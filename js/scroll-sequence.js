// Preloads a webp frame sequence and draws it to a canvas, cover-fit, by index.
export class FrameReel {
  constructor({ canvas, folder, count, pad = 3, ext = 'webp' }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.folder = folder;
    this.count = count;
    this.pad = pad;
    this.ext = ext;
    this.images = new Array(count);
    this.currentIndex = -1;
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas);
  }

  frameUrl(i) {
    return `${this.folder}/frame_${String(i + 1).padStart(this.pad, '0')}.${this.ext}`;
  }

  preload(onProgress) {
    return new Promise((resolve) => {
      let loaded = 0;
      const bump = () => {
        loaded++;
        if (onProgress) onProgress(loaded / this.count);
        if (loaded >= this.count) resolve();
      };
      for (let i = 0; i < this.count; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = bump;
        img.onerror = bump;
        img.src = this.frameUrl(i);
        this.images[i] = img;
      }
    });
  }

  resize() {
    // Frames are sourced at 1920px wide; capping the backing store at 1x
    // device pixels means we're almost always downscaling (crisp) instead of
    // upscaling a still frame past its native resolution (soft/blocky).
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.draw(this.currentIndex === -1 ? 0 : this.currentIndex, true);
  }

  draw(index, force = false) {
    index = Math.max(0, Math.min(this.count - 1, index));
    if (index === this.currentIndex && !force) return;
    const img = this.images[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    this.currentIndex = index;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  setProgress(p) {
    this.draw(Math.round(p * (this.count - 1)));
  }
}
