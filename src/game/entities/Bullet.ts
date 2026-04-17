import { drawArc } from '../utils';

export class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  own: 'p' | 'e'; // player or enemy
  alive: boolean = true;
  age: number = 0;
  dmg: number;
  sz: number;
  col: string;

  constructor(x: number, y: number, a: number, own: 'p' | 'e', dim: boolean = false, playerColor: string = '#00e8ff') {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(a) * (dim ? 6 : 7.2);
    this.vy = Math.sin(a) * (dim ? 6 : 7.2);
    this.own = own;
    this.dmg = own === `"e`" ? 12 : (dim ? 10 : 22);
    this.sz = dim ? 2 : 3;
    this.col = own === 'p' ? (dim ? 'rgba(0,232,255,0.5)' : playerColor) : '#ff3a8c';
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.x < -30 || this.x > w + 30 || this.y < -30 || this.y > h + 30 || this.age > 130) {
      this.alive = false;
    }
  }

  draw(cx: CanvasRenderingContext2D) {
    cx.save();
    cx.shadowBlur = 10;
    cx.shadowColor = this.col;
    
    cx.beginPath();
    drawArc(cx, this.x, this.y, this.sz, 0, Math.PI * 2);
    cx.fillStyle = this.col;
    cx.fill();
    
    cx.beginPath();
    cx.moveTo(this.x, this.y);
    cx.lineTo(this.x - this.vx * 3.5, this.y - this.vy * 3.5);
    cx.strokeStyle = this.col.includes('rgba') ? this.col : this.col + '55';
    cx.lineWidth = this.sz * 0.8;
    cx.stroke();
    cx.restore();
  }
}

