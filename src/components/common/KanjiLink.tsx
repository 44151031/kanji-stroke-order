/**
 * KanjiLink - 漢字詳細ページへのリンクコンポーネント
 * 
 * すべての漢字リンクを /kanji/uXXXX 形式に統一
 */

import Link from "next/link";
import { getKanjiUrl } from "@/lib/slugHelpers";
import { ReactNode } from "react";

interface KanjiLinkProps {
  kanji: string;
  children?: ReactNode;
  className?: string;
  title?: string;
}

/**
 * 漢字詳細ページへのリンク
 * 
 * @example
 * <KanjiLink kanji="山" /> // 漢字のみ表示
 * <KanjiLink kanji="山" className="text-2xl" /> // スタイル付き
 * <KanjiLink kanji="山">山を見る</KanjiLink> // カスタムテキスト
 */
export default function KanjiLink({ 
  kanji, 
  children, 
  className = "",
  title,
}: KanjiLinkProps) {
  const url = getKanjiUrl(kanji);
  
  return (
    <Link 
      href={url} 
      className={className}
      title={title || kanji}
    >
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






