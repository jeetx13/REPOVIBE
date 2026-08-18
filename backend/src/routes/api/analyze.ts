import { createFileRoute } from "@tanstack/react-router";
import { errorMessage, json, preflight } from "@/lib/api-response.server";
import { parseRepoInput } from "@/lib/analysis-types";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { repo?: unknown; refresh?: unknown };
          if (typeof body.repo !== "string" || typeof body.refresh === "boolean" && body.refresh !== true) {
            return json(request, { error: "Expected a repository name and optional boolean refresh flag." }, 400);
          }
          const { fullName } = parseRepoInput(body.repo);
          const { runAnalysis } = await import("@/lib/analysis.server");
          return json(request, await runAnalysis(fullName, body.refresh === true));
        } catch (error) {
          const message = errorMessage(error);
          const status = /format|valid GitHub|Expected/.test(message) ? 400 : /doesn't exist|private/.test(message) ? 404 : /limit/.test(message) ? 429 : 502;
          return json(request, { error: message }, status);
        }
      },
    },
  },
});
