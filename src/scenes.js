import { SHOW, CAST, PREVIOUSLY, EPISODE } from './cast.js';
import { cityArt, stoopArt, bodegaArt, fireEscapeArt, taxiArt, busArt, busStreetArt } from './art.js';

// Each scene is one frame of the opening. `in` names the transition used to
// cut INTO it; `era` drives the film look (pre = before the reel starts,
// reel = old film, show = the show proper); `auto` advances on its own.

const PLACE_ART = { stoop: stoopArt, bodega: bodegaArt, fireescape: fireEscapeArt, taxi: taxiArt };
const CAST_CUTS = ['whip', 'flash', 'whip', 'flash'];

const later = (s, fn, ms) => s.timers.push(setTimeout(fn, ms));
const clearTimers = (s) => {
  s.timers.forEach(clearTimeout);
  s.timers = [];
};

function paparazzi(s, el, sound) {
  const layer = el.querySelector('.pap');
  [450, 700, 1350, 1520].forEach((ms) =>
    later(s, () => {
      const f = document.createElement('i');
      f.style.left = `${8 + Math.random() * 84}%`;
      f.style.top = `${10 + Math.random() * 60}%`;
      layer.append(f);
      sound.shutter();
      setTimeout(() => f.remove(), 600);
    }, ms)
  );
}

export function buildScenes() {
  const castScenes = CAST.map((c, i) => ({
    id: `cast-${i}`,
    label: `Starring ${c.name}`,
    era: 'reel',
    in: CAST_CUTS[i % CAST_CUTS.length],
    rec: true,
    html: `${PLACE_ART[c.place]()}
      <div class="pap"></div>
      <div class="credit${c.place === 'taxi' ? ' right' : ''}">
        <small>${i === 0 ? 'starring' : 'and'}</small>
        <h2>${c.name}</h2>
        <p>who ${c.role}</p>
      </div>`,
    enter(el, { sound }) {
      paparazzi(this, el, sound);
    },
  }));

  const typed = `I couldn’t help but wonder… ${EPISODE.question}`;

  const scenes = [
    {
      id: 'start',
      label: 'Start',
      era: 'pre',
      in: 'fade',
      html: `<div class="ticket">
          <span class="t-top">admit one</span>
          <h1>${SHOW.title}<span class="ell">…</span></h1>
          <p class="t-sub">${SHOW.season} · The Premiere</p>
          <button class="start" type="button">▶&nbsp; start the reel</button>
          <button class="silent" type="button">or watch silently</button>
          <span class="stub">No. 000001</span>
        </div>
        <p class="sound-note">best with sound on</p>`,
    },
    {
      id: 'leader',
      label: 'Countdown',
      era: 'reel',
      in: 'static',
      auto: 3300,
      html: `<div class="leader"><div class="sweep"></div><div class="ring r1"></div><div class="ring r2"></div><div class="cross"></div><span class="num">3</span></div>`,
      enter(el, { sound }) {
        const num = el.querySelector('.num');
        [3, 2, 1].forEach((n, k) =>
          later(this, () => {
            num.textContent = n;
            sound.beep();
          }, k * 1000 + 60)
        );
      },
    },
    {
      id: 'city',
      label: 'The city at dusk',
      era: 'reel',
      in: 'reel',
      rec: true,
      html: `${cityArt()}
        <div class="taxis"><i></i><i></i><i></i><i></i></div>
        <div class="credit center">
          <small>a group chat production</small>
          <p>filmed on location, mostly in the chat</p>
        </div>`,
    },
    ...castScenes,
    {
      id: 'bus',
      label: 'The bus goes by',
      era: 'reel',
      in: 'iris',
      rec: true,
      html: `${busStreetArt()}
        <div class="bus">${busArt(SHOW.title, SHOW.premiere)}</div>
        <div class="splash">${Array.from({ length: 28 }, () => {
          const sz = 14 + Math.random() * 70;
          return `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 90).toFixed(1)}%;width:${sz.toFixed(0)}px;height:${(sz * (0.8 + Math.random() * 0.5)).toFixed(0)}px;--d:${(Math.random() * 0.25).toFixed(2)}s"></i>`;
        }).join('')}</div>
        <div class="credit right late"><small>and</small><h2>you</h2><p>obviously</p></div>`,
      enter(el, { sound }) {
        sound.rumble();
        later(this, () => {
          el.classList.add('splashed');
          sound.splash();
        }, 1500);
      },
      leave(el) {
        el.classList.remove('splashed');
      },
    },
    {
      id: 'title',
      label: SHOW.title,
      era: 'show',
      in: 'burn',
      html: `<div class="title-card">
          <small>${SHOW.season}</small>
          <h1>${SHOW.title}<span class="dots"><i></i><i></i><i></i></span></h1>
          <p>a show about us, written by us</p>
        </div>`,
      enter(el, { sound }) {
        sound.sting();
      },
    },
    {
      id: 'previously',
      label: 'Previously on',
      era: 'show',
      in: 'static',
      html: `<h2 class="prev-head">Previously on <em>${SHOW.title}</em>…</h2>
        <div class="stills">${PREVIOUSLY.map(
          (p, i) => `<figure class="still s${i}">
            <div class="shot"><span class="bubble">${p.line}</span></div>
            <figcaption><b>${p.ep}</b> ${p.title}</figcaption>
          </figure>`
        ).join('')}</div>`,
      enter(el, { sound }) {
        const stills = el.querySelectorAll('.still');
        stills.forEach((st) => st.classList.remove('shown'));
        stills.forEach((st, i) =>
          later(this, () => {
            st.classList.add('shown');
            sound.shutter();
          }, 500 + i * 750)
        );
      },
    },
    {
      id: 'episode',
      label: `This week: ${EPISODE.title}`,
      era: 'show',
      in: 'reel',
      html: `<article class="ep">
          <p class="ep-meta">${EPISODE.ep} · “${EPISODE.title}”</p>
          <p class="type" aria-label="${typed}"><span class="typed"></span><span class="caret"></span></p>
          <div class="answers">${CAST.map(
            (c) => `<div class="ans"><b>${c.name}</b><span class="typing"><i></i><i></i><i></i></span></div>`
          ).join('')}</div>
          <p class="ep-foot">answers drop Sunday · the chat decides what’s canon</p>
        </article>`,
      enter(el, { sound }) {
        const out = el.querySelector('.typed');
        el.classList.remove('done');
        out.textContent = '';
        let i = 0;
        const step = () => {
          if (i >= typed.length) {
            sound.ding();
            el.classList.add('done');
            return;
          }
          const ch = typed[i++];
          out.textContent += ch;
          if (ch !== ' ') sound.key();
          const pause = ch === '…' ? 700 : ch === ' ' ? 70 : 38 + Math.random() * 60;
          later(this, step, pause);
        };
        later(this, step, 600);
      },
    },
  ];

  for (const s of scenes) s.timers = [];
  return { scenes, clearTimers };
}
