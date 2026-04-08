import { useGameStore } from '../store/gameStore';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Bullet } from './entities/Bullet';
import { BlackHole } from './entities/BlackHole';
import { Pickup } from './entities/Pickup';
import { StarfieldRenderer, Nebula } from './renderer/StarfieldRenderer';
import { SHIPS, GALAXIES } from '../store/data';
import { rnd, drawArc } from './utils';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private reqId: number = 0;
  private lastT: number = 0;
  private onGameOver: (stats: {score: number, kills: number, time: number}) => void;
  
  private w: number;
  private h: number;
  private mouse = { x: 0, y: 0 };
  
  // Game State
  private score = 0;
  private combo = 1;
  private cTimer = 0;
  private peakC = 1;
  private wave = 1;
  private wTimer = 1200;
  private wCount = 0;
  private gTime = 0;
  private kills = 0;
  private shake = 0;
  private sx = 0;
  private sy = 0;
  
  // Entities
  private player: Player | null = null;
  private ents: Enemy[] = [];
  private buls: Bullet[] = [];
  private picks: Pickup[] = [];
  private holes: BlackHole[] = [];
  private nebulas: Nebula[] = [];
  private parts: any[] = [];
  private floatTexts: any[] = [];
  
  // Renderers
  private starfield: StarfieldRenderer;
  
  // Modifiers
  private galaxyMods: any = {};
  private galaxyColors: any = {};
  
  // Abilities state
  private ab = {
    q: { cd: 0, max: 5000 },
    w: { cd: 0, max: 8000 },
    r: { cd: 0, max: 11000 }
  };

  constructor(canvas: HTMLCanvasElement, onGameOver: (stats: any) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onGameOver = onGameOver;
    
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    canvas.width = this.w;
    canvas.height = this.h;
    
    window.addEventListener('resize', this.handleResize);

    const store = useGameStore.getState();
    const shipDef = SHIPS.find(s => s.id === store.profile.currentShipId) || SHIPS[0];
    const galDef = GALAXIES.find(g => g.id === store.profile.unlockedGalaxies[store.profile.unlockedGalaxies.length - 1]) || GALAXIES[0];
    
    this.galaxyMods = galDef.modifiers;
    this.galaxyColors = galDef.colors;
    
    this.player = new Player(this.w, this.h, shipDef);
    this.starfield = new StarfieldRenderer(this.w, this.h);
    this.nebulas.push(new Nebula(this.w, this.h));
    
    this.loop = this.loop.bind(this);
  }

  setMousePos(x: number, y: number) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  handleKeyDown(key: string) {
    if (!this.player) return;
    const a = this.ab[key as 'q' | 'w' | 'r'];
    if (!a || a.cd > 0) return;
    
    if (key === 'q') {
      a.cd = a.max;
      this.ents.forEach(e => {
        if (e.alive && Math.hypot(e.x - this.player!.x, e.y - this.player!.y) < 250) {
          e.hp -= 90;
          if (e.hp <= 0) this.killEnemy(e);
          this.boom(e.x, e.y, '#ff5c1a', 20);
        }
      });
      // Nova burst effect
      this.parts.push({ x: this.player.x, y: this.player.y, vx: 0, vy: 0, r: 0, mr: 250, col: '#ff5c1a', life: 1, dec: 0.028, ring: true });
      this.shake = 18;
      this.flt(this.player.x, this.player.y - 40, 'NOVA BURST', '#ff5c1a');
    } else if (key === 'w') {
      if (this.player.ep < 30) return;
      this.player.ep -= 30;
      a.cd = a.max;
      this.player.shOn = true;
      this.player.sh = this.player.msh;
      this.player.shT = 4000;
      this.flt(this.player.x, this.player.y - 40, 'PHASE SHIELD', '#00ffaa');
    } else if (key === 'r') {
      if (this.player.ep < 20) return;
      this.player.ep -= 20;
      a.cd = a.max;
      // Magnetize all pickups instantly to player
      this.picks.forEach(p => {
        const ang = Math.atan2(this.player!.y - p.y, this.player!.x - p.x);
        p.vx += Math.cos(ang) * 15;
        p.vy += Math.sin(ang) * 15;
      });
      // Push enemies away
      this.ents.forEach(e => {
        const ang = Math.atan2(this.player!.y - e.y, this.player!.x - e.x);
        e.vx += Math.cos(ang) * 4.5;
        e.vy += Math.sin(ang) * 4.5;
      });
      // Warp visual
      this.parts.push({ x: this.player.x, y: this.player.y, vx: 0, vy: 0, r: 250, mr: 0, col: '#8b45ff', life: 1, dec: 0.02, ring: true });
      this.flt(this.player.x, this.player.y - 40, 'WARP PULL', '#8b45ff');
    }
  }

  private handleResize = () => {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  };

  start() {
    this.lastT = performance.now();
    this.reqId = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.reqId);
    window.removeEventListener('resize', this.handleResize);
  }

  private killEnemy(e: Enemy) {
    e.alive = false;
    const pts = Math.round(e.sc * this.combo);
    this.score += pts;
    this.kills++;
    
    this.combo = Math.min(this.combo + 0.5, 10);
    this.cTimer = 3200;
    if (this.combo > this.peakC) this.peakC = this.combo;
    
    this.boom(e.x, e.y, e.col, e.sz);
    if (Math.random() < 0.65) this.picks.push(new Pickup(e.x, e.y));
    this.flt(e.x, e.y, '+' + pts, e.col);
    
    if (e.type === 'TITAN') {
      for(let i=0; i<5; i++){
        const split = new Enemy('SWARMER', this.w, this.h, this.wave);
        split.x = e.x + rnd(-40, 40);
        split.y = e.y + rnd(-40, 40);
        this.ents.push(split);
      }
    }
  }

  private boom(x: number, y: number, col: string, sz: number) {
    for (let i = 0; i < sz * 2.5; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(1, 5);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.5, 4.5), col, life: 1, dec: rnd(0.012, 0.026) });
    }
    this.parts.push({ x, y, vx: 0, vy: 0, r: 0, mr: sz * 3, col, life: 1, dec: 0.025, ring: true });
  }

  private popFx(x: number, y: number, type: string) {
    const C: any = { star: '#ffd060', hp: '#ff3a8c', ep: '#00e8ff', mega: '#fff' };
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rnd(1, 3);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1, 3), col: C[type], life: 1, dec: 0.04 });
    }
  }

  private flt(x: number, y: number, text: string, col: string) {
    this.floatTexts.push({ x, y, text, col, age: 0 });
  }

  private spawnWaves(dt: number) {
    this.wTimer -= dt;
    if (this.wTimer > 0) return;
    
    // Wave budget
    const budget = this.wave * 2 + 4;
    const pool: any[] = ['DRIFTER', 'DRIFTER', 'HUNTER', 'SWARMER', 'ORBITER'];
    if (this.wave >= 2) pool.push('PHANTOM');
    if (this.wave >= 3) pool.push('TITAN');
    if (this.wave >= 4) pool.push('SNIPER');
    
    let hpMod = this.galaxyMods.enemyHpMultiplier || 1.0;
    let dmgSizeMod = this.galaxyMods.enemySizeDmg || 1.0;
    
    for (let i = 0; i < budget; i++) {
        const t = pool[Math.floor(Math.random() * pool.length)];
        setTimeout(() => {
          if (this.player) {
            this.ents.push(new Enemy(t, this.w, this.h, this.wave, hpMod, dmgSizeMod));
          }
        }, i * (this.galaxyMods.enemyFireRate ? 150 : 250));
    }
    
    this.wTimer = 5800 + this.wave * 160;
    this.wCount++;
    
    if (this.wCount % 3 === 0) {
      this.wave++;
      this.flt(this.w/2, this.h/2 - 80, 'SECTOR ' + this.wave, '#00e8ff');
      if (Math.random() < 0.55) this.nebulas.push(new Nebula(this.w, this.h));
      if (this.wave % 2 === 0 || (this.galaxyMods.blackHoleFreq && Math.random() < 0.8)) {
        this.holes.push(new BlackHole(this.w, this.h));
      }
    }
  }

  private loop(ts: number) {
    const dt = Math.min(ts - this.lastT, 60); // Cap delta time
    this.lastT = ts;
    
    if (!this.player) return; // Game over state
    this.gTime += dt;

    if (this.shake > 0) {
      this.shake *= 0.82;
      this.sx = (Math.random() - 0.5) * this.shake;
      this.sy = (Math.random() - 0.5) * this.shake;
      if (this.shake < 0.3) { this.shake = 0; this.sx = 0; this.sy = 0; }
    }

    const { ctx, w, h } = this;
    
    // Clear & draw background
    ctx.fillStyle = '#010308';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this.sx, this.sy);

    // Dynamic background gradients logic
    const bg1 = ctx.createRadialGradient(w*0.3, h*0.3, 0, w*0.3, h*0.3, w*0.8);
    bg1.addColorStop(0, this.galaxyColors.bg1 || 'rgba(139,69,255,0.033)');
    bg1.addColorStop(1, 'transparent');
    ctx.fillStyle = bg1;
    ctx.fillRect(0,0,w,h);

    const bg2 = ctx.createRadialGradient(w*0.75, h*0.7, 0, w*0.75, h*0.7, w*0.6);
    bg2.addColorStop(0, this.galaxyColors.bg2 || 'rgba(0,232,255,0.022)');
    bg2.addColorStop(1, 'transparent');
    ctx.fillStyle = bg2;
    ctx.fillRect(0,0,w,h);

    this.starfield.draw(ctx, this.player.vx, this.player.vy);
    
    this.nebulas = this.nebulas.filter(n => n.age < n.life);
    this.nebulas.forEach(n => { n.update(dt); n.draw(ctx, this.player!.vx, this.player!.vy); });
    
    this.holes = this.holes.filter(h => h.alive);
    this.holes.forEach(h => { 
      h.update(dt, this.player!.x, this.player!.y, (fx, fy, d) => {
        this.player!.vx += fx;
        this.player!.vy += fy;
        if (d < h.r * 3 && d > h.r * 1.5) this.score += Math.max(0.1, 0.3 * this.combo * (dt / 16)); // Graze points
      }); 
      
      // Black hole hits player
      if (Math.hypot(this.player!.x - h.x, this.player!.y - h.y) < h.r) {
        this.shake += this.player!.hit(2.5 * (dt/16));
      }
      h.draw(ctx); 
    });

    // Particles
    this.parts = this.parts.filter(p => p.life > 0);
    this.parts.forEach(p => {
      if (p.ring) {
        if (p.mr === 0) p.r -= 25; // inward ring warp
        else p.r = Math.min(p.r + (p.mr) * p.dec * 2, p.mr);
        p.life -= p.dec;
        ctx.save();
        ctx.globalAlpha = p.life * 0.55;
        ctx.beginPath();
        drawArc(ctx, p.x, p.y, Math.max(0.01, p.r), 0, Math.PI * 2);
        ctx.strokeStyle = p.col;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.91; p.vy *= 0.91;
        p.life -= p.dec;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.col;
        ctx.beginPath();
        drawArc(ctx, p.x, p.y, Math.max(0.01, p.r * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.fill();
        ctx.restore();
      }
    });

    // Cosmic Storm Modifier
    if (this.galaxyMods.cosmicStormDrift) {
      this.player.vx += (Math.random() - 0.5) * 0.4;
      this.player.vy += (Math.random() - 0.5) * 0.4;
    }

    // Player Update
    this.player.update(dt, this.mouse, 5.0, this.wave, (ang, dim) => {
        this.buls.push(new Bullet(this.player!.x, this.player!.y, ang, 'p', dim, '#00e8ff'));
        // High level burst
        if (this.wave >= 3) this.buls.push(new Bullet(this.player!.x, this.player!.y, ang + 0.15, 'p', true, '#00e8ff'));
        if (this.wave >= 5) this.buls.push(new Bullet(this.player!.x, this.player!.y, ang - 0.15, 'p', true, '#00e8ff'));
    });

    // Buls update
    this.buls = this.buls.filter(b => b.alive);
    this.buls.forEach(b => {
      b.update(w, h);
      b.draw(ctx);
    });

    // Pickups update
    this.picks = this.picks.filter(p => p.alive);
    this.picks.forEach(p => {
      p.update(dt, this.player!.x, this.player!.y, this.player!.sz, (type, px, py) => {
        if (type === 'star') { this.score += 15 * this.combo; this.flt(px, py, '⭐+STAR', '#ffd060'); }
        else if (type === 'hp') { this.player!.hp = Math.min(this.player!.mhp, this.player!.hp + 18); this.flt(px, py, '♥+18', '#ff3a8c'); }
        else if (type === 'ep') { this.player!.ep = Math.min(this.player!.mep, this.player!.ep + 35); this.flt(px, py, '⚡+35', '#00e8ff'); }
        else { this.score += 100 * this.combo; this.player!.hp = Math.min(this.player!.mhp, this.player!.hp + 30); this.flt(px, py, '💎MEGA!', '#fff'); this.shake += 5; }
        this.popFx(px, py, type);
      });
      p.draw(ctx);
    });

    // Enemies update
    this.ents = this.ents.filter(e => e.alive);
    this.ents.forEach(e => {
      e.update(dt, this.player!.x, this.player!.y, (bx, by, bang) => {
        this.buls.push(new Bullet(bx, by, bang, 'e'));
      });
      e.draw(ctx);
      
      // Player <-> Enemy collision
      if (Math.hypot(e.x - this.player!.x, e.y - this.player!.y) < e.sz + this.player!.sz && e.phaseState !== 'ghost') {
        this.shake += this.player!.hit(0.7 * (dt/16));
        // Push apart
        e.vx += (e.x - this.player!.x) * 0.1;
        e.vy += (e.y - this.player!.y) * 0.1;
      }
    });

    // Bullet Collisions
    this.buls.forEach(b => {
      if (b.own === 'p') {
        this.ents.forEach(e => {
          if (e.alive && e.phaseState !== 'ghost' && Math.hypot(b.x - e.x, b.y - e.y) < e.sz) {
            e.hp -= b.dmg;
            e.fl = 140;
            b.alive = false;
            this.boom(b.x, b.y, b.col, 3);
            if (e.hp <= 0) this.killEnemy(e);
          }
        });
      } else if (b.own === 'e') {
        if (this.player && Math.hypot(b.x - this.player.x, b.y - this.player.y) < this.player.sz) {
          this.shake += this.player.hit(b.dmg);
          b.alive = false;
          this.boom(b.x, b.y, b.col, 2);
        }
      }
    });

    this.player.draw(ctx);
    this.spawnWaves(dt);
    
    if (this.cTimer > 0) {
      this.cTimer -= dt;
      if (this.cTimer <= 0) this.combo = 1;
    }

    ['q', 'w', 'r'].forEach(k => {
      const a = this.ab[k as 'q'|'w'|'r'];
      if (a.cd > 0) a.cd -= dt;
    });

    // Draw Float Texts
    this.floatTexts = this.floatTexts.filter(f => f.age < 1200);
    this.floatTexts.forEach(f => {
      f.age += dt;
      const al = 1 - (f.age / 1200);
      const dy = (f.age / 1200) * 52;
      ctx.fillStyle = f.col;
      ctx.globalAlpha = al;
      ctx.font = 'bold 14px "Oxanium"';
      ctx.fillText(f.text, f.x - 20, f.y - dy);
    });
    ctx.globalAlpha = 1;

    ctx.restore();

    this.drawHUD(ctx);

    if (this.player.hp <= 0) {
      this.triggerGameOver();
      return;
    }

    this.reqId = requestAnimationFrame(this.loop);
  }

  private drawHUD(cx: CanvasRenderingContext2D) {
    if (!this.player) return;
    
    // HP, EP, Shield Vitals (Top Left)
    const drawBar = (x: number, y: number, icon: string, val: number, max: number, colorStart: string, colorEnd: string) => {
      cx.fillStyle = `rgba(255,255,255,0.6)`;
      cx.font = '12px "Rajdhani"';
      cx.fillText(icon, x, y + 4);
      
      const bw = 138;
      cx.fillStyle = 'rgba(255,255,255,0.05)';
      cx.fillRect(x + 20, y, bw, 3);
      
      const pct = Math.max(0, Math.min(1, val / max));
      const fw = bw * pct;
      if (fw > 0) {
        const grd = cx.createLinearGradient(x + 20, y, x + 20 + fw, y);
        grd.addColorStop(0, colorStart);
        grd.addColorStop(1, colorEnd);
        cx.fillStyle = grd;
        cx.fillRect(x + 20, y, fw, 3);
        
        // white glow tip
        cx.fillStyle = 'rgba(255,255,255,0.85)';
        cx.fillRect(x + 20 + fw - 3, y - 2, 3, 7);
      }
      
      cx.fillStyle = colorStart;
      cx.font = 'bold 11px "Oxanium"';
      cx.fillText(Math.ceil(val).toString(), x + 165, y + 5);
    };

    drawBar(22, 22, '♥', this.player.hp, this.player.mhp, '#ff3a8c', '#ff6b35');
    drawBar(22, 36, '⚡', this.player.ep, this.player.mep, '#00e8ff', '#8b45ff');
    drawBar(22, 50, '◈', this.player.sh, this.player.msh, '#00ffaa', '#00e8ff');

    // Score & Combo (Top Right)
    cx.textAlign = 'right';
    cx.font = '800 44px "Oxanium"';
    cx.fillStyle = '#fff';
    cx.shadowBlur = 30;
    cx.shadowColor = 'rgba(0,232,255,0.55)';
    cx.fillText(Math.floor(this.score).toLocaleString(), this.w - 22, 50);
    cx.shadowBlur = 0;
    
    cx.font = '9px "Rajdhani"';
    cx.fillStyle = 'rgba(0,232,255,0.3)';
    cx.letterSpacing = '5px';
    cx.fillText("STELLAR POINTS", this.w - 22, 65);
    cx.letterSpacing = '0px';

    if (this.combo > 1.1 && this.cTimer > 0) {
      cx.font = '800 20px "Oxanium"';
      const cCol = this.combo >= 7 ? '#ffd060' : this.combo >= 4 ? '#ff5c1a' : '#ff3a8c';
      cx.fillStyle = cCol;
      cx.shadowBlur = 18;
      cx.shadowColor = cCol;
      cx.fillText('×' + this.combo.toFixed(1) + ' COMBO', this.w - 22, 90);
      cx.shadowBlur = 0;
      
      const cbw = 120;
      const cpct = this.cTimer / 3200;
      cx.fillStyle = 'rgba(255,255,255,0.07)';
      cx.fillRect(this.w - 22 - cbw, 98, cbw, 2);
      cx.fillStyle = cCol;
      cx.fillRect(this.w - 22 - cbw, 98, cbw * cpct, 2);
    }
    cx.textAlign = 'left';

    // Sector & Wave indicator (Bottom Right)
    cx.textAlign = 'right';
    cx.font = '8px "Rajdhani"';
    cx.fillStyle = 'rgba(255,255,255,0.14)';
    cx.letterSpacing = '5px';
    cx.fillText("SECTOR", this.w - 22, this.h - 50);
    cx.font = '800 22px "Oxanium"';
    cx.fillStyle = 'rgba(0,232,255,0.28)';
    cx.letterSpacing = '2px';
    cx.fillText(this.wave.toString().padStart(3, '0'), this.w - 22, this.h - 26);
    cx.letterSpacing = '0px';
    cx.textAlign = 'left';

    // Abilities Cooldown UI (Bottom Center)
    const drawAbility = (x: number, y: number, key: string, icon: string, a: any) => {
      const size = 50;
      const isRdy = a.cd <= 0;
      
      cx.fillStyle = 'rgba(255,255,255,0.025)';
      cx.strokeStyle = isRdy ? 'rgba(0,232,255,0.4)' : 'rgba(255,255,255,0.1)';
      cx.lineWidth = 1;
      
      // Frame
      cx.beginPath();
      cx.roundRect(x, y, size, size, 8);
      if (isRdy) {
        cx.shadowBlur = 12;
        cx.shadowColor = 'rgba(0,232,255,0.15)';
      }
      cx.fill();
      cx.stroke();
      cx.shadowBlur = 0;
      
      // Cooldown overlay
      if (!isRdy) {
        const pct = a.cd / a.max;
        cx.fillStyle = 'rgba(0,0,0,0.65)';
        cx.beginPath();
        cx.roundRect(x, y + size * (1 - pct), size, size * pct, [0, 0, 8, 8]);
        cx.fill();
      }
      
      // Icon & Text
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.font = '19px Arial';
      cx.fillStyle = '#fff';
      cx.fillText(icon, x + size/2, y + size/2 - 4);
      
      cx.font = '9px "Oxanium"';
      cx.fillStyle = 'rgba(255,255,255,0.28)';
      cx.letterSpacing = '1px';
      cx.fillText(key.toUpperCase(), x + size/2, y + size - 10);
      cx.letterSpacing = '0px';
      cx.textAlign = 'left';
      cx.textBaseline = 'alphabetic';
    };

    const cxC = this.w / 2;
    drawAbility(cxC - 80, this.h - 76, 'q', '💥', this.ab.q);
    drawAbility(cxC - 25, this.h - 76, 'w', '🛡', this.ab.w);
    drawAbility(cxC + 30, this.h - 76, 'r', '🌀', this.ab.r);
  }

  private triggerGameOver() {
    this.stop();
    const store = useGameStore.getState();
    const playTime = Math.floor(this.gTime / 1000);
    
    store.addCredits(Math.floor(this.score / 10)); // 10% score to credits ratio
    store.updateStats(this.kills, Math.floor(this.score), playTime);
    
    this.onGameOver({
      score: this.score,
      kills: this.kills,
      time: playTime
    });
  }
}
