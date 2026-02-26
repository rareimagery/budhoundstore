import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import http from "node:http";

// Shared agent prevents "Data after Connection: close" parse errors
// that crash the dev server when Drupal sends Connection: close responses.
const agent = new http.Agent({ keepAlive: false, maxSockets: 50 });

const drupalProxy = {
  target: "http://localhost:8081",
  changeOrigin: true,
  agent,
  configure: (proxy) => {
    proxy.on("error", (err, _req, res) => {
      console.warn("[proxy]", err.message);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({ message: "Proxy error" }));
    });
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/jsonapi": drupalProxy,
      "/cart": drupalProxy,
      "/api": drupalProxy,
      "/oauth": drupalProxy,
      "/sites": drupalProxy,
    },
  },
});
