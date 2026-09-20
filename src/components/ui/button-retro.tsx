import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const retroButtonVariants = cva(
  "relative inline-flex items-center justify-center border border-charcoal/40 rounded-[4px] bg-[#101214] shadow-[1px_1px_2px_rgba(0,0,0,0.4)] cursor-pointer select-none transition-transform active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: [
          "text-[#17191C] font-semibold",
          "[--bg-color:#D4AF37]",
          "[--bg-color-active:#B3820B]",
          "[--shadow-light:#F1C442]",
          "[--shadow-dark:#8E6000]",
        ],
        gold: [
          "text-[#17191C] font-semibold",
          "[--bg-color:#D4AF37]",
          "[--bg-color-active:#B3820B]",
          "[--shadow-light:#F1C442]",
          "[--shadow-dark:#8E6000]",
        ],
        darkGray: [
          "text-ivory",
          "[--bg-color:#25282D]",
          "[--bg-color-active:#1C1F23]",
          "[--shadow-light:#3A3F47]",
          "[--shadow-dark:#141619]",
        ],
        gunmetal: [
          "text-ivory",
          "[--bg-color:#25282D]",
          "[--bg-color-active:#1C1F23]",
          "[--shadow-light:#3A3F47]",
          "[--shadow-dark:#141619]",
        ],
        white: [
          "text-[#17191C]",
          "[--bg-color:#FFFDF7]",
          "[--bg-color-active:#EFE9DB]",
          "[--shadow-light:#FFFFFF]",
          "[--shadow-dark:#D5CEBD]",
        ],
        lightGray: [
          "text-[#17191C]",
          "[--bg-color:#B8BCC2]",
          "[--bg-color-active:#9FA3A9]",
          "[--shadow-light:#DCE0E6]",
          "[--shadow-dark:#787D84]",
        ],
        copper: [
          "text-ivory",
          "[--bg-color:#B87333]",
          "[--bg-color-active:#9A5E26]",
          "[--shadow-light:#D78B45]",
          "[--shadow-dark:#6E421B]",
        ],
      },
      size: {
        default: "min-w-[5.5rem] text-xs",
        sm: "min-w-[4.2rem] text-[11px]",
        lg: "min-w-[7rem] text-sm",
        icon: "w-8 h-8 p-0",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const retroButtonInnerVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 w-full rounded-[3px] px-2.5 py-1.5",
    "uppercase tracking-wider text-center font-mono font-medium",
    "bg-[var(--bg-color)] transition-all duration-150",
    "shadow-[inset_1px_1px_1px_var(--shadow-light),inset_-1px_-1px_1px_var(--shadow-dark),1px_1px_2px_rgba(0,0,0,0.3)]",
    "active:bg-[var(--bg-color-active)]",
    "active:shadow-[inset_0_0_4px_rgba(0,0,0,0.5),inset_1px_1px_1px_transparent,inset_-1px_-1px_1px_transparent]",
  ]
);

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  children: React.ReactNode;
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(retroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className={retroButtonInnerVariants()}>{children}</span>
      </button>
    );
  }
);
RetroButton.displayName = "RetroButton";

export { RetroButton, retroButtonVariants };
