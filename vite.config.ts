import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Dev-only plugin: serves the edge-style handlers in /api during `vite dev`,
 * so the whole app works locally with just a GROQ_API_KEY in .env — no Vercel
 * CLI required. In production the platform serves /api natively.
 */
function apiDevServer(env: Record<string, string>): Plugin {
  return {
    name: "api-dev-server",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      // Expose env to the handlers (they read process.env).
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) return next();

        const route = url.split("?")[0].replace(/^\/api\//, "").replace(/\.ts$/, "");
        const modPath = `/api/${route}.ts`;

        try {
          const mod = await server.ssrLoadModule(modPath);
          const handler = mod.default as (r: Request) => Promise<Response>;
          if (typeof handler !== "function") return next();

          const request = await toWebRequest(req);
          const response = await handler(request);
          await writeWebResponse(res, response);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Dev API error", detail: String(err?.message ?? err) }));
        }
      });
    },
  };
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v) headers.set(k, v);
  }
  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (!response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiDevServer(env)],
    server: { port: 5173 },
  };
});
