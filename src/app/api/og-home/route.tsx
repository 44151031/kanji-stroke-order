import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f7f2",
          position: "relative",
        }}
      >
        {/* 背景パターン */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, #e5e4df 1px, transparent 0)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
          }}
        />

        {/* メインタイトル */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.2,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          漢字書き順ナビ
        </div>

        {/* サブタイトル */}
        <div
          style={{
            fontSize: 36,
            color: "#666",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          常用漢字2136字の書き順をアニメーションで学ぼう
        </div>

        {/* サンプル漢字 */}
        <div
          style={{
            display: "flex",
            gap: 30,
            fontSize: 120,
            fontWeight: 700,
            color: "#333",
          }}
        >
          <span>水</span>
          <span>火</span>
          <span>木</span>
          <span>金</span>
          <span>土</span>
        </div>

        {/* ブランドラベル */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#888",
              fontWeight: 500,
            }}
          >
            Kanji Stroke Order Navi
          </div>
        </div>

        {/* 左上の装飾 */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 50,
            fontSize: 32,
            color: "#999",
          }}
        >
          ✍️
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Next.js replaces @vercel/og with its own ImageResponse, whose default is
      // "public, max-age=0, must-revalidate" (no CDN caching). Cache explicitly:
      // browser 1 day, Vercel CDN 30 days (s-maxage is consumed by Vercel's CDN).
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
      },
    }
  );

  // OGP images are assets, not standalone search result pages.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
