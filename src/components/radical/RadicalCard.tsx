import Link from "next/link";

interface RadicalCardProps {
  href: string;
  glyph: string;
  labelJa: string;
  labelEn: string;
  count: number;
}

export default function RadicalCard({
  href,
  glyph,
  labelJa,
  labelEn,
  count,
}: RadicalCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
    >
      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm">
        {glyph}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block truncate">
          {labelJa}（{labelEn}）
        </span>
        <span className="text-xs text-muted-foreground block">
          登録数：{count}
        </span>
      </div>
    </Link>
  );
}

