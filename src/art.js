// Illustrated backdrops, all inline SVG (viewBox 1600x900). Placeholders
// until there are real photos of the cast.

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a woman walking, in silhouette, rim-lit. (x, y) is where her feet touch the ground
export function figure(x, y, s = 1, flip = false) {
  return `<g class="fig" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <path class="hair" d="M-52 -352c4-62 98-74 112-6 6 34-2 74 8 112-20 6-38-6-46-26l-4-60c-14-10-40-10-52 2l-6 58c-10 22-28 30-44 22 18-34 26-66 32-102z"/>
    <ellipse cx="2" cy="-330" rx="36" ry="44"/>
    <path d="M-16 -290h34l6 30h-46z"/>
    <path d="M-66 -262c44-22 92-22 136 0l18 120 46 140h-286l52-140z"/>
    <path d="M-40 -2l-10 168h22l20-168zM20 -2l28 160h22l-24-160z"/>
    <path d="M-52 162h34v10h-40zM44 154h34l4 12h-40z"/>
    <path class="strap" d="M40 -250l70 118" fill="none" stroke-width="8"/>
    <rect x="80" y="-142" width="86" height="64" rx="10"/>
  </g>`;
}

export function skyline(seed, { back = false, windows = true } = {}) {
  const r = rng(seed);
  let x = -30;
  let shapes = '';
  let wins = '';
  let i = 0;
  while (x < 1640) {
    const w = 46 + r() * 104;
    let bh = (back ? 260 : 150) + r() * (back ? 420 : 380);
    if (!back && i === 9) bh = 640; // the tall one
    const y = 900 - bh;
    shapes += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${bh.toFixed(0)}"/>`;
    if (!back && i === 9) {
      shapes += `<rect x="${(x + w * 0.2).toFixed(0)}" y="${y - 50}" width="${(w * 0.6).toFixed(0)}" height="50"/>
        <rect x="${(x + w * 0.35).toFixed(0)}" y="${y - 90}" width="${(w * 0.3).toFixed(0)}" height="40"/>
        <rect x="${(x + w / 2 - 3).toFixed(0)}" y="${y - 190}" width="6" height="100"/>`;
    } else if (r() < 0.25) {
      shapes += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l${(w / 2).toFixed(0)} -${(20 + r() * 40).toFixed(0)}l${(w / 2).toFixed(0)} ${(20 + r() * 40).toFixed(0)}z"/>`;
    } else if (r() < 0.3) {
      shapes += `<rect x="${(x + w * 0.6).toFixed(0)}" y="${y - 34}" width="22" height="34"/>`; // water tower
    }
    if (windows && !back) {
      for (let wy = y + 18; wy < 860; wy += 22) {
        for (let wx = x + 9; wx < x + w - 12; wx += 15) {
          if (r() < 0.5) {
            const on = r() < 0.55 ? ' on' : '';
            wins += `<rect class="w${on}" x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="10" style="--d:${(r() * 5).toFixed(2)}s"/>`;
          }
        }
      }
    }
    x += w + (r() < 0.3 ? 6 : -4);
    i++;
  }
  return { shapes, wins };
}

const SKY = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

export function cityArt() {
  const back = skyline(7, { back: true });
  const front = skyline(21);
  const r = rng(3);
  let stars = '';
  for (let i = 0; i < 40; i++) stars += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(r() * 1.6 + 0.4).toFixed(1)}"/>`;
  return `<svg class="art crane" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
    <defs>${SKY('dusk', [[0, '#1b1440'], [0.45, '#5b2a6e'], [0.75, '#c8507a'], [1, '#f6a77a']])}</defs>
    <rect width="1600" height="900" fill="url(#dusk)"/>
    <g fill="#fff4e0" opacity=".7">${stars}</g>
    <circle cx="1260" cy="170" r="46" fill="#ffeccd" opacity=".9"/>
    <g fill="#4a2c63" opacity=".85">${back.shapes}</g>
    <g fill="#140d20">${front.shapes}</g>
    <g class="wins">${front.wins}</g>
    <rect y="868" width="1600" height="40" fill="#0b0812"/>
  </svg>`;
}

