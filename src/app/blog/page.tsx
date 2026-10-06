import Link from "next/link";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContentPage } from "@/modules/content/content-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LABELS, PAGE_SLUGS, ROUTES } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { buildStoreMetadata } from "@/utils/seo";

interface BlogPost {
  slug: string;
  baslik: string;
  ozet?: string;
  tarih?: string;
}

function parseBlogPosts(icerik?: string): BlogPost[] {
  if (!icerik) {
    return [
      {
        slug: "yeni-sezon-trendleri",
        baslik: "Yeni Sezon Trendleri",
        ozet: "Bu sezonun en popüler ürün ve stillerini keşfedin.",
        tarih: "2026-01-15",
      },
      {
        slug: "online-alisveris-ipuclari",
        baslik: "Online Alışveriş İpuçları",
        ozet: "Güvenli ve keyifli alışveriş için pratik öneriler.",
        tarih: "2026-02-01",
      },
    ];
  }
  try {
    return JSON.parse(icerik) as BlogPost[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const config = await getStoreConfig(resolveFirmaId(sp)).catch(() => null);
  return buildStoreMetadata(config, { title: LABELS.blog, path: ROUTES.blog });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  let page = null;
  try {
    page = await storeService.getPage(firmaId, PAGE_SLUGS.blog);
  } catch {
    // fallback
  }

  const posts = parseBlogPosts(page?.icerik);

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <div className="mx-auto max-w-4xl space-y-8">
        <Breadcrumbs items={[{ label: LABELS.blog }]} />
        <h1 className="text-3xl font-bold">{LABELS.blog}</h1>
        {page?.baslik && !page.icerik?.startsWith("[") && page.icerik && (
          <ContentPage page={page} />
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={ROUTES.blogPost(post.slug)}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">{post.baslik}</CardTitle>
                  {post.tarih && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.tarih).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </CardHeader>
                {post.ozet && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{post.ozet}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </StoreLayoutShell>
  );
}
