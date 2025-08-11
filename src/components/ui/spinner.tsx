import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        small: "h-4 w-4 border-2",
        medium: "h-8 w-8 border-4",
        large: "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

export function Spinner({ size, className }: SpinnerProps) {
  return <div className={cn(spinnerVariants({ size, className }))} role="status" />;
}
