import { ImageResponse } from "next/og";
import { getStoreConfig } from "@/modules/store/store.server";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

async function faviconDataUrl(): Promise<string | null> {
  try {
    const config = await getStoreConfig();
    const src = config.ayarlar?.faviconUrl?.trim().replace("://localhost", "://127.0.0.1");
    if (!src) return null;

    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i] ?? 0);
    const type = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    return `data:${type};base64,${btoa(binary)}`;
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
