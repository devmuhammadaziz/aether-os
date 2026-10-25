import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";

const PORT = Number(process.env.PORT ?? 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type MeshPart = {
  type: "box" | "sphere" | "cylinder" | "torus" | "cone" | "octahedron";
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: string;
};

type ShapePreset =
  | "us-map"
  | "earth"
  | "egg"
  | "drone"
  | "rocket"
  | "satellite"
  | "crystal"
  | "ringworld"
  | "generic";

type SpawnResult = {
  name: string;
  scale: number;
  color: string;
  preset: ShapePreset;
  parts: MeshPart[];
  source: "openai" | "mock" | "preset";
};

function resolvePreset(prompt: string): ShapePreset {
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

function presetSpawn(prompt: string): SpawnResult {
  const preset = resolvePreset(prompt);
  const cyan = "#00f3ff";
  const orange = "#ff4d00";

  const table: Record<ShapePreset, SpawnResult> = {
    "us-map": {
      name: "United States Map",
      scale: 1.35,
      color: cyan,
      preset,
      parts: [],
      source: "preset",
    },
    earth: {
      name: "Earth Globe",
      scale: 1.25,
      color: cyan,
      preset,
      parts: [],
      source: "preset",
    },
    egg: {
      name: "Holo Egg",
      scale: 1.15,
      color: cyan,
      preset,
      parts: [],
      source: "preset",
    },
    drone: {
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
    },
    rocket: {
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
      ],
    },
    satellite: {
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
    },
    crystal: {
      name: "Energy Crystal",
      scale: 1.1,
      color: cyan,
      preset,
      source: "preset",
      parts: [
        { type: "octahedron", position: [0, 0, 0], scale: [0.7, 1.1, 0.7], color: cyan },
        { type: "octahedron", position: [0, 0, 0], scale: [0.45, 0.7, 0.45], color: orange },
      ],
    },
    ringworld: {
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
    },
    generic: {
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
    },
  };

  return table[preset];
}

async function openaiSpawn(prompt: string): Promise<SpawnResult | null> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("your_openai")) return null;

  const system = `You pick the best hologram preset for a spatial UI.
Return ONLY JSON:
{"preset":"us-map"|"earth"|"egg"|"drone"|"rocket"|"satellite"|"crystal"|"ringworld"|"generic","name":string,"scale":number,"color":"#00f3ff"|"#ff4d00"}
Rules:
- "map of the US" / America outline → us-map
- earth/globe/planet → earth
- egg → egg
- Prefer named presets over generic. No markdown.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      preset?: ShapePreset;
      name?: string;
      scale?: number;
      color?: string;
    };
    const base = presetSpawn(parsed.preset ?? prompt);
    return {
      ...base,
      name: parsed.name || base.name,
      scale: parsed.scale || base.scale,
      color: parsed.color || base.color,
      source: "openai",
    };
  } catch {
    return null;
  }
}

const app = new Elysia()
  .use(
    cors({
      origin: CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
    })
  )
  .get("/health", () => ({
    ok: true,
    service: "aether-os",
    openai: Boolean(OPENAI_API_KEY && !OPENAI_API_KEY.includes("your_openai")),
  }))
  .post(
    "/api/spawn",
    async ({ body }) => {
      const prompt = body.prompt?.trim() || "holographic cube";
      // Keyword presets always win for known shapes (US map, earth, etc.)
      const preset = resolvePreset(prompt);
      if (preset !== "generic") {
        return presetSpawn(prompt);
      }
      const ai = await openaiSpawn(prompt);
      return ai ?? presetSpawn(prompt);
    },
    {
      body: t.Object({
        prompt: t.String({ minLength: 1, maxLength: 200 }),
      }),
    }
  )
  .listen(PORT);

console.log(`AETHER OS API → http://localhost:${app.server?.port}`);
