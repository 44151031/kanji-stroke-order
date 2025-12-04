"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  kanji: string;
};

export default function KanjiViewTracker({ kanji }: Props) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 二重実行防止（React Strict Mode対策）
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackView = async () => {
      try {
        // RPC関数を呼び出してviews+1
        const { error } = await supabase.rpc("increment_kanji_views", {
          target_kanji: kanji,
        });

        if (error) {
          // RPC関数がない場合はupsertでフォールバック
          if (error.code === "42883") {
            // Function does not exist
            await supabase
              .from("kanji_views")
              .upsert(
                { 
                  kanji, 
                  views: 1,
                  updated_at: new Date().toISOString()
                },
                { 
                  onConflict: "kanji",
                  ignoreDuplicates: false 
                }
              );
          } else {
            console.error("View tracking error:", error.message);
          }
        }
      } catch (err) {
        // Supabase未設定時などはサイレントに失敗
        console.debug("View tracking skipped:", err);
      }
    };

    trackView();
  }, [kanji]);

  // 非表示コンポーネント
  return null;
}