export function stoopArt() {
  let steps = '';
  for (let i = 0; i < 7; i++) {
    steps += `<rect x="${960 - i * 34}" y="${590 + i * 42}" width="${380 + i * 68}" height="42" fill="${i % 2 ? '#6d3a2c' : '#74402f'}"/>
      <rect x="${960 - i * 34}" y="${590 + i * 42}" width="${380 + i * 68}" height="5" fill="#8a5240"/>`;
  }
  return `<svg class="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="brick" width="64" height="26" patternUnits="userSpaceOnUse">
        <rect width="64" height="26" fill="#5a2b21"/>
        <path d="M0 25H64M0 12H64M32 0V12M0 12V26M64 12V26" stroke="#47201a" stroke-width="2.5"/>
      </pattern>
      <radialGradient id="glow"><stop offset="0" stop-color="#ffd08a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#brick)"/>
    <rect x="180" y="110" width="250" height="330" fill="#f1bd72" opacity=".8"/>
    <path d="M180 110h250v330h-250z M305 110v330 M180 270h250" fill="none" stroke="#2a1410" stroke-width="12"/>
    <path d="M190 120q60 120 0 310" fill="#c4553f" opacity=".7"/>
    <rect x="1040" y="160" width="250" height="430" fill="#24110c"/>
    <path d="M1040 160a125 125 0 0 1 250 0z" fill="#f6b45a" opacity=".9"/>
    <path d="M1070 200h80v160h-80zM1180 200h80v160h-80zM1070 400h80v160h-80zM1180 400h80v160h-80z" fill="none" stroke="#3b1d15" stroke-width="6"/>
    <circle cx="1238" cy="380" r="7" fill="#d9a441"/>
    ${steps}
    <path d="M1010 590L770 884M1330 590L1580 884" stroke="#0b0606" stroke-width="10"/>
    <path d="M1010 540L770 834M1330 540L1580 834" stroke="#0b0606" stroke-width="6"/>
    <circle cx="1440" cy="210" r="300" fill="url(#glow)"/>
    <path d="M1430 120h20v40h-20z" fill="#1a0d09"/><circle cx="1440" cy="175" r="18" fill="#ffe2a8"/>
    <rect y="884" width="1600" height="30" fill="#251c22"/>
    ${figure(520, 884, 1.05)}
  </svg>`;
}

export function bodegaArt() {
  const r = rng(11);
  const colors = ['#e94f64', '#f2c230', '#5fb4e8', '#7bd389', '#f39c4a', '#c983e8', '#fff1d6'];
  let shelf = '';
  for (let row = 0; row < 4; row++) {
    const y = 420 + row * 90;
    shelf += `<rect x="330" y="${y + 58}" width="940" height="6" fill="#8a5a2c" opacity=".7"/>`;
    for (let x = 340; x < 1250; x += 18 + r() * 14) {
      const h = 26 + r() * 30;
      shelf += `<rect x="${x.toFixed(0)}" y="${(y + 58 - h).toFixed(0)}" width="${(12 + r() * 10).toFixed(0)}" height="${h.toFixed(0)}" fill="${colors[(r() * colors.length) | 0]}" opacity=".85"/>`;
    }
  }
  return `<svg class="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      ${SKY('shop', [[0, '#ffe7b0'], [1, '#f2a85a']])}
      <pattern id="awn" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#c8243a"/><rect x="40" width="40" height="10" fill="#f7efe2"/></pattern>
      <filter id="neon" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1600" height="900" fill="#1d1420"/>
    <rect y="0" width="1600" height="190" fill="#141022"/>
    <rect x="280" y="140" width="1040" height="70" fill="#14352a"/>
    <text x="800" y="188" text-anchor="middle" class="sign">DELI · GROCERY · OPEN 24 HRS</text>
    <path d="M250 210h1100l-40 110h-1020z" fill="url(#awn)"/>
    <path d="M290 320h1020" stroke="#7c1525" stroke-width="6"/>
    <rect x="320" y="340" width="960" height="470" fill="url(#shop)"/>
    ${shelf}
    <text x="1120" y="420" text-anchor="middle" class="neon" filter="url(#neon)">OPEN</text>
    <path d="M1150 810c-6-40 4-70 22-84l-6-26 16 16c10-4 20-4 30 0l16-16-6 26c18 14 26 50 18 84z" fill="#1a1016"/>
    <path d="M1210 806c40 6 60-20 56-46" stroke="#1a1016" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M320 340h960v470h-960zM800 340v470" fill="none" stroke="#2a1d16" stroke-width="14"/>
    <rect x="1300" y="330" width="200" height="480" fill="#120c12"/>
    <rect y="810" width="1600" height="90" fill="#2a2228"/>
    <rect y="810" width="1600" height="6" fill="#3d3138"/>
    ${figure(240, 884, 1)}
  </svg>`;
}

