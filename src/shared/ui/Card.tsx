import { cn } from "@shared/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/50 bg-white/80 backdrop-blur-xl p-6",
        "shadow-lg shadow-slate-200/30 transition-all duration-300",
        "hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200",
        "text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
