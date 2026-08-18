import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Impl = lazy(() => import("@/scenes/Progress3D").then((m) => ({ default: m.Progress3D })));

export function Progress3D(props: { className?: string }) {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <Impl {...props} />
      </Suspense>
    </ClientOnly>
  );
}