export function fireEscapeArt() {
  let wall = '';
  for (let y = 140; y < 860; y += 210) {
    for (const x of [140, 520]) {
      const lit = (x + y) % 3 !== 0;
      wall += `<rect x="${x}" y="${y}" width="170" height="140" fill="${lit ? '#f1c27d' : '#2b2238'}" opacity="${lit ? 0.85 : 1}"/>
        <path d="M${x} ${y + 70}h170M${x + 85} ${y}v140" stroke="#2a1a14" stroke-width="7"/>`;
    }
  }
  let rails = '';
  for (const py of [330, 620]) {
    rails += `<rect x="80" y="${py}" width="700" height="10" fill="#0c0a10"/><path d="M80 ${py - 70}h700" stroke="#0c0a10" stroke-width="6"/>`;
    for (let x = 80; x <= 780; x += 35) rails += `<path d="M${x} ${py - 70}v70" stroke="#0c0a10" stroke-width="3"/>`;
  }
  let bulbs = '';
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const x = 780 + t * 800;
    const y = 90 + Math.sin(t * Math.PI) * 120;
    bulbs += `<circle class="bulb" cx="${x.toFixed(0)}" cy="${(y + 10).toFixed(0)}" r="7" style="--d:${(i * 0.13).toFixed(2)}s"/>`;
  }
  const back = skyline(42, { back: true });
  return `<svg class="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      ${SKY('night', [[0, '#0d1030'], [0.7, '#33204f'], [1, '#6a2e5c']])}
      <pattern id="brick2" width="64" height="26" patternUnits="userSpaceOnUse"><rect width="64" height="26" fill="#4a2621"/><path d="M0 25H64M0 12H64M32 0V12M0 12V26M64 12V26" stroke="#391b17" stroke-width="2.5"/></pattern>
    </defs>
    <rect width="1600" height="900" fill="url(#night)"/>
    <circle cx="1330" cy="330" r="58" fill="#f6eac8"/>
    <g fill="#241838">${back.shapes}</g>
    <rect width="860" height="900" fill="url(#brick2)"/>
    ${wall}
    ${rails}
    <path d="M600 340L760 610M200 630L360 900" stroke="#0c0a10" stroke-width="8"/>
    <path d="M620 330L780 600M220 620L380 890" stroke="#0c0a10" stroke-width="5" stroke-dasharray="4 22"/>
    <path d="M780 90Q1180 330 1580 90" stroke="#1b1524" stroke-width="2" fill="none"/>
    ${bulbs}
    ${figure(470, 620, 0.68)}
  </svg>`;
}

