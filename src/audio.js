// Every sound on the site is synthesised here with Web Audio: no files.
// The "reel" bus (projector whir + hiss + crackle) runs under the opening
// and fades out when the title card lands.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sfx = false; // whooshes, clicks and stings; the music carries the opening instead
    this.track = null;
  }

  get ready() {
    return this.ctx && !this.muted;
  }

  start() {
    if (this.ctx) return;
    const ctx = (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // the reel bus
    this.reel = ctx.createGain();
    this.reel.gain.value = 0;
    this.reel.connect(this.master);

    // tape hiss
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2600;
    this.hiss = ctx.createGain();
    this.hiss.gain.value = 0.008;
    this.loopNoise().connect(hp).connect(this.hiss).connect(this.reel);

    this.crackle();
  }

  loopNoise() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(0, Math.random() * 2);
    return src;
  }

  // dust on the film: tiny random pops, forever
  crackle() {
    const pop = () => {
      if (this.ctx && this.reel.gain.value > 0.02) {
        this.burst({
          type: 'bandpass',
          freq: 700 + Math.random() * 4500,
          q: 2,
          dur: 0.004 + Math.random() * 0.018,
          gain: 0.04 + Math.random() * 0.14,
          attack: 0.001,
          out: this.reel,
        });
      }
      setTimeout(pop, 30 + Math.random() * (Math.random() < 0.2 ? 600 : 220));
    };
    pop();
  }

  // the real soundtrack: a music file, routed through master so mute works.
  // If the file isn't there yet, this quietly does nothing.
  playMusic(url) {
    if (!this.ctx || this.track) return;
    const el = new Audio(url);
    el.loop = true;
    el.preload = 'auto';
    const src = this.ctx.createMediaElementSource(el);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    src.connect(this.musicGain).connect(this.master);
    el.play()
      .then(() => this.musicGain.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.4))
      .catch(() => {});
    this.track = el;
  }

  setMuted(m) {
    this.muted = m;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  reelUp(t = 0.6) {
    if (!this.ctx) return;
    const g = this.reel.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setTargetAtTime(1, this.ctx.currentTime, t / 3);
  }

  reelDown(t = 1.6) {
    if (!this.ctx) return;
    const g = this.reel.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setTargetAtTime(0, this.ctx.currentTime, t / 3);
  }

  // generic filtered-noise burst
  burst({ type = 'bandpass', freq = 1000, freqEnd, q = 1, dur = 0.1, gain = 0.3, attack = 0.005, at = 0, out }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out || this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  tone({ freq, type = 'sine', dur = 0.3, gain = 0.15, attack = 0.005, at = 0, lp }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o.connect(g);
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lp;
      node = g.connect(f);
      f.connect(this.master);
    } else {
      g.connect(this.master);
    }
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // ---- named effects ----

  shutter() {
    if (!this.sfx) return;
    this.burst({ type: 'highpass', freq: 2800, dur: 0.035, gain: 0.55, attack: 0.001 });
    this.burst({ type: 'bandpass', freq: 1700, q: 2, dur: 0.05, gain: 0.45, attack: 0.001, at: 0.075 });
    this.tone({ freq: 3800, dur: 0.18, gain: 0.02, at: 0.02 }); // flash whine
  }

  clack(vol = 1) {
    if (!this.sfx) return;
    this.burst({ type: 'bandpass', freq: 620, q: 3, dur: 0.045, gain: 0.5 * vol, attack: 0.001 });
    this.burst({ type: 'bandpass', freq: 380, q: 3, dur: 0.06, gain: 0.4 * vol, attack: 0.001, at: 0.1 });
    this.burst({ type: 'bandpass', freq: 520, q: 3, dur: 0.04, gain: 0.25 * vol, attack: 0.001, at: 0.16 });
  }

  whoosh() {
    if (!this.sfx) return;
    this.burst({ type: 'bandpass', freq: 350, freqEnd: 2600, q: 1.4, dur: 0.42, gain: 0.4, attack: 0.18 });
  }

  staticBurst(dur = 0.6) {
    if (!this.sfx) return;
    this.burst({ type: 'bandpass', freq: 3200, q: 0.4, dur, gain: 0.32, attack: 0.04 });
    this.burst({ type: 'lowpass', freq: 600, dur: dur * 0.6, gain: 0.2, attack: 0.02 });
  }

  burn() {
    if (!this.sfx) return;
    this.burst({ type: 'lowpass', freq: 900, freqEnd: 4000, dur: 1.1, gain: 0.35, attack: 0.5 });
    for (let i = 0; i < 14; i++) {
      this.burst({ type: 'bandpass', freq: 1500 + Math.random() * 4000, q: 2, dur: 0.01, gain: 0.3, attack: 0.001, at: 0.2 + Math.random() * 0.8 });
    }
  }

  rewind() {
    if (!this.sfx) return;
    this.burst({ type: 'bandpass', freq: 600, freqEnd: 5200, q: 3, dur: 0.5, gain: 0.3, attack: 0.05 });
    for (let i = 0; i < 6; i++) this.tone({ freq: 900 + i * 260, type: 'square', dur: 0.04, gain: 0.025, at: i * 0.07, lp: 2500 });
  }

  // a soft, rounded tick for the countdown instead of a hard test-tone beep
  beep() {
    this.tone({ freq: 660, type: 'triangle', dur: 0.22, gain: 0.07, attack: 0.01, lp: 1800 });
  }

  rumble() {
    if (!this.sfx) return;
    this.burst({ type: 'lowpass', freq: 160, dur: 3, gain: 0.7, attack: 1.1 });
    this.tone({ freq: 46, type: 'triangle', dur: 2.8, gain: 0.12, attack: 1 });
    this.burst({ type: 'bandpass', freq: 420, q: 6, dur: 0.5, gain: 0.08, attack: 0.3, at: 1.2 }); // brakes hiss
  }

  splash() {
    if (!this.sfx) return;
    this.burst({ type: 'lowpass', freq: 5000, freqEnd: 260, dur: 1, gain: 0.6, attack: 0.02 });
    for (let i = 0; i < 10; i++) {
      this.burst({ type: 'bandpass', freq: 900 + Math.random() * 2400, q: 4, dur: 0.05, gain: 0.18, attack: 0.002, at: 0.15 + Math.random() * 0.6 });
    }
  }

  // a print slapped onto the table
  slap() {
    if (!this.sfx) return;
    this.burst({ type: 'lowpass', freq: 1400, dur: 0.12, gain: 0.55, attack: 0.002 });
    this.burst({ type: 'bandpass', freq: 3200, q: 1, dur: 0.05, gain: 0.2, attack: 0.001, at: 0.01 });
  }

  // a strip of tape pulled and pressed down
  tape() {
    if (!this.sfx) return;
    this.burst({ type: 'bandpass', freq: 2400, freqEnd: 5200, q: 2, dur: 0.16, gain: 0.18, attack: 0.03 });
  }

  // a rubber stamp
  thunk() {
    if (!this.sfx) return;
    this.tone({ freq: 140, type: 'sine', dur: 0.12, gain: 0.3, attack: 0.002 });
    this.burst({ type: 'lowpass', freq: 600, dur: 0.08, gain: 0.35, attack: 0.002 });
  }

  key() {
    this.burst({ type: 'bandpass', freq: 2200 + Math.random() * 900, q: 3, dur: 0.025, gain: 0.22 + Math.random() * 0.1, attack: 0.001 });
  }

  ding() {
    this.tone({ freq: 2093, dur: 1.4, gain: 0.08 });
    this.tone({ freq: 3136, dur: 0.9, gain: 0.03 });
  }

  // a plucked, slightly detuned "guitar" note: two saws through a closing lowpass
  pluck(freq, at, dur = 0.5, gain = 0.06) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(3800, t);
    f.frequency.exponentialRampToValueAtTime(700, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f.connect(g).connect(this.master);
    for (const detune of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  kick(at) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.32);
  }

  // the title sting: an original bouncy UK-indie-pop riff in the spirit of
  // FX's Adults (not its theme). Jangly strums, busy bass, drum machine.
  sting() {
    if (!this.sfx) return;
    const bpm = 132;
    const b = 60 / bpm; // one beat
    // D – A – Bm – G, one chord per two beats, then a ringing D
    const chords = [
      [146.83, 220, 293.66, 369.99, 440],
      [110, 164.81, 220, 277.18, 329.63],
      [123.47, 185, 246.94, 293.66, 369.99],
      [98, 146.83, 196, 246.94, 293.66],
    ];
    const roots = [73.42, 55, 61.74, 49];
    chords.forEach((notes, c) => {
      const t0 = c * 2 * b;
      // down, down-up, up-down strum pattern
      [0, 0.75, 1, 1.5].forEach((off, k) => {
        const up = k % 2 === 1;
        const order = up ? [...notes].reverse() : notes;
        order.forEach((f, i) => this.pluck(f, t0 + off * b + i * 0.012, 0.45, k === 0 ? 0.045 : 0.03));
      });
      // eighth-note bass, octave jump on the "and" of 2
      for (let e = 0; e < 4; e++) {
        const f = e === 3 ? roots[c] * 2 : roots[c];
        this.tone({ freq: f, type: 'triangle', dur: b * 0.45, gain: 0.22, at: t0 + e * b * 0.5, attack: 0.005, lp: 600 });
      }
    });
    const end = 8 * b;
    chords[0].concat([587.33]).forEach((f, i) => this.pluck(f, end + i * 0.018, 1.8, 0.04));
    this.tone({ freq: 73.42, type: 'triangle', dur: 1.6, gain: 0.25, at: end, lp: 600 });
    // drums: four on the floor-ish kick, snare on 2 and 4, eighth hats
    for (let beat = 0; beat < 8; beat++) {
      const t = beat * b;
      if (beat % 2 === 0) this.kick(t);
      else {
        this.burst({ type: 'bandpass', freq: 1800, q: 0.7, dur: 0.16, gain: 0.32, attack: 0.002, at: t });
        this.tone({ freq: 190, type: 'triangle', dur: 0.08, gain: 0.1, at: t });
      }
      this.burst({ type: 'highpass', freq: 7000, dur: 0.04, gain: 0.08, attack: 0.001, at: t });
      this.burst({ type: 'highpass', freq: 7000, dur: 0.03, gain: 0.05, attack: 0.001, at: t + b / 2 });
    }
    this.kick(end);
    this.burst({ type: 'highpass', freq: 5000, dur: 1.2, gain: 0.1, attack: 0.01, at: end }); // crash
  }
}
