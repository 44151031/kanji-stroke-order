import { NextRequest, NextResponse } from "next/server";
import { getCharacterCode } from "@/lib/kanjivg";

const KANJIVG_BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const char = searchParams.get("char");

  if (!char) {
    return NextResponse.json(
      { error: "文字が指定されていません" },
      { status: 400 }
    );
  }

  try {
    const code = getCharacterCode(char);
    const url = `${KANJIVG_BASE_URL}/${code}.svg`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "SVGが見つかりません", character: char, code },
        { status: 404 }
      );
    }

    const svgContent = await response.text();
    
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("SVG fetch error:", error);
    return NextResponse.json(
      { error: "SVGの取得に失敗しました" },
      { status: 500 }
    );
  }
}





