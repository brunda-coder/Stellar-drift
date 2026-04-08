import { drawArc } from '../utils';

export class BlackHoleRenderer {
  static draw(cx: CanvasRenderingContext2D, x: number, y: number, r: number, pr: number, rot: number, lifeAl: number) {
    cx.save();
    cx.globalAlpha = lifeAl;
    
    // Gravitational Lensing (Outer pull radius glow)
    const hg = cx.createRadialGradient(x, y, r, x, y, pr);
    hg.addColorStop(0, 'rgba(139,69,255,0.11)');
    hg.addColorStop(1, 'transparent');
    cx.fillStyle = hg;
    cx.beginPath();
    drawArc(cx, x, y, pr, 0, Math.PI * 2);
    cx.fill();
    
    // Accretion disk (Rotating arcs)
    for (let i = 1; i <= 3; i++) {
        cx.save();
        cx.translate(x, y);
        cx.rotate(rot * i);
        cx.scale(1, 0.4 + (i * 0.1)); // Ellipse shape
        cx.beginPath();
        drawArc(cx, 0, 0, r * i * 2, 0, Math.PI * 2);
        cx.strokeStyle = `rgba(255, ${150 + i * 30}, 50, ${0.3 / i})`;
        cx.lineWidth = 6 / i;
        cx.stroke();
        cx.restore();
    }
    
    // Event horizon (pure black center)
    const cg = cx.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, 'rgba(0,0,0,1)');
    cg.addColorStop(0.8, 'rgba(0,0,0,0.95)');
    cg.addColorStop(1, 'rgba(139,69,255,0.8)');
    
    cx.beginPath();
    drawArc(cx, x, y, r, 0, Math.PI * 2);
    cx.fillStyle = cg;
    cx.shadowBlur = 30;
    cx.shadowColor = 'rgba(139,69,255,0.8)';
    cx.fill();
    
    cx.restore();
  }
}
