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
        "card-ios rounded-3xl border border-transparent p-6",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
