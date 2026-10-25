/** PM2 config — set secrets ON THE VPS only (never commit real keys). */
module.exports = {
  apps: [
    {
      name: "aether-os",
      cwd: "/home/deploy/aether-os/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3011",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3011",
        HOSTNAME: "127.0.0.1",
        // Paste your key on the VPS after clone — do not commit real keys to GitHub
        OPENAI_API_KEY: "",
        ASTRA_API_KEY: "",
        MONGODB_URI: "",
      },
    },
  ],
};
