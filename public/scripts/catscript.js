
(function () {
  // ---- EASY CONFIG ----
  const CAT_COUNT = 4;                 // <- change this to spawn more/fewer cats
  const CAT_IMAGE = '../images/oneko.gif'; // <- path to oneko.gif on your site
  const WANDER_SPEED = 55;
  const CHASE_SPEED = 150;
  const CHASE_DISTANCE = 160;
  const CATCH_DISTANCE = 28;
  const IDLE_MIN = 800, IDLE_MAX = 3000;
  // ----------------------

  // oneko.gif is an 8x4 grid of 32x32 frames.
  // Each entry is [col, row] (0-indexed) for that direction's two walk frames.
  const DIRS = {
    N:  [[1,2],[1,3]], NE: [[0,2],[0,3]],
    E:  [[3,0],[3,1]],  SE: [[5,1],[5,2]],
    S:  [[6,3],[7,2]],  SW: [[5,3],[6,1]],
    W:  [[4,2],[4,3]],  NW: [[1,0],[1,1]],
  };
  const IDLE = [3,3];
  const ALERT = [7,3];

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(container);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; }
  });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function dirFromAngle(dx, dy) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180..180
    const dirs = ['E','SE','S','SW','W','NW','N','NE'];
    const idx = Math.round(((angle + 360) % 360) / 45) % 8;
    return dirs[idx];
  }

  function setFrame(el, [col, row]) {
    el.style.backgroundPosition = `${-col * 32}px ${-row * 32}px`;
  }

  function makeCat() {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute; left:0; top:0; width:32px; height:32px;
      background-image:url('${CAT_IMAGE}'); background-repeat:no-repeat;
      image-rendering:pixelated; pointer-events:auto; cursor:grab;
      transform-origin:center;
    `;
    container.appendChild(el);
    setFrame(el, IDLE);

    return {
      el,
      x: rand(40, window.innerWidth - 40),
      y: rand(80, window.innerHeight - 80),
      facing: 1,
      state: 'idle',
      idleUntil: performance.now() + rand(IDLE_MIN, IDLE_MAX),
      target: { x: 0, y: 0 },
      dragging: false,
      animTimer: 0,
      animFrame: 0,
    };
  }

  function pickNewTarget(cat) {
    cat.target.x = rand(40, window.innerWidth - 40);
    cat.target.y = rand(80, window.innerHeight - 80);
  }

  function startDrag(cat, e) {
    cat.dragging = true;
    cat.state = 'dragged';
    cat.el.style.cursor = 'grabbing';
    cat.el.setPointerCapture(e.pointerId);
    setFrame(cat.el, ALERT);
  }

  function endDrag(cat) {
    cat.dragging = false;
    cat.el.style.cursor = 'grab';
    cat.state = 'idle';
    cat.idleUntil = performance.now() + rand(300, 1200);
  }

  const cats = [];
  for (let i = 0; i < CAT_COUNT; i++) {
    const cat = makeCat();
    cats.push(cat);
    cat.el.addEventListener('pointerdown', e => startDrag(cat, e));
    cat.el.addEventListener('pointerup', () => endDrag(cat));
    cat.el.addEventListener('pointermove', e => {
      if (!cat.dragging) return;
      cat.x = e.clientX;
      cat.y = e.clientY;
    });
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    for (const cat of cats) {
      if (cat.dragging) { render(cat); continue; }

      const dx = mouseX - cat.x, dy = mouseY - cat.y;
      const distToMouse = Math.hypot(dx, dy);

      if (distToMouse < CHASE_DISTANCE && distToMouse > CATCH_DISTANCE) {
        cat.state = 'chase';
      } else if (distToMouse <= CATCH_DISTANCE && cat.state === 'chase') {
        cat.state = 'idle';
        cat.idleUntil = now + rand(IDLE_MIN, IDLE_MAX);
      } else if (cat.state === 'chase' && distToMouse >= CHASE_DISTANCE) {
        cat.state = 'idle';
        cat.idleUntil = now + rand(200, 800);
      }

      let moving = false;
      let dirX = 0, dirY = 0;

      if (cat.state === 'chase') {
        moving = true; dirX = dx; dirY = dy;
        moveToward(cat, mouseX, mouseY, CHASE_SPEED, dt);
      } else if (cat.state === 'idle') {
        setFrame(cat.el, IDLE);
        if (now >= cat.idleUntil) { cat.state = 'wander'; pickNewTarget(cat); }
      } else if (cat.state === 'wander') {
        moving = true;
        dirX = cat.target.x - cat.x; dirY = cat.target.y - cat.y;
        const arrived = moveToward(cat, cat.target.x, cat.target.y, WANDER_SPEED, dt);
        if (arrived) { cat.state = 'idle'; cat.idleUntil = now + rand(IDLE_MIN, IDLE_MAX); }
      }

      if (moving) {
        cat.animTimer += dt;
        if (cat.animTimer > 0.18) { cat.animTimer = 0; cat.animFrame = cat.animFrame === 0 ? 1 : 0; }
        const dir = dirFromAngle(dirX, dirY);
        setFrame(cat.el, DIRS[dir][cat.animFrame]);
      }
    }

    for (const cat of cats) render(cat);
    requestAnimationFrame(loop);
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
    cat.el.style.transform = `translate(${cat.x - 16}px, ${cat.y - 16}px)`;
  }

  requestAnimationFrame(loop);
})();