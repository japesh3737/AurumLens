import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pickaxe, Compass, Radio, ChevronDown, Sparkles, Layers, ShieldCheck } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);

  // Trigger smooth scroll / transition into terminal
  const triggerEnterTerminal = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    // Allow smooth plunge / scroll-out animation before entering terminal
    setTimeout(() => {
      if (onEnterTerminal) {
        onEnterTerminal();
      } else if (onClose) {
        onClose();
      }
    }, 550);
  }, [onEnterTerminal, onClose]);

  // Scroll / Wheel / Touch / Keyboard event listeners for "Scroll to Terminal"
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Any downward scroll triggers smooth entry into terminal
      if (e.deltaY > 8) {
        triggerEnterTerminal();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = swipe up = scroll down
      if (deltaY > 25) {
        triggerEnterTerminal();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        triggerEnterTerminal();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerEnterTerminal, onClose]);

  // 3D Parallax Mouse Tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isExitingRef.current) return;
      const x = (window.innerWidth / 2 - e.pageX) / 28;
      const y = (window.innerHeight / 2 - e.pageY) / 28;

      // Rotate the 3D Mining Land Terrain with parallax
      canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-25 + x / 2}deg)`;
    };

    // Entrance Animation
    canvas.style.opacity = '0';
    canvas.style.transform = 'rotateX(85deg) rotateZ(-5deg) scale(0.88)';

    const timeout = setTimeout(() => {
      canvas.style.transition = 'transform 2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.6s ease';
      canvas.style.opacity = '1';
      canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
    }, 120);

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
          --halide-bg: #111315;
          --halide-silver: #F7F4EC;
          --halide-accent: #C9A227;
          --halide-gold-glow: rgba(255, 215, 0, 0.85);
          --halide-copper: #B87333;
        }

        .halide-body {
          background: radial-gradient(circle at 50% 35%, #1d2025 0%, #121417 65%, #0a0b0d 100%);
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
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
        }

        .halide-body.is-exiting {
          transform: translateY(-100%);
          opacity: 0.05;
        }

        .halide-viewport {
          perspective: 2200px;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          pointer-events: none;
        }

        .halide-canvas-3d {
          position: relative;
          width: min(960px, 92vw);
          height: min(620px, 65vh);
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .halide-body.is-exiting .halide-canvas-3d {
          transform: rotateX(85deg) rotateZ(-10deg) translateZ(800px) scale(2) !important;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* 3D Depth Layers inside preserve-3d */
        .mine-layer-base {
          position: absolute;
          inset: 0;
          transform: translateZ(0px);
        }

        .mine-layer-veins {
          position: absolute;
          inset: 0;
          transform: translateZ(28px);
          pointer-events: none;
        }

        .mine-layer-contours {
          position: absolute;
          inset: 0;
          transform: translateZ(52px);
          pointer-events: none;
        }

        .mine-layer-beacons {
          position: absolute;
          inset: 0;
          transform: translateZ(85px);
          pointer-events: none;
        }

        .mine-layer-hud {
          position: absolute;
          inset: 0;
          transform: translateZ(120px);
          pointer-events: none;
        }

        /* Animated Vein Streams */
        @keyframes veinStream {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }

        .animate-vein-stream {
          stroke-dasharray: 28 160;
          animation: veinStream 3.2s linear infinite;
        }

        .animate-vein-stream-fast {
          stroke-dasharray: 20 120;
          animation: veinStream 2s linear infinite;
        }

        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 35px rgba(255, 215, 0, 0.9)); }
        }

        .animate-core-pulse {
          animation: corePulse 3s ease-in-out infinite;
          transform-origin: 500px 330px;
        }

        @keyframes radarSweep {
          0% { transform: translateY(-300px); opacity: 0; }
          20% { opacity: 0.45; }
          80% { opacity: 0.45; }
          100% { transform: translateY(300px); opacity: 0; }
        }

        .animate-radar-sweep {
          animation: radarSweep 4.5s linear infinite;
        }

        @keyframes beaconPing {
          0% { r: 6px; opacity: 0.9; }
          100% { r: 28px; opacity: 0; }
        }

        .animate-beacon-ping {
          animation: beaconPing 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }

        @keyframes floatHud {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .animate-float-hud {
          animation: floatHud 4s ease-in-out infinite;
        }

        @keyframes scrollPromptBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(5px); }
          60% { transform: translateY(2.5px); }
        }

        .animate-scroll-prompt {
          animation: scrollPromptBounce 2s infinite;
        }

        /* Hero UI Grid */
        .halide-interface-grid {
          position: fixed;
          inset: 0;
          padding: 2.5rem 3.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          z-index: 20;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .halide-interface-grid {
            padding: 1.25rem;
          }
        }

        .halide-hero-title {
          grid-column: 1 / -1;
          align-self: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2.4rem, 6.5vw, 6rem);
          font-weight: 700;
          line-height: 0.96;
          letter-spacing: -0.025em;
          color: #FFFDF7;
          text-shadow: 0 6px 30px rgba(0, 0, 0, 0.85);
          user-select: none;
        }

        .halide-hero-title span {
          color: var(--halide-accent);
          font-style: italic;
        }

        .halide-cta-button {
          pointer-events: auto;
          background: linear-gradient(135deg, #E5C158 0%, #C9A227 60%, #A9840F 100%);
          color: #111315;
          padding: 0.85rem 2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 4px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 25px rgba(201, 162, 39, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .halide-cta-button:hover {
          background: linear-gradient(135deg, #F5D77F 0%, #D4AF37 60%, #B88E14 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201, 162, 39, 0.55);
        }

        .halide-scroll-cta {
          pointer-events: auto;
          background: rgba(23, 25, 28, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(201, 162, 39, 0.4);
          padding: 0.65rem 1.6rem;
          border-radius: 9999px;
          transition: all 0.25s ease;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .halide-scroll-cta:hover {
          border-color: rgba(201, 162, 39, 0.9);
          background: rgba(37, 40, 45, 0.95);
          box-shadow: 0 0 25px rgba(201, 162, 39, 0.45);
          transform: translateY(2px);
        }
      `}</style>

      <div ref={containerRef} className={`halide-body ${isExiting ? 'is-exiting' : ''}`}>
        {/* Subdued background dust texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Floating Top & Bottom UI Layer */}
        <div className="halide-interface-grid">
          {/* Top-Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center font-display font-bold text-charcoal shadow-lg shadow-gold/20">
              AL
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-gold flex items-center gap-2">
                <span>THE_AURUMLENS_CORE</span>
                <span className="w-2 h-2 rounded-full bg-termgreen animate-pulse" />
              </div>
              <div className="text-[10px] text-silver/70 font-mono tracking-wide">
                MCX BULLION GEOLOGICAL RELATIVE VALUE
              </div>
            </div>
          </div>

          {/* Top-Right Telemetry */}
          <div className="text-right font-mono text-[11px] text-gold/90 space-y-0.5">
            <div className="flex items-center justify-end gap-2 text-silver/80">
              <Compass className="w-3.5 h-3.5 text-gold" />
              <span>PIT SECTOR: 22°18&apos;N · 74°54&apos;E</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-gold">
              <ShieldCheck className="w-3.5 h-3.5 text-termgreen" />
              <span>STATUS: ZERO LOOK-AHEAD ASSAY VERIFIED</span>
            </div>
          </div>

          {/* Center Dramatic Title */}
          <h1 className="halide-hero-title">
            PRICE DISCOVERY,<br />
            <span>RECONSTRUCTED</span>
          </h1>

          {/* Bottom Bar: Bullion Contracts, Scroll Hint, Enter Terminal */}
          <div className="col-span-full flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Bullion Contracts Badges */}
            <div className="font-mono text-xs text-silver/80 space-y-1 text-center md:text-left">
              <div className="text-gold font-semibold flex items-center justify-center md:justify-start gap-1.5">
                <Pickaxe className="w-3.5 h-3.5 text-gold" />
                <span>[ 100% REAL MCX BHAVCOPY ORE-STREAM ]</span>
              </div>
              <div className="text-[11px] text-silver/60 tracking-wider">
                GOLDM (100g) · GOLDTEN (10g) · GOLDGUINEA (8g) · GOLDPETAL (1g)
              </div>
            </div>

            {/* Center: Prominent "Scroll to Terminal" Interactive Control */}
            <button
              onClick={triggerEnterTerminal}
              className="halide-scroll-cta group flex items-center gap-2.5"
              title="Scroll down or click to enter the terminal"
            >
              <div className="w-4 h-6 rounded-full border border-gold/50 flex items-start justify-center p-0.5 group-hover:border-gold transition-colors">
                <div className="w-1 h-2 rounded-full bg-gold animate-scroll-prompt" />
              </div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-silver group-hover:text-gold transition-colors">
                SCROLL TO ENTER TERMINAL
              </span>
              <ChevronDown className="w-4 h-4 text-gold group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Right: Enter Terminal Button & Close Button */}
            <div className="flex items-center gap-3 pointer-events-auto">
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded text-xs font-mono text-silver hover:text-white transition-colors cursor-pointer"
                >
                  RETURN
                </button>
              )}
              <button
                onClick={triggerEnterTerminal}
                className="halide-cta-button"
              >
                <span>ENTER TERMINAL</span>
                <span className="text-sm font-bold">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Viewport: Open-Pit Gold Mining Terrain Land */}
        <div className="halide-viewport">
          <div className="halide-canvas-3d" ref={canvasRef}>

            {/* LAYER 0: Bedrock Strata, Terraced Benches, Open Pit Land Relief */}
            <div className="mine-layer-base">
              <svg
                viewBox="0 0 1000 650"
                className="w-full h-full filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Bedrock Surface Gradient */}
                  <linearGradient id="bedrockRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#25282D" />
                    <stop offset="40%" stopColor="#1C1E23" />
                    <stop offset="80%" stopColor="#141619" />
                    <stop offset="100%" stopColor="#0F1012" />
                  </linearGradient>

                  {/* Excavation Bench Terraces */}
                  <linearGradient id="bench1Cut" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2D323A" />
                    <stop offset="40%" stopColor="#22252B" />
                    <stop offset="100%" stopColor="#17191D" />
                  </linearGradient>

                  <linearGradient id="bench2Cut" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#202328" />
                    <stop offset="50%" stopColor="#181A1E" />
                    <stop offset="100%" stopColor="#121316" />
                  </linearGradient>

                  <linearGradient id="bench3Cut" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#191B20" />
                    <stop offset="100%" stopColor="#0D0E10" />
                  </linearGradient>

                  {/* Deep Pit Core Molten Gold Glow */}
                  <radialGradient id="pitCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF2A0" stopOpacity="1" />
                    <stop offset="25%" stopColor="#FFD700" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#C9A227" stopOpacity="0.75" />
                    <stop offset="80%" stopColor="#B87333" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#121316" stopOpacity="0" />
                  </radialGradient>

                  {/* Gold Glow Filter */}
                  <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="intenseGoldGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Bench Drop Shadow */}
                  <filter id="benchShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#050608" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Base Surface Plateau / Craggy Mine Rim */}
                <path
                  d="M 30,30 
                     L 970,30 
                     Q 985,320 970,620 
                     L 30,620 
                     Q 15,320 30,30 Z"
                  fill="url(#bedrockRim)"
                  stroke="#3A3E47"
                  strokeWidth="2"
                />

                {/* Perimeter Land Strata Fault Lines */}
                <g opacity="0.3" stroke="#C9A227" strokeWidth="0.75" strokeDasharray="5 15">
                  <path d="M 40,80 Q 250,50 480,90 T 960,70" fill="none" />
                  <path d="M 40,570 Q 300,600 600,560 T 960,580" fill="none" />
                  <path d="M 80,40 Q 50,300 70,600" fill="none" />
                  <path d="M 930,40 Q 950,300 920,600" fill="none" />
                </g>

                {/* Geological Grid Matrix Over Bedrock */}
                <g opacity="0.12" stroke="#FFFDF7" strokeWidth="0.5">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`grid-h-${i}`} x1="50" y1={60 + i * 50} x2="950" y2={60 + i * 50} />
                  ))}
                  {Array.from({ length: 19 }).map((_, i) => (
                    <line key={`grid-v-${i}`} x1={60 + i * 48} y1="40" x2={60 + i * 48} y2="610" />
                  ))}
                </g>

                {/* --- OPEN-PIT EXCAVATION STEPPED BENCHES --- */}

                {/* BENCH 1: Upper Excavation Terrace (-90m Level) */}
                <path
                  d="M 90,110 
                     Q 500,60 910,110 
                     Q 950,325 900,535 
                     Q 500,590 100,535 
                     Q 50,325 90,110 Z"
                  fill="url(#bench1Cut)"
                  stroke="#434852"
                  strokeWidth="2.5"
                  filter="url(#benchShadow)"
                />

                {/* Bench 1 Rock Face Hatching & Strata Lines */}
                <g opacity="0.4" stroke="#25282D" strokeWidth="1.5">
                  <path d="M 120,130 Q 500,85 880,130" fill="none" />
                  <path d="M 110,515 Q 500,565 880,515" fill="none" />
                  <path d="M 75,325 Q 500,325 925,325" fill="none" strokeDasharray="4 12" stroke="#B87333" opacity="0.3" />
                </g>

                {/* BENCH 2: Mid Ore Extraction Cut (-220m Level) */}
                <path
                  d="M 190,175 
                     Q 500,135 810,175 
                     Q 850,325 800,470 
                     Q 500,515 200,470 
                     Q 150,325 190,175 Z"
                  fill="url(#bench2Cut)"
                  stroke="#4E5460"
                  strokeWidth="2.5"
                  filter="url(#benchShadow)"
                />

                {/* BENCH 3: Deep Lode Extraction Cut (-360m Level) */}
                <path
                  d="M 285,230 
                     Q 500,195 715,230 
                     Q 755,325 710,420 
                     Q 500,455 290,420 
                     Q 245,325 285,230 Z"
                  fill="url(#bench3Cut)"
                  stroke="#5F6775"
                  strokeWidth="2.5"
                  filter="url(#benchShadow)"
                />

                {/* BENCH 4: Sub-Basin Terrace (-440m Level) */}
                <path
                  d="M 370,270 
                     Q 500,245 630,270 
                     Q 665,325 625,380 
                     Q 500,405 375,380 
                     Q 335,325 370,270 Z"
                  fill="#0D0E10"
                  stroke="#C9A227"
                  strokeWidth="1.8"
                  strokeDasharray="12 4"
                  filter="url(#benchShadow)"
                />

                {/* CENTRAL SUMP CORE: Active Molten Gold Extraction Pit (-500m) */}
                <ellipse
                  cx="500"
                  cy="330"
                  rx="105"
                  ry="52"
                  fill="url(#pitCoreGlow)"
                  filter="url(#intenseGoldGlow)"
                  className="animate-core-pulse"
                />

                {/* Pit Sump Deep Chasm Basin */}
                <ellipse
                  cx="500"
                  cy="330"
                  rx="48"
                  ry="24"
                  fill="#FFFDF7"
                  filter="url(#goldGlow)"
                />

                {/* Spiraling Open-Pit Haul Road Ramp */}
                <path
                  d="M 100,115 
                     Q 500,65 890,120 
                     Q 930,325 810,460 
                     Q 500,505 210,455 
                     Q 160,325 295,240 
                     Q 500,205 700,245 
                     Q 740,325 620,375 
                     Q 500,395 385,370 
                     Q 355,325 435,310 
                     Q 500,300 500,330"
                  fill="none"
                  stroke="#2E2820"
                  strokeWidth="14"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <path
                  d="M 100,115 
                     Q 500,65 890,120 
                     Q 930,325 810,460 
                     Q 500,505 210,455 
                     Q 160,325 295,240 
                     Q 500,205 700,245 
                     Q 740,325 620,375 
                     Q 500,395 385,370 
                     Q 355,325 435,310 
                     Q 500,300 500,330"
                  fill="none"
                  stroke="#C9A227"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  opacity="0.6"
                />

                {/* Ore Haulage Vehicles Traveling the Road (Animated Beacons) */}
                <circle cx="260" cy="460" r="3.5" fill="#FFD700">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="750" cy="300" r="3.5" fill="#FFD700">
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="560" cy="225" r="3.5" fill="#FFD700">
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>

            {/* LAYER 1: Glowing Gold Veins & Precious Metal Lodes (translateZ 28px) */}
            <div className="mine-layer-veins">
              <svg
                viewBox="0 0 1000 650"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* --- MOTHER LODE VEIN ALPHA: Runs NW diagonally into the Pit Core --- */}
                <g filter="url(#goldGlow)">
                  {/* Vein Base Glow */}
                  <path
                    d="M 60,70 Q 180,140 260,190 T 360,260 T 450,300 T 500,330"
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="7"
                    opacity="0.5"
                    strokeLinecap="round"
                  />
                  {/* Vein Core Seam */}
                  <path
                    d="M 60,70 Q 180,140 260,190 T 360,260 T 450,300 T 500,330"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Ultra-Bright Vein Filament */}
                  <path
                    d="M 60,70 Q 180,140 260,190 T 360,260 T 450,300 T 500,330"
                    fill="none"
                    stroke="#FFFDF7"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {/* Animated Traveling Gold Pulse */}
                  <path
                    d="M 60,70 Q 180,140 260,190 T 360,260 T 450,300 T 500,330"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className="animate-vein-stream"
                  />
                </g>

                {/* Vein Alpha Branchlets (Quartz Splices) */}
                <g stroke="#E5C158" strokeWidth="1.5" fill="none" opacity="0.85">
                  <path d="M 180,140 Q 240,110 310,130" />
                  <path d="M 260,190 Q 290,230 330,240" />
                  <path d="M 360,260 Q 350,320 380,360" />
                </g>

                {/* --- EASTERN AU-AG VEIN BETA: Northeast into the Pit --- */}
                <g filter="url(#goldGlow)">
                  <path
                    d="M 940,90 Q 820,150 740,210 T 630,280 T 550,315 T 500,330"
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="6"
                    opacity="0.5"
                  />
                  <path
                    d="M 940,90 Q 820,150 740,210 T 630,280 T 550,315 T 500,330"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                  />
                  <path
                    d="M 940,90 Q 820,150 740,210 T 630,280 T 550,315 T 500,330"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="2.5"
                    className="animate-vein-stream-fast"
                  />
                </g>

                {/* Beta Branchlets */}
                <g stroke="#B8BCC2" strokeWidth="1.4" fill="none" opacity="0.8">
                  <path d="M 820,150 Q 870,220 900,240" />
                  <path d="M 740,210 Q 770,260 820,280" />
                </g>

                {/* --- SOUTHERN COPPER-GOLD VEIN GAMMA: South benches into the Pit --- */}
                <g filter="url(#goldGlow)">
                  <path
                    d="M 220,600 Q 320,530 400,460 T 470,380 T 500,330"
                    fill="none"
                    stroke="#B87333"
                    strokeWidth="5"
                    opacity="0.6"
                  />
                  <path
                    d="M 220,600 Q 320,530 400,460 T 470,380 T 500,330"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 220,600 Q 320,530 400,460 T 470,380 T 500,330"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="2"
                    className="animate-vein-stream"
                  />
                </g>

                {/* --- SOUTHEAST PYRITE REEF DELTA --- */}
                <g filter="url(#goldGlow)">
                  <path
                    d="M 860,570 Q 760,490 670,430 T 580,365 T 500,330"
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="5"
                    opacity="0.5"
                  />
                  <path
                    d="M 860,570 Q 760,490 670,430 T 580,365 T 500,330"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                  />
                </g>

                {/* Sparkling Raw Gold Crystals & High-Grade Nuggets */}
                {[
                  { x: 260, y: 190, r: 4.5 },
                  { x: 360, y: 260, r: 5 },
                  { x: 450, y: 300, r: 5.5 },
                  { x: 740, y: 210, r: 4 },
                  { x: 630, y: 280, r: 4.5 },
                  { x: 400, y: 460, r: 4 },
                  { x: 470, y: 380, r: 5 },
                  { x: 670, y: 430, r: 4 },
                ].map((nugget, idx) => (
                  <g key={`nugget-${idx}`} filter="url(#goldGlow)">
                    <circle cx={nugget.x} cy={nugget.y} r={nugget.r} fill="#FFFDF7">
                      <animate
                        attributeName="transform"
                        type="scale"
                        values="1;1.4;1"
                        dur={`${2 + (idx % 3) * 0.7}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx={nugget.x} cy={nugget.y} r={nugget.r * 2} fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.6">
                      <animate
                        attributeName="r"
                        values={`${nugget.r};${nugget.r * 3}`}
                        dur={`${2 + (idx % 3) * 0.7}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0"
                        dur={`${2 + (idx % 3) * 0.7}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                ))}
              </svg>
            </div>

            {/* LAYER 2: Topographic Contour Grids, Lidar Scanline & Depth Annotations (translateZ 52px) */}
            <div className="mine-layer-contours">
              <svg
                viewBox="0 0 1000 650"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Elevation Iso-Contour Lines */}
                <g fill="none" stroke="#C9A227" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.45">
                  <path d="M 140,140 Q 500,95 860,140 Q 900,325 850,505 Q 500,550 150,505 Q 100,325 140,140 Z" />
                  <path d="M 230,200 Q 500,165 770,200 Q 805,325 765,445 Q 500,485 240,445 Q 195,325 230,200 Z" />
                  <path d="M 330,250 Q 500,225 670,250 Q 700,325 665,400 Q 500,430 335,400 Q 295,325 330,250 Z" />
                </g>

                {/* Topographic Elevation Tags Along Contours */}
                <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#C9A227" opacity="0.85">
                  <text x="500" y="85" textAnchor="middle">EL. +480m [SURFACE RIM]</text>
                  <text x="500" y="155" textAnchor="middle">BENCH 01 // EL. +360m [UPPER TERRACE]</text>
                  <text x="500" y="215" textAnchor="middle">BENCH 02 // EL. +240m [AU-QUARTZ HORIZON]</text>
                  <text x="500" y="260" textAnchor="middle">BENCH 03 // EL. +120m [HIGH GRADE ORE]</text>
                  <text x="500" y="395" textAnchor="middle">SUMP CORE // EL. -500m [999.9 BULLION]</text>
                </g>

                {/* Lidar Radar Sweep Line (Sweeps across terrain) */}
                <line
                  x1="60"
                  y1="325"
                  x2="940"
                  y2="325"
                  stroke="url(#bedrockRim)"
                  strokeWidth="60"
                  strokeOpacity="0.08"
                  className="animate-radar-sweep pointer-events-none"
                />
              </svg>
            </div>

            {/* LAYER 3: Active Drill Rigs, Survey Laser Pillars & Beacons (translateZ 85px) */}
            <div className="mine-layer-beacons">
              <svg
                viewBox="0 0 1000 650"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Vertical Survey Laser Gradients */}
                  <linearGradient id="laserBeam1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                    <stop offset="60%" stopColor="#C9A227" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="laserBeam2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#2E8B57" stopOpacity="1" />
                    <stop offset="70%" stopColor="#10B981" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* DRILL RIG ALPHA (Northwest Bench) */}
                <g>
                  {/* Ground Ring Target */}
                  <circle cx="310" cy="220" r="14" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="310" cy="220" r="4" fill="#FFD700" />
                  <circle cx="310" cy="220" r="14" fill="none" stroke="#FFD700" strokeWidth="1" className="animate-beacon-ping" />
                  {/* Vertical Laser Projection Beam */}
                  <line x1="310" y1="220" x2="310" y2="130" stroke="url(#laserBeam1)" strokeWidth="2.5" />
                  {/* Top Crosshair Pin */}
                  <circle cx="310" cy="130" r="3.5" fill="#FFFDF7" filter="url(#goldGlow)" />
                </g>

                {/* DRILL RIG BETA (Eastern Ridge) */}
                <g>
                  <circle cx="730" cy="230" r="14" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="730" cy="230" r="4" fill="#FFD700" />
                  <circle cx="730" cy="230" r="14" fill="none" stroke="#FFD700" strokeWidth="1" className="animate-beacon-ping" />
                  <line x1="730" y1="230" x2="730" y2="140" stroke="url(#laserBeam1)" strokeWidth="2.5" />
                  <circle cx="730" cy="140" r="3.5" fill="#FFFDF7" filter="url(#goldGlow)" />
                </g>

                {/* ASSAY SENSOR GAMMA (Southern Pit Wall) */}
                <g>
                  <circle cx="420" cy="450" r="12" fill="none" stroke="#2E8B57" strokeWidth="1.5" strokeDasharray="2 2" />
                  <circle cx="420" cy="450" r="3.5" fill="#10B981" />
                  <line x1="420" y1="450" x2="420" y2="370" stroke="url(#laserBeam2)" strokeWidth="2" />
                  <circle cx="420" cy="370" r="3" fill="#10B981" />
                </g>

                {/* PIT SUMP CORE DRILL (Central Chamber) */}
                <g>
                  <circle cx="500" cy="330" r="28" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="6 4" className="animate-spin" style={{ animationDuration: '18s' }} />
                  <circle cx="500" cy="330" r="38" fill="none" stroke="#FFD700" strokeWidth="1" className="animate-beacon-ping" />
                  <line x1="500" y1="330" x2="500" y2="210" stroke="url(#laserBeam1)" strokeWidth="3" />
                  <circle cx="500" cy="210" r="5" fill="#FFFDF7" filter="url(#intenseGoldGlow)" />
                </g>
              </svg>
            </div>

            {/* LAYER 4: Floating 3D Holographic Telemetry Cards & Markers (translateZ 120px) */}
            <div className="mine-layer-hud">
              {/* Badge 1: Drill Rig 01 Assay Telemetry - Northwest Flank */}
              <div
                className="absolute left-[6%] top-[14%] animate-float-hud"
                style={{ transform: 'translate3d(0, 0, 40px)' }}
              >
                <div className="bg-charcoal/95 border border-gold/50 backdrop-blur-md rounded px-3 py-2 text-left shadow-2xl shadow-black/90 font-mono">
                  <div className="flex items-center gap-1.5 text-[10px] text-gold font-bold">
                    <Radio className="w-3 h-3 text-gold animate-pulse" />
                    <span>DRILL_BORE_ALPHA</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    GRADE: 18.4 g/t Au
                  </div>
                  <div className="text-[9px] text-silver/70">
                    DEPTH: -240m // QUARTZ LODE
                  </div>
                </div>
              </div>

              {/* Badge 2: Drill Rig 02 Telemetry - Northeast Flank */}
              <div
                className="absolute right-[6%] top-[14%] animate-float-hud"
                style={{ transform: 'translate3d(0, 0, 40px)', animationDelay: '1.2s' }}
              >
                <div className="bg-charcoal/95 border border-gold/50 backdrop-blur-md rounded px-3 py-2 text-left shadow-2xl shadow-black/90 font-mono">
                  <div className="flex items-center gap-1.5 text-[10px] text-gold font-bold">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span>BORE_BETA: AU-AG</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    PURITY: 999.9 FINE GOLD
                  </div>
                  <div className="text-[9px] text-silver/70">
                    RECOVERY RATE: 99.4%
                  </div>
                </div>
              </div>

              {/* Badge 3: Central Sump Ore Recovery - Anchored Above Deep Pit Basin */}
              <div
                className="absolute left-[34%] top-[10%] animate-float-hud"
                style={{ transform: 'translate3d(0, 0, 50px)', animationDelay: '0.6s' }}
              >
                <div className="bg-charcoal/95 border-2 border-gold/70 backdrop-blur-md rounded px-4 py-2 shadow-2xl shadow-gold/25 font-mono text-center">
                  <div className="text-[10px] text-gold font-bold tracking-wider flex items-center justify-center gap-1.5">
                    <Layers className="w-3 h-3 text-gold" />
                    <span>MCX DEEP SUMP EXTRACTION</span>
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide mt-0.5">
                    CORE ORE CHAMBER -500M
                  </div>
                  <div className="text-[9px] text-termgreen font-semibold">
                    100% REAL BHAVCOPY STREAM
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default HalideTopoHero;
