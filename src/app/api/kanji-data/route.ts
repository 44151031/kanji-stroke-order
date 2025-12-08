import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  
  try {
    let filePath: string;
    
    switch (type) {
      case "joyo":
        filePath = path.join(process.cwd(), "data", "kanji-joyo.json");
        break;
      case "meta":
        filePath = path.join(process.cwd(), "data", "kanji-meta.json");
        break;
      case "words":
        filePath = path.join(process.cwd(), "data", "words-by-kanji.json");
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading kanji data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}














