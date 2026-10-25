import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Plain Vite + TanStack Start setup.
// Nitro builds the server for whichever host runs the build: it auto-detects
// Vercel, Netlify and Cloudflare in their build environments and falls back to a
// plain Node server everywhere else (`node .output/server/index.mjs`).
export default defineConfig(({ command, mode }) => {
  // Make variables from a local .env file (e.g. STRIPE_SECRET_KEY) visible to server
  // code during `npm run dev`. On Vercel/Netlify the host provides them instead.
  for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
    process.env[k] ??= v;
  }
  return {
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // src/server.ts wraps the server entry with a friendly error page.
        server: { entry: "server" },
      }),
      ...(command === "build" ? [nitro()] : []),
      viteReact(),
    ],
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
    },
  };
});
