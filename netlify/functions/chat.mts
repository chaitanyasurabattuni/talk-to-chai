// Netlify Function (v2) — routes POST /api/chat to the shared handler in /api/chat.ts.
// The handler is a web-standard (Request) => Promise<Response>, so it works as-is.
import handler from "../../api/chat.ts";

export default (req: Request) => handler(req);

export const config = { path: "/api/chat" };
