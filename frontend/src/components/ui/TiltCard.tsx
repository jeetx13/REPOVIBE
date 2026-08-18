import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

/** 3D tilt-on-hover card. Degrades to no-tilt on touch / reduced-motion. */
export function TiltCard({ children, className = '', intensity = 8, glare = false }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rx = useSpring(useTransform(mvY, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mvX, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 18 });

  // glare position — declared unconditionally (hooks rule)
  const glareX = useTransform(mvX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mvY, [-0.5, 0.5], ['0%', '100%']);
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]: string[]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`,
  );

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mvX.set((e.clientX - r.left) / r.width - 0.5);
    mvY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mvX.set(0);
    mvY.set(0);
    setHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glareBg, opacity: hovering ? 1 : 0 }}
        />
      )}
    </motion.div>
  );
}
