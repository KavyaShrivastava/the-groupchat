// The printed-collage look: riso-inked placeholders, film negatives, photobooth
// strips, tape, typewriter captions and hand-drawn doodles. Photos get their
// ink from the SVG filters in index.html (#riso-blue, #riso-red, #riso-cross,
// #riso-bw). Friends without a photo yet get a silhouette in the same ink.

import { figure } from './art.js';

export const INKS = ['riso-blue', 'riso-red', 'riso-cross', 'riso-bw'];

export const today = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
})();

export function photo(c, ink, cls = '') {
  if (c.photo) {
    // real photos stay true to life: no ink, just a touch of film warmth
    return `<div class="ph real ${cls}"><img src="${c.photo}" alt="${c.name}" draggable="false"></div>`;
  }
  return `<div class="ph empty ${cls}" data-ink="${ink}"><svg viewBox="-230 -430 460 620" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${figure(0, 190, 1)}</svg><i class="halftone"></i></div>`;
}

export function negative(c, offset = 0) {
  const nums = [19, 20, 21].map((n) => n + offset);
  return `<div class="neg">
    <span class="edge top">${nums.map((n) => `▸${n}A`).join('&emsp;&emsp;')}</span>
    ${[1, 2, 0].map((k) => photo(c, INKS[(k + offset) % INKS.length], 'nf')).join('')}
    <span class="edge bottom">PORTRA 400&emsp;${nums.join('&emsp;&emsp;')}</span>
  </div>`;
}

const DOODLES = [
  // a loose star
  'M60 8l14 40 42 2-33 26 12 41-35-24-35 24 12-41-33-26 42-2z',
  // a heart with a wobble
  'M80 130C30 95 8 66 14 40 20 14 52 6 72 30c6 8 8 12 8 12s6-12 16-20c22-18 50-6 52 22 2 30-28 58-68 86z',
  // a spiral
  'M80 70c0-8 10-10 14-4 6 10-6 22-18 20-18-4-22-28-8-40 20-16 50-4 52 22 2 30-30 48-58 40',
  // a little speech bubble
  'M20 30c0-14 14-24 60-24s60 10 60 24v40c0 14-14 24-60 24-10 0-20 0-28-2L24 116l10-28c-10-4-14-10-14-18z',
];

export function doodle(k, cls = '') {
  return `<svg class="doodle ${cls}" viewBox="0 0 160 140" aria-hidden="true"><path d="${DOODLES[k % DOODLES.length]}"/></svg>`;
}

// the establishing shot: a building at night, a life in every window
export function building(cast) {
  const rnd = (() => {
    let s = 9;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const rooms = ['#f2b65c', '#e8853f', '#f4d58a', '#d6452e', '#3d5bc4', '#f3e2bd', '#2a2235'];
  const cols = 6;
  const rows = 6;
  const photoSpot = { 13: 0, 26: 1, 21: 2, 8: 3 };
  let wins = '';
  for (let i = 0; i < cols * rows; i++) {
    const castIdx = photoSpot[i];
    const dark = castIdx === undefined && rnd() < 0.22;
    const room = dark ? '#1c1724' : rooms[Math.floor(rnd() * (rooms.length - 1))];
    let inside = '';
    if (castIdx !== undefined && cast[castIdx]) {
      inside = photo(cast[castIdx], INKS[castIdx % INKS.length], 'winph');
    } else if (!dark && rnd() < 0.6) {
      const two = rnd() < 0.35;
      const flip = rnd() < 0.5;
      const move = ['bob', 'sway', 'walk', 'bob', 'sway', ''][Math.floor(rnd() * 6)];
      inside = `<svg class="mv-${move}" style="--s:${(0.5 + rnd()).toFixed(2)}s" viewBox="-230 -175 460 390" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${figure(two ? -90 : 0, 200, 1, flip)}${two ? figure(110, 200, 0.95, !flip) : ''}</svg>`;
    }
    const flick = !dark && castIdx === undefined && rnd() < 0.15 ? ' flick' : '';
    const curtain = !dark && rnd() < 0.3 ? `<i class="curtain ${rnd() < 0.5 ? 'l' : 'r'}"></i>` : '';
    wins += `<div class="win${dark ? ' dark' : ''}${flick}${castIdx !== undefined ? ' star' : ''}" style="--room:${room};--d:${(rnd() * 3.2).toFixed(2)}s">${inside}${curtain}</div>`;
  }
  return `<div class="building crane"><div class="facade">${wins}</div></div>`;
}

// everyone's photo in a View-Master disc: one click, one picture
export function viewMaster(cast) {
  const people = [...cast, { name: 'you' }, ...cast].slice(0, 7);
  const slots = people
    .map((c, i) => {
      const a = (360 / 7) * i;
      return `<div class="slot" style="--a:${a}deg"><div class="slotin">${photo(c, INKS[i % INKS.length], 'slotph')}</div></div>`;
    })
    .join('');
  const nums = [1, 2, 3, 4, 5, 6, 7]
    .map((n, i) => `<span class="vmnum" style="--a:${(360 / 7) * i + 360 / 14}deg">${n}</span>`)
    .join('');
  return `<div class="vm"><div class="disc">${slots}${nums}<i class="arrow"></i><i class="hub"></i><i class="notch"></i></div></div>`;
}
