"use client";

import { Twitter } from "lucide-react";

export function XShareButton({ kanji }: { kanji: string }) {
  const url = `https://kanji-stroke-order.com/kanji/u${kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}`;

  const text = `今日の書き順「${kanji}」`;

  const hashtags = "漢字書き順ナビ,書き順";

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] text-white font-semibold hover:bg-[#1A8CD8] transition"
    >
      <Twitter className="w-5 h-5" />
      Xでポスト
    </a>
  );
}








