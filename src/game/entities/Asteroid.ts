import { rnd } from '../utils';

export class Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sz: number;
  hp: number;
  mhp: number;
  rot: number = 0;
  vRot: number;
  alive: boolean = true;
  points: number[] = [];

  constructor(x: number, y: number, sz: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.sz = sz;
    this.vx = vx;
    this.vy = vy;
    this.mhp = sz * 2.5; // Bigger asteroid = more hp
    this.hp = this.mhp;
    this.vRot = rnd(-0.02, 0.02);

    // Generate irregular polygon shape for renderer
    const numPoints = Math.floor(rnd(6, 10));
    for (let i = 0; i < numPoints; i++) {
      this.points.push(rnd(0.7, 1.2)); // Variance in radius per point
    }
  }

  update(dt: number, w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.vRot;

    // Destroy if it drifts far off screen
    if (this.x < -100 || this.x > w + 100 || this.y < -100 || this.y > h + 100) {
      this.alive = false;
    }
  }

  shatter(): Asteroid[] {
    this.alive = false;
    if (this.sz < 15) return []; // Too small to shatter further

    const chunks: Asteroid[] = [];
    const numChunks = Math.floor(rnd(2, 4));
    for (let i = 0; i < numChunks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rnd(0.5, 2.0);
      chunks.push(new Asteroid(
        this.x + Math.cos(angle) * this.sz * 0.5,
        this.y + Math.sin(angle) * this.sz * 0.5,
        this.sz * rnd(0.4, 0.6), // smaller chunks
        this.vx + Math.cos(angle) * speed,
        this.vy + Math.sin(angle) * speed
      ));
    }
    return chunks;
  }
}
