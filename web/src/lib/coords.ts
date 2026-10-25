import type { Landmark, Vec3 } from "./types";

/** Map mirrored MediaPipe image landmarks into R3F world space. */
export function landmarkToWorld(lm: Landmark, depthScale = 4): Vec3 {
  const x = (0.5 - lm.x) * 4.2;
  const y = (0.5 - lm.y) * 3.0;
  const z = -lm.z * depthScale;
  return [x, y, z];
}

export function landmarksToWorld(landmarks: Landmark[], depthScale = 4): Vec3[] {
  return landmarks.map((lm) => landmarkToWorld(lm, depthScale));
}

export function distance3(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.hypot(dx, dy, dz);
}

export function mid3(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function add3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function scale3(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function length3(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function normalize3(a: Vec3): Vec3 {
  const len = length3(a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}
