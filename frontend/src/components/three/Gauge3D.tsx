import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Torus } from '@react-three/drei';
import * as THREE from 'three';

function Dial({ fill, color }: { fill: number; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const needleRef = useRef<THREE.Group>(null);
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);

  useEffect(() => {
    // -90deg (empty) -> +90deg (full)
    targetAngle.current = -Math.PI / 2 + (fill / 100) * Math.PI;
  }, [fill]);

  useFrame((_, dt) => {
    currentAngle.current += (targetAngle.current - currentAngle.current) * Math.min(1, dt * 3);
    if (needleRef.current) needleRef.current.rotation.z = currentAngle.current;
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.15;
  });

  const needleLen = 1.1;
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    arr.push(new THREE.Vector3(0, 0, 0.05));
    arr.push(new THREE.Vector3(needleLen, 0, 0.05));
    return arr;
  }, []);

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* dial ring */}
      <Torus args={[1.5, 0.08, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#E2DCC9" />
      </Torus>
      {/* fill arc */}
      <Torus ref={ringRef} args={[1.5, 0.11, 16, 64, Math.PI * (fill / 100) + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Torus>
      {/* needle */}
      <group ref={needleRef}>
        <Line points={points} color={color} lineWidth={4} />
        <mesh position={[needleLen * 0.5, 0, 0.05]}>
          <boxGeometry args={[needleLen, 0.06, 0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* hub */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 24]} />
        <meshStandardMaterial color="#2A2622" />
      </mesh>
    </group>
  );
}

interface Gauge3DProps {
  fill: number; // 0..100
  color?: string;
  className?: string;
}

/** Animated 3D health-score gauge. */
export function Gauge3D({ fill, color = '#2A5238', className }: Gauge3DProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 2.2, 4.2], fov: 40 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} color="#FFF3DD" />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#93B69E" />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <Dial fill={fill} color={color} />
        </Float>
      </Canvas>
    </div>
  );
}
