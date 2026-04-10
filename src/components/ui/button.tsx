"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { getHoverTypeClasses, type ButtonHoverType } from "@/components/ui/button-hover/types";
import { useButtonHover } from "@/components/ui/button-hover/use-button-hover";
import { cn } from "@/lib/utils";

export type { ButtonHoverType };

const iconOnlyMotionClasses =
  "relative overflow-hidden rounded-full before:absolute before:inset-0 before:scale-75 before:rounded-full before:bg-primary/0 before:opacity-0 before:transition-all before:duration-300 before:ease-out hover:before:scale-100 hover:before:bg-primary/10 hover:before:opacity-100 active:before:scale-95 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-out hover:[&_svg]:scale-110 active:[&_svg]:scale-95";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-[color,background-color,border-color,box-shadow,filter,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none motion-safe:transform-gpu [&_svg]:pointer-events-none [&_svg]:relative [&_svg]:z-[1] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/15 hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/20",
        outline:
          "border border-input bg-background shadow-sm hover:text-accent-foreground hover:shadow-md hover:shadow-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-secondary/15 hover:bg-secondary/80 hover:shadow-lg hover:shadow-secondary/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  hoverType?: ButtonHoverType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, disabled, hoverType, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isIconOnly = size === "icon";
    const resolvedHoverType = hoverType ?? (isIconOnly ? "softGlowEnergy" : "breathing");
    const { elementRef } = useButtonHover({ disabled, hoverType: resolvedHoverType });

    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        elementRef.current = node;
        if (typeof ref === "function") {
          ref(node);
          return;
        }
        if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref, elementRef]
    );

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          isIconOnly && iconOnlyMotionClasses,
          getHoverTypeClasses(resolvedHoverType),
          className
        )}
        data-hover-type={resolvedHoverType}
        data-icon-only={isIconOnly ? "true" : undefined}
        ref={setRef}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
