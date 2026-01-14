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
        "card-ios rounded-lg border border-transparent p-6",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: CardProps) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }: CardProps) => (
  <h3 className={cn("text-lg font-bold", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className,
  ...props
}: CardProps) => (
  <p className={cn("text-sm text-slate-500", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }: CardProps) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }: CardProps) => (
  <div className={cn("mt-4", className)} {...props}>
    {children}
  </div>
);
