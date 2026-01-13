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
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        "text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
