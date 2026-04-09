import { RocketRenderer } from '../renderer/RocketRenderer';

export class Player {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  ang: number = 0;
  
  hp: number = 100;
  mhp: number = 100;
  ep: number = 100;
  mep: number = 100;
  sh: number = 0;
  msh: number = 100;
  
  shOn: boolean = false;
  shT: number = 0;
  inv: number = 0;
  
  sz: number = 15;
  trail: {x: number, y: number, a: number}[] = [];
  scd: number = 0;
  ef: number = 0;
  private canvasW: number;
  private canvasH: number;
  private shipColor: string;

  constructor(w: number, h: number, stats: {hull: number, energy: number, speed: number, shield: number, color: string}) {
    this.canvasW = w;
    this.canvasH = h;
    this.x = w / 2;
    this.y = h / 2;
    this.mhp = stats.hull;
    this.hp = stats.hull;
    this.mep = stats.energy;
    this.ep = stats.energy;
    this.msh = stats.shield;
    this.shipColor = stats.color;
  }

  update(dt: number, mouse: {x: number, y: number}, shipSpeedStat: number, wave: number, fireCb: (ang: number, dim: boolean) => void) {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const d = Math.hypot(dx, dy);
    
    let ta = Math.atan2(dy, dx);
    let diff = ta - this.ang;
    
    while(diff > Math.PI) diff -= Math.PI * 2;
    while(diff < -Math.PI) diff += Math.PI * 2;
    
    this.ang += diff * 0.28;
    
    const maxSpeed = shipSpeedStat * 1.5;
    const spd = d > 5 ? Math.min(d * 0.1, maxSpeed) : 0;
    
    this.vx += (Math.cos(this.ang) * spd - this.vx) * 0.25;
    this.vy += (Math.sin(this.ang) * spd - this.vy) * 0.25;
    
    this.x += this.vx;
    this.y += this.vy;
    
    // Bounds wrapping
    if(this.x < -20) this.x = this.canvasW + 20;
    if(this.x > this.canvasW + 20) this.x = -20;
    if(this.y < -20) this.y = this.canvasH + 20;
    if(this.y > this.canvasH + 20) this.y = -20;
    
    // Trail calculation
    this.trail.push({x: this.x, y: this.y, a: 0});
    if(this.trail.length > 24) this.trail.shift();
    this.trail.forEach(t => t.a++);
    
    this.ef = Math.sin(Date.now() * 0.018) * 0.5 + 0.5;
    
    if (this.shOn) {
      this.shT -= dt;
      if (this.shT <= 0) {
        this.shOn = false;
        this.sh = 0;
      }
    }
    
    if (this.inv > 0) this.inv -= dt;
    
    this.scd -= dt;
    if (this.scd <= 0) {
      this.scd = 200 + Math.max(0, 100 - wave * 4); // auto fire
      // Find closest enemy angle, or just shoot straight. Handled by callback.
      fireCb(this.ang, false); 
    }
    
    this.ep = Math.min(this.mep, this.ep + dt * 0.015);
  }

  hit(dmg: number): number {
    if (this.inv > 0) return 0;
    let shake = 0;
    
    if (this.shOn) {
      this.sh -= dmg;
      if (this.sh < 0) { 
        this.hp += this.sh; 
        this.sh = 0; 
        this.shOn = false; 
      }
    } else {
      this.hp -= dmg;
    }
    
    this.inv = 500;
    shake = 15;
    
    if (this.hp <= 0) {
      this.hp = 0;
    }
    return shake;
  }

  draw(cx: CanvasRenderingContext2D) {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const al = i / this.trail.length;
        const r = al * 7;
        cx.beginPath();
        cx.arc(t.x, t.y, r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(0,232,255,${al * 0.28})`;
        cx.fill();
    }
    
    RocketRenderer.draw(cx, this.x, this.y, this.ang, this.sz, this.shOn, this.inv, this.vx, this.vy, this.ef, this.shipColor);
  }
}
