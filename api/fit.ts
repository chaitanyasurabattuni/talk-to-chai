/**
 * /api/fit — the fit-checker headliner.
 *
 * POST { jd: string }
 * → { verdict, summary, strong[], partial[], gaps[] }
 *
 * Demonstrates structured-output design + honest judgment: paste a job
 * description, get an honestly-assessed strong / partial / gap breakdown
 * grounded only in the résumé.
 */
import { buildGrounding } from "../src/data/personas";
import { profile } from "../src/data/resume";
import { getProvider, rateLimit, clientIp, json } from "./_lib";

const MAX_JD_CHARS = 6000;

export interface FitItem {
  requirement: string;
  evidence: string;
}

export interface FitResult {
  verdict: "strong" | "moderate" | "stretch";
  summary: string;
  strong: FitItem[];
  partial: FitItem[];
  gaps: FitItem[];
}

const FIT_SYSTEM = `You are an honest fit-assessor evaluating whether Chaitanya Surabattuni matches a job description. You speak as a fair, candid analyst — NOT a salesperson. Use ONLY the grounding dossier as evidence; never invent experience.

For each meaningful requirement in the JD, classify it as:
- "strong": clear, direct evidence in the dossier.
- "partial": adjacent/transferable evidence but not a direct match.
- "gap": no evidence in the dossier. Be honest — gaps build trust.

Return STRICT JSON only (no prose, no markdown fences) in exactly this shape:
{"verdict":"strong|moderate|stretch","summary":"one honest sentence","strong":[{"requirement":"...","evidence":"... from résumé ..."}],"partial":[{"requirement":"...","evidence":"..."}],"gaps":[{"requirement":"...","evidence":"why it's a gap"}]}

Pick verdict honestly: "strong" if most core requirements are strong matches, "moderate" if mixed, "stretch" if mostly gaps. Keep each list to the most important 2–5 items.`;

function items(arr: unknown): FitItem[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, 6)
    .map((x: any) => ({
      requirement: String(x?.requirement ?? "").slice(0, 200),
      evidence: String(x?.evidence ?? "").slice(0, 300),
    }))
    .filter((x) => x.requirement);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const limit = rateLimit(clientIp(req));
  if (!limit.ok) return json({ error: "Rate limit", retryAfter: limit.retryAfter }, 429);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const jd = String(body?.jd ?? "").slice(0, MAX_JD_CHARS).trim();
  if (jd.length < 30) return json({ error: "Paste a fuller job description (at least a sentence or two)." }, 400);

  const provider = getProvider();
  const userBlock = `GROUNDING DOSSIER (the only allowed evidence about ${profile.name}):
${buildGrounding()}

JOB DESCRIPTION TO ASSESS AGAINST:
${jd}

Return the strict JSON fit assessment now.`;

  try {
    const raw = await provider.complete(
      [
        { role: "system", content: FIT_SYSTEM },
        { role: "user", content: userBlock },
      ],
      { temperature: 0.2, jsonMode: true },
    );

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const verdict = ["strong", "moderate", "stretch"].includes(parsed.verdict)
      ? parsed.verdict
      : "moderate";

    const result: FitResult = {
      verdict,
      summary: String(parsed.summary ?? "").slice(0, 300),
      strong: items(parsed.strong),
      partial: items(parsed.partial),
      gaps: items(parsed.gaps),
    };

    return json(result);
  } catch (err: any) {
    return json({ error: "Fit check failed.", detail: String(err?.message ?? err) }, 502);
  }
}
