import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kanji = searchParams.get("k") || "漢";

  return new ImageResponse(
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
        
        {/* メイン漢字 */}
        <div
          style={{
            fontSize: 350,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          {kanji}
        </div>
        
        {/* サブテキスト */}
        <div
          style={{
            fontSize: 48,
            color: "#666",
            marginTop: 20,
          }}
        >
          書き順・筆順
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
            Kanji Stroke Order
          </div>
        </div>
        
        {/* 左上の装飾 */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 50,
            fontSize: 24,
            color: "#999",
          }}
        >
          常用漢字 2136字
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}



