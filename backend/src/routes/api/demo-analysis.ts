import { createFileRoute } from "@tanstack/react-router";
import { errorMessage, json, preflight } from "@/lib/api-response.server";
import { DEMO_REPO_MAP } from "@/lib/analysis-types";

export const Route = createFileRoute("/api/demo-analysis")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { key?: unknown };
          if (typeof body.key !== "string") return json(request, { error: "Expected a demo repository key." }, 400);
          const { runAnalysis } = await import("@/lib/analysis.server");
          return json(request, await runAnalysis(DEMO_REPO_MAP[body.key] ?? "facebook/react", false));
        } catch (error) {
          return json(request, { error: errorMessage(error) }, 502);
        }
      },
    },
  },
});
