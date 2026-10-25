import { distance3, mid3 } from "./coords";
import type { HandFrame, Landmark, Vec3 } from "./types";

const TIP = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
const PIP = { index: 6, middle: 10, ring: 14, pinky: 18 };
const MCP = { index: 5, middle: 9, ring: 13, pinky: 17 };

function tipFolded(world: Vec3[], tip: number, pip: number, wrist: Vec3): boolean {
  return distance3(world[tip], wrist) < distance3(world[pip], wrist) * 1.05;
}

export function analyzeHand(
  side: "Left" | "Right",
  landmarks: Landmark[],
  world: Vec3[],
  prevPalm: Vec3 | null,
  dt: number
): HandFrame {
  const wrist = world[0];
  const palm = mid3(wrist, world[MCP.middle]);
  const pinchDist = distance3(world[TIP.thumb], world[TIP.index]);
  const pinchStrength = Math.max(0, 1 - pinchDist / 0.18);
  const pinch = pinchDist < 0.09;

  const folded =
    tipFolded(world, TIP.index, PIP.index, wrist) &&
    tipFolded(world, TIP.middle, PIP.middle, wrist) &&
    tipFolded(world, TIP.ring, PIP.ring, wrist) &&
    tipFolded(world, TIP.pinky, PIP.pinky, wrist);

  const openPalm =
    !pinch &&
    distance3(world[TIP.index], wrist) > distance3(world[PIP.index], wrist) &&
    distance3(world[TIP.middle], wrist) > distance3(world[PIP.middle], wrist) &&
    distance3(world[TIP.ring], wrist) > distance3(world[PIP.ring], wrist);

  const velocity: Vec3 = prevPalm
    ? [
        (palm[0] - prevPalm[0]) / Math.max(dt, 1e-3),
        (palm[1] - prevPalm[1]) / Math.max(dt, 1e-3),
        (palm[2] - prevPalm[2]) / Math.max(dt, 1e-3),
      ]
    : [0, 0, 0];

  return {
    side,
    landmarks,
    world,
    palm,
    velocity,
    pinch,
    fist: folded && !pinch,
    openPalm,
    pinchStrength,
  };
}

export function detectClap(hands: HandFrame[]): boolean {
  if (hands.length < 2) return false;
  const [a, b] = hands;
  const dist = distance3(a.palm, b.palm);
  const approaching =
    Math.hypot(a.velocity[0], a.velocity[1]) +
      Math.hypot(b.velocity[0], b.velocity[1]) >
    1.2;
  return dist < 0.22 && approaching && a.openPalm && b.openPalm;
}

export function twoFistSpread(hands: HandFrame[]): number | null {
  const fists = hands.filter((h) => h.fist);
  if (fists.length < 2) return null;
  return Math.abs(fists[0].palm[0] - fists[1].palm[0]);
}

export function palmNormal(hand: HandFrame): Vec3 {
  const w = hand.world;
  const a = w[0];
  const b = w[5];
  const c = w[17];
  const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: Vec3 = [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];
