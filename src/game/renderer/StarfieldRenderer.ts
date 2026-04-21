import { rnd } from '../utils';

export class StarfieldRenderer {
  stars: {x: number, y: number, r: number, a: number, tw: number, c: string, layer: number}[] = [];
  dust: {x: number, y: number, s: number, a: number}[] = [];
  w: number;
  h: number;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    const cols = ['255,248,225', '200,220,255', '255,200,200', '255,230,150', '200,255,255'];
    
    // Deep parallax stars
    this.stars = Array.from({length: 300}, () => {
      const layer = Math.random(); // 0 = far background, 1 = foreground
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: rnd(0.5, 1.5) + (layer * 1.5),
        a: rnd(0.1, 0.4) + (layer * 0.4),
        tw: Math.random() * Math.PI * 2,
        c: cols[Math.floor(Math.random() * cols.length)],
        layer: layer
      };
    });

    // Fast moving space dust
    this.dust = Array.from({length: 150}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: rnd(0.1, 0.5),
      a: rnd(0.05, 0.2)
    }));
  }

  private wrap(val: number, max: number, buffer: number = 50) {
    if (val < -buffer) return max + buffer;
    if (val > max + buffer) return -buffer;
    return val;
  }

  draw(cx: CanvasRenderingContext2D, px: number, py: number) {
    // We use player's absolute position for a continuous parallax universe
    const dx = px * 0.1;
    const dy = py * 0.1;

    // Draw Stars
    this.stars.forEach(s => {
      s.tw += 0.01 + (s.layer * 0.02);
      
      // Parallax effect based on layer depth
      let drawX = (s.x - dx * (1 + s.layer * 8)) % (this.w + 100);
      let drawY = (s.y - dy * (1 + s.layer * 8)) % (this.h + 100);
      
      if (drawX < -50) drawX += this.w + 100;
      if (drawY < -50) drawY += this.h + 100;

      const al = s.a * (0.65 + Math.sin(s.tw) * 0.35);
      
      cx.beginPath();
      cx.arc(drawX, drawY, s.r * 1.2, 0, Math.PI * 2);
      cx.fillStyle = `rgba(${s.c},${al})`;
      cx.fill();
      
      if (s.layer > 0.5) {
        // core glow for foreground stars
        cx.beginPath();
        cx.arc(drawX, drawY, s.r * 0.5, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255,255,255,${al * 1.5})`;
        cx.fill();
      }
    });

    // Draw Space Dust (moves much faster to give speed illusion)
    cx.fillStyle = 'rgba(255,255,255,0.8)';
    this.dust.forEach(d => {
      let drawX = (d.x - dx * 15 * d.s) % (this.w + 100);
      let drawY = (d.y - dy * 15 * d.s) % (this.h + 100);
      
      if (drawX < -50) drawX += this.w + 100;
      if (drawY < -50) drawY += this.h + 100;

      cx.globalAlpha = d.a;
      cx.fillRect(drawX, drawY, 1, 1);
    });
    cx.globalAlpha = 1.0;
  }
}

export class Nebula {
  x: number;
  y: number;
  r: number;
  age: number = 0;
  life: number;
  col: string;

  constructor(w: number, h: number) {
    this.x = rnd(100, w - 100);
    this.y = rnd(100, h - 100);
    this.r = rnd(100, 250); // Made nebulas slightly larger
    this.life = rnd(18000, 30000);
    const C = ['rgba(124,58,237,', 'rgba(219,39,119,', 'rgba(6,182,212,', 'rgba(16,185,129,'];
    this.col = C[Math.floor(Math.random() * C.length)];
  }

  update(dt: number) {
    this.age += dt;
  }

  draw(cx: CanvasRenderingContext2D, px: number, py: number) {
    const al = Math.min(1, (this.life - this.age) / 3000) * 0.15; // Increased opacity slightly
    const p = 1 + Math.sin(this.age * 0.0018) * 0.04;
    cx.save();
    
    // Slow parallax for nebulas (they are far away)
    const dx = px * 0.1;
    const dy = py * 0.1;
    let drawX = (this.x - dx * 0.5) % (cx.canvas.width + this.r * 2);
    let drawY = (this.y - dy * 0.5) % (cx.canvas.height + this.r * 2);
    
    if (drawX < -this.r) drawX += cx.canvas.width + this.r * 2;
    if (drawY < -this.r) drawY += cx.canvas.height + this.r * 2;

    const g = cx.createRadialGradient(drawX, drawY, 0, drawX, drawY, this.r * p);
    g.addColorStop(0, this.col + (al * 2.5) + ')');
    g.addColorStop(0.5, this.col + al + ')');
    g.addColorStop(1, this.col + '0)');
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(drawX, drawY, this.r * p, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }
}

