import { rnd, drawArc } from '../utils';

export class Pickup {
  x: number;
  y: number;
  type: 'star' | 'hp' | 'ep' | 'mega' | 'weapon';
  alive: boolean = true;
  age: number = 0;
  vx: number;
  vy: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const r = Math.random();
    this.type = r < 0.50 ? 'star' : r < 0.70 ? 'hp' : r < 0.88 ? 'ep' : r < 0.96 ? 'weapon' : 'mega';
    this.vx = rnd(-1.5, 1.5);
    this.vy = rnd(-1.5, 1.5);
  }

  update(dt: number, px: number, py: number, psz: number, cCb: (type: 'star' | 'hp' | 'ep' | 'mega' | 'weapon', x: number, y: number) => void) {
    this.age += dt;
    if (this.age > 7000) {
      this.alive = false;
      return;
    }
    
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.x += this.vx;
    this.y += this.vy;
    
    // Magnetize to player
    const d = Math.hypot(px - this.x, py - this.y);
    if (d < 70) {
      const a = Math.atan2(py - this.y, px - this.x);
      this.vx += Math.cos(a) * 2.5;
      this.vy += Math.sin(a) * 2.5;
    }
    
    // Collect
    if (d < psz + 9) {
      this.alive = false;
      cCb(this.type, this.x, this.y);
    }
  }

  draw(cx: CanvasRenderingContext2D) {
    const pulse = 1 + Math.sin(this.age * 0.005) * 0.15;
    const al = this.age > 5500 ? (7000 - this.age) / 1500 : 1;
    
    cx.save();
    cx.globalAlpha = al;
    cx.translate(this.x, this.y);
    cx.scale(pulse, Math.max(0.1, pulse));
    cx.shadowBlur = 18;
    
    const C: any = { star: '#ffd060', hp: '#ff3a8c', ep: '#00e8ff', mega: '#fff', weapon: '#ff2a00' };
    cx.shadowColor = C[this.type];
    cx.strokeStyle = C[this.type];
    cx.lineWidth = 2;
    
    if (this.type === 'star') {
      cx.fillStyle = '#ffd060';
      cx.strokeStyle = '#ffea8f';
      cx.lineWidth = 1.4;
      cx.lineJoin = 'round';
      cx.beginPath();
      // True 5-pointed golden star
      const outerRadius = 9;
      const innerRadius = 4.2;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) cx.moveTo(px, py);
        else cx.lineTo(px, py);
      }
      cx.closePath();
      cx.fill();
      cx.stroke();
    } else if (this.type === 'hp') {
      cx.beginPath();
      cx.moveTo(0, -7); cx.lineTo(0, 7);
      cx.moveTo(-7, 0); cx.lineTo(7, 0);
      cx.stroke();
    } else if (this.type === 'ep') {
      cx.beginPath();
      drawArc(cx, 0, 0, 7, 0, Math.PI * 2);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(-3, -3); cx.lineTo(1, -7); cx.lineTo(3, -3);
      cx.moveTo(3, 3); cx.lineTo(-1, 7); cx.lineTo(-3, 3);
      cx.stroke();
    } else if (this.type === 'weapon') {
      cx.fillStyle = 'rgba(255, 42, 0, 0.2)';
      cx.beginPath();
      drawArc(cx, 0, 0, 8, 0, Math.PI * 2);
      cx.fill(); cx.stroke();
      cx.beginPath();
      cx.moveTo(0, -5); cx.lineTo(4, 5); cx.lineTo(-4, 5);
      cx.closePath();
      cx.fillStyle = '#ffea00';
      cx.fill();
    } else {
      cx.fillStyle = 'rgba(255,255,255,0.08)';
      cx.beginPath();
      drawArc(cx, 0, 0, 9, 0, Math.PI * 2);
      cx.fill(); cx.stroke();
      cx.fillStyle = '#fff';
      cx.beginPath();
      drawArc(cx, 0, 0, 4, 0, Math.PI * 2);
      cx.fill();
    }
    cx.restore();
  }
}
