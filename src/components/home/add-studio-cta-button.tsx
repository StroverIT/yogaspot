"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";

export type AddStudioCtaButtonProps = {
  className?: string;
  children: ReactNode;
  /** Post-registration destination for guests (e.g. `/dashboard`). */
  next?: string;
} & VariantProps<typeof buttonVariants>;

export function AddStudioCtaButton({
  className,
  children,
  variant,
  size,
  next,
}: AddStudioCtaButtonProps) {
  const { status } = useSession();
  const postRegisterPath = next ?? "/dashboard";
  const registerHref = `/auth?type=register&role=business&next=${encodeURIComponent(postRegisterPath)}`;
  const href = status === "authenticated" ? "/dashboard/studios" : registerHref;

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
