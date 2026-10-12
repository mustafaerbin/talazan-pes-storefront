"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Tümünü Gör",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
        {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Button variant="outline" asChild className="shrink-0 gap-1.5">
          <Link href={href}>
            {linkLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
