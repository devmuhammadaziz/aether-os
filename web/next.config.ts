import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Optional Bun server still works in local `npm run dev` via concurrently;
  // production uses Next.js /api/spawn — no external rewrite needed.
};

export default nextConfig;
