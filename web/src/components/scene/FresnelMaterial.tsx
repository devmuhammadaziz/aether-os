"use client";

import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uPower);
    vec3 col = uColor * (0.15 + fresnel * uIntensity);
    gl_FragColor = vec4(col, 0.85 + fresnel * 0.15);
  }
`;

type Props = {
  color?: string;
  wireframe?: boolean;
  clippingPlanes?: THREE.Plane[];
};

export function useFresnelMaterial({
  color = "#00f3ff",
  wireframe = true,
  clippingPlanes,
}: Props = {}) {
  return useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uPower: { value: 2.2 },
        uIntensity: { value: 1.6 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      wireframe,
      depthWrite: true,
      side: THREE.DoubleSide,
      clipping: true,
      clippingPlanes: clippingPlanes ?? [],
    });
    return mat;
  }, [color, wireframe, clippingPlanes]);
}

export function HoloMeshMaterial({
  color = "#00f3ff",
  clippingPlanes,
}: {
  color?: string;
  clippingPlanes?: THREE.Plane[];
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={1.4}
      wireframe
      transparent
      opacity={0.85}
      metalness={0.2}
      roughness={0.25}
      clippingPlanes={clippingPlanes}
      clipShadows
      depthWrite
    />
  );
}
