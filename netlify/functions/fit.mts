// Netlify Function (v2) — routes POST /api/fit to the shared handler in /api/fit.ts.
import handler from "../../api/fit.ts";

export default (req: Request) => handler(req);

export const config = { path: "/api/fit" };
