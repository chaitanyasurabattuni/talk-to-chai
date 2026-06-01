// Netlify Function (v2) — routes POST /api/judge to the shared handler in /api/judge.ts.
import handler from "../../api/judge.ts";

export default (req: Request) => handler(req);

export const config = { path: "/api/judge" };
