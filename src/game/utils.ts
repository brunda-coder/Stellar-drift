export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const hypot = (a: {x: number, y: number}, b: {x: number, y: number}) => Math.hypot(a.x - b.x, a.y - b.y);

export function drawArc(cx: CanvasRenderingContext2D, x: number, y: number, r: number, a1: number, a2: number, ccw = false) {
  cx.arc(x, y, Math.max(0.001, r), a1, a2, ccw);
}
