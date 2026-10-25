"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { distance3, length3, add3, scale3 } from "@/lib/coords";
import { useAetherStore } from "@/store/aetherStore";
import type { Vec3 } from "@/lib/types";

const GRAB_RADIUS = 0.55;
const FLICK_SPEED = 1.8;
const DOCK_X = 2.6;

export function InteractionSystem({
  clipPlane,
}: {
  clipPlane: THREE.Plane;
}) {
  const { gl } = useThree();
  const grabIdRef = useRef<string | null>(null);
  const lastClapRef = useRef(0);
  const baseSpreadRef = useRef<number | null>(null);

  useFrame((_, delta) => {
    const state = useAetherStore.getState();
    const {
      hands,
      intent,
      objects,
      selectedId,
      updateObject,
      dockObject,
      clapPulse,
      fistSpread,
      clippingEnabled,
      clipPoint,
      clipNormal,
      setSculptPoint,
    } = state;

    gl.localClippingEnabled = clippingEnabled;
    if (clippingEnabled) {
      clipPlane.set(
        new THREE.Vector3(...clipNormal),
        -new THREE.Vector3(...clipNormal).dot(new THREE.Vector3(...clipPoint))
      );
    }

    // Clap → collapse exploded views
    if (clapPulse && clapPulse !== lastClapRef.current) {
      lastClapRef.current = clapPulse;
      objects.forEach((o) => {
        if (o.exploded) {
          updateObject(o.id, { exploded: false, explodeAmount: 0 });
        }
      });
    }

    // Two-fist deconstruct
    if (fistSpread !== null && intent === "interacting") {
      if (baseSpreadRef.current === null) baseSpreadRef.current = fistSpread;
      const deltaSpread = fistSpread - baseSpreadRef.current;
      if (deltaSpread > 0.25 && selectedId) {
        const amount = Math.min(1.2, deltaSpread * 1.5);
        updateObject(selectedId, {
          exploded: true,
          explodeAmount: amount,
        });
      }
    } else {
      baseSpreadRef.current = null;
    }

    // Smooth explode amount
    objects.forEach((o) => {
      const target = o.exploded ? Math.max(o.explodeAmount, 0.9) : 0;
      const next = THREE.MathUtils.damp(o.explodeAmount, target, 5, delta);
      if (Math.abs(next - o.explodeAmount) > 0.001) {
        updateObject(o.id, { explodeAmount: next });
      }
    });

    // Grab / flick with dominant hand (prefer Right)
    const hand =
      hands.find((h) => h.side === "Right") ?? hands[0] ?? null;

    // No hands → release grab, keep physics integrating
    if (!hand) {
      setSculptPoint(null, false);
      if (grabIdRef.current) {
        const id = grabIdRef.current;
        updateObject(id, { grabbed: false, velocity: [0, 0, 0] });
        grabIdRef.current = null;
      }
      objects.forEach((o) => {
        if (o.grabbed || o.docked) return;
        const speed = length3(o.velocity);
        if (speed < 0.05) {
          if (speed > 0) updateObject(o.id, { velocity: [0, 0, 0] });
          return;
        }
        const nextPos = add3(o.position, scale3(o.velocity, delta));
        const nextVel = scale3(o.velocity, Math.exp(-1.5 * delta));
        if (nextPos[0] > DOCK_X) {
          dockObject(o.id);
          return;
        }
        updateObject(o.id, { position: nextPos, velocity: nextVel });
      });
      return;
    }

    // Soft resting: still allow pinch-grab, only block air-sculpt spam
    const allowSculpt = intent === "interacting";

    const pinchPoint = hand.world[8];
    const pinching = hand.pinch;

    if (pinching && !grabIdRef.current) {
      let best: { id: string; d: number } | null = null;
      for (const o of objects) {
        const d = distance3(o.position, pinchPoint);
        if (d < GRAB_RADIUS && (!best || d < best.d)) best = { id: o.id, d };
      }
      if (best) {
        grabIdRef.current = best.id;
        updateObject(best.id, {
          grabbed: true,
          velocity: [0, 0, 0],
        });
        useAetherStore.getState().setSelected(best.id);
      }
    }

    if (grabIdRef.current && pinching) {
      const id = grabIdRef.current;
      updateObject(id, {
        position: pinchPoint as Vec3,
        velocity: hand.velocity,
        grabbed: true,
      });
      setSculptPoint(null, false);
    } else if (pinching && allowSculpt && !grabIdRef.current) {
      setSculptPoint(pinchPoint as Vec3, true);
    } else {
      setSculptPoint(null, false);
    }

    if (grabIdRef.current && !pinching) {
      const id = grabIdRef.current;
      const speed = length3(hand.velocity);
      if (speed > FLICK_SPEED) {
        updateObject(id, {
          grabbed: false,
          velocity: scale3(hand.velocity, 0.85),
        });
      } else {
        updateObject(id, { grabbed: false, velocity: [0, 0, 0] });
      }
      grabIdRef.current = null;
    }

    // Integrate tossed objects toward dock edge
    objects.forEach((o) => {
      if (o.grabbed || o.docked) return;
      const speed = length3(o.velocity);
      if (speed < 0.05) return;
      const nextPos = add3(o.position, scale3(o.velocity, delta));
      const nextVel = scale3(o.velocity, Math.exp(-1.2 * delta));
      if (nextPos[0] > DOCK_X || (speed > FLICK_SPEED && nextPos[0] > 2.0)) {
        dockObject(o.id);
        return;
      }
      updateObject(o.id, { position: nextPos, velocity: nextVel });
    });
  });

  return null;
}
