"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { CyberHandRig } from "./CyberHand";
import { AirSculptLayers } from "./AirSculpt";
import { ProceduralObject } from "./ProceduralObject";
import { InteractionSystem } from "./InteractionSystem";
import { ClipPlaneHelper } from "./ClipPlaneHelper";
import { useAetherStore } from "@/store/aetherStore";

function SceneContents() {
  const objects = useAetherStore((s) => s.objects);
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const planes = useMemo(() => [clipPlane], [clipPlane]);
  const clippingEnabled = useAetherStore((s) => s.clippingEnabled);

  return (
    <>
      <color attach="background" args={["#03060c"]} />
      <fog attach="fog" args={["#03060c", 6, 18]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#00f3ff" />
      <pointLight position={[-3, 1, -2]} intensity={0.6} color="#ff4d00" />

      <gridHelper args={[12, 24, "#0a3a44", "#071820"]} position={[0, -1.6, 0]} />

      {/* Origin hologram pedestal */}
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 48]} />
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.35} />
      </mesh>

      {objects.map((obj) => (
        <ProceduralObject
          key={obj.id}
          spec={obj}
          clippingPlanes={clippingEnabled ? planes : []}
        />
      ))}

      <AirSculptLayers />
      <CyberHandRig />
      <ClipPlaneHelper />
      <InteractionSystem clipPlane={clipPlane} />

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI * 0.49}
      />

      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0008)}
        />
      </EffectComposer>
    </>
  );
}

export function AetherScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.2], fov: 45, near: 0.1, far: 40 }}
        gl={{ antialias: true, localClippingEnabled: true }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
