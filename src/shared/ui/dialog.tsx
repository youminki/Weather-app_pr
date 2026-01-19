import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@shared/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal> & {
  className?: string;
  children?: React.ReactNode;
}) => (
  <DialogPrimitive.Portal {...props}>
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  </DialogPrimitive.Portal>
);

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm", className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center")}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "relative w-11/12 sm:w-80 md:w-96 mx-4 bg-white rounded-lg shadow-xl p-6 aspect-square max-h-[90vh] overflow-auto flex flex-col",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </div>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props} />
);

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export const DialogClose = DialogPrimitive.Close;

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  row?: boolean;
};

export const DialogFooter = ({
  className,
  children,
  row = false,
  ...props
}: DialogFooterProps) => {
  if (row) {
    return (
      <div className={cn("mt-auto w-full flex gap-2", className)} {...props}>
        {React.Children.map(children, (child) => (
          <div className="flex-1">{child as React.ReactNode}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("mt-auto w-full flex flex-col gap-2", className)} {...props}>
      {React.Children.map(children, (child) => (
        <div className="w-full">{child as React.ReactNode}</div>
      ))}
    </div>
  );
};

export default Dialog;
