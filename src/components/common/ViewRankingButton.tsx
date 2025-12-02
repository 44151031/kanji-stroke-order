import Link from "next/link";
import { Trophy } from "lucide-react";

export default function ViewRankingButton() {
  return (
    <Link
      href="/ranking"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full
        bg-amber-500 hover:bg-amber-600
        text-white font-medium
        transition-colors"
    >
      <Trophy className="w-5 h-5" />
      <span>人気の漢字ランキングを見る</span>
    </Link>
  );
}

