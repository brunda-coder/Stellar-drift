import { rnd } from '../utils';
import { EnemyRenderer } from '../renderer/EnemyRenderer';

export type EnemyType = 'DRIFTER' | 'HUNTER' | 'TITAN' | 'SWARMER' | 'ORBITER' | 'SNIPER' | 'PHANTOM' | 'BOSS';

const ET_DEF: Record<EnemyType, {c: string, s: number, h: number, spd: number, sc: number, sh: string}> = {
  DRIFTER: { c: '#8b45ff', s: 13, h: 18,  spd: 0.85, sc: 80,  sh: 'tri' },
  HUNTER:  { c: '#ef4444', s: 11, h: 28,  spd: 1.5,  sc: 120, sh: 'dia' },
  TITAN:   { c: '#f59e0b', s: 26, h: 130, spd: 0.45, sc: 350, sh: 'hex' },
  SWARMER: { c: '#ff3a8c', s: 7,  h: 8,   spd: 2.0,  sc: 40,  sh: 'dot' },
  ORBITER: { c: '#06b6d4', s: 9,  h: 14,  spd: 1.3,  sc: 90,  sh: 'star' },
  SNIPER:  { c: '#34d399', s: 10, h: 22,  spd: 0.65, sc: 140, sh: 'arr' },
  PHANTOM: { c: '#ffffff', s: 12, h: 16,  spd: 1.0,  sc: 160, sh: 'cross' },
  BOSS:    { c: '#ff0055', s: 45, h: 1500, spd: 0.3,  sc: 5000,sh: 'boss' }
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

  // Boss specific
  bossPhase: number = 1;
  bossMoveTarget: {x: number, y: number} = {x: 0, y: 0};

  constructor(type: EnemyType, w: number, h: number, wave: number, hpMultiplier: number = 1.0, sizeDmgMod: number = 1.0) {
    this.type = type;
    const d = ET_DEF[type];
    this.col = d.c;
    this.sz = d.s * sizeDmgMod;
    
    if (type === 'BOSS') {
      this.hp = d.h * Math.max(1, wave / 5) * hpMultiplier;
    } else {
      this.hp = (d.h + wave * 4) * hpMultiplier;
    }
    
    this.mhp = this.hp;
    this.spd = d.spd + wave * 0.025;
    this.sc = d.sc;
    this.sh = d.sh;
    
    if (type === 'BOSS') {
      this.scd = 2000;
      this.x = w / 2;
      this.y = -100;
      this.bossMoveTarget = { x: w / 2, y: h * 0.3 };
    } else {
      this.scd = rnd(1800, 3500);
      this.oa = Math.random() * Math.PI * 2;
      this.spawn(w, h);
    }
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
    
    if (this.type === 'BOSS') {
      this.updateBoss(dt, px, py, fireCb);
      return;
    }

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
    if (this.scd <= 0 && d < 350 && this.phaseState !== 'ghost') {
      this.scd = rnd(1800, 3200);  // fire less frequently (was 1200–2200)
      if (this.type === 'SNIPER') {
        for(let i = -1; i <= 1; i++) {
          fireCb(this.x, this.y, this.ang + i * 0.2);
        }
      } else {
        fireCb(this.x, this.y, this.ang);
      }
    }
  }

  private updateBoss(dt: number, px: number, py: number, fireCb: (x: number, y: number, ang: number) => void) {
    const dx = px - this.x;
    const dy = py - this.y;
    this.ang = Math.atan2(dy, dx);

    // Update Phase based on HP
    const hpPct = this.hp / this.mhp;
    if (hpPct < 0.35) this.bossPhase = 3;
    else if (hpPct < 0.7) this.bossPhase = 2;

    // Boss Movement
    const tx = this.bossMoveTarget.x - this.x;
    const ty = this.bossMoveTarget.y - this.y;
    if (Math.hypot(tx, ty) < 20) {
      // Pick new target near top half
      this.bossMoveTarget.x = rnd(100, px > 100 ? px + 200 : 800);
      this.bossMoveTarget.y = rnd(50, 250);
    }
    
    const d = Math.hypot(tx, ty);
    this.vx += (tx / Math.max(1, d)) * this.spd * 0.1;
    this.vy += (ty / Math.max(1, d)) * this.spd * 0.1;
    
    this.vx *= 0.92;
    this.vy *= 0.92;
    this.x += this.vx;
    this.y += this.vy;

    // Boss Firing Patterns
    this.scd -= dt;
    if (this.scd <= 0) {
      if (this.bossPhase === 1) {
        // Phase 1: Ring blast
        this.scd = 2000;
        for (let i = 0; i < 12; i++) {
          fireCb(this.x, this.y, (Math.PI * 2 / 12) * i + (this.age * 0.001));
        }
      } else if (this.bossPhase === 2) {
        // Phase 2: Directed spread + fast fire
        this.scd = 1200;
        for (let i = -2; i <= 2; i++) {
          fireCb(this.x, this.y, this.ang + i * 0.15);
        }
        setTimeout(() => {
          if (!this.alive) return;
          for (let i = -1; i <= 1; i++) fireCb(this.x, this.y, this.ang + i * 0.15);
        }, 300);
      } else {
        // Phase 3: Bullet Hell Spiral
        this.scd = 150;
        const spiralAng = (this.age * 0.008) % (Math.PI * 2);
        fireCb(this.x, this.y, spiralAng);
        fireCb(this.x, this.y, spiralAng + Math.PI);
        if (Math.random() < 0.2) {
           fireCb(this.x, this.y, this.ang); // occasional direct shot
        }
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
    EnemyRenderer.draw(cx, this.type, s, this.col);
    cx.closePath();
    
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
