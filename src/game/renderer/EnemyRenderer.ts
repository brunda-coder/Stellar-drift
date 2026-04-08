import { EnemyType } from '../entities/Enemy';

export class EnemyRenderer {
  static draw(cx: CanvasRenderingContext2D, type: EnemyType, sz: number, col: string) {
    cx.beginPath();
    
    // Instead of simple shapes, draw detailed alien crafts / drone shapes
    if (type === 'DRIFTER') {
      // Bio-mechanical drone
      cx.moveTo(sz * 1.2, 0);
      cx.bezierCurveTo(sz * 0.5, -sz * 0.8, -sz * 0.5, -sz * 0.5, -sz, 0);
      cx.bezierCurveTo(-sz * 0.5, sz * 0.5, sz * 0.5, sz * 0.8, sz * 1.2, 0);
      
      cx.fillStyle = 'rgba(20,20,30,0.8)';
      cx.fill();
      
      cx.beginPath();
      cx.arc(0, 0, sz * 0.4, 0, Math.PI * 2);
      cx.fillStyle = col;
      cx.fill();

    } else if (type === 'HUNTER') {
      // Sleek arrowhead fighter
      cx.moveTo(sz * 1.5, 0);
      cx.lineTo(-sz * 0.8, -sz * 1.1);
      cx.lineTo(-sz * 0.4, 0);
      cx.lineTo(-sz * 0.8, sz * 1.1);
      cx.closePath();
      
      const g = cx.createLinearGradient(-sz, 0, sz, 0);
      g.addColorStop(0, '#1a1a2e');
      g.addColorStop(1, col);
      cx.fillStyle = g;
      cx.fill();
      
      // glowing engine
      cx.beginPath();
      cx.arc(-sz * 0.5, 0, sz * 0.3, 0, Math.PI * 2);
      cx.fillStyle = '#fff';
      cx.fill();

    } else if (type === 'TITAN') {
      // Massive dreadnought
      cx.moveTo(sz * 1.5, 0);
      cx.lineTo(sz * 0.5, -sz * 1.2);
      cx.lineTo(-sz * 1.5, -sz * 0.8);
      cx.lineTo(-sz * 1.0, 0);
      cx.lineTo(-sz * 1.5, sz * 0.8);
      cx.lineTo(sz * 0.5, sz * 1.2);
      cx.closePath();
      
      const g = cx.createRadialGradient(0,0,0, 0,0, sz*1.5);
      g.addColorStop(0, col);
      g.addColorStop(1, '#000');
      cx.fillStyle = g;
      cx.fill();
      
      cx.strokeStyle = col;
      cx.lineWidth = 3;
      cx.stroke();

    } else if (type === 'SWARMER') {
      // Tiny fast dart
      cx.moveTo(sz * 1.3, 0);
      cx.lineTo(-sz * 0.8, -sz * 0.5);
      cx.lineTo(-sz * 0.5, 0);
      cx.lineTo(-sz * 0.8, sz * 0.5);
      cx.closePath();
      cx.fillStyle = col;
      cx.fill();

    } else if (type === 'ORBITER') {
      // Ring-based satellite
      cx.arc(0, 0, sz * 0.6, 0, Math.PI * 2);
      cx.fillStyle = '#111';
      cx.fill();
      
      cx.beginPath();
      cx.arc(0, 0, sz * 1.2, -Math.PI/4, Math.PI/4);
      cx.arc(0, 0, sz * 1.2, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
      cx.strokeStyle = col;
      cx.lineWidth = sz * 0.3;
      cx.stroke();

    } else if (type === 'SNIPER') {
      // Long-barreled ship
      cx.moveTo(sz * 1.8, -sz * 0.1);
      cx.lineTo(sz * 1.8, sz * 0.1);
      cx.lineTo(sz * 0.5, sz * 0.4);
      cx.lineTo(-sz * 1.2, sz * 0.6);
      cx.lineTo(-sz * 1.0, 0);
      cx.lineTo(-sz * 1.2, -sz * 0.6);
      cx.lineTo(sz * 0.5, -sz * 0.4);
      cx.closePath();
      cx.fillStyle = '#0f172a';
      cx.fill();
      
      cx.strokeStyle = col;
      cx.lineWidth = 1.5;
      cx.stroke();
      
      // Targeting laser
      cx.beginPath();
      cx.moveTo(sz * 1.8, 0);
      cx.lineTo(sz * 5.0, 0);
      cx.strokeStyle = 'rgba(255,0,0,0.15)';
      cx.lineWidth = 1;
      cx.stroke();

    } else if (type === 'PHANTOM') {
      // Ethereal wing shape
      cx.moveTo(sz * 1.2, 0);
      cx.quadraticCurveTo(0, -sz * 1.5, -sz * 1.2, -sz);
      cx.quadraticCurveTo(-sz * 0.5, 0, -sz * 1.2, sz);
      cx.quadraticCurveTo(0, sz * 1.5, sz * 1.2, 0);
      cx.fillStyle = 'rgba(255,255,255,0.7)';
      cx.shadowBlur = 20;
      cx.shadowColor = '#fff';
      cx.fill();
      cx.shadowBlur = 0;
    }
    
    // Add unified structural elements to all
    if (type !== 'PHANTOM') {
      cx.strokeStyle = 'rgba(255,255,255,0.3)';
      cx.lineWidth = Math.max(1, sz * 0.05);
      cx.stroke();
    }
  }
}
