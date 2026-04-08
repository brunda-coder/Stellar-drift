import { rnd } from '../utils';

export class StarfieldRenderer {
  stars: {x: number, y: number, r: number, a: number, tw: number}[] = [];

  constructor(w: number, h: number) {
    this.stars = Array.from({length: 220}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: rnd(0.2, 1.5),
      a: rnd(0.08, 0.55),
      tw: Math.random() * Math.PI * 2
    }));
  }

  draw(cx: CanvasRenderingContext2D, dx: number, dy: number) {
    this.stars.forEach(s => {
      s.tw += 0.016;
      
      // Parallax effect
      let drawX = s.x - (dx * s.r * 8);
      let drawY = s.y - (dy * s.r * 8);

      const al = s.a * (0.65 + Math.sin(s.tw) * 0.35);
      cx.beginPath();
      cx.arc(drawX, drawY, s.r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(255,248,225,${al})`;
      cx.fill();
    });
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
    this.r = rnd(80, 150);
    this.life = rnd(18000, 30000);
    const C = ['rgba(124,58,237,', 'rgba(219,39,119,', 'rgba(6,182,212,'];
    this.col = C[Math.floor(Math.random() * 3)];
  }

  update(dt: number) {
    this.age += dt;
  }

  draw(cx: CanvasRenderingContext2D, dx: number, dy: number) {
    const al = Math.min(1, (this.life - this.age) / 3000) * 0.13;
    const p = 1 + Math.sin(this.age * 0.0018) * 0.04;
    cx.save();
    
    const drawX = this.x - (dx * 5); // slow parallax
    const drawY = this.y - (dy * 5);

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
