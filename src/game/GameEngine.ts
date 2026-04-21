import { useGameStore } from '../store/gameStore';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Bullet } from './entities/Bullet';
import { BlackHole } from './entities/BlackHole';
import { Pickup } from './entities/Pickup';
import { Asteroid } from './entities/Asteroid';
import { StarfieldRenderer, Nebula } from './renderer/StarfieldRenderer';
import { AsteroidRenderer } from './renderer/AsteroidRenderer';
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
  private mouseRaw = { x: 0, y: 0 };
  private upgrades: any;
  
  // Game State
  private score = 0;
  private combo = 1;
  private cTimer = 0;
  private peakC = 1;
  private wave = 1;
  private wTimer = 3000;  // longer initial delay before first wave
  private wCount = 0;
  private gTime = 0;
  private kills = 0;
  private shake = 0;
  private sx = 0;
  private sy = 0;
  
  // Juice
  private rapidKills = 0;
  private rapidKillTimer = 0;
  
  // Entities
  private player: Player | null = null;
  private ents: Enemy[] = [];
  private buls: Bullet[] = [];
  private picks: Pickup[] = [];
  private holes: BlackHole[] = [];
  private nebulas: Nebula[] = [];
  private asteroids: Asteroid[] = [];
  private parts: any[] = [];
  private floatTexts: any[] = [];
  private spawnQueue: { type: any, delay: number, hpMod: number, dmgSizeMod: number }[] = [];
  
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

  private paused = false;

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
    const upgrades = store.profile.upgrades || {hullPlating:0, energyCore:0, magnetRange:0, overchargeDuration:0, adrenalineDecay:0};
    
    this.galaxyMods = galDef.modifiers;
    this.galaxyColors = galDef.colors;
    this.upgrades = upgrades;
    
    this.player = new Player(this.w, this.h, shipDef, upgrades);
    this.starfield = new StarfieldRenderer(this.w, this.h);
    this.nebulas.push(new Nebula(this.w, this.h));
    
    this.loop = this.loop.bind(this);
  }

  setMousePos(x: number, y: number) {
    this.mouseRaw.x = x;
    this.mouseRaw.y = y;
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

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.lastT = performance.now(); // reset to avoid jump
  }

  get isPaused() { return this.paused; }

  private killEnemy(e: Enemy) {
    e.alive = false;
    const pts = Math.round(e.sc * this.combo);
    this.score += pts;
    this.kills++;
    
    this.combo = Math.min(this.combo + 0.5, 10);
    this.cTimer = 5500;
    if (this.combo > this.peakC) this.peakC = this.combo;
    
    this.boom(e.x, e.y, e.col, e.sz);
    if (Math.random() < 0.80) this.picks.push(new Pickup(e.x, e.y));
    this.flt(e.x, e.y, '+' + pts, e.col);
    
    this.rapidKills++;
    this.rapidKillTimer = 2000;
    
    if (this.rapidKills === 3) this.flt(this.w/2, this.h * 0.25, 'TRIPLE KILL!', '#ff8c00');
    if (this.rapidKills === 5) this.flt(this.w/2, this.h * 0.25, 'RAMPAGE!', '#ff0055');
    if (this.rapidKills === 10) this.flt(this.w/2, this.h * 0.25, 'GODLIKE!', '#8b45ff');
    if (this.rapidKills === 20) this.flt(this.w/2, this.h * 0.25, 'UNSTOPPABLE!', '#00e8ff');

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
    if (this.ents.some(e => e.type === 'BOSS')) {
      this.wTimer = 5000; // stall wave timer while boss is alive
      return;
    }

    this.wTimer -= dt;
    if (this.wTimer > 0) return;
    
    let hpMod = this.galaxyMods.enemyHpMultiplier || 1.0;
    let dmgSizeMod = this.galaxyMods.enemySizeDmg || 1.0;

    const isBossWave = (this.wave > 0 && this.wave % 5 === 0);

    if (isBossWave) {
      this.flt(this.w/2, this.h/2 - 80, '⚠️ WARNING: ANOMALY DETECTED ⚠️', '#ff0055');
      this.shake = 30;
      this.spawnQueue.push({
        type: 'BOSS',
        delay: 2000,
        hpMod,
        dmgSizeMod
      });
      // Skip normal wave processing
    } else {
      // Wave budget — smaller waves early on
      const budget = Math.min(this.wave + 2, 10);
      const pool: any[] = ['DRIFTER', 'SWARMER'];
      if (this.wave >= 3) pool.push('HUNTER', 'ORBITER');
      if (this.wave >= 5) pool.push('PHANTOM');
      if (this.wave >= 6) pool.push('TITAN');
      if (this.wave >= 7) pool.push('SNIPER');
      
      for (let i = 0; i < budget; i++) {
          const t = pool[Math.floor(Math.random() * pool.length)];
          this.spawnQueue.push({
            type: t,
            delay: i * (this.galaxyMods.enemyFireRate ? 250 : 400),
            hpMod,
            dmgSizeMod
          });
      }
    }
    
    this.wTimer = 8000 + this.wave * 120;
    this.wCount++;
    
    if (this.wCount % 4 === 0) {  // wave level-up every 4 waves
      this.wave++;
      this.flt(this.w/2, this.h/2 - 80, '✦ SECTOR ' + this.wave + ' ✦', '#00e8ff');
      if (Math.random() < 0.45) this.nebulas.push(new Nebula(this.w, this.h));
      if (this.wave % 3 === 0 || (this.galaxyMods.blackHoleFreq && Math.random() < 0.7)) {
        this.holes.push(new BlackHole(this.w, this.h));
      }
    }
    
    // Random Asteroid Spawning
    if (Math.random() < 0.08) {
      const edge = Math.floor(Math.random() * 4);
      let ax, ay, avx, avy;
      const speed = rnd(0.5, 2.5);
      if (edge === 0) { ax = Math.random() * this.w; ay = -50; avx = rnd(-1, 1); avy = speed; }
      else if (edge === 1) { ax = this.w + 50; ay = Math.random() * this.h; avx = -speed; avy = rnd(-1, 1); }
      else if (edge === 2) { ax = Math.random() * this.w; ay = this.h + 50; avx = rnd(-1, 1); avy = -speed; }
      else { ax = -50; ay = Math.random() * this.h; avx = speed; avy = rnd(-1, 1); }
      this.asteroids.push(new Asteroid(ax, ay, rnd(15, 45), avx, avy));
    }
  }

  private loop(ts: number) {
    const dt = Math.min(ts - this.lastT, 60); // Cap delta time
    this.lastT = ts;
    
    if (!this.player) return; // Game over state
    if (this.paused) { this.reqId = requestAnimationFrame(this.loop); return; } // paused
    this.gTime += dt;

    if (this.shake > 0) {
      this.shake *= 0.82;
      this.sx = (Math.random() - 0.5) * this.shake;
      this.sy = (Math.random() - 0.5) * this.shake;
      if (this.shake < 0.3) { this.shake = 0; this.sx = 0; this.sy = 0; }
    }

    const { ctx, w, h } = this;
    
    // Dynamic camera zoom based on player speed and adrenaline
    let zoom = 1.0;
    if (this.player.isAdrenalineActive) zoom = 0.92;
    else {
      const spd = Math.hypot(this.player.vx, this.player.vy);
      zoom = Math.max(0.85, 1.0 - (spd * 0.015));
    }

    // Un-project raw mouse position back to world space
    this.mouse.x = (this.mouseRaw.x - w / 2) / zoom + w / 2 - this.sx;
    this.mouse.y = (this.mouseRaw.y - h / 2) / zoom + h / 2 - this.sy;

    // Clear & draw background
    ctx.fillStyle = '#010308';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h / 2);
    ctx.translate(this.sx, this.sy);

    // Dynamic background gradients logic based on Sector (wave) progression
    // As wave increases, themes get more intense (reds, deep purples, dark greens)
    const intensity = Math.min(1.0, this.wave / 15);
    
    // Core hue shifts from standard galaxy to intense danger colors
    const rShift = Math.floor(intensity * 100);
    const waveBg1 = this.galaxyColors.bg1 || `rgba(${139 + rShift},69,255,0.033)`;
    const waveBg2 = this.galaxyColors.bg2 || `rgba(${rShift*2},232,255,0.022)`;

    const bg1 = ctx.createRadialGradient(w*0.3, h*0.3, 0, w*0.3, h*0.3, w*0.8);
    bg1.addColorStop(0, waveBg1);
    bg1.addColorStop(1, 'transparent');
    ctx.fillStyle = bg1;
    ctx.fillRect(0,0,w,h);

    const bg2 = ctx.createRadialGradient(w*0.75, h*0.7, 0, w*0.75, h*0.7, w*0.6);
    bg2.addColorStop(0, waveBg2);
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
    this.player.update(dt, this.mouse, 5.0, this.wave, (ang, dim, isAdr) => {
        // Fire logic: affected by combo and adrenaline
        const col = isAdr ? '#ff2a00' : '#00e8ff';
        const numShots = this.combo >= 6 ? 5 : this.combo >= 3 ? 3 : 1;
        const spread = 0.15;

        if (numShots === 1) {
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang, 'p', dim, col));
        } else if (numShots === 3) {
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang, 'p', dim, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang + spread, 'p', true, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang - spread, 'p', true, col));
        } else {
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang, 'p', dim, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang + spread, 'p', true, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang - spread, 'p', true, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang + spread * 2, 'p', true, col));
          this.buls.push(new Bullet(this.player!.x, this.player!.y, ang - spread * 2, 'p', true, col));
        }
    });

    // Buls update
    this.buls = this.buls.filter(b => b.alive);
    this.buls.forEach(b => {
      b.update(w, h);
      b.draw(ctx);
    });

    // Pickups update
    const magnetBonus = (this.upgrades?.magnetRange || 0) * 35;
    const pickupCb = (type: string, px: number, py: number) => {
      if (type === 'star') { this.score += 30 * this.combo; this.flt(px, py, '⭐+30', '#ffd060'); }
      else if (type === 'hp') { this.player!.hp = Math.min(this.player!.mhp, this.player!.hp + 25); this.flt(px, py, '♥+25', '#ff3a8c'); }
      else if (type === 'ep') { this.player!.ep = Math.min(this.player!.mep, this.player!.ep + 45); this.flt(px, py, '⚡+45', '#00e8ff'); }
      else if (type === 'weapon') {
        this.player!.weaponTimer = 8000 + (this.upgrades?.overchargeDuration || 0) * 2000;
        this.flt(px, py, '🔫 OVERCHARGE', '#ff2a00');
      }
      else { this.score += 200 * this.combo; this.player!.hp = Math.min(this.player!.mhp, this.player!.hp + 40); this.flt(px, py, '💎MEGA!', '#fff'); this.shake += 5; }
      this.popFx(px, py, type);
    };
    this.picks.forEach(p => p.update(dt, this.player!.x, this.player!.y, this.player!.sz, magnetBonus, pickupCb));
    this.picks = this.picks.filter(p => p.alive);
    this.picks.forEach(p => p.draw(ctx));

    // Enemies update
    this.ents = this.ents.filter(e => e.alive);
    this.ents.forEach(e => {
      e.update(dt, this.player!.x, this.player!.y, (bx, by, bang) => {
        this.buls.push(new Bullet(bx, by, bang, 'e'));
      });
      e.draw(ctx);
      
      // Player <-> Enemy collision & Graze
      const dist = Math.hypot(e.x - this.player!.x, e.y - this.player!.y);
      if (dist < e.sz + this.player!.sz && e.phaseState !== 'ghost') {
        this.shake += this.player!.hit(0.35 * (dt/16));  // was 0.7
        // Push apart
        e.vx += (e.x - this.player!.x) * 0.1;
        e.vy += (e.y - this.player!.y) * 0.1;
      } else if (dist < e.sz + this.player!.sz + 55 && e.phaseState !== 'ghost') {
        // Graze
        this.player!.addGraze(0.6 * (dt/16));
        this.score += 2 * this.combo;
      }
    });

    // Asteroids update
    const newAsts: Asteroid[] = [];
    this.asteroids = this.asteroids.filter(a => a.alive);
    this.asteroids.forEach(a => {
      a.update(dt, w, h);
      AsteroidRenderer.draw(ctx, a);

      // Asteroid hits player
      const distToPlayer = Math.hypot(a.x - this.player!.x, a.y - this.player!.y);
      if (distToPlayer < a.sz + this.player!.sz * 0.8) {
        this.shake += this.player!.hit(a.sz * 0.5);
        this.boom(a.x, a.y, '#aaa', a.sz * 0.5);
        a.alive = false;
        newAsts.push(...a.shatter());
      } else if (distToPlayer < a.sz + this.player!.sz * 0.8 + 40) {
        this.player!.addGraze(0.3 * (dt/16));
      }

      // Asteroid hits enemies
      this.ents.forEach(e => {
        if (!e.alive || e.phaseState === 'ghost') return;
        if (Math.hypot(a.x - e.x, a.y - e.y) < a.sz + e.sz) {
          e.hp -= a.sz;
          e.fl = 100;
          this.boom(a.x, a.y, '#aaa', 5);
          a.alive = false;
          newAsts.push(...a.shatter());
          if (e.hp <= 0) this.killEnemy(e);
        }
      });
    });
    this.asteroids.push(...newAsts);

    // Bullet Collisions
    this.buls.forEach(b => {
      if (b.own === 'p') {
        // Player bullets hit enemies
        this.ents.forEach(e => {
          if (e.alive && e.phaseState !== 'ghost' && Math.hypot(b.x - e.x, b.y - e.y) < e.sz) {
            const actDmg = b.dmg * (this.player!.isAdrenalineActive ? 1.5 : 1);
            const isCrit = Math.random() < 0.15;
            const finalDmg = isCrit ? actDmg * 2 : actDmg;
            
            e.hp -= finalDmg;
            e.fl = 140;
            b.alive = false;
            this.boom(b.x, b.y, b.col, 3);
            
            this.flt(e.x + rnd(-15, 15), e.y + rnd(-15, 15), Math.floor(finalDmg).toString(), isCrit ? '#ff0055' : '#fff');
            
            if (e.hp <= 0) this.killEnemy(e);
          }
        });
        
        // Player bullets hit asteroids
        this.asteroids.forEach(a => {
          if (a.alive && Math.hypot(b.x - a.x, b.y - a.y) < a.sz) {
            a.hp -= b.dmg;
            b.alive = false;
            this.boom(b.x, b.y, '#777', 2);
            if (a.hp <= 0) {
              this.boom(a.x, a.y, '#aaa', a.sz * 0.5);
              this.score += Math.round(a.sz * this.combo);
              this.asteroids.push(...a.shatter());
            }
          }
        });
      } else if (b.own === 'e') {
        const pDist = Math.hypot(b.x - this.player!.x, b.y - this.player!.y);
        if (pDist < (this.player!.sz * 0.7)) {
          this.shake += this.player!.hit(b.dmg * 0.6);  // enemy bullets do 40% less damage
          b.alive = false;
          this.boom(b.x, b.y, b.col, 2);
        } else if (pDist < (this.player!.sz * 2.5)) {
          // Graze bullets
          this.player!.addGraze(0.8);
          this.score += 1 * this.combo;
        }

        // Enemy bullets hit asteroids
        this.asteroids.forEach(a => {
          if (a.alive && Math.hypot(b.x - a.x, b.y - a.y) < a.sz) {
            a.hp -= b.dmg;
            b.alive = false;
            this.boom(b.x, b.y, '#777', 2);
            if (a.hp <= 0) this.asteroids.push(...a.shatter());
          }
        });
      }
    });

    this.player.draw(ctx);
    this.spawnWaves(dt);
    
    // Process Enemy Spawn Queue synchronously with physics
    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const q = this.spawnQueue[i];
      q.delay -= dt;
      if (q.delay <= 0) {
        if (this.player) {
          this.ents.push(new Enemy(q.type, this.w, this.h, this.wave, q.hpMod, q.dmgSizeMod));
        }
        this.spawnQueue.splice(i, 1);
      }
    }

    // Hard-Cap arrays to prevent Memory/GC spikes on high waves
    if (this.buls.length > 400) this.buls.splice(0, this.buls.length - 400);
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
    if (this.floatTexts.length > 100) this.floatTexts.splice(0, this.floatTexts.length - 100);
    
    if (this.cTimer > 0) {
      this.cTimer -= dt;
      if (this.cTimer <= 0) this.combo = 1;
    } else if (this.combo > 1) {
      // Gradual combo decay instead of instant reset
      this.combo = Math.max(1, this.combo - 0.001 * dt);
    }

    if (this.rapidKillTimer > 0) {
      this.rapidKillTimer -= dt;
      if (this.rapidKillTimer <= 0) this.rapidKills = 0;
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
      
      const isCrit = f.col === '#ff0055';
      ctx.font = isCrit ? '800 20px "Oxanium"' : 'bold 14px "Oxanium"';
      if (isCrit) {
         ctx.shadowBlur = 10;
         ctx.shadowColor = '#ff0055';
      }
      
      ctx.fillText(f.text, f.x - 20, f.y - dy);
      ctx.shadowBlur = 0;
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

    // ── Level-based HUD colour theme ──
    // Sector 1-3: Cyan  |  4-6: Orange  |  7-10: Red  |  11+: Void Pink
    const getTheme = () => {
      if (this.wave <= 3)  return { primary: '#00e8ff', secondary: '#8b45ff', glow: 'rgba(0,232,255,0.55)', name: 'SECTOR' };
      if (this.wave <= 6)  return { primary: '#ff8c00', secondary: '#ffd060', glow: 'rgba(255,140,0,0.55)',  name: 'DANGER ZONE' };
      if (this.wave <= 10) return { primary: '#ef4444', secondary: '#ff6b35', glow: 'rgba(239,68,68,0.55)',  name: 'RED ZONE' };
      return               { primary: '#ff067f', secondary: '#d873ff', glow: 'rgba(255,6,127,0.6)',          name: 'VOID' };
    };
    const theme = getTheme();

    // ── Boss HP Bar (Top Center) ──
    const boss = this.ents.find(e => e.type === 'BOSS');
    if (boss && boss.alive) {
      cx.save();
      const bw = Math.min(400, this.w * 0.6);
      const bx = this.w / 2 - bw / 2;
      const by = 24;
      
      cx.fillStyle = 'rgba(0,0,0,0.7)';
      cx.fillRect(bx - 4, by - 4, bw + 8, 26);
      
      const pct = Math.max(0, boss.hp / boss.mhp);
      const bg = cx.createLinearGradient(bx, by, bx + bw, by);
      bg.addColorStop(0, '#ff0055');
      bg.addColorStop(1, '#ffaa00');
      
      cx.fillStyle = bg;
      cx.fillRect(bx, by, bw * pct, 18);
      
      // Boss segment markers
      cx.fillStyle = 'rgba(0,0,0,0.5)';
      cx.fillRect(bx + bw * 0.35, by, 3, 18);
      cx.fillRect(bx + bw * 0.7, by, 3, 18);

      cx.fillStyle = '#fff';
      cx.font = 'bold 12px "Oxanium"';
      cx.textAlign = 'center';
      cx.shadowBlur = 4;
      cx.shadowColor = '#000';
      cx.fillText(`ANOMALY CLASS: OMEGA - PHASE ${boss.bossPhase}`, this.w / 2, by + 13);
      cx.restore();
    }

    // ── HP / EP / Shield bars (Top Left) ──
    const drawBar = (x: number, y: number, icon: string, val: number, max: number, barColor: string, barEnd: string, labelColor: string) => {
      // Background panel
      cx.fillStyle = 'rgba(0,0,0,0.55)';
      cx.fillRect(x - 4, y - 14, 200, 22);

      cx.fillStyle = 'rgba(255,255,255,0.75)';
      cx.font = '13px Arial';
      cx.fillText(icon, x, y + 4);

      const bw = 145;
      cx.fillStyle = 'rgba(255,255,255,0.07)';
      cx.fillRect(x + 22, y, bw, 4);

      const pct = Math.max(0, Math.min(1, val / max));
      const fw = bw * pct;
      if (fw > 0) {
        const grd = cx.createLinearGradient(x + 22, y, x + 22 + fw, y);
        grd.addColorStop(0, barColor);
        grd.addColorStop(1, barEnd);
        cx.fillStyle = grd;
        cx.fillRect(x + 22, y, fw, 4);
        cx.fillStyle = 'rgba(255,255,255,0.9)';
        cx.fillRect(x + 22 + fw - 3, y - 2, 3, 8);
      }

      cx.fillStyle = 'rgba(255,255,255,0.85)';
      cx.font = 'bold 12px "Oxanium"';
      cx.fillText(Math.ceil(val).toString(), x + 173, y + 5);
    };

    drawBar(22, 24, '♥', this.player.hp, this.player.mhp, '#ff3a8c', '#ff6b35', '#ff3a8c');
    drawBar(22, 42, '⚡', this.player.ep, this.player.mep, '#00e8ff', '#8b45ff', '#00e8ff');
    drawBar(22, 60, '◈', this.player.sh, this.player.msh, '#00ffaa', '#00e8ff', '#00ffaa');

    // ── Score (Top Right) with theme colour glow ──
    cx.textAlign = 'right';
    cx.font = '800 48px "Oxanium"';
    cx.fillStyle = '#fff';
    cx.shadowBlur = 35;
    cx.shadowColor = theme.glow;
    cx.fillText(Math.floor(this.score).toLocaleString(), this.w - 22, 52);
    cx.shadowBlur = 0;

    cx.font = 'bold 10px "Rajdhani"';
    cx.fillStyle = `${theme.primary}99`;
    cx.letterSpacing = '5px';
    cx.fillText('STELLAR POINTS', this.w - 22, 67);
    cx.letterSpacing = '0px';

    // Combo
    if (this.combo > 1.1 && this.cTimer > 0) {
      cx.font = '800 22px "Oxanium"';
      const cCol = this.combo >= 7 ? '#ffd060' : this.combo >= 4 ? '#ff5c1a' : '#ff3a8c';
      cx.fillStyle = cCol;
      cx.shadowBlur = 20;
      cx.shadowColor = cCol;
      cx.fillText('×' + this.combo.toFixed(1) + ' COMBO', this.w - 22, 95);
      cx.shadowBlur = 0;

      const cbw = 130;
      const cpct = this.cTimer / 5500;
      cx.fillStyle = 'rgba(255,255,255,0.07)';
      cx.fillRect(this.w - 22 - cbw, 103, cbw, 3);
      cx.fillStyle = cCol;
      cx.fillRect(this.w - 22 - cbw, 103, cbw * cpct, 3);
    }
    cx.textAlign = 'left';

    // ── Sector label (Bottom Right) with theme colour ──
    cx.textAlign = 'right';
    // Background slab
    cx.fillStyle = 'rgba(0,0,0,0.55)';
    cx.fillRect(this.w - 130, this.h - 68, 115, 52);

    cx.font = 'bold 9px "Rajdhani"';
    cx.fillStyle = `${theme.primary}99`;
    cx.letterSpacing = '4px';
    cx.fillText(theme.name, this.w - 22, this.h - 46);
    cx.letterSpacing = '0px';

    cx.font = '800 28px "Oxanium"';
    cx.fillStyle = theme.primary;
    cx.shadowBlur = 14;
    cx.shadowColor = theme.glow;
    cx.letterSpacing = '3px';
    cx.fillText(this.wave.toString().padStart(3, '0'), this.w - 22, this.h - 20);
    cx.shadowBlur = 0;
    cx.letterSpacing = '0px';
    cx.textAlign = 'left';

    // ── Abilities Cooldown UI (Bottom Centre) ──
    const drawAbility = (x: number, y: number, key: string, icon: string, a: any) => {
      const sz = 56;
      const isRdy = a.cd <= 0;

      cx.fillStyle = isRdy ? `${theme.primary}18` : 'rgba(0,0,0,0.5)';
      cx.strokeStyle = isRdy ? `${theme.primary}88` : 'rgba(255,255,255,0.12)';
      cx.lineWidth = isRdy ? 1.5 : 1;

      cx.beginPath();
      cx.roundRect(x, y, sz, sz, 8);
      if (isRdy) {
        cx.shadowBlur = 16;
        cx.shadowColor = `${theme.primary}55`;
      }
      cx.fill();
      cx.stroke();
      cx.shadowBlur = 0;

      if (!isRdy) {
        const pct = a.cd / a.max;
        cx.fillStyle = 'rgba(0,0,0,0.7)';
        cx.beginPath();
        cx.roundRect(x, y + sz * (1 - pct), sz, sz * pct, [0, 0, 8, 8]);
        cx.fill();
      }

      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.font = '22px Arial';
      cx.globalAlpha = isRdy ? 1.0 : 0.45;
      cx.fillText(icon, x + sz / 2, y + sz / 2 - 4);
      cx.globalAlpha = 1;

      cx.font = `bold 10px "Oxanium"`;
      cx.fillStyle = isRdy ? theme.primary : 'rgba(255,255,255,0.3)';
      cx.letterSpacing = '1px';
      cx.fillText(key.toUpperCase(), x + sz / 2, y + sz - 9);
      cx.letterSpacing = '0px';
      cx.textAlign = 'left';
      cx.textBaseline = 'alphabetic';
    };

    const cxC = this.w / 2;
    drawAbility(cxC - 90, this.h - 82, 'q', '💥', this.ab.q);
    drawAbility(cxC - 30, this.h - 82, 'w', '🛡', this.ab.w);
    drawAbility(cxC + 30, this.h - 82, 'r', '🌀', this.ab.r);

    // Theme zone notification flash (on theme change boundary)
    if (this.wave === 4 || this.wave === 7 || this.wave === 11) {
      const age = (this.gTime % 3000) / 3000;
      if (age < 0.5) {
        cx.save();
        cx.globalAlpha = (0.5 - age) * 0.4;
        cx.fillStyle = theme.primary;
        cx.fillRect(0, 0, this.w, this.h);
        cx.restore();
      }
    }

    // Adrenaline Bar Overlay (Screen edges glow)
    if (this.player.adrenaline > 0) {
      cx.save();
      const aPct = this.player.adrenaline / 100;
      const gAlpha = this.player.isAdrenalineActive ? 0.3 + Math.sin(Date.now() * 0.01) * 0.1 : aPct * 0.15;
      
      const vGrad = cx.createLinearGradient(0, 0, 0, this.h);
      vGrad.addColorStop(0, `rgba(255, 60, 0, ${gAlpha})`);
      vGrad.addColorStop(0.1, 'transparent');
      vGrad.addColorStop(0.9, 'transparent');
      vGrad.addColorStop(1, `rgba(255, 60, 0, ${gAlpha})`);
      cx.fillStyle = vGrad;
      cx.fillRect(0, 0, this.w, this.h);
      
      const hGrad = cx.createLinearGradient(0, 0, this.w, 0);
      hGrad.addColorStop(0, `rgba(255, 60, 0, ${gAlpha})`);
      hGrad.addColorStop(0.05, 'transparent');
      hGrad.addColorStop(0.95, 'transparent');
      hGrad.addColorStop(1, `rgba(255, 60, 0, ${gAlpha})`);
      cx.fillStyle = hGrad;
      cx.fillRect(0, 0, this.w, this.h);

      // Adrenaline Gauge text
      cx.font = 'bold 12px "Oxanium"';
      cx.fillStyle = this.player.isAdrenalineActive ? '#ff2a00' : '#ffaa00';
      cx.textAlign = 'center';
      cx.fillText(`ADRENALINE: ${Math.floor(this.player.adrenaline)}%`, this.w / 2, 85);
      
      if (this.player.isAdrenalineActive) {
        cx.font = '800 16px "Oxanium"';
        cx.fillText(`🔥 MAXIMUM OVERDRIVE 🔥`, this.w / 2, 105);
      }
      
      cx.restore();
    }
  }

  private triggerGameOver() {
    this.stop();
    const store = useGameStore.getState();
    const playTime = Math.floor(this.gTime / 1000);
    
    store.updateStats(this.kills, Math.floor(this.score), playTime);
    store.addCredits(Math.floor(this.score / 10)); // Convert points to credits
    
    this.onGameOver({
      score: this.score,
      kills: this.kills,
      time: playTime
    });
  }
}


