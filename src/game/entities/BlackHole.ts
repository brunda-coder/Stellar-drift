import { rnd } from '../utils';
import { BlackHoleRenderer } from '../renderer/BlackHoleRenderer';

export class BlackHole {
  x: number;
  y: number;
  r: number;
  pr: number;
  age: number = 0;
  life: number;
  alive: boolean = true;
  rot: number = 0;

  constructor(w: number, h: number) {
    this.x = rnd(w * 0.2, w * 0.8);
    this.y = rnd(h * 0.2, h * 0.8);
    this.r = rnd(25, 40);
    this.pr = this.r * 5.5;
    this.life = rnd(22000, 38000);
  }

  update(dt: number, px: number, py: number, pullCb: (fx: number, fy: number, d: number) => void) {
    this.age += dt;
    this.rot += dt * 0.003;
    
    if (this.age > this.life) {
      this.alive = false;
      return;
    }
    
    const dx = this.x - px;
    const dy = this.y - py;
    const d = Math.hypot(dx, dy);
    
    if (d < this.pr && d > this.r) {
      const f = (1 - d / this.pr) * 0.45;
      pullCb((dx / d) * f, (dy / d) * f, d);
    }
  }

  draw(cx: CanvasRenderingContext2D) {
    const al = Math.min(1, (this.life - this.age) / 3000);
    BlackHoleRenderer.draw(cx, this.x, this.y, this.r, this.pr, this.rot, al);
  }
}