export function taxiArt() {
  const r = rng(5);
  const tints = ['#ffcf6b', '#ff6f91', '#7fd1ff', '#fff3c4', '#ff9a4d', '#c79bff'];
  let bokeh = '';
  for (let i = 0; i < 46; i++) {
    bokeh += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 700).toFixed(0)}" r="${(20 + r() * 70).toFixed(0)}" fill="${tints[(r() * tints.length) | 0]}" opacity="${(0.15 + r() * 0.45).toFixed(2)}"/>`;
  }
  return `<svg class="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="bk"><feGaussianBlur stdDeviation="14"/></filter>
      <pattern id="check" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#111"/><rect x="20" y="20" width="20" height="20" fill="#111"/><rect x="20" width="20" height="20" fill="#f2c230"/><rect y="20" width="20" height="20" fill="#f2c230"/></pattern>
      ${SKY('cab', [[0, '#f7cf3c'], [1, '#d9a51c']])}
    </defs>
    <rect width="1600" height="900" fill="#120e1c"/>
    <g filter="url(#bk)" class="bokeh">${bokeh}</g>
    <path d="M0 80h1600v40h-1600z" fill="url(#cab)"/>
    <rect x="0" y="120" width="190" height="460" fill="url(#cab)"/>
    <rect x="1380" y="120" width="220" height="460" fill="url(#cab)"/>
    <rect x="770" y="120" width="40" height="460" fill="#d9a51c"/>
    <rect x="190" y="120" width="580" height="460" fill="#0e0b16" opacity=".45"/>
    <rect x="810" y="120" width="570" height="460" fill="#0e0b16" opacity=".55"/>
    <g class="fig">
      <path d="M380 580c0-90 60-140 150-140s150 50 150 140z"/>
      <ellipse cx="530" cy="360" rx="62" ry="76"/>
      <path class="hair" d="M458 380c-14-110 40-160 90-150 60 6 90 60 70 170-4 50 6 90 30 110-50 10-70-30-74-70l-2-80c-30-20-70-20-96 0z"/>
    </g>
    <path d="M190 120l220 0-220 300zM900 120h160l-250 460h-0z" fill="#fff" opacity=".07"/>
    <rect y="580" width="1600" height="320" fill="url(#cab)"/>
    <rect y="660" width="1600" height="40" fill="url(#check)"/>
    <rect x="620" y="610" width="120" height="16" rx="8" fill="#a77b0f"/>
    <text x="1000" y="800" class="cabtext">NYC TAXI</text>
    <text x="300" y="800" class="cabtext small">5W12</text>
  </svg>`;
}

export function busArt(title, tagline) {
  return `<svg viewBox="0 0 1100 360">
    <rect x="10" y="20" width="1080" height="290" rx="26" fill="#eef2f5"/>
    <rect x="10" y="240" width="1080" height="34" fill="#1f4ea3"/>
    <rect x="10" y="20" width="1080" height="20" rx="10" fill="#d7dde3"/>
    <rect x="40" y="56" width="130" height="150" rx="10" fill="#23202b"/>
    <rect x="44" y="60" width="122" height="24" fill="#ff9a3c"/><text x="105" y="78" text-anchor="middle" class="dest">M15 BRUNCH</text>
    ${[200, 330, 460, 590, 720, 850, 970].map((x) => `<rect x="${x}" y="56" width="${x === 970 ? 90 : 112}" height="86" rx="8" fill="#2b2a38"/>`).join('')}
    <rect x="248" y="150" width="660" height="84" rx="6" fill="#16121c"/>
    <text x="578" y="196" text-anchor="middle" class="ad">${title.toUpperCase()}…</text>
    <text x="578" y="222" text-anchor="middle" class="ad2">${tagline}</text>
    <rect x="16" y="214" width="26" height="18" rx="5" fill="#fff6c8"/>
    <circle cx="210" cy="310" r="44" fill="#111"/><circle cx="210" cy="310" r="18" fill="#777"/>
    <circle cx="900" cy="310" r="44" fill="#111"/><circle cx="900" cy="310" r="18" fill="#777"/>
  </svg>`;
}

export function busStreetArt() {
  const back = skyline(77, { back: true });
  const front = skyline(91, { windows: false });
  return `<svg class="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
    <defs>${SKY('eve', [[0, '#2a1f4f'], [0.5, '#a5487a'], [1, '#ffb27c']])}</defs>
    <rect width="1600" height="900" fill="url(#eve)"/>
    <g fill="#5a3570" opacity=".8" transform="translate(0 -120)">${back.shapes}</g>
    <g fill="#24182f" transform="translate(0 -150)">${front.shapes}</g>
    <rect y="700" width="1600" height="200" fill="#17131c"/>
    <rect y="700" width="1600" height="14" fill="#3a3040"/>
    <path d="M0 820h1600" stroke="#f2c230" stroke-width="5" stroke-dasharray="70 60" opacity=".7"/>
    <ellipse class="puddle" cx="820" cy="780" rx="260" ry="26" fill="#6c86b8" opacity=".55"/>
  </svg>`;
}
