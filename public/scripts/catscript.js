(function () {
  // ---- EASY CONFIG ----
  const CAT_COUNT = 4;
  const CAT_IMAGE = 'images/oneko.gif';
  // Per-cat sprite override: map a cat's index (0-based) to an alternate image.
  // Any index not listed here uses CAT_IMAGE.
  const CAT_IMAGE_OVERRIDES = { 0: 'images/oneko1.gif' };
  const WANDER_SPEED = 55;
  const CHASE_SPEED = 150;
  const CHASE_DISTANCE = 160;
  const CATCH_DISTANCE = 28;
  const IDLE_MIN = 800, IDLE_MAX = 10000;
  const SCRATCH_CHANCE = 0.3;      // chance an idle turns into a scratch instead of standing still
  const IDLES_BEFORE_SLEEP = 3;    // consecutive idles (no chasing in between) before a cat gets sleepy
  const WAKE_DISTANCE = 100;       // cursor closer than this wakes a sleeping cat
  // ----------------------

  // oneko.gif is an 8x4 grid of 32x32 frames: [col, row], 0-indexed.
  const DIRS = {
    N:  [[1,2],[1,3]], NE: [[0,2],[0,3]],
    E:  [[3,0],[3,1]],  SE: [[5,1],[5,2]],
    S:  [[6,3],[7,2]],  SW: [[5,3],[6,1]],
    W:  [[4,2],[4,3]],  NW: [[1,0],[1,1]],
  };
  const IDLE = [3,3];
  const ALERT = [7,3];
  const TIRED = [3,2];
  const SLEEPING = [[2,0],[2,1]];
  const SCRATCH_SELF = [[5,0],[6,0],[7,0]];

  // FIX: container is now absolutely positioned over the *document*, not the
  // viewport, so its contents scroll with the page instead of floating fixed
  // on screen. Height is kept in sync with document.documentElement.scrollHeight.
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(container);

  function syncContainerHeight() {
    container.style.height = document.documentElement.scrollHeight + 'px';
  }
  syncContainerHeight();
  window.addEventListener('resize', syncContainerHeight);
  // Catch content growing/shrinking (images loading, dynamic content, etc.)
  // without a resize event. Cheap to run occasionally.
  new ResizeObserver(syncContainerHeight).observe(document.body);

  // Mouse position is tracked in *viewport* coordinates (as the browser gives
  // it to us). We convert to document coordinates on each update by adding
  // the current scroll offset, so chasing stays correct even if the user
  // scrolls without moving the mouse.
  let mouseViewportX = window.innerWidth / 2, mouseViewportY = window.innerHeight / 2;
  window.addEventListener('mousemove', e => { mouseViewportX = e.clientX; mouseViewportY = e.clientY; });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { mouseViewportX = e.touches[0].clientX; mouseViewportY = e.touches[0].clientY; }
  });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function dirFromAngle(dx, dy) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const dirs = ['E','SE','S','SW','W','NW','N','NE'];
    const idx = Math.round(((angle + 360) % 360) / 45) % 8;
    return dirs[idx];
  }

  function setFrame(el, [col, row]) {
    el.style.backgroundPosition = `${-col * 32}px ${-row * 32}px`;
  }

  function makeCat(index) {
    const el = document.createElement('div');
    const image = CAT_IMAGE_OVERRIDES[index] || CAT_IMAGE;
    el.style.cssText = `
      position:absolute; left:0; top:0; width:32px; height:32px;
      background-image:url('${image}'); background-repeat:no-repeat;
      image-rendering:pixelated; pointer-events:auto; cursor:grab;
      transform-origin:center;
    `;
    container.appendChild(el);
    setFrame(el, IDLE);

    // Spawn positions are in *document* coordinates now, so we offset by the
    // current scroll position to place cats within the visible viewport
    // rather than always up near the top of the document.
    return {
      el,
      x: rand(40, window.innerWidth - 40) + window.scrollX,
      y: rand(80, window.innerHeight - 80) + window.scrollY,
      state: 'idle',
      idleUntil: performance.now() + rand(IDLE_MIN, IDLE_MAX),
      target: { x: 0, y: 0 },
      dragging: false,
      animTimer: 0,
      animFrame: 0,
      idleStreak: 0,      // consecutive idles without chasing, used to trigger sleep
      actionEnd: 0,       // used for timed states like scratch/tired
    };
  }

  function pickNewTarget(cat) {
    // Wander targets are also document-relative, biased around the current
    // viewport so cats tend to wander somewhere visible rather than the
    // full (possibly huge) document height.
    cat.target.x = rand(40, window.innerWidth - 40) + window.scrollX;
    cat.target.y = rand(80, window.innerHeight - 80) + window.scrollY;
  }

  function startDrag(cat, e) {
    cat.dragging = true;
    cat.state = 'dragged';
    cat.el.style.cursor = 'grabbing';
    try { cat.el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone; ignore */ }
    setFrame(cat.el, ALERT);
  }

  function endDrag(cat) {
    if (!cat.dragging) return;
    cat.dragging = false;
    cat.el.style.cursor = 'grab';
    cat.state = 'idle';
    cat.idleStreak = 0; // being picked up resets sleepiness
    cat.idleUntil = performance.now() + rand(300, 1200);
    cat.animFrame = 0;
    cat.animTimer = 0;
    setFrame(cat.el, IDLE); // FIX: previously left showing the ALERT frame indefinitely
  }

  // decide what happens after a cat finishes wandering / catches its breath
  function startIdle(cat, now) {
    cat.idleStreak++;
    if (cat.idleStreak >= IDLES_BEFORE_SLEEP) {
      cat.state = 'tired';
      cat.actionEnd = now + 700;
      setFrame(cat.el, TIRED);
    } else if (Math.random() < SCRATCH_CHANCE) {
      cat.state = 'scratch';
      cat.actionEnd = now + 1200;
      cat.animTimer = 0; cat.animFrame = 0;
    } else {
      cat.state = 'idle';
      cat.idleUntil = now + rand(IDLE_MIN, IDLE_MAX);
      setFrame(cat.el, IDLE);
    }
  }

  const cats = [];
  for (let i = 0; i < CAT_COUNT; i++) {
    const cat = makeCat(i);
    cats.push(cat);
    cat.el.addEventListener('pointerdown', e => startDrag(cat, e));
    cat.el.addEventListener('pointerup', () => endDrag(cat));
    // FIX: if capture is revoked without a pointerup (alt-tab, context menu,
    // browser gesture, etc.) the cat used to get stuck in 'dragged' forever.
    cat.el.addEventListener('pointercancel', () => endDrag(cat));
    cat.el.addEventListener('lostpointercapture', () => endDrag(cat));
    cat.el.addEventListener('pointermove', e => {
      if (!cat.dragging) return;
      // Convert the pointer's viewport coordinates to document coordinates.
      cat.x = e.clientX + window.scrollX;
      cat.y = e.clientY + window.scrollY;
    });
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Document-relative mouse position, recomputed every frame so scrolling
    // alone (without mouse movement) still keeps chase behavior correct.
    const mouseX = mouseViewportX + window.scrollX;
    const mouseY = mouseViewportY + window.scrollY;

    for (const cat of cats) {
      // FIX: isolate each cat's update so one bad frame can't take down
      // the whole shared animation loop (which would freeze every cat and
      // make dragging look broken, since render() would stop being called).
      try {
        updateCat(cat, now, dt, mouseX, mouseY);
      } catch (err) {
        console.error('oneko: cat update failed', err);
      }
    }

    // FIX: always reschedule, even if a cat update threw above.
    requestAnimationFrame(loop);
  }

  function updateCat(cat, now, dt, mouseX, mouseY) {
    if (cat.dragging) { render(cat); return; }

    const dx = mouseX - cat.x, dy = mouseY - cat.y;
    const distToMouse = Math.hypot(dx, dy);

    // sleeping cats only care about the cursor getting close enough to wake them
    if (cat.state === 'sleeping') {
      if (distToMouse < WAKE_DISTANCE) {
        cat.state = 'idle';
        cat.idleStreak = 0;
        cat.idleUntil = now + rand(300, 900);
        setFrame(cat.el, ALERT);
      } else {
        cat.animTimer += dt;
        if (cat.animTimer > 0.5) { cat.animTimer = 0; cat.animFrame = cat.animFrame === 0 ? 1 : 0; }
        setFrame(cat.el, SLEEPING[cat.animFrame]);
      }
      render(cat);
      return;
    }

    if (cat.state === 'tired') {
      if (now >= cat.actionEnd) { cat.state = 'sleeping'; cat.animTimer = 0; cat.animFrame = 0; }
      render(cat);
      return;
    }

    if (cat.state === 'scratch') {
      cat.animTimer += dt;
      if (cat.animTimer > 0.15) {
        cat.animTimer = 0;
        cat.animFrame = (cat.animFrame + 1) % SCRATCH_SELF.length;
      }
      setFrame(cat.el, SCRATCH_SELF[cat.animFrame]);
      if (now >= cat.actionEnd) {
        cat.state = 'idle';
        cat.idleUntil = now + rand(IDLE_MIN, IDLE_MAX);
        setFrame(cat.el, IDLE); // FIX: previously left the last scratch frame showing
      }
      render(cat);
      return;
    }

    // chasing takes priority over everything and resets sleepiness
    if (distToMouse < CHASE_DISTANCE && distToMouse > CATCH_DISTANCE) {
      cat.state = 'chase';
      cat.idleStreak = 0;
    } else if (distToMouse <= CATCH_DISTANCE && cat.state === 'chase') {
      startIdle(cat, now);
    } else if (cat.state === 'chase' && distToMouse >= CHASE_DISTANCE) {
      startIdle(cat, now);
    }

    let moving = false;
    let dirX = 0, dirY = 0;

    if (cat.state === 'chase') {
      moving = true; dirX = dx; dirY = dy;
      moveToward(cat, mouseX, mouseY, CHASE_SPEED, dt);
    } else if (cat.state === 'idle') {
      if (now >= cat.idleUntil) { cat.state = 'wander'; pickNewTarget(cat); }
    } else if (cat.state === 'wander') {
      moving = true;
      dirX = cat.target.x - cat.x; dirY = cat.target.y - cat.y;
      const arrived = moveToward(cat, cat.target.x, cat.target.y, WANDER_SPEED, dt);
      if (arrived) startIdle(cat, now);
    }

    // FIX: only paint a walking frame if the cat is *still* chasing/wandering
    // after the logic above. Previously `moving` stayed true even when
    // startIdle() just switched the cat to idle/tired/scratch this same tick,
    // so the correct pose got immediately overwritten with a walking frame.
    if (moving && (cat.state === 'chase' || cat.state === 'wander')) {
      cat.animTimer += dt;
      if (cat.animTimer > 0.18) { cat.animTimer = 0; cat.animFrame = cat.animFrame === 0 ? 1 : 0; }
      const dir = dirFromAngle(dirX, dirY);
      setFrame(cat.el, DIRS[dir][cat.animFrame]);
    }

    render(cat);
  }

  function moveToward(cat, tx, ty, speed, dt) {
    const dx = tx - cat.x, dy = ty - cat.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return true;
    cat.x += (dx / dist) * speed * dt;
    cat.y += (dy / dist) * speed * dt;
    return false;
  }

  function render(cat) {
    // cat.x/cat.y are document coordinates; the container itself is
    // absolutely positioned over the document, so no extra scroll math is
    // needed here — the browser handles scrolling the container's contents.
    cat.el.style.transform = `translate(${cat.x - 16}px, ${cat.y - 16}px)`;
  }

  requestAnimationFrame(loop);
})();