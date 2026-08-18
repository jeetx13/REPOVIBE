import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Impl = lazy(() => import("@/scenes/Gauge3D").then((m) => ({ default: m.Gauge3D })));

export function Gauge3D(props: { fill: number; color?: string; className?: string }) {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <Impl {...props} />
      </Suspense>
    </ClientOnly>
  );
}
