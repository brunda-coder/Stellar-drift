import type { EnemyType } from '../entities/Enemy';

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
      // Sleek arrowhead fighter - Overhauled
      cx.beginPath();
      cx.moveTo(-sz * 0.8, -sz * 0.3);
      cx.lineTo(-sz * 1.8, -sz * 0.3);
      cx.moveTo(-sz * 0.8, sz * 0.3);
      cx.lineTo(-sz * 1.8, sz * 0.3);
      cx.strokeStyle = 'rgba(255, 92, 26, 0.9)';
      cx.lineWidth = sz * 0.25;
      cx.stroke();

      cx.beginPath();
      cx.moveTo(sz * 1.5, 0);
      cx.lineTo(-sz * 0.8, -sz * 1.2);
      cx.lineTo(-sz * 0.4, 0);
      cx.lineTo(-sz * 0.8, sz * 1.2);
      cx.closePath();
      
      const g = cx.createLinearGradient(-sz, 0, sz, 0);
      g.addColorStop(0, '#111');
      g.addColorStop(1, col);
      cx.fillStyle = g;
      cx.fill();
      cx.strokeStyle = col;
      cx.lineWidth = 1.5;
      cx.stroke();

      // Armor plating lines
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.lineTo(-sz * 0.6, -sz * 0.8);
      cx.moveTo(0, 0);
      cx.lineTo(-sz * 0.6, sz * 0.8);
      cx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      cx.lineWidth = 1;
      cx.stroke();

      // Glowing Cockpit
      cx.beginPath();
      cx.ellipse(sz * 0.2, 0, sz * 0.5, sz * 0.15, 0, 0, Math.PI * 2);
      cx.fillStyle = 'rgba(0, 232, 255, 0.7)';
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
      // Tiny fast dart - Overhauled to look like a mechanical drone
      cx.beginPath();
      cx.moveTo(-sz * 0.8, 0);
      cx.lineTo(-sz * 1.8, 0);
      cx.strokeStyle = 'rgba(0, 232, 255, 0.8)';
      cx.lineWidth = sz * 0.3;
      cx.stroke();

      cx.beginPath();
      cx.moveTo(sz * 1.3, 0);
      cx.lineTo(-sz * 0.8, -sz * 0.6);
      cx.lineTo(-sz * 0.5, 0);
      cx.lineTo(-sz * 0.8, sz * 0.6);
      cx.closePath();
      
      const g = cx.createLinearGradient(-sz, 0, sz, 0);
      g.addColorStop(0, '#222');
      g.addColorStop(1, col);
      cx.fillStyle = g;
      cx.fill();
      cx.lineWidth = 1;
      cx.strokeStyle = col;
      cx.stroke();

      // Cockpit Window
      cx.beginPath();
      cx.arc(0, 0, sz * 0.25, 0, Math.PI * 2);
      cx.fillStyle = 'rgba(0, 232, 255, 0.8)';
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
    } else if (type === 'BOSS') {
      // Massive Multi-Segmented Boss
      cx.moveTo(sz * 1.5, 0);
      cx.lineTo(sz * 0.8, -sz * 1.2);
      cx.lineTo(-sz * 0.5, -sz * 1.5);
      cx.lineTo(-sz * 1.5, -sz * 0.5);
      cx.lineTo(-sz * 1.5, sz * 0.5);
      cx.lineTo(-sz * 0.5, sz * 1.5);
      cx.lineTo(sz * 0.8, sz * 1.2);
      cx.closePath();
      
      const g = cx.createRadialGradient(0,0,0, 0,0, sz*1.5);
      g.addColorStop(0, '#331122');
      g.addColorStop(1, '#110000');
      cx.fillStyle = g;
      cx.fill();
      
      cx.strokeStyle = col;
      cx.lineWidth = 4;
      cx.stroke();

      // Reactor Core
      cx.beginPath();
      cx.arc(0, 0, sz * 0.4, 0, Math.PI * 2);
      cx.fillStyle = '#ff2a00';
      cx.shadowBlur = 40;
      cx.shadowColor = '#ff2a00';
      cx.fill();
      cx.shadowBlur = 0;

      // Pincers / Cannons
      cx.beginPath();
      cx.moveTo(sz * 0.8, -sz * 0.8);
      cx.lineTo(sz * 2.5, -sz * 0.4);
      cx.lineTo(sz * 0.5, -sz * 0.2);
      
      cx.moveTo(sz * 0.8, sz * 0.8);
      cx.lineTo(sz * 2.5, sz * 0.4);
      cx.lineTo(sz * 0.5, sz * 0.2);
      
      cx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      cx.lineWidth = 3;
      cx.stroke();
    }
    
    // Add unified structural elements to all
    if (type !== 'PHANTOM') {
      cx.strokeStyle = 'rgba(255,255,255,0.3)';
      cx.lineWidth = Math.max(1.5, sz * 0.1);
      cx.stroke();
    }
  }
}

