/* ============================================================================
   desksprite — a tiny pixel desk worker (sprite) for your web page.
   Zero dependencies. Drop in one <script>, call DeskSprite.start().

   It sits working at a little CRT desk, occasionally gets up to walk around,
   and you can GRAB it (it dangles from the cursor, scared of heights), THROW it
   (gravity + momentum), and toss it back onto the desk (it glides into the seat).
   At noon it eats lunch. Wire your own status (a build, a download, anything)
   into the monitor with setStatus(), or ignore it.

   MIT licensed. https://github.com/welltilln/desksprite
   ============================================================================ */
(function (global) {
  'use strict';

  // ── Bundled default skin (blue-boy) ─────────────────────────────────────────
  // Byte-equivalent to skins/blue-boy.json (generated mechanically, not hand
  // typed). Task 5 will add the SKINS registry + resolveSkin; for now the engine
  // renders whatever `skin` points at, defaulting to this bundled blue-boy.
  const BLUE_BOY = {
    "name": "blue-boy",
    "author": "welltilln",
    "palette": {
      ".": null,
      "H": "#3D2714",
      "h": "#5A3D22",
      "S": "#FDBDA0",
      "s": "#E09070",
      "e": "#1A1A2E",
      "W": "#F0F0F8",
      "B": "#1E5FCC",
      "b": "#1547A8",
      "T": "#CC2233",
      "t": "#AA1020",
      "o": "#fff",
      "g": "#E8C36A"
    },
    "size": {
      "w": 14,
      "h": 14
    },
    "anchor": {
      "x": 7,
      "y": 14
    },
    "frames": {
      "idle": [
        "...HHHHHHHHH..",
        "..HHhhHHHhhH..",
        "..HHhSSSSShH..",
        "..HHSeeSSeeS..",
        "..HHSSSsSSSS..",
        "..HHSSsWWsSH..",
        "...HHSSSSsH...",
        "...WBBTtTBBW..",
        "..BBBbTtTbBBB.",
        "..BBBBTtTBBBB.",
        "..bBBBBBBBBBb.",
        "..bBBBBBBBBBb.",
        "...bbb..bbb...",
        "...bbb..bbb..."
      ],
      "walk": [
        [
          "...HHHHHHHHH..",
          "..HHhhHHHhhH..",
          "..HHhSSSSShH..",
          "..HHSeeSSeeS..",
          "..HHSSSsSSSS..",
          "..HHSSsWWsSH..",
          "...HHSSSSsH...",
          "...WBBTtTBBW..",
          "..BBBbTtTbBBB.",
          "..BBBBTtTBBBB.",
          "..bBBBBBBBBBb.",
          "..bBBBBBBBBBb.",
          "........bbb...",
          "...bbb..bbb..."
        ],
        [
          "...HHHHHHHHH..",
          "..HHhhHHHhhH..",
          "..HHhSSSSShH..",
          "..HHSeeSSeeS..",
          "..HHSSSsSSSS..",
          "..HHSSsWWsSH..",
          "...HHSSSSsH...",
          "...WBBTtTBBW..",
          "..BBBbTtTbBBB.",
          "..BBBBTtTBBBB.",
          "..bBBBBBBBBBb.",
          "..bBBBBBBBBBb.",
          "...bbb........",
          "...bbb..bbb..."
        ]
      ],
      "held": [
        "...HHHHHHHHH..",
        "S.HHhhHHHhhHS.",
        "SSHHhSSSSShSS.",
        "..HHSeeSSeeS..",
        "..HHooSooSSS..",
        "..HHoesoesSH..",
        "...HHSSSSsH...",
        "...WBBTtTBBW..",
        "..BBBbTtTbBBB.",
        "..BBBBTtTBBBB.",
        "..bBBBBBBBBBb.",
        "..bBBBBBBBBBb.",
        "..............",
        ".............."
      ],
      "carry": [
        "..............",
        "..............",
        "..............",
        "..............",
        "..............",
        "..............",
        "...........ggg",
        "...........gog",
        "...........gog",
        "...........ggg",
        "..............",
        "..............",
        "..............",
        ".............."
      ]
    }
  };

  // ── Bundled demo skin (cat) ─────────────────────────────────────────────────
  // Byte-equivalent to skins/cat.json (generated mechanically, not hand typed).
  const CAT = {
    "name": "cat",
    "author": "welltilln",
    "palette": {
      ".": null,
      "B": "#1A1A1A",
      "b": "#2E2E2E",
      "G": "#4A4A4A",
      "g": "#6A6A6A",
      "W": "#F0F0F0",
      "P": "#FF9EAD",
      "N": "#1A1A2E"
    },
    "size": {
      "w": 13,
      "h": 13
    },
    "anchor": {
      "x": 6,
      "y": 13
    },
    "traits": {
      "walkSpeed": 1.35,
      "messages": {
        "working": "hunting bugs…",
        "done": "meow ✓",
        "error": "hiss!",
        "seat": "mine now."
      }
    },
    "frames": {
      "idle": [
        ".B.........B.",
        "BB.........BB",
        "BBBbBBBBBbBBB",
        ".BBBNgGgNBBB.",
        ".BBBggPggBBB.",
        ".BBBBBBBbBBB.",
        ".BWWWBBBBBB..",
        ".BWWWbBBBBB..",
        ".BBBBBBBBBB..",
        "..BBBBBBBB...",
        "..BBBBBBBB...",
        "..BB....BB...",
        "..BB....BB..."
      ],
      "walk": [
        [
          ".B.........B.",
          "BB.........BB",
          "BBBbBBBBBbBBB",
          ".BBBNgGgNBBB.",
          ".BBBggPggBBB.",
          ".BBBBBBBbBBB.",
          ".BWWWBBBBBB..",
          ".BWWWbBBBBB..",
          ".BBBBBBBBBB..",
          "..BBBBBBBB...",
          "..BBBBBBBB...",
          ".......BB....",
          "..BB....BB..."
        ],
        [
          ".B.........B.",
          "BB.........BB",
          "BBBbBBBBBbBBB",
          ".BBBNgGgNBBB.",
          ".BBBggPggBBB.",
          ".BBBBBBBbBBB.",
          ".BWWWBBBBBB..",
          ".BWWWbBBBBB..",
          ".BBBBBBBBBB..",
          "..BBBBBBBB...",
          "..BBBBBBBB...",
          "..BB.........",
          "..BB....BB..."
        ]
      ],
      "held": [
        ".B.........B.",
        "BB.........BB",
        "BBBbBBBBBbBBB",
        ".BBBWGBGWBBB.",
        ".BBBggPggBBB.",
        ".BBBBBBBbBBB.",
        ".BWWWBBBBBB..",
        ".BWWWbBBBBB..",
        ".BBBBBBBBBB..",
        "..BBBBBBBB...",
        "..BBBBBBBB...",
        ".............",
        "............."
      ]
    }
  };

  // ── Skin registry ───────────────────────────────────────────────────────────
  // Built-in skins. Add new built-ins here (one line per sprite).
  const SKINS = {
    'blue-boy': BLUE_BOY,
    'cat': CAT,
  };

  // resolveSkin: name string → built-in lookup (warns + falls back on unknown);
  // skin object → validated (falls back on invalid); falsy → blue-boy.
  // Never throws.
  function resolveSkin(v) {
    let skin = (!v) ? SKINS['blue-boy']
      : (typeof v === 'string') ? (SKINS[v] || (console.warn('desksprite: unknown skin ' + v), SKINS['blue-boy']))
      : v;
    const chk = validateSkin(skin);
    if (!chk.ok) { console.warn('desksprite: invalid skin (' + chk.errors.join('; ') + ') — using blue-boy'); skin = SKINS['blue-boy']; }
    return skin;
  }

  const PX = 4;                                  // sprite pixel size (desk + free body share it)
  const MON = { idle: '#15A66A', working: '#00C2B8', done: '#28E08A', error: '#E0564A' };

  const FLOOR_MARGIN = 6, GRAVITY = 0.9, THROW_CAP = 22, CATCH_MARGIN = 28;

  const DEFAULTS = {
    mount: null,            // element/selector to inline the desk into; null = floating bottom-left
    desk: true,             // show the CRT desk "home"
    roam: true,             // walk the page + wander on its own
    lunch: true,            // noon eating animation (needs desk)
    lunchHour: 12,          // local hour for lunch (12 = 12:00–12:59)
    clock: true,            // show the clock + calendar readout under the desk
    scale: 1,               // overall size multiplier of the desk widget
    accent: '#3794FF',      // speech-bubble border + drop highlight
    status: 'idle',         // initial status
    messages: {             // speech-bubble text (set any to '' to silence)
      working: 'on it!', done: 'done ✓', error: 'uh oh…', seat: 'back to work!',
    },
  };

  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return; cssInjected = true;
    const css = `
/* Chrome colours are themeable via CSS vars with dark defaults — standalone looks
   identical (a dark CRT); a host page can set --ds-* to follow its own theme.
   Themeable: --ds-accent (border/highlight), --ds-bezel + --ds-bezel-edge (the desk
   case), --ds-readout (clock/status/calendar text), --ds-cal-dim (faint calendar
   days), --ds-bubble-bg + --ds-bubble-ink (speech bubble). The CRT screen + the
   pixel scene inside it stay fixed (it's a lit monitor, not a themed surface). */
.desksprite-desk{display:inline-block;background:var(--ds-bezel,#0C0F14);border-radius:11px;padding:9px;
  border:1px solid var(--ds-bezel-edge,#05070A);box-shadow:0 6px 18px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.05);}
.desksprite-desk.float{position:fixed;left:14px;bottom:14px;z-index:2147483600;}
.desksprite-screen{position:relative;border-radius:7px;overflow:hidden;background:#06080C;
  box-shadow:inset 0 0 22px rgba(0,0,0,.7);transition:box-shadow .3s;cursor:grab;touch-action:none;}
.desksprite-screen.drop{box-shadow:inset 0 0 22px rgba(0,0,0,.5),0 0 0 2px var(--ds-accent,#3794FF),0 0 16px var(--ds-accent,#3794FF);}
.desksprite-pet{display:block;width:100%;aspect-ratio:220/150;image-rendering:pixelated;}
.desksprite-scan{position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.16) 2px,rgba(0,0,0,.16) 3px);}
.desksprite-readout{display:grid;grid-template-columns:1fr auto;align-items:center;gap:6px;padding:8px 4px 2px;
  color:var(--ds-readout,#54E08A);font-family:ui-monospace,'Cascadia Code',Consolas,monospace;}
.desksprite-status{font-size:9px;letter-spacing:1px;font-weight:700;}
.desksprite-status.s-working{color:var(--ds-working,#46D9D0);} .desksprite-status.s-done{color:var(--ds-done,#6BFFA8);} .desksprite-status.s-error{color:var(--ds-error,#FF7A7A);}
.desksprite-clock{font-size:10px;text-align:right;color:var(--ds-readout,#7CEBA8);}
.desksprite-cal{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:5px;
  font-family:ui-monospace,monospace;font-weight:500;}
.desksprite-cal .d{font-size:8.5px;text-align:center;color:var(--ds-cal-dim,#2E5C42);padding:1px 0;border-radius:3px;}
.desksprite-cal .d.today{background:var(--ds-today-bg,#54E08A);color:var(--ds-today-ink,#06140C);font-weight:700;}
.desksprite-cal .d.dim{color:var(--ds-cal-dim,#1C3A28);}
.desksprite-free{position:fixed;top:0;left:0;width:60px;height:60px;z-index:2147483601;display:none;
  image-rendering:pixelated;cursor:grab;touch-action:none;will-change:transform;
  filter:drop-shadow(0 5px 5px rgba(0,0,0,.5));}
.desksprite-bubble{position:fixed;top:0;left:0;z-index:2147483602;pointer-events:none;
  font-family:ui-monospace,'Cascadia Code',Consolas,monospace;font-size:11px;line-height:1.4;
  color:var(--ds-bubble-ink,#E3E3E3);background:var(--ds-bubble-bg,#1F1F1F);border:1px solid var(--ds-accent,#3794FF);padding:5px 9px;border-radius:9px;
  box-shadow:0 4px 12px rgba(0,0,0,.4);opacity:0;transform:translateY(4px);transition:opacity .2s,transform .2s;white-space:nowrap;}
.desksprite-bubble.show{opacity:1;transform:translateY(0);}
@media(prefers-reduced-motion:reduce){.desksprite-bubble{transition:none;}}`;
    const el = document.createElement('style');
    el.id = 'desksprite-css'; el.textContent = css;
    document.head.appendChild(el);
  }

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  // ── One instance = one creature ────────────────────────────────────────────
  function start(userOpts) {
    const cfg = Object.assign({}, DEFAULTS, userOpts || {});
    cfg.messages = Object.assign({}, DEFAULTS.messages, (userOpts && userOpts.messages) || {});
    injectCSS();
    const reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Per-instance skin resolution. cfg.skin may be a name string, a skin object,
    // or undefined (→ blue-boy). resolveSkin never throws.
    let skin = resolveSkin(cfg.skin);

    // skin-derived box — the free body's footprint in CSS px. Replaces the old
    // fixed 60. Split into width/height because a skin is not square (blue-boy
    // = 14×14×PX = 56×56). Every former PET_BOX site now reads PET_W/PET_H.
    let PET_W = skin.size.w * PX, PET_H = skin.size.h * PX;

    // state ---------------------------------------------------------------------
    let status = cfg.status;            // idle | working | done | error
    const pet = {
      loc: 'desk', x: 90, y: 0, vx: 0, vy: 0, dir: 1, frame: 0, t: 0, pauseFor: 0,
      fear: 0, squash: 0, grabDX: PET_W / 2, grabDY: PET_H / 2, seatX: 0, seatY: 0, roamUntil: 0, returning: false,
    };
    if (!cfg.desk) pet.loc = 'roaming';  // deskless: it lives on the floor
    let tick = 0, sceneRAF = null, petRAF = null, bubbleTimer = null, wanderTimer = null;
    let dragging = false, lastPX = 0, lastPY = 0, destroyed = false;

    // DOM -----------------------------------------------------------------------
    const free = document.createElement('canvas');
    free.width = PET_W; free.height = PET_H; free.className = 'desksprite-free';
    free.style.width = PET_W + 'px'; free.style.height = PET_H + 'px';
    const bubble = document.createElement('div'); bubble.className = 'desksprite-bubble';
    document.body.appendChild(free); document.body.appendChild(bubble);
    // accent is per-instance (set on this instance's own nodes, NOT the global root),
    // so two creatures on one page keep independent accent colours.
    free.style.setProperty('--ds-accent', cfg.accent);
    bubble.style.setProperty('--ds-accent', cfg.accent);

    let deskEl = null, screenEl = null, petCanvas = null, statusEl = null, clockEl = null, calEl = null;
    if (cfg.desk) {
      deskEl = document.createElement('div'); deskEl.className = 'desksprite-desk';
      deskEl.style.setProperty('--ds-accent', cfg.accent);   // .desksprite-screen.drop inherits it
      if (cfg.scale !== 1) deskEl.style.width = Math.round(238 * cfg.scale) + 'px';
      screenEl = document.createElement('div'); screenEl.className = 'desksprite-screen';
      petCanvas = document.createElement('canvas'); petCanvas.width = 220; petCanvas.height = 150;
      petCanvas.className = 'desksprite-pet';
      const scan = document.createElement('div'); scan.className = 'desksprite-scan';
      screenEl.appendChild(petCanvas); screenEl.appendChild(scan);
      deskEl.appendChild(screenEl);
      if (cfg.clock) {
        const ro = document.createElement('div'); ro.className = 'desksprite-readout';
        statusEl = document.createElement('span'); statusEl.className = 'desksprite-status';
        clockEl = document.createElement('span'); clockEl.className = 'desksprite-clock';
        calEl = document.createElement('div'); calEl.className = 'desksprite-cal';
        ro.appendChild(statusEl); ro.appendChild(clockEl); ro.appendChild(calEl);
        deskEl.appendChild(ro);
      }
      const mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
      if (mount) mount.appendChild(deskEl);
      else { deskEl.classList.add('float'); document.body.appendChild(deskEl); }
    }

    // helpers -------------------------------------------------------------------
    function floorY() { return global.innerHeight - FLOOR_MARGIN - PET_H; }
    function homeX() {
      if (screenEl) return screenEl.getBoundingClientRect().left;
      return 24;                                  // deskless: a corner near the left
    }
    function isLunch() { return cfg.desk && cfg.lunch && new Date().getHours() === cfg.lunchHour; }
    function isEating() { return pet.loc === 'desk' && status === 'idle' && isLunch(); }
    function deskNeedsAnim() { return cfg.desk && (status === 'working' || isEating()); }

    // ── desk scene (drawn on the 220x150 petCanvas) ──────────────────────────
    // The seat hides the standing legs under the desk. Legacy drew only the 12
    // body rows (no legs) here; a skin's frames are the full standing sprite
    // (body + DESK_LEG_ROWS leg rows). We crop those trailing leg rows so no leg
    // pixel appears above the desk line (floor occlusion alone is unsafe when the
    // bob dips: at bob=-2 a leg row would land 2px above the desk).
    // The seated sprite uses the STATUS frame (work/done/error) when the skin
    // defines one, falling back to idle — same frameFor() logic as the free body.
    const DESK_LEG_ROWS = 2;
    const deskSeatX = 20;                          // legacy fixed seat x
    // Seat y is anchor-derived: the sprite's feet (anchor.y) rest at DESK+8, so the
    // seat top = DESK - anchor.y*PX + 8 = DESK-48 for blue-boy (anchor.y=14).
    // drawScene passes `by` (already includes DESK + bob) so DESK stays local there.
    function drawDeskChar(ctx, by) {
      const rows = frameFor(skin, 'idle', status);
      const grid = gridFor(skin, rows).slice(0, skin.size.h - DESK_LEG_ROWS);
      drawFrame(ctx, grid, deskSeatX, by, PX);
    }
    function drawCloud(ctx, x, y) { ctx.fillStyle = '#DDEEFF'; [[0,4,8,3],[3,1,8,5],[11,2,7,4]].forEach(([dx,dy,w,h]) => ctx.fillRect(x+dx,y+dy,w,h)); }
    function drawPlant(ctx, x, y) {
      ctx.fillStyle = '#7B3D1A'; ctx.fillRect(x+3,y+15,11,9);
      ctx.fillStyle = '#2D5A1A'; ctx.fillRect(x+7,y+2,3,14);
      ctx.fillStyle = '#3A7A22'; ctx.fillRect(x+1,y+4,7,5); ctx.fillRect(x+8,y+7,7,5); ctx.fillRect(x+3,y,6,5);
      ctx.fillStyle = '#55AA33'; ctx.fillRect(x+2,y+5,4,3); ctx.fillRect(x+10,y+8,4,3);
    }
    function drawChair(ctx, x, y) {
      ctx.fillStyle = '#6B4A2A'; ctx.fillRect(x, y, 20, 4);
      ctx.fillStyle = '#56391F'; ctx.fillRect(x+1, y-12, 3, 12); ctx.fillRect(x+1, y-12, 16, 3);
      ctx.fillStyle = '#4A3018'; ctx.fillRect(x+2, y+4, 3, 8); ctx.fillRect(x+15, y+4, 3, 8);
    }
    function drawScene(t) {
      if (!petCanvas) return;
      const ctx = petCanvas.getContext('2d');
      const W = 220, H = 150, DESK = 104;
      const run = status === 'working';
      ctx.fillStyle = '#D6C8B4'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#C8BAAA';
      for (let wx = 8; wx < W; wx += 16) for (let wy = 8; wy < DESK-2; wy += 16) ctx.fillRect(wx, wy, 2, 2);
      ctx.fillStyle = '#8AC4E8'; ctx.fillRect(8, 8, 60, 46);
      ctx.fillStyle = '#A8D8F0'; ctx.fillRect(8, 8, 60, 14);
      ctx.fillStyle = '#A0907A';
      ctx.fillRect(6,6,64,4); ctx.fillRect(6,52,64,4); ctx.fillRect(6,6,4,50); ctx.fillRect(66,6,4,50); ctx.fillRect(36,6,4,50); ctx.fillRect(6,28,64,4);
      const cd = Math.round((t * 0.1) % 18);
      drawCloud(ctx, 12 + cd, 12); drawCloud(ctx, 40, 32);
      drawPlant(ctx, 176, 30);
      const amp = run ? 2.4 : 1.4, sp = run ? 0.10 : 0.04;
      const bob = Math.round(Math.sin(t * sp) * amp);
      drawChair(ctx, 22, DESK - 12);
      // Seat top y = DESK - anchor.y*PX + 8 (= DESK-48 for blue-boy) + bob.
      if (pet.loc === 'desk') drawDeskChar(ctx, DESK - skin.anchor.y * PX + 8 + bob);
      ctx.fillStyle = '#9B7038'; ctx.fillRect(0, DESK, W, H - DESK);
      ctx.fillStyle = '#7A5228'; ctx.fillRect(0, DESK, W, 5);
      ctx.fillStyle = '#886030'; for (let gy = DESK+10; gy < H; gy += 14) ctx.fillRect(0, gy, W, 1);
      const MX = 104, MY = DESK - 42, MW = 58, MH = 40;
      ctx.fillStyle = '#3A3A4A'; ctx.fillRect(MX, MY, MW, MH);
      ctx.fillStyle = '#1C1C28'; ctx.fillRect(MX+2, MY+2, MW-4, MH-8);
      const flick = run && (t % 6 < 3) ? 0.78 : 1;
      ctx.globalAlpha = flick;
      ctx.fillStyle = MON[status] || MON.idle;
      ctx.fillRect(MX+4, MY+4, MW-8, MH-12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      const lines = [[.4,.6,.5],[.7,.3,.6],[.5,.8,.4],[.6,.4,.7]];
      lines.forEach((segs, i) => { let cx = MX+7; segs.forEach(len => { const w = Math.max(2, Math.floor(len*13)); ctx.fillRect(cx, MY+7+i*6, w, 3); cx += w+3; }); });
      if ((run ? t % 20 < 10 : t % 60 < 30)) ctx.fillRect(MX+7, MY+7+4*6, 5, 3);
      ctx.fillStyle = '#3A3A4A'; ctx.fillRect(MX+24, MY+MH, 12, 6); ctx.fillRect(MX+18, MY+MH+6, 24, 4);
      const CX = 166, CY = DESK - 20;
      ctx.fillStyle = '#7B4F2A'; ctx.fillRect(CX, CY, 15, 22);
      ctx.fillStyle = '#1A0800'; ctx.fillRect(CX+1, CY+3, 13, 9);
      ctx.fillStyle = '#7B4F2A'; ctx.fillRect(CX+15, CY+5, 5, 11);
      ctx.fillStyle = '#9B7038'; ctx.fillRect(CX+16, CY+7, 3, 7);
      if (t % 80 < 40) { ctx.fillStyle = 'rgba(220,220,200,0.55)'; ctx.fillRect(CX+3, CY-7, 2, 5); ctx.fillRect(CX+8, CY-9, 2, 5); }
      const KX = 20, KY = DESK + 7, KW = 50, KH = 8;
      ctx.fillStyle = '#4A4A6A'; ctx.fillRect(KX, KY, KW, KH);
      const keys = [2,6,10,14,18,22,26,30,34,38,42,46];
      const lit = run ? Math.floor(t * 0.4) % keys.length : -1;
      keys.forEach((kx, i) => { ctx.fillStyle = (i === lit) ? '#BFE9FF' : '#6A6A8A'; ctx.fillRect(KX+kx, KY+3, 3, 4); });
      if (pet.loc === 'desk' && isEating()) {
        const up = Math.floor(t / 22) % 2 === 1;
        ctx.fillStyle = '#EDE7DA'; ctx.fillRect(40, DESK-8, 16, 6);
        ctx.fillStyle = '#CFC4AC'; ctx.fillRect(40, DESK-9, 16, 2);
        ctx.fillStyle = '#E8A030'; ctx.fillRect(43, DESK-11, 10, 2);
        if (t % 40 < 20) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(45, DESK-18, 2, 4); ctx.fillRect(49, DESK-21, 2, 4); }
        const hx = up ? 40 : 46, hy = up ? 78 : (DESK-12);
        ctx.fillStyle = '#E09070'; ctx.fillRect(hx, hy, 4, 4);
        ctx.fillStyle = '#7A4A20'; ctx.fillRect(hx+1, hy-5, 1, 6); ctx.fillRect(hx+3, hy-5, 1, 6);
        if (up) { ctx.fillStyle = '#E8A030'; ctx.fillRect(hx+1, hy-3, 2, 2); }
      }
      if (status === 'done' || status === 'error') {
        const pulse = 0.10 + Math.abs(Math.sin(t * 0.12)) * 0.10;
        ctx.fillStyle = status === 'done' ? `rgba(40,224,138,${pulse})` : `rgba(224,86,74,${pulse})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
    function sceneLoop() {
      if (destroyed || document.hidden) { sceneRAF = null; return; }
      tick++; drawScene(tick);
      if (deskNeedsAnim() && !reduceMotion) sceneRAF = requestAnimationFrame(sceneLoop);
      else sceneRAF = null;
    }

    // ── free body (held / falling / roaming / seating on the free canvas) ────
    // Renders the skin's frame grid. The engine still owns the GENERIC transforms
    // (centre, flip, squash, jitter, walk-bob, error-droop) and the two engine
    // overlays (scared sweat, working carry) — the skin only supplies pixels.
    function drawFreePet() {
      const ctx = free.getContext('2d'); ctx.clearRect(0, 0, free.width, free.height);
      const P = PX, frameW = skin.size.w * P;
      const scared = pet.loc === 'held' || pet.loc === 'falling';
      const walking = pet.loc === 'roaming' && pet.pauseFor <= 0 && status !== 'error';
      const jit = (scared && !reduceMotion) ? pet.fear * 2.2 : 0;
      const jx = jit ? Math.round((Math.random()*2-1)*jit) : 0;
      const jy = jit ? Math.round((Math.random()*2-1)*jit) : 0;
      const bob = walking ? (pet.frame % 2 ? 1 : 0) : 0;
      const droop = status === 'error' ? 2 : 0;                 // error-droop = +2*px, engine-side
      // Pick the frame: walk cycles the walk array; everything else via frameFor.
      const rows = walking
        ? skin.frames.walk[pet.frame % skin.frames.walk.length]
        : frameFor(skin, scared ? 'held' : 'idle', status);
      const grid = gridFor(skin, rows);
      ctx.save();
      ctx.translate(free.width/2 + jx, 4 + jy);
      if (pet.dir < 0 && !scared) ctx.scale(-1, 1);
      if (pet.squash > 0) { ctx.translate(0, pet.squash*8); ctx.scale(1 + pet.squash*0.35, 1 - pet.squash*0.35); }
      ctx.translate(-frameW/2, 0);
      drawFrame(ctx, grid, 0, (bob + droop) * P, P);
      // Working carry overlay (e.g. the clipboard) — a separate frame drawn at the
      // base position (legacy kept it fixed, unaffected by walk-bob; status is
      // 'working' here so droop is 0 too).
      if (walking && status === 'working' && skin.frames.carry) {
        drawFrame(ctx, gridFor(skin, skin.frames.carry), 0, 0, P);
      }
      // Scared sweat drop — an engine overlay, not a skin frame.
      if (scared && pet.fear > 0.45) { ctx.fillStyle = '#9FE0FF'; ctx.fillRect(12*P, 3*P, 2, 4); }
      ctx.restore();
    }
    function placeFreePet() { free.style.transform = `translate(${Math.round(pet.x)}px, ${Math.round(pet.y)}px)`; }

    // resolve a message key at use-time: site config > skin traits > engine defaults.
    // resolved per-key so a runtime skin swap re-resolves personality immediately.
    function msg(key) {
      const user = userOpts && userOpts.messages;
      if (user && user[key] !== undefined) return user[key];
      const skinMsg = skin.traits && skin.traits.messages && skin.traits.messages[key];
      if (skinMsg !== undefined) return skinMsg;
      return DEFAULTS.messages[key];
    }

    function say(text) {
      if (destroyed || !text) return;
      bubble.textContent = text; bubble.classList.add('show'); positionBubble();
      clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2600);
    }
    function positionBubble() {
      const bw = bubble.offsetWidth || 140, bh = bubble.offsetHeight || 28;
      let cx, headTop;
      if (pet.loc === 'desk' && petCanvas) {
        const p = petCanvas.getBoundingClientRect();
        if (p.width) { cx = p.left + 46*(p.width/220); headTop = p.top + 56*(p.height/150); }
        else { cx = homeX()+PET_W/2; headTop = global.innerHeight - 120; }
      } else {
        cx = pet.x + PET_W/2; headTop = pet.y + 4;
      }
      bubble.style.left = Math.min(global.innerWidth - bw - 8, Math.max(8, cx - bw/2)) + 'px';
      bubble.style.top = Math.max(6, headTop - bh - 2) + 'px';
    }

    function setLoc(loc) {
      pet.loc = loc;
      const atDesk = loc === 'desk';
      free.style.display = atDesk ? 'none' : 'block';
      free.style.cursor = loc === 'held' ? 'grabbing' : loc === 'roaming' ? 'grab' : 'default';
      drawScene(tick);
      if (atDesk) { pet.returning = false; scheduleWander(); if (deskNeedsAnim() && !sceneRAF && !reduceMotion) sceneLoop(); }
      else startPetLoop();
    }
    function startPetLoop() { if (!petRAF) petRAF = requestAnimationFrame(petLoop); }

    function petLoop() {
      if (destroyed || document.hidden) { petRAF = null; return; }
      if (pet.loc === 'desk') { petRAF = null; return; }
      pet.t++;
      if (pet.squash > 0) pet.squash = Math.max(0, pet.squash - 0.08);
      if (pet.loc === 'falling') {
        if (reduceMotion) { land(); }
        else {
          pet.vy += GRAVITY; pet.x += pet.vx; pet.y += pet.vy; pet.vx *= 0.985;
          const maxX = global.innerWidth - PET_W;
          if (pet.x < 0) { pet.x = 0; pet.vx = Math.abs(pet.vx)*0.5; }
          if (pet.x > maxX) { pet.x = maxX; pet.vx = -Math.abs(pet.vx)*0.5; }
          if (cfg.desk && overScreen(pet.x+PET_W/2, pet.y+PET_H/2, CATCH_MARGIN)) seatInto();
          else if (pet.y >= floorY()) land();
        }
      } else if (pet.loc === 'seating') {
        seatStep();
      } else if (pet.loc === 'roaming' && !reduceMotion) {
        roamStep();
      }
      placeFreePet();
      if (bubble.classList.contains('show')) positionBubble();
      drawFreePet();
      if (reduceMotion && pet.loc === 'roaming') { petRAF = null; return; }
      petRAF = requestAnimationFrame(petLoop);
    }
    function land() {
      pet.y = floorY(); pet.vy = 0; pet.vx = 0; pet.squash = reduceMotion ? 0 : 1;
      if (cfg.roam) setLoc('roaming');
      else seatInto();                            // desk-only: never walks → glide back to the seat
    }
    function roamStep() {
      // read traits at use-time so a runtime skin swap changes pace immediately
      const walkFrameTicks = traitNumber(skin.traits, 'walkFrameTicks', 9);
      if (status === 'error') { if (pet.t % walkFrameTicks === 0) pet.frame++; return; }
      if (pet.pauseFor > 0) { pet.pauseFor--; return; }
      if (pet.t >= pet.roamUntil) pet.returning = true;
      if (pet.returning && cfg.desk) {
        const hx = homeX(); pet.dir = pet.x > hx ? -1 : 1; pet.x += pet.dir * 1.2;
        if (Math.abs(pet.x - hx) <= 2) { seatInto(); return; }
      } else {
        const baseSpd = status === 'working' ? 1.5 : 0.7;
        const spd = baseSpd * traitNumber(skin.traits, 'walkSpeed', 1);
        pet.x += pet.dir * spd;
        const maxX = global.innerWidth - PET_W;
        if (pet.x >= maxX) { pet.x = maxX; pet.dir = -1; pet.pauseFor = 40; }
        if (pet.x <= 0) { pet.x = 0; pet.dir = 1; pet.pauseFor = 40; }
        if (status === 'idle' && pet.t % 420 === 0) pet.pauseFor = 70;
      }
      if (pet.t % walkFrameTicks === 0) pet.frame++;
    }

    // ── sit-down glide ────────────────────────────────────────────────────────
    function seatTarget() {
      if (!petCanvas) return { x: homeX(), y: floorY() };
      const p = petCanvas.getBoundingClientRect();
      if (!p.width) return { x: homeX(), y: floorY() };
      return { x: p.left + 20*(p.width/220) - 4, y: p.top + 56*(p.height/150) - 4 };
    }
    function seatInto() {
      if (!cfg.desk) { setLoc('roaming'); return; }    // no desk → nowhere to sit
      if (reduceMotion) { setLoc('desk'); say(msg('seat')); return; }
      const t = seatTarget(); pet.seatX = t.x; pet.seatY = t.y; pet.returning = false;
      pet.loc = 'seating'; free.style.display = 'block'; free.style.cursor = 'default';
      drawScene(tick); startPetLoop();
    }
    function seatStep() {
      pet.x += (pet.seatX - pet.x) * 0.28; pet.y += (pet.seatY - pet.y) * 0.28;
      if (Math.abs(pet.x - pet.seatX) < 1.5 && Math.abs(pet.y - pet.seatY) < 1.5) { setLoc('desk'); say(msg('seat')); }
    }

    // ── autonomy ───────────────────────────────────────────────────────────────
    function scheduleWander() {
      clearTimeout(wanderTimer);
      if (reduceMotion || !cfg.roam || !cfg.desk) return;
      wanderTimer = setTimeout(() => {
        if (pet.loc === 'desk' && status === 'idle' && !dragging && !isLunch()) wanderOut();
        else scheduleWander();
      }, 120000 + Math.random() * 120000);
    }
    function wanderOut() {
      pet.x = homeX(); pet.y = floorY(); pet.dir = 1; pet.vx = 0; pet.vy = 0; pet.pauseFor = 0; pet.returning = false;
      pet.roamUntil = pet.t + 1200 + Math.floor(Math.random() * 1200);
      setLoc('roaming');
    }
    function sendHome() { if (cfg.desk && (pet.loc === 'roaming' || pet.loc === 'falling')) pet.returning = true; }

    // ── drag / throw ───────────────────────────────────────────────────────────
    function overScreen(x, y, m) {
      if (!screenEl) return false;
      const r = screenEl.getBoundingClientRect();
      m = m || 0;
      return x >= r.left-m && x <= r.right+m && y >= r.top-m && y <= r.bottom+m;
    }
    function dropTarget(on) { if (screenEl) screenEl.classList.toggle('drop', !!on); }
    function updateFear() { const fy = floorY(); pet.fear = Math.max(0, Math.min(1, (fy - pet.y) / Math.max(1, fy))); }
    function grab(cx, cy, fromDesk) {
      dragging = true;
      if (fromDesk) { pet.grabDX = PET_W/2; pet.grabDY = PET_H/2; pet.x = cx - pet.grabDX; pet.y = cy - pet.grabDY; }
      else { pet.grabDX = cx - pet.x; pet.grabDY = cy - pet.y; }
      pet.vx = 0; pet.vy = 0; lastPX = cx; lastPY = cy; updateFear();
      setLoc('held'); placeFreePet(); drawFreePet();
      global.addEventListener('pointermove', dragMove);
      global.addEventListener('pointerup', dragEnd);
      global.addEventListener('pointercancel', dragEnd);   // touch gesture interrupted = treat as a drop
    }
    function endDragListeners() {
      global.removeEventListener('pointermove', dragMove);
      global.removeEventListener('pointerup', dragEnd);
      global.removeEventListener('pointercancel', dragEnd);
    }
    function dragMove(e) {
      pet.x = e.clientX - pet.grabDX; pet.y = e.clientY - pet.grabDY;
      pet.vx = Math.max(-THROW_CAP, Math.min(THROW_CAP, (e.clientX-lastPX)*0.6 + pet.vx*0.4));
      pet.vy = Math.max(-THROW_CAP, Math.min(THROW_CAP, (e.clientY-lastPY)*0.6 + pet.vy*0.4));
      lastPX = e.clientX; lastPY = e.clientY; updateFear();
      dropTarget(overScreen(e.clientX, e.clientY));
      placeFreePet(); drawFreePet();
      if (bubble.classList.contains('show')) positionBubble();
      if (!reduceMotion) startPetLoop();
    }
    function dragEnd(e) {
      if (destroyed) return;
      dragging = false; dropTarget(false); endDragListeners();
      if (cfg.desk && overScreen(e.clientX, e.clientY)) seatInto();   // dropped on the desk → seat
      else if (!cfg.roam) seatInto();                                  // desk-only → always glide back
      else { pet.roamUntil = Infinity; pet.returning = false; setLoc('falling'); }
    }

    // ── status / clock ───────────────────────────────────────────────────────
    function setStatus(next, label) {
      if (!MON[next]) next = 'idle';
      status = next;
      if (statusEl) {
        statusEl.className = 'desksprite-status' + (next === 'working' ? ' s-working' : next === 'done' ? ' s-done' : next === 'error' ? ' s-error' : '');
        statusEl.textContent = label || next.toUpperCase();
      }
      if (next === 'working' && !dragging) sendHome();
      if (next === 'working') say(msg('working'));
      else if (next === 'done') say(msg('done'));
      else if (next === 'error') say(msg('error'));
      if (deskNeedsAnim() && !sceneRAF && !reduceMotion) sceneLoop();
      else if (next !== 'working') drawScene(tick);
      if (pet.loc !== 'desk') drawFreePet();
    }
    function updateClock() {
      if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (status !== 'working') {
        if (isLunch() && status === 'idle' && pet.loc === 'roaming' && !dragging) sendHome();
        if (pet.loc === 'desk') {
          if (isEating() && !reduceMotion) { if (!sceneRAF) sceneLoop(); }
          else if (!sceneRAF) drawScene(tick);
        }
      }
    }
    function renderCalendar() {
      if (!calEl) return;
      const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
      const days = new Date(y, m+1, 0).getDate();
      let html = `<div class="d dim" style="grid-column:1/-1">${MONTHS[m]} ${y}</div>`;
      for (let d = 1; d <= days; d++) html += `<div class="d${d === today ? ' today' : ''}">${d}</div>`;
      calEl.innerHTML = html;
    }

    // ── wiring ──────────────────────────────────────────────────────────────
    free.addEventListener('pointerdown', e => { if (pet.loc === 'roaming') { e.preventDefault(); grab(e.clientX, e.clientY, false); } });
    if (screenEl) screenEl.addEventListener('pointerdown', e => { if (pet.loc === 'desk') { e.preventDefault(); grab(e.clientX, e.clientY, true); } });
    const onResize = () => {
      if (pet.loc === 'seating') { const t = seatTarget(); pet.seatX = t.x; pet.seatY = t.y; }
      else if (pet.loc === 'roaming' || pet.loc === 'falling') { pet.y = Math.min(pet.y, floorY()); placeFreePet(); }
    };
    const onVis = () => { if (!document.hidden) { if (pet.loc !== 'desk' && !petRAF) startPetLoop(); if (deskNeedsAnim() && !sceneRAF) sceneLoop(); } };
    global.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    const clockTimer = setInterval(updateClock, 1000);

    // ── boot ────────────────────────────────────────────────────────────────
    renderCalendar(); updateClock();
    if (cfg.desk) { setStatus(status); setLoc('desk'); }
    else { pet.x = homeX(); pet.y = floorY(); pet.roamUntil = Infinity; setStatus(status); setLoc('roaming'); }

    // ── skinUrl async swap ───────────────────────────────────────────────────
    // After the instance boots with the initial skin, optionally fetch a remote
    // skin JSON. On success: swap the skin, re-derive the sprite box, clamp
    // position to the new box, and redraw both desk scene and free sprite.
    // On failure: keep the current skin silently.
    if (cfg.skinUrl && typeof fetch === 'function') {
      fetch(cfg.skinUrl).then(r => r.json()).then(s => {
        const sk = resolveSkin(s);
        skin = sk;
        PET_W = sk.size.w * PX;
        PET_H = sk.size.h * PX;
        free.width = PET_W; free.height = PET_H;
        free.style.width = PET_W + 'px'; free.style.height = PET_H + 'px';
        // Clamp position so the sprite stays within the viewport with the new box.
        pet.x = Math.max(0, Math.min(pet.x, global.innerWidth - PET_W));
        pet.y = Math.max(0, Math.min(pet.y, floorY()));
        drawScene(tick);
        if (pet.loc !== 'desk') drawFreePet();
      }).catch(() => {});
    }

    function destroy() {
      destroyed = true;
      if (sceneRAF) cancelAnimationFrame(sceneRAF);
      if (petRAF) cancelAnimationFrame(petRAF);
      sceneRAF = petRAF = null;
      clearInterval(clockTimer); clearTimeout(bubbleTimer); clearTimeout(wanderTimer);
      global.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      endDragListeners();
      [free, bubble, deskEl].forEach(n => n && n.remove());
    }

    return { setStatus, say, destroy, el: deskEl };
  }

  // ── Skin format helpers (pure; exported for tooling/tests) ──────────────────
  // a trait is a suggestion, not a contract — bad values just mean "use the default"
  function traitNumber(traits, key, fallback) {
    const v = traits ? traits[key] : undefined;
    return (typeof v === 'number' && isFinite(v) && v > 0) ? v : fallback;
  }

  function validateSkin(s) {
    const e = [];
    if (!s || typeof s !== 'object') return { ok: false, errors: ['not an object'] };
    if (!s.palette || typeof s.palette !== 'object') e.push('palette missing');
    if (!s.size || !(s.size.w > 0) || !(s.size.h > 0)) e.push('size invalid');
    if (!s.anchor || !(s.anchor.x >= 0) || !(s.anchor.y >= 0)) e.push('anchor invalid');
    const F = s.frames || {};
    const isFrame = f => Array.isArray(f) && f.length > 0 && f.every(r => typeof r === 'string')
      && f.every(r => r.length === f[0].length);
    if (!isFrame(F.idle)) e.push('frames.idle required (string[])');
    if (!isFrame(F.held)) e.push('frames.held required (string[])');
    if (!(Array.isArray(F.walk) && F.walk.length > 0 && F.walk.every(isFrame))) e.push('frames.walk required (frame[])');
    const all = [F.idle, F.held, F.fall, F.work, F.done, F.error, F.eat, F.carry, ...(F.walk || [])].filter(isFrame);
    if (s.size) for (const f of all) { if (f.length > s.size.h || f[0].length > s.size.w) { e.push('a frame exceeds size'); break; } }
    if (s.traits !== undefined && (typeof s.traits !== 'object' || s.traits === null || Array.isArray(s.traits))) e.push('traits invalid (must be an object)');
    return { ok: e.length === 0, errors: e };
  }
  function frameToGrid(rows, palette) {
    return rows.map(row => Array.from(row, ch => {
      if (ch === '.' || ch === ' ') return null;
      const c = palette[ch];
      return (c === undefined) ? null : c;   // unknown char = transparent
    }));
  }

  // ── Frame player (engine-side; used by every scene/free render) ─────────────
  // frameFor: pick the right frame ROWS for a state+status. `walk` returns null —
  // the caller cycles skin.frames.walk[counter % length] itself.
  function frameFor(sk, state, status) {
    const F = sk.frames;
    if (state === 'held')    return F.held;
    if (state === 'falling') return F.fall || F.held;
    if (state === 'walk')    return null;               // caller cycles the walk array
    if (status === 'working') return F.work || F.idle;
    if (status === 'done')    return F.done || F.idle;
    if (status === 'error')   return F.error || F.idle;
    return F.idle;
  }
  // drawFrame: paint a resolved colour grid at (ox, oy) with px-sized cells.
  function drawFrame(ctx, grid, ox, oy, px) {
    for (let y = 0; y < grid.length; y++) {
      const rowGrid = grid[y];
      for (let x = 0; x < rowGrid.length; x++) {
        const c = rowGrid[x];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(ox + x * px, oy + y * px, px, px);
      }
    }
  }
  // frameToGrid is pure but O(w*h); cache resolved grids per (skin, frame-rows).
  // Keyed by the skin object reference (outer WeakMap) → the frame-rows array
  // reference (inner Map), so swapping `skin` (Task 5) transparently uses a fresh
  // cache and the old one is GC'd. No manual invalidation needed.
  const gridCache = new WeakMap();
  function gridFor(sk, rows) {
    let inner = gridCache.get(sk);
    if (!inner) { inner = new Map(); gridCache.set(sk, inner); }
    let grid = inner.get(rows);
    if (!grid) { grid = frameToGrid(rows, sk.palette); inner.set(rows, grid); }
    return grid;
  }

  const DeskSprite = { start, version: '2.1.0', validateSkin, frameToGrid, resolveSkin, traitNumber };
  if (typeof module !== 'undefined' && module.exports) module.exports = DeskSprite;
  global.DeskSprite = DeskSprite;
})(typeof window !== 'undefined' ? window : this);
