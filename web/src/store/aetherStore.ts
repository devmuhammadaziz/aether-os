import { create } from "zustand";
import type {
  DockItem,
  HandFrame,
  IntentState,
  SculptStroke,
  SpawnSpec,
  Vec3,
} from "@/lib/types";

type AetherState = {
  ready: boolean;
  cameraError: string | null;
  fps: number;
  hands: HandFrame[];
  intent: IntentState;
  clapPulse: number;
  fistSpread: number | null;
  objects: SpawnSpec[];
  selectedId: string | null;
  dock: DockItem[];
  sculptActive: boolean;
  activeStroke: Vec3[];
  strokes: SculptStroke[];
  clippingEnabled: boolean;
  clipPoint: Vec3;
  clipNormal: Vec3;
  setTracker: (
    partial: Partial<
      Pick<
        AetherState,
        | "ready"
        | "cameraError"
        | "fps"
        | "hands"
        | "intent"
        | "clapPulse"
        | "fistSpread"
        | "clippingEnabled"
        | "clipPoint"
        | "clipNormal"
      >
    >
  ) => void;
  addObject: (obj: SpawnSpec) => void;
  updateObject: (id: string, patch: Partial<SpawnSpec>) => void;
  removeObject: (id: string) => void;
  setSelected: (id: string | null) => void;
  dockObject: (id: string) => void;
  undock: (id: string) => void;
  setSculptPoint: (p: Vec3 | null, pinching: boolean) => void;
  clearStrokes: () => void;
  deleteSelected: () => void;
  clearAll: () => void;
};

export const useAetherStore = create<AetherState>((set, get) => ({
  ready: false,
  cameraError: null,
  fps: 0,
  hands: [],
  intent: "resting",
  clapPulse: 0,
  fistSpread: null,
  objects: [],
  selectedId: null,
  dock: [],
  sculptActive: false,
  activeStroke: [],
  strokes: [],
  clippingEnabled: false,
  clipPoint: [0, 0, 0],
  clipNormal: [1, 0, 0],

  setTracker: (partial) => set(partial),

  addObject: (obj) =>
    set((s) => ({
      objects: [...s.objects, obj],
      selectedId: obj.id,
    })),

  updateObject: (id, patch) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  removeObject: (id) =>
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  setSelected: (id) => set({ selectedId: id }),

  dockObject: (id) => {
    const obj = get().objects.find((o) => o.id === id);
    if (!obj) return;
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      dock: [...s.dock, { id: obj.id, name: obj.name, color: obj.color }],
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  undock: (id) => {
    const item = get().dock.find((d) => d.id === id);
    if (!item) return;
    set((s) => ({
      dock: s.dock.filter((d) => d.id !== id),
    }));
  },

  setSculptPoint: (p, pinching) => {
    if (!pinching || !p) {
      const stroke = get().activeStroke;
      if (stroke.length > 2) {
        set((s) => ({
          sculptActive: false,
          activeStroke: [],
          strokes: [
            ...s.strokes,
            {
              id: `stroke-${Date.now()}`,
              points: stroke,
              color: "#00f3ff",
            },
          ],
        }));
      } else {
        set({ sculptActive: false, activeStroke: [] });
      }
      return;
    }

    set((s) => {
      const last = s.activeStroke[s.activeStroke.length - 1];
      if (
        last &&
        Math.hypot(last[0] - p[0], last[1] - p[1], last[2] - p[2]) < 0.04
      ) {
        return { sculptActive: true };
      }
      return {
        sculptActive: true,
        activeStroke: [...s.activeStroke, p],
      };
    });
  },

  clearStrokes: () => set({ strokes: [], activeStroke: [], sculptActive: false }),

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      dock: s.dock.filter((d) => d.id !== id),
      selectedId: null,
    }));
  },

  clearAll: () =>
    set({
      objects: [],
      dock: [],
      selectedId: null,
      strokes: [],
      activeStroke: [],
      sculptActive: false,
    }),
}));
