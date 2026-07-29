'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/seda.vert.glsl';
import fragmentShader from '@/shaders/seda.frag.glsl';

type Props = {
  cor?: string;
  amplitude?: number;
  frequencia?: number;
  brilho?: number;
  /** Reduz a malha em dispositivos modestos. */
  segmentos?: number;
};

/**
 * Lençol de seda que respira por trás do título do hero.
 * O deslocamento acontece na GPU; a CPU só atualiza 5 uniforms por frame.
 */
export function SilkCloth({
  cor = '#e4cfc2',
  amplitude = 0.14,
  frequencia = 1.6,
  brilho = 0.55,
  segmentos = 128,
}: Props) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const alvo = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: amplitude },
      uFrequency: { value: frequencia },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uCorBase: { value: new THREE.Color(cor) },
      uCorLuz: { value: new THREE.Color('#fff6ea') },
      uBrilho: { value: brilho },
    }),
    [cor, amplitude, frequencia, brilho],
  );

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    // lerp do cursor: o tecido responde com atraso, como pano real
    alvo.current.set(state.pointer.x, state.pointer.y);
    pointer.current.lerp(alvo.current, 0.045);
    uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <mesh ref={mesh} rotation={[-0.32, 0, 0.12]} scale={[viewport.width * 0.62, viewport.height * 0.72, 1]}>
      <planeGeometry args={[2.6, 2.6, segmentos, segmentos]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
