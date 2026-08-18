import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Impl = lazy(() => import("@/scenes/RepoCore").then((m) => ({ default: m.RepoCore })));

export function RepoCore(props: { reduced?: boolean; className?: string }) {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <Impl {...props} />
      </Suspense>
    </ClientOnly>
  );
}
