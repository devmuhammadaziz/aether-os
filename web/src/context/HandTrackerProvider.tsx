"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { LandmarkFilterBank } from "@/lib/oneEuroFilter";
import { landmarksToWorld } from "@/lib/coords";
import {
  analyzeHand,
  detectClap,
  palmNormal,
  twoFistSpread,
} from "@/lib/gestures";
import { IntentClassifier } from "@/lib/intent";
import { useAetherStore } from "@/store/aetherStore";
import type { HandFrame, Vec3 } from "@/lib/types";

type HandTrackerContextValue = {
  start: () => Promise<void>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  running: boolean;
  starting: boolean;
};

const HandTrackerContext = createContext<HandTrackerContextValue | null>(null);

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useHandTracker() {
  const ctx = useContext(HandTrackerContext);
  if (!ctx) {
    throw new Error("useHandTracker must be used within HandTrackerProvider");
  }
  return ctx;
}

export function HandTrackerProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const filtersRef = useRef<Map<string, LandmarkFilterBank>>(new Map());
  const prevPalmsRef = useRef<Map<string, Vec3>>(new Map());
  const lastTsRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const uniqueTsRef = useRef<number>(0);
  const intentRef = useRef(new IntentClassifier());
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(performance.now());
  const startingLock = useRef(false);
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const setTracker = useAetherStore((s) => s.setTracker);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const dt = lastTsRef.current ? (now - lastTsRef.current) / 1000 : 0.016;
    lastTsRef.current = now;

    let hands: HandFrame[] = useAetherStore.getState().hands;

    // Only detect on new video frames; timestamps must be strictly increasing
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      uniqueTsRef.current = Math.max(uniqueTsRef.current + 1, Math.floor(now));

      try {
        const result = landmarker.detectForVideo(video, uniqueTsRef.current);
        const handedness = result.handednesses ?? [];
        const landmarks = result.landmarks ?? [];
        hands = [];
        const seen = new Set<string>();

        for (let i = 0; i < landmarks.length; i++) {
          const label =
            (handedness[i]?.[0]?.categoryName as "Left" | "Right") || "Right";
          const key = `${label}-${i}`;
          seen.add(key);

          if (!filtersRef.current.has(key)) {
            filtersRef.current.set(key, new LandmarkFilterBank(21));
          }

          const smoothed = filtersRef.current.get(key)!.apply(landmarks[i], now);
          // landmarkToWorld flips X so physical right lands on screen-right (selfie)
          const world = landmarksToWorld(smoothed);
          const prev = prevPalmsRef.current.get(key) ?? null;
          const hand = analyzeHand(label, smoothed, world, prev, dt);
          prevPalmsRef.current.set(key, hand.palm);
          hands.push(hand);
        }

        for (const key of [...filtersRef.current.keys()]) {
          if (!seen.has(key)) {
            filtersRef.current.delete(key);
            prevPalmsRef.current.delete(key);
          }
        }
      } catch (err) {
        console.warn("[AETHER] Hand detect frame skipped:", err);
      }
    }

    const intent = intentRef.current.update(hands);
    const clap = detectClap(hands);
    const spread = twoFistSpread(hands);

    const dominant =
      hands.find((h) => h.side === "Right") ?? hands[0] ?? null;
    const nonDominant =
      hands.length > 1 ? hands.find((h) => h !== dominant) ?? null : null;

    let clippingEnabled = false;
    let clipPoint: Vec3 = [0, 0, 0];
    let clipNormal: Vec3 = [1, 0, 0];

    if (nonDominant?.openPalm) {
      clippingEnabled = true;
      clipPoint = nonDominant.palm;
      clipNormal = palmNormal(nonDominant);
    }

    frameCountRef.current += 1;
    const elapsed = now - fpsTimerRef.current;
    let fps = useAetherStore.getState().fps;
    if (elapsed >= 500) {
      fps = Math.round((frameCountRef.current / elapsed) * 1000);
      frameCountRef.current = 0;
      fpsTimerRef.current = now;
    }

    setTracker({
      ready: true,
      hands,
      intent,
      fps,
      clapPulse: clap ? now : useAetherStore.getState().clapPulse,
      fistSpread: spread,
      clippingEnabled,
      clipPoint,
      clipNormal,
    });

    rafRef.current = requestAnimationFrame(processFrame);
  }, [setTracker]);

  const start = useCallback(async () => {
    if (running || startingLock.current) return;
    startingLock.current = true;
    setStarting(true);
    setTracker({ cameraError: null });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) throw new Error("Video element missing");

      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      await video.play();
      setPreviewStream(stream);

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          resolve();
          return;
        }
        const onReady = () => {
          video.removeEventListener("loadeddata", onReady);
          resolve();
        };
        video.addEventListener("loadeddata", onReady);
      });

      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      let landmarker: HandLandmarker;
      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.45,
          minHandPresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
      } catch {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.45,
          minHandPresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
      }

      landmarkerRef.current = landmarker;
      setRunning(true);
      setTracker({ cameraError: null, ready: true });
      rafRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Webcam access denied";
      console.error("[AETHER] Vision start failed:", err);
      setTracker({ cameraError: message, ready: false });
    } finally {
      startingLock.current = false;
      setStarting(false);
    }
  }, [processFrame, running, setTracker]);

  useEffect(() => {
    const t = window.setTimeout(() => void start(), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      const video = videoRef.current;
      const stream = video?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <HandTrackerContext.Provider value={{ start, videoRef, running, starting }}>
      {/* Hidden raw feed for MediaPipe (unmirrored) */}
      <video
        ref={videoRef}
        className="pointer-events-none fixed h-px w-px opacity-0"
        playsInline
        muted
        autoPlay
      />

      {/* Selfie preview: CSS-mirrored so your right hand stays on the right */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-50 overflow-hidden rounded-xl border border-cyan-400/50 shadow-[0_0_28px_rgba(0,243,255,0.35)]">
        <div className="relative h-40 w-64 bg-black/90">
          {previewStream ? (
            <SelfieMirror stream={previewStream} />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[10px] tracking-widest text-cyan-500/70">
              {starting ? "ARMING VISION…" : "VISION OFFLINE"}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03060c]/70 via-transparent to-cyan-400/5" />
          <div className="absolute left-2 top-2 font-mono text-[9px] tracking-[0.2em] text-cyan-300/90">
            SELFIE · R=R L=L
          </div>
          <div className="absolute bottom-2 right-2 font-mono text-[9px] text-cyan-400/70">
            {running ? "TRACKING" : "…"}
          </div>
        </div>
      </div>
      {children}
    </HandTrackerContext.Provider>
  );
}

function SelfieMirror({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    void el.play();
  }, [stream]);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      style={{ transform: "scaleX(-1)" }}
      playsInline
      muted
      autoPlay
    />
  );
}
