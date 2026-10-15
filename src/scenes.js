import { SHOW, CAST, PREVIOUSLY, EPISODE } from './cast.js';
import { photo, card, doodle, building, viewMaster } from './collage.js';

// Each scene is one frame of the opening. `in` names the transition used to
// cut INTO it; `era` drives the film look (pre = before the reel starts,
// reel = old film, show = the show proper); `auto` advances on its own.

const CAST_CUTS = ['whip', 'reel', 'whip', 'reel'];

const later = (s, fn, ms) => s.timers.push(setTimeout(fn, ms));
const clearTimers = (s) => {
  s.timers.forEach(clearTimeout);
  s.timers = [];
};

export function buildScenes() {
  const castScenes = CAST.map((c, i) => ({
    id: `cast-${i}`,
    label: `Starring ${c.name}`,
    era: 'reel',
    in: CAST_CUTS[i % CAST_CUTS.length],
    rec: true,
    html: `<div class="table layout-${i % 2}">
        ${CAST.filter((_, k) => k !== i)
          .slice(0, 3)
          .map((o, k) => card(o, CAST.indexOf(o), `ghost g${k}`))
          .join('')}
        ${card(c, i, 'hero')}
        ${doodle(i, 'd1')}
      </div>
      <div class="credit ink">
        <small>${i === 0 ? 'starring' : 'and'}</small>
        <h2>${c.name}</h2>
      </div>`,
    enter(el, { sound }) {
      later(this, () => sound.slap(), 60);
      later(this, () => sound.whoosh(), 320);
      later(this, () => sound.tape(), 560);
      later(this, () => sound.tape(), 700);
      later(this, () => sound.thunk(), 900);
      later(this, () => sound.thunk(), 1150);
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
      in: 'fade',
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
      id: 'building',
      label: 'A building at night, a life in every window',
      era: 'reel',
      in: 'reel',
      rec: true,
      html: `${building(CAST)}
        <div class="credit center">
          <small>a group chat production</small>
          <p>filmed on location, mostly in the chat</p>
        </div>`,
    },
    ...castScenes,
    {
      id: 'viewmaster',
      label: 'And you, obviously',
      era: 'reel',
      in: 'iris',
      html: `${viewMaster(CAST)}
        <div class="vm-words"><span>this is</span><em>the story</em><span>of us</span><small>and you, obviously</small></div>`,
      enter(el, { sound }) {
        const disc = el.querySelector('.disc');
        let turn = 0;
        // the disc clicks round one picture at a time, like a real View-Master
        for (let k = 1; k <= 3; k++) {
          later(this, () => {
            turn += 360 / 7;
            disc.style.setProperty('--turn', `${turn}deg`);
            sound.clack(0.8);
          }, 600 + k * 750);
        }
      },
      leave(el) {
        el.querySelector('.disc').style.setProperty('--turn', '0deg');
      },
    },
    {
      id: 'title',
      label: SHOW.title,
      era: 'show',
      in: 'burn',
      html: `<div class="poster">
          <div class="booth">${CAST.slice(0, 4)
            .map((c) => photo(c, 'riso-blue', 'bf'))
            .join('')}</div>
          <div class="poster-type">
            <small>${SHOW.season}</small>
            <h1><em>The</em><span>Groupchat<span class="dots"><i></i><i></i><i></i></span></span></h1>
            <p>a show about us, written by us</p>
          </div>
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
