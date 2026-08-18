import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Octahedron, Line, OrbitControls, Torus, Trail } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Repo "core" — a faceted octahedron with a glowing inner node and a
 * translucent torus belt. Replaces the previous icosahedron/sphere look.
 * Orbiting commit-particle rings + a drifting cloud of small dust particles.
 * Mouse parallax tilt.
 */
function Core({ reduced }: { reduced: boolean }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const belt = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (outer.current) {
      outer.current.rotation.y += dt * 0.3;
      outer.current.rotation.x = Math.sin(performance.now() * 0.0003) * 0.15;
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.5;
      inner.current.rotation.z += dt * 0.25;
    }
    if (belt.current) belt.current.rotation.z += dt * 0.45;
  });

  return (
    <group>
      {/* faceted outer shell */}
      <Octahedron ref={outer} args={[1.4, 0]}>
        <meshStandardMaterial
          color="#2A5238"
          emissive="#3B6E4B"
          emissiveIntensity={0.4}
          roughness={0.35}
          metalness={0.25}
          flatShading
        />
      </Octahedron>
      {/* glowing inner node */}
      <Octahedron ref={inner} args={[0.55, 0]}>
        <meshStandardMaterial
          color="#EBA84A"
          emissive="#D98A2B"
          emissiveIntensity={1.4}
          roughness={0.2}
          flatShading
        />
      </Octahedron>
      {/* torus belt around the equator */}
      <Torus ref={belt} args={[1.75, 0.045, 8, 64]}>
        <meshStandardMaterial color="#93B69E" emissive="#5E8E6C" emissiveIntensity={0.35} />
      </Torus>
      {/* wireframe shell */}
      <Octahedron args={[1.65, 0]}>
        <meshBasicMaterial color="#93B69E" wireframe transparent opacity={0.2} />
      </Octahedron>
      {!reduced && <pointLight position={[0, 0, 0]} color="#F4C97A" intensity={5} distance={7} />}
    </group>
  );
}

type RingProps = { count: number; radius: number; speed: number; tilt: number; color: string; size?: number };

function Ring({ count, radius, speed, tilt, color, size = 0.06 }: RingProps) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius] as [number, number, number];
      }),
    [count, radius],
  );

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * speed;
  });

  return (
    <group ref={group} rotation={[tilt, 0, tilt * 0.4]}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[size, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      <Line
        points={positions.map((p) => new THREE.Vector3(...p))}
        color={color}
        lineWidth={0.5}
        transparent
        opacity={0.18}
      />
    </group>
  );
}

/**
 * A diffuse cloud of small dust particles drifting around the whole scene.
 * Uses an interleaved set of instanced spheres for performance.
 */
function DustCloud({ count, spread }: { count: number; spread: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        pos: [
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread * 0.6,
          (Math.random() - 0.5) * spread,
        ] as [number, number, number],
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        size: 0.015 + Math.random() * 0.025,
      })),
    [count, spread],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    seeds.forEach((s, i) => {
      const bob = Math.sin(t * s.speed + s.phase) * 0.25;
      dummy.position.set(s.pos[0], s.pos[1] + bob, s.pos[2]);
      dummy.scale.setScalar(s.size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#C9DDD0" emissive="#93B69E" emissiveIntensity={0.3} transparent opacity={0.6} />
    </instancedMesh>
  );
}

/** A single comet-like commit particle trailing around the core. */
function CommitTrail() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * 0.8) * 2.4,
        Math.sin(t * 0.6) * 0.8,
        Math.sin(t * 0.8) * 2.4,
      );
    }
  });
  return (
    <Trail width={1.2} length={5} color="#EBA84A" attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#F4C97A" emissive="#EBA84A" emissiveIntensity={1.5} />
      </mesh>
    </Trail>
  );
}

function Parallax() {
  const { camera } = useThree();
  useFrame((state) => {
    const x = state.pointer.x * 0.6;
    const y = state.pointer.y * 0.4;
    camera.position.x += (x - camera.position.x) * 0.04;
    camera.position.y += (y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

interface RepoCoreProps {
  reduced?: boolean;
  className?: string;
}

export function RepoCore({ reduced = false, className }: RepoCoreProps) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const pScale = reduced || mobile ? 0.5 : 1;
  const dustCount = Math.round((reduced || mobile ? 60 : 160) * pScale);

  // Camera sits further back with a narrower fov so the widest rings stay
  // comfortably inside the view frustum instead of clipping against the
  // edges of the canvas (previously the outer rings/dust exceeded the
  // visible frustum and were cut off on shorter/narrower containers).
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 8.5], fov: 38 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 3]} intensity={1.1} color="#FFF3DD" />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#93B69E" />
        <Parallax />
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.7}>
          <Core reduced={reduced} />
        </Float>
        {/* main orbiting rings — radii tuned to stay within the camera frustum */}
        <Ring count={Math.round(18 * pScale)} radius={1.9} speed={0.5} tilt={0.5} color="#3B6E4B" size={0.045} />
        <Ring count={Math.round(14 * pScale)} radius={2.35} speed={-0.35} tilt={1.1} color="#EBA84A" size={0.055} />
        <Ring count={Math.round(10 * pScale)} radius={2.75} speed={0.25} tilt={0.2} color="#93B69E" size={0.035} />
        {/* extra fine particle rings for density */}
        <Ring count={Math.round(28 * pScale)} radius={2.1} speed={-0.22} tilt={0.8} color="#5E8E6C" size={0.022} />
        <Ring count={Math.round(22 * pScale)} radius={2.55} speed={0.32} tilt={1.4} color="#F4C97A" size={0.02} />
        {/* diffuse dust cloud, kept tighter so it doesn't drift past the frame */}
        <DustCloud count={dustCount} spread={5.5} />
        {!reduced && !mobile && <CommitTrail />}
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
