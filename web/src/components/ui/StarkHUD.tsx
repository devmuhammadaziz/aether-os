"use client";

import { useState, type FormEvent } from "react";
import { useHandTracker } from "@/context/HandTrackerProvider";
import { useAetherStore } from "@/store/aetherStore";
import type { ShapePresetId, SpawnSpec } from "@/lib/types";

export function StarkHUD() {
  const { start, running, starting } = useHandTracker();
  const [prompt, setPrompt] = useState("map of the US");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("STANDBY");

  const fps = useAetherStore((s) => s.fps);
  const intent = useAetherStore((s) => s.intent);
  const hands = useAetherStore((s) => s.hands);
  const cameraError = useAetherStore((s) => s.cameraError);
  const dock = useAetherStore((s) => s.dock);
  const objects = useAetherStore((s) => s.objects);
  const addObject = useAetherStore((s) => s.addObject);
  const clearStrokes = useAetherStore((s) => s.clearStrokes);
  const deleteSelected = useAetherStore((s) => s.deleteSelected);
  const clearAll = useAetherStore((s) => s.clearAll);
  const selectedId = useAetherStore((s) => s.selectedId);
  const updateObject = useAetherStore((s) => s.updateObject);
  const setSelected = useAetherStore((s) => s.setSelected);

  async function onSpawn(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setStatus("SYNTHESIZING…");
    try {
      const res = await fetch("/api/spawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Spawn failed");
      const data = await res.json();
      const spec: SpawnSpec = {
        id: `obj-${Date.now()}`,
        name: data.name,
        scale: data.scale ?? 1,
        color: data.color ?? "#00f3ff",
        preset: (data.preset as ShapePresetId) ?? "generic",
        parts: data.parts ?? [],
        source: data.source,
        position: [0, 0.25, 0],
        rotation: [0, 0, 0],
        exploded: false,
        explodeAmount: 0,
        docked: false,
        velocity: [0, 0, 0],
        grabbed: false,
      };
      addObject(spec);
      setStatus(`SPAWNED · ${String(data.preset || data.source).toUpperCase()}`);
    } catch {
      setStatus("SPAWN ERROR");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-6">
      <header className="pointer-events-auto flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.35em] text-cyan-400/70">
            AETHER OS // SPATIAL KERNEL
          </p>
          <h1 className="mt-1 bg-gradient-to-r from-cyan-300 to-orange-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            AETHER
          </h1>
          <p className="mt-1 max-w-sm font-mono text-xs text-slate-400">
            Hand-tracked holographic workspace
          </p>
        </div>

        <div className="glass-panel flex gap-4 px-4 py-3 font-mono text-[11px] text-cyan-200/90">
          <div>
            <div className="text-cyan-500/60">FPS</div>
            <div className="text-sm text-cyan-300">{fps || "--"}</div>
          </div>
          <div>
            <div className="text-cyan-500/60">INTENT</div>
            <div
              className={`text-sm ${
                intent === "interacting" ? "text-orange-400" : "text-cyan-300"
              }`}
            >
              {intent.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-cyan-500/60">HANDS</div>
            <div className="text-sm text-cyan-300">{hands.length}</div>
          </div>
          <div>
            <div className="text-cyan-500/60">OBJS</div>
            <div className="text-sm text-cyan-300">{objects.length}</div>
          </div>
          <div>
            <div className="text-cyan-500/60">SYS</div>
            <div className="text-sm text-cyan-300">{status}</div>
          </div>
        </div>
      </header>

      <aside className="pointer-events-none absolute left-4 top-1/3 hidden max-w-[200px] font-mono text-[10px] leading-relaxed text-cyan-500/50 md:block">
        <p>TRACK: MEDIAPIPE @1.1.1</p>
        <p>FILTER: 1-EURO</p>
        <p>VIEW: SELFIE MIRROR</p>
        <p>PINCH NEAR OBJ → GRAB</p>
        <p>PINCH EMPTY → SCULPT</p>
        <p>DUAL FIST → DECON</p>
        <p>CLAP → REASSEMBLE</p>
        <p>FLICK → DOCK</p>
        <p className="mt-2 text-cyan-400/70">TRY: map of the US</p>
        <p className="text-cyan-400/70">TRY: earth / egg / drone</p>
      </aside>

      {/* Object list + selection */}
      {objects.length > 0 && (
        <div className="pointer-events-auto absolute right-4 top-28 flex max-h-64 w-44 flex-col gap-1 overflow-auto">
          <p className="font-mono text-[10px] tracking-widest text-cyan-400/80">
            SCENE OBJECTS
          </p>
          {objects.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={`glass-panel truncate px-3 py-2 text-left font-mono text-[11px] ${
                selectedId === o.id
                  ? "border-orange-400/70 text-orange-200"
                  : "text-cyan-100"
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}

      {dock.length > 0 && (
        <div className="pointer-events-auto absolute right-4 top-[60%] flex w-36 flex-col gap-2">
          <p className="font-mono text-[10px] tracking-widest text-orange-400/80">
            SPATIAL DOCK
          </p>
          {dock.map((item) => (
            <div
              key={item.id}
              className="glass-panel px-3 py-2 font-mono text-xs text-cyan-100"
              style={{ borderColor: item.color }}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      <footer className="pointer-events-auto flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="ml-0 flex flex-wrap gap-2 md:ml-64">
          {!running && (
            <button
              type="button"
              onClick={() => void start()}
              disabled={starting}
              className="rounded border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 font-mono text-xs tracking-wider text-cyan-200 transition hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {starting ? "STARTING…" : "ENABLE VISION"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (selectedId) {
                updateObject(selectedId, { exploded: true, explodeAmount: 1 });
              }
            }}
            className="rounded border border-orange-500/40 bg-orange-500/10 px-3 py-2 font-mono text-xs text-orange-200"
          >
            DECONSTRUCT
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!selectedId}
            className="rounded border border-orange-500/60 bg-orange-600/20 px-3 py-2 font-mono text-xs text-orange-100 disabled:opacity-40"
          >
            DELETE SELECTED
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded border border-red-500/50 bg-red-500/15 px-3 py-2 font-mono text-xs text-red-200"
          >
            CLEAR ALL
          </button>
          <button
            type="button"
            onClick={clearStrokes}
            className="rounded border border-slate-500/40 bg-slate-500/10 px-3 py-2 font-mono text-xs text-slate-300"
          >
            CLEAR SCULPT
          </button>
        </div>

        <form
          onSubmit={onSpawn}
          className="glass-panel flex w-full max-w-xl items-center gap-2 p-2"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="map of the US · earth · egg · drone · rocket…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm text-cyan-50 outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded bg-cyan-400/20 px-4 py-2 font-mono text-xs tracking-wider text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-50"
          >
            {busy ? "…" : "SPAWN"}
          </button>
        </form>
      </footer>

      {cameraError && (
        <div className="pointer-events-auto absolute left-1/2 top-24 -translate-x-1/2 rounded border border-orange-500/50 bg-black/80 px-4 py-2 font-mono text-xs text-orange-300">
          CAMERA: {cameraError}
        </div>
      )}
    </div>
  );
}
