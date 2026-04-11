"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";

export type AddStudioCtaButtonProps = {
  className?: string;
  children: ReactNode;
} & VariantProps<typeof buttonVariants>;

export function AddStudioCtaButton({ className, children, variant, size }: AddStudioCtaButtonProps) {
  const { status } = useSession();
  const href =
    status === "authenticated"
      ? "/dashboard/studios"
      : "/auth?type=register&role=business";

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
