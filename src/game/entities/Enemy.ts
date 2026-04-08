import { rnd, drawArc } from '../utils';

export type EnemyType = 'DRIFTER' | 'HUNTER' | 'TITAN' | 'SWARMER' | 'ORBITER' | 'SNIPER' | 'PHANTOM';

const ET_DEF: Record<EnemyType, {c: string, s: number, h: number, spd: number, sc: number, sh: string}> = {
  DRIFTER: { c: '#8b45ff', s: 13, h: 30, spd: 1.1, sc: 50, sh: 'tri' },
  HUNTER:  { c: '#ef4444', s: 11, h: 45, spd: 1.9, sc: 80, sh: 'dia' },
  TITAN:   { c: '#f59e0b', s: 26, h: 220, spd: 0.55, sc: 220, sh: 'hex' },
  SWARMER: { c: '#ff3a8c', s: 7,  h: 12, spd: 2.6, sc: 25, sh: 'dot' },
  ORBITER: { c: '#06b6d4', s: 9,  h: 22, spd: 1.7, sc: 60, sh: 'star' },
  SNIPER:  { c: '#34d399', s: 10, h: 35, spd: 0.8, sc: 90, sh: 'arr' },
  PHANTOM: { c: '#ffffff', s: 12, h: 25, spd: 1.3, sc: 100, sh: 'cross' }
};

export class Enemy {
  type: EnemyType;
  col: string;
  sz: number;
  hp: number;
  mhp: number;
  spd: number;
  sc: number;
  sh: string;
  
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  ang: number = 0;
  alive: boolean = true;
  scd: number;
  age: number = 0;
  oa: number;
  fl: number = 0;
  
  phaseState: 'solid' | 'phasing' | 'ghost' = 'solid';
  phaseTimer: number = 0;

  constructor(type: EnemyType, w: number, h: number, wave: number, hpMultiplier: number = 1.0, sizeDmgMod: number = 1.0) {
    this.type = type;
    const d = ET_DEF[type];
    this.col = d.c;
    this.sz = d.s * sizeDmgMod;
    this.hp = (d.h + wave * 7) * hpMultiplier;
    this.mhp = this.hp;
    this.spd = d.spd + wave * 0.04;
    this.sc = d.sc;
    this.sh = d.sh;
    
    this.scd = rnd(1200, 2800);
    this.oa = Math.random() * Math.PI * 2;
    
    this.spawn(w, h);
  }

  private spawn(w: number, h: number) {
    const sd = Math.floor(Math.random() * 4);
    if(sd === 0) { this.x = Math.random() * w; this.y = -35; }
    else if(sd === 1) { this.x = w + 35; this.y = Math.random() * h; }
    else if(sd === 2) { this.x = Math.random() * w; this.y = h + 35; }
    else { this.x = -35; this.y = Math.random() * h; }
  }

