import { ImageResponse } from "next/og";
import { getFaviconDataUrl, getStoreConfig } from "@/modules/store/store.server";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

async function faviconDataUrl(): Promise<string | null> {
  try {
    const config = await getStoreConfig();
    const src = config.ayarlar?.faviconUrl?.trim().replace("://localhost", "://127.0.0.1");
    if (!src) return null;
    return await getFaviconDataUrl(src);
  } catch {
    return null;
  }
}

export default async function Icon() {
  const src = await faviconDataUrl();

  if (!src) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#111827",
          }}
        />
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={32} height={32} style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size },
  );
}
