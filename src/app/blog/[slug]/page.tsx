import { notFound } from "next/navigation";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContentPage } from "@/modules/content/content-page";
import { LABELS, PAGE_SLUGS, ROUTES } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { JsonLd } from "@/components/seo/json-ld";
import { buildStoreMetadata, buildWebPageJsonLd } from "@/utils/seo";

interface BlogPost {
  slug: string;
  baslik: string;
  icerik?: string;
  ozet?: string;
}

function findBlogPost(posts: BlogPost[], slug: string) {
  return posts.find((p) => p.slug === slug);
}

async function getBlogPosts(firmaId: number): Promise<BlogPost[]> {
  try {
    const page = await storeService.getPage(firmaId, PAGE_SLUGS.blog);
    if (page.icerik?.startsWith("[")) {
      return JSON.parse(page.icerik) as BlogPost[];
    }
  } catch {
    // fallback
  }
  return [
    {
      slug: "yeni-sezon-trendleri",
      baslik: "Yeni Sezon Trendleri",
      icerik: "<p>Bu sezon minimal çizgiler, doğal tonlar ve konfor odaklı parçalar öne çıkıyor.</p>",
    },
    {
      slug: "online-alisveris-ipuclari",
      baslik: "Online Alışveriş İpuçları",
      icerik: "<p>Güvenli alışveriş için SSL sertifikalı siteleri tercih edin ve güçlü şifreler kullanın.</p>",
    },
  ];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);
  const posts = await getBlogPosts(firmaId);
  const post = findBlogPost(posts, slug);
  const config = await getStoreConfig(firmaId).catch(() => null);
  return buildStoreMetadata(config, {
    title: post?.baslik ?? slug,
    path: ROUTES.blogPost(slug),
  });
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);
  const posts = await getBlogPosts(firmaId);
  const post = findBlogPost(posts, slug);

  if (!post) notFound();

  const config = await getStoreConfig(firmaId).catch(() => null);
  const pageContent = {
    slug,
    baslik: post.baslik,
    icerik: post.icerik ?? `<p>${post.ozet ?? ""}</p>`,
  };

  return (
    <StoreLayoutShell searchParams={searchParams}>
      {config && <JsonLd data={buildWebPageJsonLd(pageContent, config)} />}
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumbs
          items={[
            { label: LABELS.blog, href: ROUTES.blog },
            { label: post.baslik },
          ]}
        />
        <ContentPage page={pageContent} />
      </div>
    </StoreLayoutShell>
  );
}
