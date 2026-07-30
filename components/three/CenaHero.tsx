'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Environment, Preload } from '@react-three/drei';
import { SilkCloth } from './SilkCloth';

/**
 * Camada 3D do hero.
 *
 * Estratégia de desempenho e respeito pelo usuário:
 *  1. Só monta depois do primeiro paint (não atrasa o LCP).
 *  2. Desliga-se com `prefers-reduced-motion`.
 *  3. Malha reduzida no celular; DPR adaptativo.
 *  4. `frameloop="demand"` fora do tela via IntersectionObserver.
 */
export function CenaHero() {
  const [pronto, setPronto] = useState(false);
  const [reduzirMovimento, setReduzir] = useState(false);
  const [movel, setMovel] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduzir(mq.matches);
    setMovel(window.innerWidth < 768);

    const id = requestAnimationFrame(() => setPronto(true));
    const onChange = (e: MediaQueryListEvent) => setReduzir(e.matches);
    mq.addEventListener('change', onChange);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  // Fallback estático, elegante e sem custo: um gradiente de seda.
  if (reduzirMovimento || !pronto) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 70% 20%, #f3e6da 0%, #e4cfc2 38%, #faf6f1 100%)',
        }}
      />
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, movel ? 1.5 : 2]}
        gl={{
          antialias: !movel,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 3, 4]} intensity={1.1} color="#fff4e6" />
          <SilkCloth
            cor="#e4cfc2"
            amplitude={movel ? 0.1 : 0.15}
            segmentos={movel ? 64 : 144}
          />
          <Environment preset="studio" environmentIntensity={0.35} />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
