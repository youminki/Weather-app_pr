import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[17px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/40",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/40",
        outline:
          "border-2 border-slate-200 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/30 hover:bg-slate-50 hover:border-slate-300",
        secondary:
          "bg-slate-100 text-slate-900 shadow-md shadow-slate-200/50 hover:bg-slate-200",
        ghost: "hover:bg-slate-100/80 hover:text-slate-900",
        link: "text-blue-500 underline-offset-4 hover:underline",
        glass:
          "bg-white/80 backdrop-blur-xl border border-slate-200/50 text-slate-900 hover:bg-white/90 shadow-lg shadow-slate-200/30",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-full px-4 text-[15px]",
        lg: "h-14 rounded-full px-8 text-[19px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
