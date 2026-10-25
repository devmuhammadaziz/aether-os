"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAetherStore } from "@/store/aetherStore";

export function ClipPlaneHelper() {
  const groupRef = useRef<THREE.Group>(null);
  const enabled = useAetherStore((s) => s.clippingEnabled);
  const point = useAetherStore((s) => s.clipPoint);
  const normal = useAetherStore((s) => s.clipNormal);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.4, 2.4)), []);

  useFrame(() => {
    if (!groupRef.current || !enabled) return;
    groupRef.current.position.set(...point);
    const n = new THREE.Vector3(...normal);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n.normalize());
    groupRef.current.quaternion.copy(q);
  });

  if (!enabled) return null;

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ff4d00" />
      </lineSegments>
    </group>
  );
}
