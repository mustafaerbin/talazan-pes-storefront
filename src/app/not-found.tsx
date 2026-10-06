import Link from "next/link";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Button } from "@/components/ui/button";
import { LABELS, ROUTES } from "@/config/constants";

export default function NotFound() {
  return (
    <StoreLayoutShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold">{LABELS.notFound}</h1>
        <p className="max-w-md text-muted-foreground">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <Button asChild>
          <Link href={ROUTES.home}>{LABELS.backToHome}</Link>
        </Button>
      </div>
    </StoreLayoutShell>
  );
}
