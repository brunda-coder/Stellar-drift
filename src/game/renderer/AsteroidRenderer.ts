import { Asteroid } from '../entities/Asteroid';

export class AsteroidRenderer {
  static draw(cx: CanvasRenderingContext2D, a: Asteroid) {
    cx.save();
    cx.translate(a.x, a.y);
    cx.rotate(a.rot);
    
    // Draw asteroid base
    cx.beginPath();
    const step = (Math.PI * 2) / a.points.length;
    for (let i = 0; i < a.points.length; i++) {
      const angle = i * step;
      const rad = a.sz * a.points[i];
      const px = Math.cos(angle) * rad;
      const py = Math.sin(angle) * rad;
      if (i === 0) cx.moveTo(px, py);
      else cx.lineTo(px, py);
    }
    cx.closePath();
    
    // Gradient and fill
    const g = cx.createRadialGradient(0, 0, 0, 0, 0, a.sz);
    g.addColorStop(0, '#2a2d34');
    g.addColorStop(1, '#111215');
    cx.fillStyle = g;
    cx.fill();
    
    // Edge highlight / shadow
    cx.strokeStyle = 'rgba(150, 160, 175, 0.4)';
    cx.lineWidth = 1.5;
    cx.stroke();

    // Damage cracks
    if (a.hp < a.mhp) {
        cx.beginPath();
        cx.moveTo(0, 0);
        const dmgPct = 1 - (a.hp / a.mhp);
        cx.lineTo(Math.cos(0) * a.sz * dmgPct, Math.sin(0) * a.sz * dmgPct);
        cx.moveTo(0, 0);
        cx.lineTo(Math.cos(2) * a.sz * dmgPct, Math.sin(2) * a.sz * dmgPct);
        cx.moveTo(0, 0);
        cx.lineTo(Math.cos(4) * a.sz * dmgPct, Math.sin(4) * a.sz * dmgPct);
        cx.strokeStyle = '#ff5c1a';
        cx.lineWidth = 1;
        cx.stroke();
    }

    cx.restore();
  }
}
