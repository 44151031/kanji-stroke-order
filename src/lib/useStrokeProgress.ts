"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface StrokeProgress {
  latestScore: number | null; // 最新スコア
  averageScore: number | null; // 平均スコア
  scoreDifference: number | null; // 前回からのスコア差分（+10 など）
  attemptCount: number; // 挑戦回数
}

/**
 * 書き順テストの進捗管理フック
 * Supabaseからスコア履歴を取得し、統計情報を返す
 */
export function useStrokeProgress(userId: string | null, kanjiCode: string) {
  const [progress, setProgress] = useState<StrokeProgress>({
    latestScore: null,
    averageScore: null,
    scoreDifference: null,
    attemptCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId || !kanjiCode || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Supabaseからスコア履歴を取得（降順、最新順）
      const { data, error } = await supabase
        .from("stroke_tests")
        .select("score, created_at")
        .eq("user_id", userId)
        .eq("kanji_code", kanjiCode)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("進捗取得エラー:", error.message);
        setProgress({
          latestScore: null,
          averageScore: null,
          scoreDifference: null,
          attemptCount: 0,
        });
        return;
      }

      if (data && data.length > 0) {
        // スコアの配列を取得（nullでないもののみ）
        const scores = data
          .map((entry) => entry.score)
          .filter((s): s is number => s !== null && typeof s === "number");

        const latestScore = scores[0] || null;
        const previousScore = scores.length > 1 ? scores[1] : null;

        // 平均スコアを計算
        const averageScore =
          scores.length > 0
            ? scores.reduce((sum, s) => sum + s, 0) / scores.length
            : null;

        // 前回からのスコア差分
        const scoreDifference =
          latestScore !== null && previousScore !== null
            ? latestScore - previousScore
            : null;

        setProgress({
          latestScore,
          averageScore: averageScore ? Math.round(averageScore) : null,
          scoreDifference,
          attemptCount: data.length,
        });
      } else {
        // データがない場合
        setProgress({
          latestScore: null,
          averageScore: null,
          scoreDifference: null,
          attemptCount: 0,
        });
      }
    } catch (err) {
      console.error("進捗取得エラー:", err);
      setProgress({
        latestScore: null,
        averageScore: null,
        scoreDifference: null,
        attemptCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, kanjiCode]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, isLoading, refetch: fetchProgress };
}
