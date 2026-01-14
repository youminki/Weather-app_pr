import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-500)]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary-500)] text-white shadow-sm hover:bg-[color:var(--primary-600)]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border-2 border-[color:var(--primary-400)] bg-white/80 backdrop-blur-xl hover:bg-[color:var(--primary-50)]",
        secondary:
          "bg-slate-100 text-[color:var(--text)] shadow-sm hover:bg-slate-200",
        ghost: "hover:bg-slate-100/80 hover:text-[color:var(--text)]",
        link: "text-[color:var(--primary-500)] underline-offset-4 hover:underline",
        glass:
          "bg-white/80 backdrop-blur-xl border border-slate-200/50 text-[color:var(--text)] hover:bg-white/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
