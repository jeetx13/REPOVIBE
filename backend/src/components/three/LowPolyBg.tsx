import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Impl = lazy(() => import("@/scenes/LowPolyBg").then((m) => ({ default: m.LowPolyBg })));

export function LowPolyBg(props: { className?: string }) {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <Impl {...props} />
      </Suspense>
    </ClientOnly>
  );
}
