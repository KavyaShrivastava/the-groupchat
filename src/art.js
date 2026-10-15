// A placeholder person in silhouette, until there's a real photo.

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
