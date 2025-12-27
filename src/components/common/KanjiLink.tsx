/**
 * KanjiLink - 漢字詳細ページへのリンクコンポーネント
 *
 * すべての漢字リンクを /kanji/uXXXX または /kanji/uXXXX/practice 形式に統一
 */

import Link from "next/link";
import { getKanjiUrl } from "@/lib/slugHelpers";
import { ReactNode } from "react";

interface KanjiLinkProps {
  kanji: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  /** 書き取りモードで使用する場合は "practice" を指定 */
  mode?: "dictionary" | "practice";
}

/**
 * 漢字詳細ページへのリンク
 *
 * @example
 * <KanjiLink kanji="山" /> // 辞書モード
 * <KanjiLink kanji="山" mode="practice" /> // 書き取り練習モード
 */
export default function KanjiLink({
  kanji,
  children,
  className = "",
  title,
  mode = "dictionary",
}: KanjiLinkProps) {
  // /kanji/uXXXX 形式の基本URLを取得
  const baseUrl = getKanjiUrl(kanji);

  // mode に応じてURLを決定
  const url = mode === "practice" ? `${baseUrl}/practice` : baseUrl;

  return (
    <Link href={url} className={className} title={title || kanji}>
      {children || kanji}
    </Link>
  );
}

/**
 * 漢字グリッド表示用のリンク
 */
export function KanjiGridLink({
  kanji,
  className = "w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors",
  title,
}: Omit<KanjiLinkProps, "children">) {
  return (
    <KanjiLink kanji={kanji} className={className} title={title}>
      {kanji}
    </KanjiLink>
  );
}






