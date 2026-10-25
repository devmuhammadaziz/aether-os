"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HoloMeshMaterial } from "./FresnelMaterial";
import { US_MAP_PATH } from "@/lib/shapePresets";
import type { MeshPartSpec, SpawnSpec, Vec3 } from "@/lib/types";

function PartMesh({
  part,
  explodeDir,
  explodeAmount,
  clippingPlanes,
}: {
  part: MeshPartSpec;
  explodeDir: Vec3;
  explodeAmount: number;
  clippingPlanes: THREE.Plane[];
}) {
  const offset: Vec3 = [
    part.position[0] + explodeDir[0] * explodeAmount,
    part.position[1] + explodeDir[1] * explodeAmount,
    part.position[2] + explodeDir[2] * explodeAmount,
  ];

  const geo = (() => {
    switch (part.type) {
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 24]} />;
      case "torus":
        return <torusGeometry args={[0.4, 0.12, 16, 48]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 24]} />;
      case "octahedron":
        return <octahedronGeometry args={[0.55, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  })();

  return (
    <mesh position={offset} scale={part.scale} rotation={part.rotation ?? [0, 0, 0]}>
      {geo}
      <HoloMeshMaterial color={part.color} clippingPlanes={clippingPlanes} />
    </mesh>
  );
}

function UsMapMesh({
  color,
  explodeAmount,
  clippingPlanes,
}: {
  color: string;
  explodeAmount: number;
  clippingPlanes: THREE.Plane[];
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const raw = US_MAP_PATH.replace(/,/g, " ").trim().split(/\s+/);
    let i = 0;
    while (i < raw.length) {
      const cmd = raw[i++];
      if (cmd === "M" || cmd === "L") {
        const x = (parseFloat(raw[i++]) - 500) / 220;
        const y = -(parseFloat(raw[i++]) - 300) / 220;
        if (cmd === "M") shape.moveTo(x, y);
        else shape.lineTo(x, y);
      } else if (cmd === "Z") {
        shape.closePath();
      }
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2.2, 0, 0]}
      position={[0, explodeAmount * 0.3, 0]}
    >
      <HoloMeshMaterial color={color} clippingPlanes={clippingPlanes} />
    </mesh>
  );
}

function EggMesh({
  color,
  explodeAmount,
  clippingPlanes,
}: {
  color: string;
  explodeAmount: number;
  clippingPlanes: THREE.Plane[];
}) {
  const geometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const y = (t - 0.5) * 1.6;
      const r = 0.38 * Math.sqrt(Math.max(0, 1 - Math.pow((y + 0.12) / 0.85, 2)));
      points.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(points, 32);
  }, []);

  return (
    <group>
      <mesh geometry={geometry} position={[0, explodeAmount * 0.2, 0]}>
        <HoloMeshMaterial color={color} clippingPlanes={clippingPlanes} />
      </mesh>
      <mesh position={[0, 0.15 + explodeAmount * 0.5, 0]} scale={[0.55, 0.55, 0.55]}>
        <torusGeometry args={[0.55, 0.04, 8, 48]} />
        <HoloMeshMaterial color="#ff4d00" clippingPlanes={clippingPlanes} />
      </mesh>
    </group>
  );
}

function EarthMesh({
  color,
  explodeAmount,
  clippingPlanes,
}: {
  color: string;
  explodeAmount: number;
  clippingPlanes: THREE.Plane[];
}) {
  return (
    <group>
      <mesh scale={[1.2 + explodeAmount * 0.1, 1.2, 1.2]}>
        <sphereGeometry args={[0.85, 48, 48]} />
        <HoloMeshMaterial color={color} clippingPlanes={clippingPlanes} />
      </mesh>
      {/* Latitude / longitude wire rings */}
      {[ -0.5, 0, 0.5 ].map((y, i) => (
        <mesh
          key={`lat-${i}`}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, y * 0.7, 0]}
        >
          <torusGeometry args={[Math.sqrt(Math.max(0.05, 0.85 ** 2 - (y * 0.7) ** 2)), 0.012, 8, 64]} />
          <meshBasicMaterial color="#ff4d00" transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.86, 0.012, 8, 64]} />
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.7} />
      </mesh>
      <mesh
        rotation={[Math.PI / 2.4, 0.3, 0]}
        scale={[1 + explodeAmount * 0.4, 1 + explodeAmount * 0.4, 1]}
      >
        <torusGeometry args={[1.15, 0.02, 8, 64]} />
        <meshBasicMaterial color="#ff4d00" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export function ProceduralObject({
  spec,
  clippingPlanes,
}: {
  spec: SpawnSpec;
  clippingPlanes: THREE.Plane[];
}) {
  const groupRef = useRef<THREE.Group>(null);

  const dirs = useMemo(
    () =>
      spec.parts.map((p) => {
        const len =
          Math.hypot(p.position[0], p.position[1], p.position[2]) || 1;
        return [p.position[0] / len, p.position[1] / len, p.position[2] / len] as Vec3;
      }),
    [spec.parts]
  );

  useFrame((_, delta) => {
    if (groupRef.current && !spec.grabbed) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group
      ref={groupRef}
      position={spec.position}
      rotation={spec.rotation}
      scale={spec.scale}
      userData={{ aetherId: spec.id }}
    >
      {spec.preset === "us-map" && (
        <UsMapMesh
          color={spec.color}
          explodeAmount={spec.explodeAmount}
          clippingPlanes={clippingPlanes}
        />
      )}
      {spec.preset === "egg" && (
        <EggMesh
          color={spec.color}
          explodeAmount={spec.explodeAmount}
          clippingPlanes={clippingPlanes}
        />
      )}
      {spec.preset === "earth" && (
        <EarthMesh
          color={spec.color}
          explodeAmount={spec.explodeAmount}
          clippingPlanes={clippingPlanes}
        />
      )}
      {spec.preset !== "us-map" &&
        spec.preset !== "egg" &&
        spec.preset !== "earth" &&
        spec.parts.map((part, i) => (
          <PartMesh
            key={i}
            part={part}
            explodeDir={dirs[i] ?? [0, 1, 0]}
            explodeAmount={spec.explodeAmount}
            clippingPlanes={clippingPlanes}
          />
        ))}
      <mesh visible={false}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
