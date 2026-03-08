import { redirect } from "next/navigation";

/**
 * /ranking → /ranking/week へリダイレクト
 * 期間別ランキングのデフォルトは週間。
 */
export default function RankingIndexPage() {
  redirect("/ranking/week");
}
