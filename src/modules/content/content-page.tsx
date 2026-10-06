import type { SiteSayfaDto } from "@/types/api";

interface ContentPageProps {
  page: SiteSayfaDto;
}

export function ContentPage({ page }: ContentPageProps) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{page.baslik}</h1>
      </header>
      {page.icerik ? (
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: page.icerik }}
        />
      ) : (
        <p className="text-muted-foreground">İçerik yakında eklenecek.</p>
      )}
    </article>
  );
}
