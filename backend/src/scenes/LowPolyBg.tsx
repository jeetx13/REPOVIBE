import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

type Shape = 'ico' | 'octa' | 'torus';

function Drifter({ shape, color, position, scale }: { shape: Shape; color: string; position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.12;
      ref.current.rotation.y += dt * 0.08;
    }
  });
  const mat = (
    <meshStandardMaterial color={color} flatShading transparent opacity={0.55} roughness={0.6} />
  );
  if (shape === 'torus')
    return (
      <Float speed={1} rotationIntensity={0.8} floatIntensity={1.4}>
        <Torus ref={ref as unknown as React.RefObject<THREE.Mesh>} args={[scale, scale * 0.32, 8, 18]} position={position}>
          {mat}
        </Torus>
      </Float>
    );
  const Cmp = shape === 'octa' ? Octahedron : Icosahedron;
  return (
    <Float speed={1} rotationIntensity={0.8} floatIntensity={1.4}>
      <Cmp ref={ref as unknown as React.RefObject<THREE.Mesh>} args={[scale, 0]} position={position}>
        {mat}
      </Cmp>
    </Float>
  );
}

interface LowPolyBgProps {
  className?: string;
}

/** Slow-drifting low-poly shapes in brand palette. Sits behind landing sections. */
export function LowPolyBg({ className }: LowPolyBgProps) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const shapes = useMemo(
    () =>
      (mobile
        ? [
            { shape: 'ico' as Shape, color: '#93B69E', position: [-3, 1.5, -2] as [number, number, number], scale: 0.8 },
            { shape: 'octa' as Shape, color: '#EBA84A', position: [3, -1.5, -2] as [number, number, number], scale: 0.6 },
          ]
        : [
            { shape: 'ico' as Shape, color: '#93B69E', position: [-5, 2, -3] as [number, number, number], scale: 1.1 },
            { shape: 'octa' as Shape, color: '#EBA84A', position: [5, -2, -3] as [number, number, number], scale: 0.9 },
            { shape: 'torus' as Shape, color: '#5E8E6C', position: [-4, -2.5, -2] as [number, number, number], scale: 0.7 },
            { shape: 'ico' as Shape, color: '#D98A2B', position: [4.5, 2.5, -4] as [number, number, number], scale: 0.5 },
          ]),
    [mobile],
  );

  return (
    <div className={className} aria-hidden style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={0.8} color="#FFF3DD" />
        {shapes.map((s, i) => (
          <Drifter key={i} {...s} />
        ))}
      </Canvas>
    </div>
  );
}
