"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useAetherStore } from "@/store/aetherStore";
import type { Vec3 } from "@/lib/types";

function TubeFromPoints({
  points,
  color,
}: {
  points: Vec3[];
  color: string;
}) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p))
    );
    return new THREE.TubeGeometry(curve, Math.max(points.length * 2, 8), 0.018, 8, false);
  }, [points]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.2}
        transparent
        opacity={0.95}
        depthWrite
      />
    </mesh>
  );
}

export function AirSculptLayers() {
  const strokes = useAetherStore((s) => s.strokes);
  const active = useAetherStore((s) => s.activeStroke);

  return (
    <group>
      {strokes.map((s) => (
        <TubeFromPoints key={s.id} points={s.points} color={s.color} />
      ))}
      {active.length > 1 && (
        <TubeFromPoints points={active} color="#ff4d00" />
      )}
    </group>
  );
}
