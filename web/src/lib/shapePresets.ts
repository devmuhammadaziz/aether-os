import type { MeshPartSpec, ShapePresetId, SpawnSpec } from "./types";

export type SpawnPayload = {
  name: string;
  scale: number;
  color: string;
  preset: ShapePresetId;
  parts: MeshPartSpec[];
  source: "openai" | "mock" | "preset";
};

/** Simplified contiguous USA outline (normalized ~960x600). */
export const US_MAP_PATH =
  "M 140 200 L 190 130 L 270 100 L 360 95 L 430 105 L 500 90 L 560 100 L 620 115 L 670 105 L 720 125 L 760 150 L 800 175 L 835 220 L 860 270 L 870 320 L 855 365 L 815 400 L 770 420 L 725 440 L 680 450 L 630 470 L 575 485 L 520 475 L 470 460 L 420 450 L 370 460 L 320 470 L 275 455 L 235 425 L 205 385 L 180 340 L 160 290 L 145 245 Z";

export function resolvePresetFromPrompt(prompt: string): ShapePresetId {
  const p = prompt.toLowerCase();
  if (
    (/\b(us|u\.s\.|usa|united states|america)\b/.test(p) &&
      /\b(map|outline|country|continent|states)\b/.test(p)) ||
    (/\bmap\b/.test(p) && /\b(us|usa|america)\b/.test(p))
  ) {
    return "us-map";
  }
  if (/\begg\b/.test(p)) return "egg";
  if (/\bearth\b|\bglobe\b|\bplanet\b/.test(p)) return "earth";
  if (/\bdrone\b|\bquadcopter\b/.test(p)) return "drone";
  if (/\brocket\b|\bmissile\b|\bspaceship\b|\bship\b|\bcraft\b/.test(p))
    return "rocket";
  if (/\bsatellite\b|\bprobe\b/.test(p)) return "satellite";
  if (/\bcrystal\b|\bgem\b|\bdiamond\b/.test(p)) return "crystal";
  if (/\bring\b|\bhalo\b|\bringworld\b/.test(p)) return "ringworld";
  return "generic";
}

