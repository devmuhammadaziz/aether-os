export type Vec3 = [number, number, number];

export type Landmark = {
  x: number;
  y: number;
  z: number;
};

export type HandSide = "Left" | "Right";

export type HandFrame = {
  side: HandSide;
  landmarks: Landmark[];
  world: Vec3[];
  palm: Vec3;
  velocity: Vec3;
  pinch: boolean;
  fist: boolean;
  openPalm: boolean;
  pinchStrength: number;
};

export type IntentState = "resting" | "interacting";

export type MeshPartType =
  | "box"
  | "sphere"
  | "cylinder"
  | "torus"
  | "cone"
  | "octahedron";

export type MeshPartSpec = {
  type: MeshPartType;
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color: string;
};

export type ShapePresetId =
  | "us-map"
  | "earth"
  | "egg"
  | "drone"
  | "rocket"
  | "satellite"
  | "crystal"
  | "ringworld"
  | "generic";

export type SpawnSpec = {
  id: string;
  name: string;
  scale: number;
  color: string;
  preset: ShapePresetId;
  parts: MeshPartSpec[];
  source: "openai" | "mock" | "preset";
  position: Vec3;
  rotation: Vec3;
  exploded: boolean;
  explodeAmount: number;
  docked: boolean;
  velocity: Vec3;
  grabbed: boolean;
};

export type SculptStroke = {
  id: string;
  points: Vec3[];
  color: string;
};

export type DockItem = {
  id: string;
  name: string;
  color: string;
};
