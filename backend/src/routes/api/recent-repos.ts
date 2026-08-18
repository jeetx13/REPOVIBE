import { createFileRoute } from "@tanstack/react-router";
import { errorMessage, json, preflight } from "@/lib/api-response.server";

export const Route = createFileRoute("/api/recent-repos")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      GET: async ({ request }) => {
        try {
          const { fetchRecentRepos } = await import("@/lib/analysis.server");
          return json(request, await fetchRecentRepos());
        } catch (error) {
          return json(request, { error: errorMessage(error) }, 502);
        }
      },
    },
  },
});
