
export class RocketRenderer {
  static draw(
    cx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    ang: number, 
    sz: number, 
    shOn: boolean, 
    invT: number,
    vx: number,
    vy: number,
    ef: number,
    color: string = '#00e8ff'
  ) {
    cx.save();
    cx.translate(x, y);
    cx.rotate(ang);
    
    // Thruster flames
    if (Math.abs(vx) + Math.abs(vy) > 0.3) {
      const fg = cx.createRadialGradient(-sz, 0, 0, -sz, 0, 16);
      fg.addColorStop(0, `rgba(0,180,255,${0.65 * ef})`);
      fg.addColorStop(0.5, `rgba(139,69,255,${0.28 * ef})`);
      fg.addColorStop(1, 'transparent');
      cx.fillStyle = fg;
      cx.fillRect(-sz * 2.5, -14, sz * 2.5, 28);
    }
    
    cx.shadowBlur = shOn ? 25 : invT > 0 ? 15 : 22;
    cx.shadowColor = shOn ? '#00ffaa' : invT > 0 ? '#ff5c1a' : color;
    
    // Detailed Nose Cone & Body
    cx.beginPath();
    cx.moveTo(sz * 1.2, 0); // nose tip
    cx.quadraticCurveTo(sz * 0.5, -sz * 0.6, -sz * 0.5, -sz * 0.6); // top
    cx.lineTo(-sz * 0.5, sz * 0.6); // bottom back
    cx.quadraticCurveTo(sz * 0.5, sz * 0.6, sz * 1.2, 0); // bottom curve
    cx.closePath();
    
    const sg = cx.createLinearGradient(-sz, -sz, sz, sz);
    sg.addColorStop(0, shOn ? '#00ffaa' : color);
    sg.addColorStop(1, '#0e2040');
    cx.fillStyle = sg;
    cx.fill();
    
    cx.strokeStyle = shOn ? 'rgba(0,255,170,0.85)' : color;
    cx.lineWidth = 1.5;
    cx.stroke();

    // Cockpit
    cx.beginPath();
    cx.moveTo(sz * 0.4, 0);
    cx.arc(0, 0, sz * 0.4, -Math.PI/2, Math.PI/2);
    cx.fillStyle = 'rgba(0,232,255,0.4)';
    cx.fill();

    // Fins
    cx.beginPath();
    cx.moveTo(-sz * 0.2, -sz * 0.5);
    cx.lineTo(-sz * 0.6, -sz * 0.9);
    cx.lineTo(-sz * 0.6, -sz * 0.5);
    cx.fillStyle = color;
    cx.fill();

    cx.beginPath();
    cx.moveTo(-sz * 0.2, sz * 0.5);
    cx.lineTo(-sz * 0.6, sz * 0.9);
    cx.lineTo(-sz * 0.6, sz * 0.5);
    cx.fill();

    // Shield Bubble
    if (shOn) {
      const p = 1 + Math.sin(Date.now() * 0.01) * 0.06;
      cx.beginPath();
      cx.arc(0, 0, sz * 2.2 * p, 0, Math.PI * 2);
      cx.strokeStyle = `rgba(0,255,170,0.5)`;
      cx.lineWidth = 2;
      cx.stroke();
      cx.fillStyle = 'rgba(0,255,170,0.08)';
      cx.fill();
    }
    
    cx.restore();
  }
}