  update(dt: number, px: number, py: number, fireCb: (x: number, y: number, ang: number) => void) {
    this.age += dt;
    this.fl = Math.max(0, this.fl - dt);
    
    // Phantom logic
    if (this.type === 'PHANTOM') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        if (this.phaseState === 'solid') {
          this.phaseState = 'phasing';
          this.phaseTimer = 500;
        } else if (this.phaseState === 'phasing') {
          this.phaseState = 'ghost';
          this.phaseTimer = 2000;
        } else if (this.phaseState === 'ghost') {
          this.phaseState = 'solid';
          this.phaseTimer = 3000;
        }
      }
    }

    const dx = px - this.x;
    const dy = py - this.y;
    const d = Math.hypot(dx, dy);
    this.ang = Math.atan2(dy, dx);
    
    if (this.type === 'ORBITER') {
      this.oa += 0.022;
      const tx = px + Math.cos(this.oa) * 110;
      const ty = py + Math.sin(this.oa) * 110;
      const ox = tx - this.x;
      const oy = ty - this.y;
      this.vx += (ox / Math.max(1, Math.hypot(ox, oy))) * this.spd * 0.25;
      this.vy += (oy / Math.max(1, Math.hypot(ox, oy))) * this.spd * 0.25;
    } else if (this.type === 'SNIPER') {
      // Sniper stays at distance
      if (d > 250) {
        this.vx += (dx / Math.max(1, d)) * this.spd * 0.14;
        this.vy += (dy / Math.max(1, d)) * this.spd * 0.14;
      } else if (d < 200) {
        this.vx -= (dx / Math.max(1, d)) * this.spd * 0.14;
        this.vy -= (dy / Math.max(1, d)) * this.spd * 0.14;
      }
    } else {
      this.vx += (dx / Math.max(1, d)) * this.spd * 0.14;
      this.vy += (dy / Math.max(1, d)) * this.spd * 0.14;
    }
    
    this.vx *= 0.9;
    this.vy *= 0.9;
    this.x += this.vx;
    this.y += this.vy;
    
    // Auto-fire
    this.scd -= dt;
    if (this.scd <= 0 && d < 380 && this.phaseState !== 'ghost') {
      this.scd = rnd(1200, 2200);
      if (this.type === 'SNIPER') {
        for(let i = -1; i <= 1; i++) {
          fireCb(this.x, this.y, this.ang + i * 0.2);
        }
      } else {
        fireCb(this.x, this.y, this.ang);
      }
    }
  }

  draw(cx: CanvasRenderingContext2D) {
    cx.save();
    
    if (this.type === 'PHANTOM') {
      if (this.phaseState === 'ghost') {
        cx.globalAlpha = 0.2;
      } else if (this.phaseState === 'phasing') {
        cx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
      }
    }

    cx.translate(this.x, this.y);
    cx.rotate(this.ang + (this.type === 'DRIFTER' ? this.age * 0.001 : 0));
    
    cx.shadowBlur = this.fl > 0 ? 34 : 11;
    cx.shadowColor = this.fl > 0 ? '#fff' : this.col;
    
    const s = this.sz;
    
    cx.beginPath();
    if (this.sh === 'tri') {
      cx.moveTo(s, 0); cx.lineTo(-s*.6, -s*.9); cx.lineTo(-s*.6, s*.9);
    } else if (this.sh === 'dia') {
      cx.moveTo(0, -s); cx.lineTo(s, 0); cx.lineTo(0, s); cx.lineTo(-s, 0);
    } else if (this.sh === 'hex') {
      for(let i=0; i<6; i++){
        const a = (i/6)*Math.PI*2 - Math.PI/6;
        i===0 ? cx.moveTo(Math.cos(a)*s, Math.sin(a)*s) : cx.lineTo(Math.cos(a)*s, Math.sin(a)*s);
      }
    } else if (this.sh === 'star') {
      for(let i=0; i<8; i++){
        const a = (i/8)*Math.PI*2;
        const r = i%2===0 ? s : s*.42;
        i===0 ? cx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : cx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
    } else if (this.sh === 'arr') {
      cx.moveTo(s, 0); cx.lineTo(-s*.4, -s*.7); cx.lineTo(-s*.7, 0); cx.lineTo(-s*.4, s*.7);
    } else if (this.sh === 'cross') {
      cx.moveTo(s, s*0.2); cx.lineTo(s*0.2, s*0.2); cx.lineTo(s*0.2, s); cx.lineTo(-s*0.2, s);
      cx.lineTo(-s*0.2, s*0.2); cx.lineTo(-s, s*0.2); cx.lineTo(-s, -s*0.2); cx.lineTo(-s*0.2, -s*0.2);
      cx.lineTo(-s*0.2, -s); cx.lineTo(s*0.2, -s); cx.lineTo(s*0.2, -s*0.2); cx.lineTo(s, -s*0.2);
    } else {
      drawArc(cx, 0, 0, s, 0, Math.PI * 2);
    }
    cx.closePath();
    
    cx.fillStyle = this.fl > 0 ? '#fff' : this.col;
    cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,0.18)';
    cx.lineWidth = 1;
    cx.stroke();
    
    // HP Bar
    if (this.hp < this.mhp) {
      const bw = s * 2.8;
      cx.fillStyle = 'rgba(0,0,0,0.5)';
      cx.fillRect(-bw/2, -s - 9, bw, 3);
      cx.fillStyle = this.col;
      cx.fillRect(-bw/2, -s - 9, bw * (this.hp / this.mhp), 3);
    }
    
    cx.restore();
  }
}
