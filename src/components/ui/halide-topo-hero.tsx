import React, { useEffect, useRef } from 'react';

export interface HalideTopoHeroProps {
  onEnterTerminal?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const HalideTopoHero: React.FC<HalideTopoHeroProps> = ({
  onEnterTerminal,
  onClose,
  showCloseButton = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
      return;
    }

    // Mouse Parallax Logic
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 25;
      const y = (window.innerHeight / 2 - e.pageY) / 25;

      // Rotate the 3D Canvas
      canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-25 + x / 2}deg)`;

      // Apply depth shift to layers
      layersRef.current.forEach((layer, index) => {
        if (!layer) return;
        const depth = (index + 1) * 15;
        const moveX = x * (index + 1) * 0.2;
        const moveY = y * (index + 1) * 0.2;
        layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
      });
    };

    // Entrance Animation
    canvas.style.opacity = '0';
    canvas.style.transform = 'rotateX(90deg) rotateZ(0deg) scale(0.8)';

    const timeout = setTimeout(() => {
      canvas.style.transition = 'all 2.2s cubic-bezier(0.16, 1, 0.3, 1)';
      canvas.style.opacity = '1';
      canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
    }, 200);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --halide-bg: #17191C;
          --halide-silver: #F7F4EC;
          --halide-accent: #C9A227;
          --halide-grain-opacity: 0.12;
        }

        .halide-body {
          background-color: var(--halide-bg);
          color: var(--halide-silver);
          font-family: 'Inter', -apple-system, sans-serif;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .halide-grain {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 100;
          opacity: var(--halide-grain-opacity);
        }

        .halide-viewport {
          perspective: 2000px;
          width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        .halide-canvas-3d {
          position: relative;
          width: 800px; height: 500px;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .halide-layer {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(201, 162, 39, 0.15);
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
          border-radius: 8px;
        }

        .halide-layer-1 {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.18) 0%, rgba(37, 40, 45, 0.95) 60%);
          filter: contrast(1.1) brightness(0.6);
        }
        .halide-layer-2 {
          background: linear-gradient(45deg, rgba(184, 115, 51, 0.15) 0%, rgba(23, 25, 28, 0.8) 70%);
          filter: contrast(1.2) brightness(0.8);
          opacity: 0.7;
          mix-blend-mode: screen;
        }
        .halide-layer-3 {
          background: radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.25), transparent 70%),
                      linear-gradient(180deg, transparent 40%, rgba(18, 20, 23, 0.9) 100%);
          filter: contrast(1.3) brightness(0.9);
          opacity: 0.5;
          mix-blend-mode: overlay;
        }

        .halide-contours {
          position: absolute;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
          background-image: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(201, 162, 39, 0.08) 41px, transparent 42px);
          transform: translateZ(120px);
          pointer-events: none;
        }

        .halide-interface-grid {
          position: fixed;
          inset: 0;
          padding: 3rem 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          z-index: 10;
          pointer-events: none;
        }

        .halide-hero-title {
          grid-column: 1 / -1;
          align-self: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2.8rem, 7vw, 6.5rem);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #FFFDF7;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        }

        .halide-hero-title span {
          color: var(--halide-accent);
          font-style: italic;
        }

        .halide-cta-button {
          pointer-events: auto;
          background: var(--halide-accent);
          color: #17191C;
          padding: 0.9rem 2.2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 4px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
          border: none;
          cursor: pointer;
        }

        .halide-cta-button:hover {
          background: #A9840F;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(201, 162, 39, 0.45);
        }

        .halide-scroll-hint {
          position: absolute;
          bottom: 2rem; left: 50%;
          width: 1px; height: 50px;
          background: linear-gradient(to bottom, var(--halide-accent), transparent);
          animation: halide-flow 2s infinite ease-in-out;
        }

        @keyframes halide-flow {
          0%, 100% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
        }
      `}</style>

      <div className="halide-body">
        {/* SVG Filter for Grain */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="halide-grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>

        <div className="halide-grain" style={{ filter: 'url(#halide-grain-filter)' }} />

        <div className="halide-interface-grid">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-display font-bold text-charcoal">
              AL
            </div>
            <div>
              <div className="text-xs font-mono font-semibold tracking-wider text-gold">THE_AURUMLENS_CORE</div>
              <div className="text-[10px] text-silver/70 font-mono">MCX BULLION RELATIVE VALUE</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--halide-accent)', fontSize: '0.72rem' }}>
            <div>EXCHANGE: MCX INDIA</div>
            <div>STATUS: ZERO LOOK-AHEAD VERIFIED</div>
          </div>

          <h1 className="halide-hero-title">
            PRICE DISCOVERY,<br />
            <span>RECONSTRUCTED</span>
          </h1>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#B8BCC2' }}>
              <p className="text-gold font-semibold">[ 100% REAL BHAVCOPY DATA ]</p>
              <p>GOLDM · GOLDTEN · GOLDGUINEA · GOLDPETAL</p>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto">
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded text-xs font-mono text-silver hover:text-white transition-colors cursor-pointer"
                >
                  RETURN
                </button>
              )}
              <button
                onClick={() => onEnterTerminal ? onEnterTerminal() : (onClose ? onClose() : null)}
                className="halide-cta-button"
              >
                ENTER TERMINAL →
              </button>
            </div>
          </div>
        </div>

        <div className="halide-viewport">
          <div className="halide-canvas-3d" ref={canvasRef}>
            <div className="halide-layer halide-layer-1" ref={(el) => (layersRef.current[0] = el!)} />
            <div className="halide-layer halide-layer-2" ref={(el) => (layersRef.current[1] = el!)} />
            <div className="halide-layer halide-layer-3" ref={(el) => (layersRef.current[2] = el!)} />
            <div className="halide-contours" />
          </div>
        </div>

        <div className="halide-scroll-hint" />
      </div>
    </>
  );
};

export default HalideTopoHero;