export function buildPresetPayload(prompt: string): SpawnPayload {
  const preset = resolvePresetFromPrompt(prompt);
  const cyan = "#00f3ff";
  const orange = "#ff4d00";

  switch (preset) {
    case "us-map":
      return {
        name: "United States Map",
        scale: 1.35,
        color: cyan,
        preset,
        source: "preset",
        parts: [],
      };
    case "earth":
      return {
        name: "Earth Globe",
        scale: 1.25,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          { type: "sphere", position: [0, 0, 0], scale: [1.5, 1.5, 1.5], color: cyan },
          {
            type: "torus",
            position: [0, 0, 0],
            scale: [1.15, 1.15, 1.15],
            rotation: [Math.PI / 2.3, 0.25, 0],
            color: orange,
          },
        ],
      };
    case "egg":
      return {
        name: "Holo Egg",
        scale: 1.15,
        color: cyan,
        preset,
        source: "preset",
        parts: [],
      };
    case "drone":
      return {
        name: "Combat Drone",
        scale: 1,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          { type: "box", position: [0, 0, 0], scale: [1.4, 0.22, 0.9], color: cyan },
          { type: "sphere", position: [0, 0.18, 0.15], scale: [0.28, 0.28, 0.28], color: orange },
          { type: "cylinder", position: [-0.85, 0.12, 0.45], scale: [0.42, 0.06, 0.42], color: cyan },
          { type: "cylinder", position: [0.85, 0.12, 0.45], scale: [0.42, 0.06, 0.42], color: cyan },
          { type: "cylinder", position: [-0.85, 0.12, -0.45], scale: [0.42, 0.06, 0.42], color: cyan },
          { type: "cylinder", position: [0.85, 0.12, -0.45], scale: [0.42, 0.06, 0.42], color: cyan },
          { type: "box", position: [0, -0.2, -0.2], scale: [0.35, 0.35, 0.5], color: orange },
        ],
      };
    case "rocket":
      return {
        name: "Orbital Rocket",
        scale: 1.15,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          { type: "cone", position: [0, 1.1, 0], scale: [0.35, 0.7, 0.35], color: orange },
          { type: "cylinder", position: [0, 0.2, 0], scale: [0.35, 1.4, 0.35], color: cyan },
          { type: "box", position: [-0.45, -0.3, 0], scale: [0.15, 0.7, 0.4], color: orange },
          { type: "box", position: [0.45, -0.3, 0], scale: [0.15, 0.7, 0.4], color: orange },
          { type: "box", position: [0, -0.3, -0.45], scale: [0.4, 0.7, 0.15], color: orange },
          { type: "cylinder", position: [0, -0.7, 0], scale: [0.28, 0.25, 0.28], color: "#ff8844" },
        ],
      };
    case "satellite":
      return {
        name: "Deep Space Satellite",
        scale: 1,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          { type: "box", position: [0, 0, 0], scale: [0.55, 0.55, 0.55], color: cyan },
          { type: "box", position: [-1.1, 0, 0], scale: [1.2, 0.06, 0.55], color: orange },
          { type: "box", position: [1.1, 0, 0], scale: [1.2, 0.06, 0.55], color: orange },
          { type: "cylinder", position: [0, 0.55, 0], scale: [0.12, 0.5, 0.12], color: cyan },
          { type: "sphere", position: [0, 0.9, 0], scale: [0.2, 0.2, 0.2], color: orange },
        ],
      };
    case "crystal":
      return {
        name: "Energy Crystal",
        scale: 1.1,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          { type: "octahedron", position: [0, 0, 0], scale: [0.7, 1.1, 0.7], color: cyan },
          { type: "octahedron", position: [0, 0, 0], scale: [0.45, 0.7, 0.45], color: orange },
        ],
      };
    case "ringworld":
      return {
        name: "Ringworld Halo",
        scale: 1.2,
        color: cyan,
        preset,
        source: "preset",
        parts: [
          {
            type: "torus",
            position: [0, 0, 0],
            scale: [1.4, 1.4, 1.4],
            rotation: [Math.PI / 2, 0, 0],
            color: cyan,
          },
          {
            type: "torus",
            position: [0, 0, 0],
            scale: [1.0, 1.0, 1.0],
            rotation: [Math.PI / 2.5, 0.3, 0],
            color: orange,
          },
          { type: "sphere", position: [0, 0, 0], scale: [0.45, 0.45, 0.45], color: cyan },
        ],
      };
    default:
      return {
        name: prompt.slice(0, 40) || "Holo Construct",
        scale: 1,
        color: cyan,
        preset: "generic",
        source: "preset",
        parts: [
          { type: "box", position: [0, 0, 0], scale: [1.6, 0.12, 1.0], color: cyan },
          { type: "box", position: [0, 0.55, 0], scale: [0.95, 0.95, 0.95], color: orange },
          {
            type: "torus",
            position: [0, 0.55, 0],
            scale: [0.9, 0.9, 0.9],
            rotation: [Math.PI / 2, 0, 0],
            color: cyan,
          },
          { type: "cylinder", position: [0, -0.45, 0], scale: [0.16, 0.75, 0.16], color: cyan },
        ],
      };
  }
}

export function toSpawnSpec(payload: SpawnPayload, id?: string): SpawnSpec {
  return {
    id: id ?? `obj-${Date.now()}`,
    name: payload.name,
    scale: payload.scale,
    color: payload.color,
    preset: payload.preset,
    parts: payload.parts,
    source: payload.source,
    position: [0, 0.25, 0],
    rotation: [0, 0, 0],
    exploded: false,
    explodeAmount: 0,
    docked: false,
    velocity: [0, 0, 0],
    grabbed: false,
  };
}
