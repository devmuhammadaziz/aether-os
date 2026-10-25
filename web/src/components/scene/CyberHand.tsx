"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HAND_CONNECTIONS } from "@/lib/gestures";
import { useAetherStore } from "@/store/aetherStore";
import type { HandFrame } from "@/lib/types";

function HandBones({ hand }: { hand: HandFrame }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const jointsRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(HAND_CONNECTIONS.length * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    HAND_CONNECTIONS.forEach(([a, b], i) => {
      const pa = hand.world[a];
      const pb = hand.world[b];
      pos.setXYZ(i * 2, pa[0], pa[1], pa[2]);
      pos.setXYZ(i * 2 + 1, pb[0], pb[1], pb[2]);
    });
    pos.needsUpdate = true;

    if (jointsRef.current) {
      hand.world.forEach((p, i) => {
        dummy.position.set(p[0], p[1], p[2]);
        dummy.scale.setScalar(i === 0 ? 0.035 : 0.022);
        dummy.updateMatrix();
        jointsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      jointsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const color = hand.side === "Right" ? "#00f3ff" : "#ff4d00";

  return (
    <group>
      <lineSegments ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.95} depthWrite />
      </lineSegments>
      <instancedMesh ref={jointsRef} args={[undefined, undefined, 21]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          depthWrite
        />
      </instancedMesh>
    </group>
  );
}

export function CyberHandRig() {
  const hands = useAetherStore((s) => s.hands);
  return (
    <group>
      {hands.map((hand, i) => (
        <HandBones key={`${hand.side}-${i}`} hand={hand} />
      ))}
    </group>
  );
}
