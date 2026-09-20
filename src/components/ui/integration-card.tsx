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

// 6 Exchange & Sovereign Feeds mapped precisely to 564 x 300 viewBox
const integrations: IntegrationItem[] = [
  {
    id: "mcx",
    name: "MCX",
    sub: "BHAVCOPY",
    x: 80,
    y: 55,
    path: "M 282 150 V 70 Q 282 55 260 55 H 80",
    delay: 0.1,
  },
  {
    id: "rbi",
    name: "RBI",
    sub: "REF RATE",
    x: 484,
    y: 55,
    path: "M 282 150 V 70 Q 282 55 304 55 H 484",
    delay: 0.2,
  },
  {
    id: "ibja",
    name: "IBJA",
    sub: "SPOT 999",
    x: 80,
    y: 150,
    path: "M 282 150 H 80",
    delay: 0.3,
  },
  {
    id: "nse",
    name: "NSE",
    sub: "GOLD REF",
    x: 484,
    y: 150,
    path: "M 282 150 H 484",
    delay: 0.4,
  },
  {
    id: "lbma",
    name: "LBMA",
    sub: "PM FIX",
    x: 80,
    y: 245,
    path: "M 282 150 V 230 Q 282 245 260 245 H 80",
    delay: 0.5,
  },
  {
    id: "wgc",
    name: "WGC",
    sub: "BULLION",
    x: 484,
    y: 245,
    path: "M 282 150 V 230 Q 282 245 304 245 H 484",
    delay: 0.6,
  },
];

const AnimatedPath = ({ d, id }: { d: string; id: string }) => {
  return (
    <>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-[#D8D1C2] dark:text-[#2C3038]"
      />
      <motion.path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="3"
        fill="none"
        strokeDasharray="60 140"
        initial={{ strokeDashoffset: 200 }}
        animate={{ strokeDashoffset: -200 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </>
  );
};

export function FeedConvergenceVisual() {
  const containerId = useId();

  return (
    <div className="relative w-full h-full min-h-[280px] select-none flex items-center justify-center">
      {/* SVG Connecting Tracks */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 564 300"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
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
      <div className="relative z-20 flex items-center justify-center rounded-xl border-2 border-[#D4AF37] dark:border-[#F1C442]/60 bg-[#17191C] px-5 py-3.5 shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-gold/25 border border-[#F1C442] flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(212,175,55,0.5)]">
            <span className="text-[#F1C442] font-display font-bold text-base leading-none">AL</span>
          </div>
          <span className="font-mono text-[11px] font-bold tracking-widest text-[#F1C442]">THE AURUMLENS</span>
          <span className="font-mono text-[8px] text-[#A6ACB5] uppercase tracking-wider mt-0.5">Ingestion & Audit Core</span>
        </div>
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-[#D4AF37]/50 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Peripheral Feed Source Badges */}
      {integrations.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay, duration: 0.4 }}
          style={{
            left: `${(item.x / 564) * 100}%`,
            top: `${(item.y / 300) * 100}%`,
          }}
          className="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg border-2 border-[#D4AF37]/40 dark:border-[#2C3038] bg-[#FFFFFF] dark:bg-[#1E2127] shadow-md min-w-[5.2rem] text-center"
        >
          <span className="font-mono text-xs font-bold text-[#8E6000] dark:text-[#F1C442] tracking-wider">{item.name}</span>
          <span className="font-mono text-[9px] text-[#525860] dark:text-[#A6ACB5] tracking-tight font-semibold">{item.sub}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function VisualContainer({ children, className }: VisualContainerProps) {
  return (
    <div
      className={cn(
        "relative flex h-72 sm:h-80 w-full items-center justify-center overflow-hidden rounded-t-xl bg-[#FAF7F0] dark:bg-[#15171B] p-6 border-b border-[#E2DCD0] dark:border-[#23262B]",
        className,
      )}
    >
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-25 dark:opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
          backgroundSize: "24px 24px",
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
    <Card className={cn("mx-auto flex w-full flex-col rounded-xl overflow-hidden border border-[#E2DCD0] dark:border-[#23262B] bg-[#FFFFFF] dark:bg-gunmetal shadow-card", className)}>
      <VisualContainer>
        <FeedConvergenceVisual />
      </VisualContainer>

      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#141618] dark:text-[#F7F4EC]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#525860] dark:text-[#A6ACB5] leading-relaxed">
            {description}
          </p>
        </div>
        {onAuditClick && (
          <button
            onClick={onAuditClick}
            className="btn-gold px-4 py-2 text-xs font-mono font-bold tracking-wider shrink-0 cursor-pointer shadow-sm"
          >
            VIEW AUDIT TRAIL →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
