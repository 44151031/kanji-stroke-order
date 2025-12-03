/**
 * Next.js Middleware
 * 
 * 旧URL (/kanji/山) から新URL (/kanji/u5C71) への301リダイレクト
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 漢字かどうかを判定（CJK統合漢字の範囲）
 */
function isKanji(char: string): boolean {
  if (!char || char.length === 0) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK統合漢字
    (code >= 0x3400 && code <= 0x4DBF) ||   // CJK統合漢字拡張A
    (code >= 0x20000 && code <= 0x2A6DF)    // CJK統合漢字拡張B
  );
}

/**
 * 漢字をUnicodeスラッグに変換
 */
function toUnicodeSlug(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (codePoint === undefined) return "";
  return `u${codePoint.toString(16).toUpperCase()}`;
}

/**
 * Unicode スラッグ形式かどうかを判定（大文字・小文字両方）
 */
function isUnicodeSlug(slug: string): boolean {
  return /^u[0-9A-Fa-f]{4,5}$/.test(slug);
}

/**
 * 正規化された大文字Unicode形式かどうかを判定
 */
function isNormalizedUnicodeSlug(slug: string): boolean {
  return /^u[0-9A-F]{4,5}$/.test(slug);
}

/**
 * Unicodeスラッグを正規化（大文字に統一）
 */
function normalizeUnicodeSlug(slug: string): string {
  return `u${slug.slice(1).toUpperCase()}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // /kanji/[slug] パターンをチェック
  const kanjiMatch = pathname.match(/^\/kanji\/([^/]+)$/);
  
  if (kanjiMatch) {
    const slug = kanjiMatch[1];
    
    // 既に正規化されたUnicode形式（大文字）ならスキップ
    if (isNormalizedUnicodeSlug(slug)) {
      return NextResponse.next();
    }
    
    // 小文字のUnicode形式なら大文字にリダイレクト
    if (isUnicodeSlug(slug)) {
      const normalizedSlug = normalizeUnicodeSlug(slug);
      const url = request.nextUrl.clone();
      url.pathname = `/kanji/${normalizedSlug}`;
      
      // 301 永続的リダイレクト
      return NextResponse.redirect(url, { status: 301 });
    }
    
    // URLデコードして漢字を取得
    try {
      const decoded = decodeURIComponent(slug);
      
      // 漢字の場合、Unicode形式にリダイレクト
      if (decoded && isKanji(decoded)) {
        const unicodeSlug = toUnicodeSlug(decoded);
        const url = request.nextUrl.clone();
        url.pathname = `/kanji/${unicodeSlug}`;
        
        // 301 永続的リダイレクト
        return NextResponse.redirect(url, { status: 301 });
      }
    } catch {
      // デコード失敗は無視
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // /kanji/[slug] にのみ適用
    "/kanji/:slug*",
  ],
};

