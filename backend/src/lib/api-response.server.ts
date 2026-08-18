/** Helpers shared by public JSON API routes. */
function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  const origin = request.headers.get("origin");
  const allowed = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((value) => value.trim());
  if (origin && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

export function json(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unexpected server error.";
}
