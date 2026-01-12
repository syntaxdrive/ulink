import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';

function ParticleCloud(props: any) {
    const ref = useRef<THREE.Points>(null!);

    const [sphere] = useState(() => {
        const coords = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = 1.2 * Math.cbrt(Math.random());
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            coords[i * 3] = x;
            coords[i * 3 + 1] = y;
            coords[i * 3 + 2] = z;
        }
        return coords;
    });

    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#312e81"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

export default function ThreeBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-[#FAFAFA]">
            <Canvas camera={{ position: [0, 0, 1.8] }}>
                <ParticleCloud />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAFAFA]/80 pointer-events-none"></div>
        </div>
    );
}
