// The printed-collage look: riso-inked placeholders, film negatives, photobooth
// strips, tape, typewriter captions and hand-drawn doodles. Photos get their
// ink from the SVG filters in index.html (#riso-blue, #riso-red, #riso-cross,
// #riso-bw). Friends without a photo yet get a silhouette in the same ink.

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
  const initial = c.name === 'you' ? 'you' : c.name.trim()[0];
  return `<div class="ph empty ${cls}" data-ink="${ink}"><span class="initial">${initial}</span><span class="soon">photo soon</span></div>`;
}

// a player card: coloured border, title tag, photo, stats
export function card(c, i, cls = '') {
  const stats = (c.stats || [])
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
  return `<article class="card ${cls}" style="--card:${c.color || '#f2c94c'}">
    <span class="tag">${c.title || c.name}</span>
    <div class="cardph">${photo(c, INKS[i % INKS.length])}</div>
    <dl class="stats">${stats}</dl>
  </article>`;
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

// cozy things to put in the windows (viewBox 0 0 100 100, sill at the bottom)
const PROPS = {
  plant: `<rect x="40" y="76" width="20" height="18" rx="2" fill="#c9714f"/><ellipse cx="50" cy="66" rx="7" ry="14" fill="#6f9a62"/><ellipse cx="40" cy="70" rx="5" ry="11" fill="#86ad74" transform="rotate(-30 40 70)"/><ellipse cx="60" cy="70" rx="5" ry="11" fill="#86ad74" transform="rotate(30 60 70)"/>`,
  lamp: `<circle cx="34" cy="52" r="26" fill="#fff6d8" opacity=".55"/><path d="M24 50h20l-5-16h-10z" fill="#e8a7a0"/><rect x="32.5" y="50" width="3" height="36" fill="#7b5a4a"/><rect x="26" y="86" width="16" height="4" rx="2" fill="#7b5a4a"/>`,
  cat: `<path d="M56 94c-2-14 2-24 10-28l-2-9 6 6c3-1 7-1 10 0l6-6-2 9c8 4 10 16 8 28z" fill="#6b5560"/><path d="M90 92c10 2 12-8 8-14" stroke="#6b5560" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  lights: `<path d="M0 14Q50 40 100 14" stroke="#7b5a4a" stroke-width="1.2" fill="none"/>${[8, 22, 36, 50, 64, 78, 92].map((x) => `<circle class="bulb" cx="${x}" cy="${(14 + 26 * Math.sin((x / 100) * Math.PI) * 0.75).toFixed(1)}" r="3.2" fill="#fff1b8"/>`).join('')}`,
  flowers: `<path d="M44 92h12l2-16h-16z" fill="#9fb7d9"/><path d="M50 76V58M50 76l-9-14M50 76l9-12" stroke="#6f9a62" stroke-width="2"/><circle cx="50" cy="56" r="5" fill="#f0a6a0"/><circle cx="40" cy="61" r="4.5" fill="#f6d27a"/><circle cx="60" cy="63" r="4.5" fill="#f0a6a0"/>`,
  tv: `<rect x="26" y="54" width="48" height="32" rx="4" fill="#5b5168"/><rect x="30" y="58" width="40" height="24" rx="2" class="tvglow"/><rect x="46" y="86" width="8" height="6" fill="#5b5168"/>`,
  books: `<rect x="20" y="70" width="8" height="22" fill="#e2725b"/><rect x="29" y="66" width="7" height="26" fill="#7f9bd6"/><rect x="37" y="72" width="9" height="20" fill="#8fb08a"/><rect x="47" y="68" width="6" height="24" fill="#f2c66d"/><rect x="56" y="74" width="20" height="5" fill="#e8a7a0" transform="rotate(-8 66 76)"/>`,
  mug: `<rect x="62" y="78" width="14" height="14" rx="3" fill="#fbeedd" stroke="#c9714f" stroke-width="2"/><path d="M66 74q2-6 0-10M71 74q2-6 0-10" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8"/>`,
};
const PROP_KEYS = Object.keys(PROPS);

// the establishing shot: a building at dusk, something cozy in every window
export function building(cast) {
  const rnd = (() => {
    let s = 9;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const rooms = ['#f6e3b4', '#f9d2b8', '#f4c7c3', '#dfe8cf', '#fbeedd', '#f2d9a2', '#e9dff0'];
  const cols = 6;
  const rows = 6;
  const photoSpot = { 13: 0, 26: 1, 21: 2, 8: 3 };
  let wins = '';
  for (let i = 0; i < cols * rows; i++) {
    const castIdx = photoSpot[i];
    const dark = castIdx === undefined && rnd() < 0.1;
    const room = rooms[Math.floor(rnd() * rooms.length)];
    let inside = '';
    if (castIdx !== undefined && cast[castIdx]) {
      inside = photo(cast[castIdx], INKS[castIdx % INKS.length], 'winph');
    } else if (!dark && rnd() < 0.8) {
      const a = PROP_KEYS[Math.floor(rnd() * PROP_KEYS.length)];
      const b = rnd() < 0.35 ? PROP_KEYS[Math.floor(rnd() * PROP_KEYS.length)] : null;
      const sway = a === 'plant' || a === 'flowers' ? ' mv-sway' : a === 'cat' ? ' mv-cat' : '';
      inside = `<svg class="prop${sway}" style="--s:${(0.6 + rnd()).toFixed(2)}s" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${PROPS[a]}${b && b !== a ? PROPS[b] : ''}</svg>`;
    }
    const flick = !dark && castIdx === undefined && rnd() < 0.1 ? ' flick' : '';
    const curtain = !dark && rnd() < 0.35 ? `<i class="curtain ${rnd() < 0.5 ? 'l' : 'r'}"></i>` : '';
    wins += `<div class="win${dark ? ' dark' : ''}${flick}${castIdx !== undefined ? ' star' : ''}" style="--room:${room};--d:${(rnd() * 2.4).toFixed(2)}s">${inside}${curtain}</div>`;
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
