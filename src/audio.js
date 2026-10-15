// Every sound on the site is synthesised here with Web Audio: no files.
// The "reel" bus (projector whir + hiss + crackle) runs under the opening
// and fades out when the title card lands.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
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
    this.hiss.gain.value = 0.03;
    this.loopNoise().connect(hp).connect(this.hiss).connect(this.reel);

    // projector clatter: band-passed noise chopped by an 18 Hz square wave
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 950;
    bp.Q.value = 1.3;
    const chop = ctx.createGain();
    chop.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 18;
    const depth = ctx.createGain();
    depth.gain.value = 0.5;
    lfo.connect(depth).connect(chop.gain);
    lfo.start();
    const whir = ctx.createGain();
    whir.gain.value = 0.07;
    this.loopNoise().connect(bp).connect(chop).connect(whir).connect(this.reel);

    // motor hum
    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 55;
    const hl = ctx.createBiquadFilter();
    hl.type = 'lowpass';
    hl.frequency.value = 170;
    const hg = ctx.createGain();
    hg.gain.value = 0.03;
    hum.connect(hl).connect(hg).connect(this.reel);
    hum.start();

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
          gain: 0.08 + Math.random() * 0.3,
          attack: 0.001,
          out: this.reel,
        });
      }
      setTimeout(pop, 30 + Math.random() * (Math.random() < 0.2 ? 600 : 220));
    };
    pop();
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
    this.burst({ type: 'highpass', freq: 2800, dur: 0.035, gain: 0.55, attack: 0.001 });
    this.burst({ type: 'bandpass', freq: 1700, q: 2, dur: 0.05, gain: 0.45, attack: 0.001, at: 0.075 });
    this.tone({ freq: 3800, dur: 0.18, gain: 0.02, at: 0.02 }); // flash whine
  }

  clack(vol = 1) {
    this.burst({ type: 'bandpass', freq: 620, q: 3, dur: 0.045, gain: 0.5 * vol, attack: 0.001 });
    this.burst({ type: 'bandpass', freq: 380, q: 3, dur: 0.06, gain: 0.4 * vol, attack: 0.001, at: 0.1 });
    this.burst({ type: 'bandpass', freq: 520, q: 3, dur: 0.04, gain: 0.25 * vol, attack: 0.001, at: 0.16 });
  }

  whoosh() {
    this.burst({ type: 'bandpass', freq: 350, freqEnd: 2600, q: 1.4, dur: 0.42, gain: 0.4, attack: 0.18 });
  }

  staticBurst(dur = 0.6) {
    this.burst({ type: 'bandpass', freq: 3200, q: 0.4, dur, gain: 0.32, attack: 0.04 });
    this.burst({ type: 'lowpass', freq: 600, dur: dur * 0.6, gain: 0.2, attack: 0.02 });
  }

  burn() {
    this.burst({ type: 'lowpass', freq: 900, freqEnd: 4000, dur: 1.1, gain: 0.35, attack: 0.5 });
    for (let i = 0; i < 14; i++) {
      this.burst({ type: 'bandpass', freq: 1500 + Math.random() * 4000, q: 2, dur: 0.01, gain: 0.3, attack: 0.001, at: 0.2 + Math.random() * 0.8 });
    }
  }

  rewind() {
    this.burst({ type: 'bandpass', freq: 600, freqEnd: 5200, q: 3, dur: 0.5, gain: 0.3, attack: 0.05 });
    for (let i = 0; i < 6; i++) this.tone({ freq: 900 + i * 260, type: 'square', dur: 0.04, gain: 0.025, at: i * 0.07, lp: 2500 });
  }

  beep() {
    this.tone({ freq: 1000, dur: 0.14, gain: 0.12 });
  }

  rumble() {
    this.burst({ type: 'lowpass', freq: 160, dur: 3, gain: 0.7, attack: 1.1 });
    this.tone({ freq: 46, type: 'triangle', dur: 2.8, gain: 0.12, attack: 1 });
    this.burst({ type: 'bandpass', freq: 420, q: 6, dur: 0.5, gain: 0.08, attack: 0.3, at: 1.2 }); // brakes hiss
  }

  splash() {
    this.burst({ type: 'lowpass', freq: 5000, freqEnd: 260, dur: 1, gain: 0.6, attack: 0.02 });
    for (let i = 0; i < 10; i++) {
      this.burst({ type: 'bandpass', freq: 900 + Math.random() * 2400, q: 4, dur: 0.05, gain: 0.18, attack: 0.002, at: 0.15 + Math.random() * 0.6 });
    }
  }

  key() {
    this.burst({ type: 'bandpass', freq: 2200 + Math.random() * 900, q: 3, dur: 0.025, gain: 0.22 + Math.random() * 0.1, attack: 0.001 });
  }

  ding() {
    this.tone({ freq: 2093, dur: 1.4, gain: 0.08 });
    this.tone({ freq: 3136, dur: 0.9, gain: 0.03 });
  }

  // a small lounge-jazz sting for the title card (original, not the show's theme)
  sting() {
    const bass = [87.31, 130.81];
    bass.forEach((f, i) => this.tone({ freq: f, type: 'sine', dur: 1.6, gain: 0.22, at: i * 0.32, attack: 0.01 }));
    const chord = [174.61, 220, 329.63, 392, 523.25, 659.25]; // Fmaj9 rising
    chord.forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', dur: 2.6 - i * 0.15, gain: 0.07, at: 0.05 + i * 0.07, attack: 0.02, lp: 2400 })
    );
    this.tone({ freq: 1174.66, type: 'sine', dur: 1.8, gain: 0.05, at: 0.75 });
    this.tone({ freq: 1567.98, type: 'sine', dur: 1.5, gain: 0.04, at: 0.9 });
    // brushes
    for (let i = 0; i < 4; i++) this.burst({ type: 'highpass', freq: 5000, dur: 0.18, gain: 0.05, attack: 0.06, at: i * 0.32 });
  }
}
