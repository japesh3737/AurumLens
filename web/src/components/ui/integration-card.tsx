import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface VisualContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface IntegrationCardProps {
  title?: string;
  description?: string;
  onAuditClick?: () => void;
  className?: string;
}

interface IntegrationItem {
  id: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  path: string;
  delay: number;
}

// 6 Exchange & Sovereign Feeds
const integrations: IntegrationItem[] = [
  {
    id: "mcx",
    name: "MCX",
    sub: "BHAVCOPY",
    x: 100,
    y: 80,
    path: "M 270 205 V 95 Q 270 80 255 80 H 100",
    delay: 0.1,
  },
  {
    id: "rbi",
    name: "RBI",
    sub: "REF RATE",
    x: 370,
    y: 70,
    path: "M 294 205 V 85 Q 294 70 309 70 H 370",
    delay: 0.2,
  },
  {
    id: "ibja",
    name: "IBJA",
    sub: "SPOT 999",
    x: 140,
    y: 205,
    path: "M 250 205 H 140",
    delay: 0.3,
  },
  {
    id: "nse",
    name: "NSE",
    sub: "GOLD REF",
    x: 480,
    y: 205,
    path: "M 314 205 H 480",
    delay: 0.4,
  },
  {
    id: "lbma",
    name: "LBMA",
    sub: "PM FIX",
    x: 282,
    y: 350,
    path: "M 282 205 V 350",
    delay: 0.5,
  },
  {
    id: "wgc",
    name: "WGC",
    sub: "BULLION",
    x: 450,
    y: 330,
    path: "M 314 215 V 315 Q 314 330 329 330 H 450",
    delay: 0.6,
  },
];

const AnimatedPath = ({ d, id }: { d: string; id: string }) => {
  return (
    <>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        className="text-hair dark:text-gunmetal/80"
      />
      <motion.path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="2"
        fill="none"
        strokeDasharray="40 160"
        initial={{ strokeDashoffset: 200 }}
        animate={{ strokeDashoffset: -200 }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 1.5,
        }}
      />
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.85" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </>
  );
};

export function FeedConvergenceVisual() {
  const containerId = useId();

  return (
    <div className="relative h-full w-full select-none">
      {/* SVG Connecting Tracks */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 564 410"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {integrations.map((item) => (
          <AnimatedPath
            key={item.id}
            d={item.path}
            id={`${containerId}-${item.id}`}
          />
        ))}
      </svg>

      {/* Center Engine Mark */}
      <div className="absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-gold/40 bg-charcoal p-3 shadow-lg">
        <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/60 flex items-center justify-center mb-1">
            <span className="text-gold font-display font-bold text-base leading-none">AL</span>
          </div>
          <span className="font-mono text-[10px] font-bold tracking-wider text-gold">THE AURUMLENS</span>
          <span className="font-mono text-[8px] text-silver/80 uppercase">Engine Core</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-gold/30"
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Peripheral Feed Source Badges */}
      {integrations.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay, duration: 0.4 }}
          style={{
            left: `${(item.x / 564) * 100}%`,
            top: `${(item.y / 410) * 100}%`,
          }}
          className="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg border border-hair dark:border-hair/50 bg-ivory-card dark:bg-charcoal shadow-sm min-w-[4.8rem] text-center"
        >
          <span className="font-mono text-xs font-bold text-gold tracking-wider">{item.name}</span>
          <span className="font-mono text-[9px] text-ink-muted dark:text-silver/80 tracking-tight">{item.sub}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function VisualContainer({ children, className }: VisualContainerProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-564/340 w-full items-center justify-center overflow-hidden rounded-t-xl bg-ivory dark:bg-[#15171B] p-6 border-b border-hair dark:border-hair/40",
        className,
      )}
    >
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-25 dark:opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle, var(--gold) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title = "Multi-Feed Reconciliation & Data Provenance",
  description = "Every price observation is reconciled across official exchange bhavcopies, sovereign reference rates, and spot bullion fixes before entering the signal engine.",
  onAuditClick,
  className
}) => {
  return (
    <Card className={cn("mx-auto flex w-full flex-col rounded-xl overflow-hidden border border-hair dark:border-hair/50 bg-ivory-card dark:bg-gunmetal shadow-card", className)}>
      <VisualContainer>
        <FeedConvergenceVisual />
      </VisualContainer>

      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-ink dark:text-ivory">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-silver leading-relaxed">
            {description}
          </p>
        </div>
        {onAuditClick && (
          <button
            onClick={onAuditClick}
            className="btn-gold px-4 py-2 text-xs font-mono font-semibold tracking-wider shrink-0 cursor-pointer"
          >
            VIEW AUDIT TRAIL →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
