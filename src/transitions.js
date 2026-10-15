// Every cut between frames. Each takes the outgoing frame (a), the incoming
// frame (b), a direction (1 forward, -1 rewinding) and the shared fx layers,
// and resolves when the cut is finished.

const anim = (el, keyframes, opts) => el.animate(keyframes, { fill: 'forwards', ...opts }).finished;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const TRANSITIONS = {
  // the signature move: the next frame drags through the gate, sprockets showing
  async reel(a, b, dir, fx) {
    fx.sound.clack();
    fx.gate.classList.add('on');
    b.hidden = false;
    const o = { duration: 760, easing: 'cubic-bezier(.78,0,.22,1)' };
    const gap = 'calc(100% + 26px)';
    await Promise.all([
      anim(a, [{ transform: 'translateY(0)', filter: 'blur(0)' }, { transform: `translateY(calc(${-dir} * ${gap}))`, filter: 'blur(4px)' }], o),
      anim(b, [{ transform: `translateY(calc(${dir} * ${gap}))`, filter: 'blur(4px)' }, { transform: 'translateY(0)', filter: 'blur(0)' }], o),
    ]);
    fx.gate.classList.remove('on');
  },

  async whip(a, b, dir, fx) {
    fx.sound.whoosh();
    b.hidden = false;
    const o = { duration: 460, easing: 'cubic-bezier(.7,0,.3,1)' };
    await Promise.all([
      anim(a, [{ transform: 'translateX(0)', filter: 'blur(0)' }, { transform: `translateX(${-dir * 100}%)`, filter: 'blur(26px)' }], o),
      anim(b, [{ transform: `translateX(${dir * 100}%)`, filter: 'blur(26px)' }, { transform: 'translateX(0)', filter: 'blur(0)' }], o),
    ]);
  },

  // hard cut on a camera flash
  async flash(a, b, dir, fx) {
    fx.sound.shutter();
    await anim(fx.flash, [{ opacity: 0 }, { opacity: 1 }], { duration: 60 });
    a.hidden = true;
    b.hidden = false;
    await anim(fx.flash, [{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease-out' });
  },

  async iris(a, b, dir, fx) {
    fx.sound.clack(0.6);
    a.style.zIndex = 2;
    await anim(a, [{ clipPath: 'circle(80% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 560, easing: 'cubic-bezier(.6,0,.9,.6)' });
    a.hidden = true;
    a.style.zIndex = '';
    await wait(140);
    b.hidden = false;
    await anim(b, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(80% at 50% 50%)' }], { duration: 680, easing: 'cubic-bezier(.2,.5,.3,1)' });
  },

  // the frame dissolves into TV noise and the next one tunes in
  async static(a, b, dir, fx) {
    fx.sound.staticBurst(0.75);
    fx.film.staticOn = true;
    const s = fx.stat;
    await anim(s, [{ opacity: 0 }, { opacity: 0.5 }], { duration: 160 });
    a.hidden = true;
    b.hidden = false;
    await wait(60);
    await anim(s, [{ opacity: 0.5 }, { opacity: 0 }], { duration: 300 });
    fx.film.staticOn = false;
  },

  // film burn: the frame overexposes and melts away
  async burn(a, b, dir, fx) {
    fx.sound.burn();
    b.hidden = false;
    a.style.zIndex = 2;
    await Promise.all([
      anim(
        a,
        [
          { filter: 'none', opacity: 1 },
          { filter: 'sepia(1) saturate(4) brightness(1.5) contrast(1.5)', opacity: 1, offset: 0.45 },
          { filter: 'sepia(1) saturate(6) brightness(3)', opacity: 0 },
        ],
        { duration: 1150, easing: 'ease-in' }
      ),
      anim(
        fx.burn,
        [
          { opacity: 0, transform: 'scale(.2)' },
          { opacity: 1, transform: 'scale(1.4)', offset: 0.55 },
          { opacity: 0, transform: 'scale(3)' },
        ],
        { duration: 1300, easing: 'ease-out' }
      ),
    ]);
    a.style.zIndex = '';
  },

  async fade(a, b) {
    b.hidden = false;
    a.style.zIndex = 2;
    await anim(a, [{ opacity: 1 }, { opacity: 0 }], { duration: 320 });
    a.style.zIndex = '';
  },
};
