# 🌌 AETHER OS (Augmented Environment Tactile Holographic Engine & Renderer)

## 🚀 Project Overview
AETHER OS is a browser-based, zero-install spatial computing environment. It transforms a standard webcam and browser into a fully interactive, AI-driven holographic workspace using hand gestures, real-time 3D rendering, and LLM-powered procedural generation.

## 🛠️ The Tech Stack
*   **Frontend UI & Routing:** Next.js (TypeScript), TailwindCSS (for the sci-fi glassmorphism UI).
*   **3D Engine:** React Three Fiber (R3F), Three.js, `@react-three/postprocessing` (for bloom and chromatic aberration).
*   **Computer Vision:** MediaPipe Hands (client-side WebAssembly for 60 FPS tracking).
*   **Backend / AI Proxy:** Elysia.js + Bun (ultra-fast API proxying and WebSocket handling for real-time AI streams).
*   **AI Models:** OpenAI API / Gemini Astra (for natural language processing, predictive intent, and dynamic text-to-3D procedural generation).

---

## 🔐 Environment Variables (`.env`)
Create a `.env` file in your root directory. The backend (Elysia.js) will securely handle these keys.

```env
# AI APIs for Text-to-3D & Intent Recognition
OPENAI_API_KEY=your_openai_api_key_here
ASTRA_API_KEY=your_astra_api_key_here

# Backend Config (Bun + Elysia)
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Optional: Database for saving user spaces/models
MONGODB_URI=your_mongodb_uri_here
```

---

## 🤖 THE MEGA-PROMPT
*Copy everything below this line and paste it into Cursor, Windsurf, or ChatGPT to generate your entire project.*

***

**Context & Role:**
Act as an elite Spatial Computing and WebGL Architect. I am building "AETHER OS", a highly advanced, browser-based holographic workspace inspired by Tony Stark's lab interfaces. The user interacts with 3D objects in mid-air using webcam hand tracking.

**Tech Stack Requirements:**
1.  **Frontend:** Next.js (App Router), TypeScript, TailwindCSS.
2.  **3D Rendering:** React Three Fiber (R3F) and Three.js. Must use `@react-three/drei` and `@react-three/postprocessing` (UnrealBloomPass is mandatory for the neon UI).
3.  **Vision Tracking:** `@mediapipe/tasks-vision` (HandLandmarker running client-side at 60 FPS).
4.  **Backend Proxy (if needed for AI):** Elysia.js running on Bun.

**Core Aesthetics (The "Stark" UI):**
*   Dark mode only (`bg-black` or deep dark blue/gray).
*   Heavy use of glassmorphism (translucent panels, heavy backdrop blur).
*   Neon cyan (`#00f3ff`) and alert orange (`#ff4d00`) accents.
*   Wireframe 3D models with glowing edges (Fresnel shaders).
*   Minimalist, technical telemetry data floating around the screen.

**Required Features to Implement:**

1.  **MediaPipe to R3F Bridge:** Set up a webcam feed that is hidden or highly stylized. Map the 3D hand landmarks from MediaPipe to an invisible physics kinematic body in the Three.js scene. Use a 1-Euro filter or simple lerp to smooth out landmark jitter.
2.  **Dynamic Text-to-3D Spawning (AI Integration):** Create an input field (or voice trigger). When the user types/says "Spawn a futuristic drone", simulate an API call to an LLM (OpenAI/Astra) that returns procedural parameters to generate or fetch a 3D geometry in the center of the scene.
3.  **The Stark Deconstruct (Exploded View):** Implement a two-handed gesture where pulling fists apart along the X-axis takes a grouped 3D mesh and animates its child components outward radially (exploded view). Clapping snaps them back.
4.  **Holographic Spatial Scalpel (Clipping Plane):** Map a `THREE.Plane` to the user's non-dominant hand (flat palm). Bind this plane to the `clippingPlanes` property of the 3D model materials, allowing the user to slice through objects to see inside them. Render a glowing neon rim where the cut occurs.
5.  **Cybernetic Hand Rig & Depth Occlusion:** Render a futuristic skeletal hand over the user's actual hand coordinates. Ensure it interacts with the WebGL depth buffer so 3D objects can properly occlude (hide) the hand when the hand is behind them.
6.  **Volumetric Air-Sculpting:** When the user pinches index and thumb, record the 3D position over time and dynamically build a `THREE.TubeGeometry` (like drawing neon strings in mid-air).
7.  **Kinetic Flick-to-Toss:** When releasing a grabbed object, calculate the hand's release velocity. If the velocity is high, apply physical momentum to the object so it flies off and docks into a spatial UI carousel at the edge of the screen.
8.  **Predictive Intent Classifier:** Write a lightweight utility function that monitors hand velocity and micro-movements to determine if the user is "resting" vs "interacting," disabling accidental clicks when resting.

**Deployment Instructions (Include in output):**
Provide the setup scripts, Dockerfile (if necessary for Elysia), and Vercel configuration required to deploy this stack seamlessly.

**First Step:**
Please initialize the project structure, `package.json` dependencies, and provide the core `HandTracker` context provider that will pipe MediaPipe data into the React Three Fiber canvas.