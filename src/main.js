import './style.css';
import './collage.css';
import { Sound } from './audio.js';
import { Film } from './film.js';
import { TRANSITIONS } from './transitions.js';
import { buildScenes } from './scenes.js';

// The page never scrolls. One wheel gesture, swipe or arrow key = one cut.

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const framesEl = $('#frames');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const sound = new Sound();
const film = new Film(stage);
const fx = { flash: $('#fx-flash'), stat: $('#fx-static'), burn: $('#fx-burn'), gate: $('#fx-gate'), film, sound };
const { scenes, clearTimers } = buildScenes();
const FIRST_BACKABLE = scenes.findIndex((s) => s.id === 'building');

for (const s of scenes) {
  const el = document.createElement('section');
  el.className = `frame f-${s.id}`;
  el.setAttribute('aria-label', s.label);
  el.innerHTML = s.html;
  el.hidden = true;
  framesEl.append(el);
  s.el = el;
}

let cur = 0;
let busy = false;
let started = false;
let autoTimer = null;
let hintTimer = null;
const ctx = { sound, film };

// ---- HUD ----
const hud = { tc: $('#hud .tc'), sc: $('#hud .sc') };
film.onTick = () => {
  if (started) hud.tc.textContent = film.timecode();
};
const hint = $('#hint');
if (matchMedia('(pointer: coarse)').matches) hint.textContent = 'swipe to cut';
function scheduleHint() {
  clearTimeout(hintTimer);
  hint.classList.remove('on');
  const s = scenes[cur];
  if (s.auto || s.id === 'start' || cur === scenes.length - 1) return;
  hintTimer = setTimeout(() => hint.classList.add('on'), 2600);
}

// ---- scenes ----
function enter(i, dir) {
  const s = scenes[i];
  const el = s.el;
  el.classList.remove('in');
  void el.offsetWidth; // restart CSS entrance animations
  el.classList.add('in');

  const prevEra = stage.dataset.era;
  stage.dataset.era = s.era;
  stage.dataset.scene = s.id;
  stage.classList.toggle('rec', !!s.rec);
  if (s.era === 'reel' && prevEra !== 'reel') sound.reelUp();
  if (s.era === 'show' && prevEra === 'reel') sound.reelDown();

  hud.sc.textContent = `SC ${String(i).padStart(2, '0')} / ${String(scenes.length - 1).padStart(2, '0')}`;
  s.enter?.(el, ctx, dir);
  scheduleHint();
  if (s.auto) autoTimer = setTimeout(() => go(1), s.auto);
}

function leave(i) {
  clearTimeout(autoTimer);
  const s = scenes[i];
  clearTimers(s);
  s.leave?.(s.el, ctx);
}

async function goTo(next, dir) {
  if (busy || next === cur || next < 0 || next >= scenes.length) return;
  busy = true;
  clearTimeout(hintTimer);
  hint.classList.remove('on');
  const a = scenes[cur].el;
  const b = scenes[next].el;
  leave(cur);
  let name = dir > 0 ? scenes[next].in : 'reel';
  if (reduce) name = 'fade';
  if (dir < 0) sound.rewind();
  await TRANSITIONS[name](a, b, dir, fx);
  a.hidden = true;
  b.hidden = false;
  for (const el of [a, b]) el.getAnimations().forEach((x) => x.cancel());
  cur = next;
  enter(cur, dir);
  busy = false;
  cutDoneAt = performance.now();
}

function go(dir) {
  if (!started) return;
  if (dir < 0 && cur + dir < FIRST_BACKABLE) return;
  goTo(cur + dir, dir);
}

// ---- starting the reel (sound needs a real click) ----
function begin(withSound) {
  if (started) return;
  started = true;
  film.t0 = performance.now();
  if (withSound) {
    sound.start();
    sound.playMusic('/music/theme.mp3');
  }
  else sound.setMuted(true);
  const mute = $('#mute');
  mute.hidden = false;
  mute.textContent = withSound ? 'sound on' : 'sound off';
  hint.textContent = matchMedia('(pointer: coarse)').matches ? 'swipe to cut' : 'scroll to cut';
  goTo(1, 1);
}
scenes[0].el.querySelector('.start').addEventListener('click', () => begin(true));
scenes[0].el.querySelector('.silent').addEventListener('click', () => begin(false));
$('#mute').addEventListener('click', (e) => {
  const turnOn = sound.muted || !sound.ctx;
  sound.start();
  sound.playMusic('/music/theme.mp3');
  sound.setMuted(!turnOn);
  if (turnOn && stage.dataset.era === 'reel') sound.reelUp();
  e.currentTarget.textContent = turnOn ? 'sound on' : 'sound off';
});

// ---- input: one gesture = one cut ----
// Trackpads keep firing wheel events (momentum) after a flick. Once a gesture
// has caused a cut, its decaying tail is ignored, but a fresh push (the wheel
// going quiet, the deltas growing again, or a steady scroll that keeps going
// after the cut has landed) counts as a new gesture.
let lastWheel = 0;
let lastAbs = 0;
let acc = 0;
let consumed = false;
let cutDoneAt = 0;
let consumedSince = 0;
addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const now = performance.now();
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const abs = Math.abs(delta);
    if (!started) {
      if (abs > 4) nudgeStart();
      return;
    }
    const quiet = now - lastWheel > 160;
    const rising = abs > lastAbs * 1.4 + 3 && now - cutDoneAt > 120;
    const held = consumed && !busy && now - cutDoneAt > 650 && now - consumedSince > 900 && abs > 8;
    if (quiet || rising || held) {
      consumed = false;
      if (quiet) acc = 0;
    }
    lastWheel = now;
    lastAbs = abs;
    if (consumed || busy) return;
    acc += delta;
    if (Math.abs(acc) > 30) {
      consumed = true;
      consumedSince = now;
      go(Math.sign(acc));
      acc = 0;
    }
  },
  { passive: false }
);

// scrolling on the ticket: point at the button instead of doing nothing
const startBtn = scenes[0].el.querySelector('.start');
let nudgeTimer = null;
function nudgeStart() {
  if (startBtn.classList.contains('nudge')) return;
  startBtn.classList.add('nudge');
  hint.textContent = 'click to start the reel';
  hint.classList.add('on');
  clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(() => startBtn.classList.remove('nudge'), 900);
}

let touchY = null;
addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
addEventListener('touchend', (e) => {
  if (touchY === null) return;
  const dy = touchY - e.changedTouches[0].clientY;
  touchY = null;
  if (Math.abs(dy) > 40) {
    if (!started) nudgeStart();
    else go(dy > 0 ? 1 : -1);
  }
});

addEventListener('keydown', (e) => {
  if (e.target.closest?.('button') && (e.key === 'Enter' || e.key === ' ')) return;
  if (['ArrowDown', 'ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) {
    e.preventDefault();
    if (!started) begin(true);
    else go(1);
  } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    go(-1);
  }
});

// ---- go ----
film.start();
scenes[0].el.hidden = false;
enter(0, 1);
