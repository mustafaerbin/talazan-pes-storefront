import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card hover:-translate-y-0.5 hover:shadow-hover active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-card hover:-translate-y-0.5 hover:opacity-90",
        outline:
          "border border-border bg-card shadow-card hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary hover:shadow-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-card hover:-translate-y-0.5 hover:shadow-hover",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 rounded-[var(--radius-btn)]",
        sm: "h-9 rounded-[var(--radius-btn)] px-3.5 text-xs",
        lg: "h-12 rounded-[var(--radius-btn)] px-8 text-base",
        icon: "size-11 rounded-[var(--radius-btn)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
