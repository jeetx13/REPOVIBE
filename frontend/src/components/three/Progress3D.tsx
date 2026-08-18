import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function SpinRing({ color, radius, tube, speed, axis }: { color: string; radius: number; tube: number; speed: number; axis: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * speed * axis[0];
      ref.current.rotation.y += dt * speed * axis[1];
      ref.current.rotation.z += dt * speed * axis[2];
    }
  });
  return (
    <Torus ref={ref} args={[radius, tube, 12, 48]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.4} />
    </Torus>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.6;
  });
  return (
    <Icosahedron ref={ref} args={[0.5, 1]}>
      <meshStandardMaterial color="#EBA84A" emissive="#D98A2B" emissiveIntensity={0.9} flatShading />
    </Icosahedron>
  );
}

interface Progress3DProps {
  className?: string;
}

/** Animated 3D progress indicator used in the dashboard loading state. */
export function Progress3D({ className }: Progress3DProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1} color="#FFF3DD" />
        <Core />
        <SpinRing color="#3B6E4B" radius={1.1} tube={0.05} speed={1.4} axis={[0.3, 1, 0.2]} />
        <SpinRing color="#EBA84A" radius={1.35} tube={0.04} speed={-1} axis={[1, 0.3, 0.5]} />
        <SpinRing color="#93B69E" radius={1.6} tube={0.03} speed={0.8} axis={[0.5, 0.5, 1]} />
      </Canvas>
    </div>
  );
}
