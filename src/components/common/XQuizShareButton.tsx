"use client";

import { useEffect, useState } from "react";

interface XQuizShareButtonProps {
  kanji: string;
}

/**
 * 投稿テンプレート（クイズ形式）
 */
const TEMPLATES = {
  // テンプレートA: 標準クイズ形式（推奨）
  A: (kanji: string) =>
    `『${kanji}』の正しい書き順、間違えてた！🤔 #漢字 #書き順`,
  // テンプレートB: 意外性を強調
  B: (kanji: string) =>
    `『${kanji}』の書き順、意外すぎて驚いた😳\nあなたは当てられる？（答えは「漢字書き順ナビ」） #漢字 #書き順`,
  // テンプレートC: 最短版（文字数オーバー時のフォールバック）
  C: (kanji: string) => `書き順ミスってた…！『${kanji}』の正しい書き順クイズ👇 #漢字 #書き順`,
};

/**
 * 投稿テキストを生成（280文字を超えたら短いテンプレートにフォールバック）
 */
function generateShareText(kanji: string): string {
  const URL_LENGTH = 23; // XはURLを23文字に短縮
  const MAX_LENGTH = 280;

  let text = TEMPLATES.A(kanji);
  if (text.length + URL_LENGTH + 1 <= MAX_LENGTH) {
    return text;
  }

  text = TEMPLATES.B(kanji);
  if (text.length + URL_LENGTH + 1 <= MAX_LENGTH) {
    return text;
  }

  return TEMPLATES.C(kanji);
}

/**
 * X（Twitter）書き順クイズシェアボタン
 * 意外な書き順を友達にクイズとして出題するためのボタン
 */
export function XQuizShareButton({ kanji }: XQuizShareButtonProps) {
  const [pageUrl, setPageUrl] = useState<string>("");

  // クライアントサイドでURLを取得
  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      setPageUrl(canonical.getAttribute("href") || window.location.href);
    } else {
      setPageUrl(window.location.href);
    }
  }, []);

  // URLが取得できるまではフォールバックURLを使用
  const shareUrl = pageUrl || `https://kanji-stroke-order.com/kanji/u${kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}`;

  const text = generateShareText(kanji);

  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

  const handleClick = () => {
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`「${kanji}」の書き順クイズをXでシェアする`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] text-white font-semibold hover:bg-[#1A8CD8] transition"
    >
      {/* X（旧Twitter）ロゴ */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="w-5 h-5 fill-current"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span>意外だったので友達にシェアする</span>
    </button>
  );
}
