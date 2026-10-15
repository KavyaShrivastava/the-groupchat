// The look of old film: grain, scratches, dust and a TV-static layer the
// transitions can switch on. Runs from page load so the static is there
// before anyone presses play.

export class Film {
  constructor(stage) {
    this.stage = stage;
    this.grain = stage.querySelector('#grain');
    this.scratches = stage.querySelector('#scratches');
    this.staticCanvas = stage.querySelector('#fx-static');
    this.sctx = this.staticCanvas.getContext('2d');
    this.staticOn = false;
    this.grainFrames = [];
    this.t0 = performance.now();
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  start() {
    this.makeGrain();
    this.loop();
    if (!this.reduce) this.scratchLoop();
  }

  makeGrain() {
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas');
      c.width = c.height = 180;
      const g = c.getContext('2d');
      const img = g.createImageData(180, 180);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = Math.random() * 110;
      }
      g.putImageData(img, 0, 0);
      this.grainFrames.push(`url(${c.toDataURL()})`);
    }
  }

  drawStatic() {
    const { width: w, height: h } = this.staticCanvas;
    const img = this.sctx.createImageData(w, h);
    const band = Math.random() * h;
    for (let y = 0; y < h; y++) {
      const lift = Math.abs(y - band) < 6 ? 70 : 0;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const v = Math.min(255, Math.random() * 230 + lift);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    this.sctx.putImageData(img, 0, 0);
  }

  loop() {
    let last = 0;
    const tick = (t) => {
      if (t - last > 41) {
        last = t;
        if (!this.reduce) {
          this.grain.style.backgroundImage = this.grainFrames[(Math.random() * this.grainFrames.length) | 0];
          this.grain.style.backgroundPosition = `${(Math.random() * 180) | 0}px ${(Math.random() * 180) | 0}px`;
        }
        if (this.staticOn || this.stage.dataset.era === 'pre') this.drawStatic();
        this.onTick?.(t);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // scratches and dust, only while we're "on film"
  scratchLoop() {
    const spawn = () => {
      const era = this.stage.dataset.era;
      if (era !== 'show') {
        if (Math.random() < 0.35) {
          const s = document.createElement('i');
          s.className = 'scratch';
          s.style.left = `${Math.random() * 100}%`;
          s.style.opacity = (0.15 + Math.random() * 0.45).toFixed(2);
          s.style.width = `${Math.random() < 0.8 ? 1 : 2}px`;
          if (Math.random() < 0.5) s.style.background = 'rgba(40, 26, 24, 0.7)';
          this.scratches.append(s);
          setTimeout(() => s.remove(), 90 + Math.random() * 380);
        }
        for (let k = 0; k < (Math.random() * 3) | 0; k++) {
          const d = document.createElement('i');
          d.className = 'dust';
          const sz = 2 + Math.random() * 7;
          d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz * (0.4 + Math.random())}px;border-radius:${30 + Math.random() * 50}%;opacity:${0.3 + Math.random() * 0.5}`;
          this.scratches.append(d);
          setTimeout(() => d.remove(), 45 + Math.random() * 90);
        }
      }
      setTimeout(spawn, 160 + Math.random() * 600);
    };
    spawn();
  }

  timecode() {
    const f = Math.floor(((performance.now() - this.t0) / 1000) * 24);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
  }
}
