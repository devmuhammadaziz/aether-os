"use client";

import { HandTrackerProvider } from "@/context/HandTrackerProvider";
import { AetherScene } from "@/components/scene/AetherScene";
import { StarkHUD } from "@/components/ui/StarkHUD";

export default function Home() {
  return (
    <HandTrackerProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-[#03060c]">
        <AetherScene />
        <StarkHUD />
      </main>
    </HandTrackerProvider>
  );
}
