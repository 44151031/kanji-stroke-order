"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnonymousUser } from "@/lib/useAnonymousUser";
import { useStrokeProgress } from "@/lib/useStrokeProgress";
import { calcStrokeScore } from "@/lib/calcStrokeScore";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import KanjiSvgViewer from "@/components/KanjiSvgViewer";

interface Stroke {
  points: Array<{ x: number; y: number }>;
}

interface Props {
  kanjiCode: string; // "u6c34" 形式（ucsHexから生成）
  kanji: string; // 漢字文字自体（表示用）
  ucsHex: string; // "6c34" 形式（SVGパス用）
}

/**
 * 書き取りテストキャンバスコンポーネント
 * スマホ・PC対応の書き取り機能を提供
 */
export default function StrokePracticeCanvas({
  kanjiCode,
  kanji,
  ucsHex,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [correctStrokeCount, setCorrectStrokeCount] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { userId, isLoading: isUserLoading } = useAnonymousUser();
  const { progress, isLoading: isProgressLoading, refetch } = useStrokeProgress(
    userId,
    kanjiCode
  );

  // 正解のストローク数を取得（SVGからpath要素の数を数える）
  useEffect(() => {
    const fetchStrokeCount = async () => {
      try {
        const response = await fetch(`/kanjivg/${ucsHex}.svg`);
        if (response.ok) {
          const svgText = await response.text();
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
          const paths = svgDoc.querySelectorAll("path[d]");
          setCorrectStrokeCount(paths.length);
        }
      } catch (err) {
        console.warn("ストローク数取得エラー:", err);
      }
    };
    fetchStrokeCount();
  }, [ucsHex]);

  // キャンバスの描画を更新
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 全てのストロークを描画
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // 現在描画中のストロークを描画
    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  // キャンバスのサイズを設定（リサイズ対応）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // 実際のサイズを設定（高DPI対応）
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      // 表示サイズを設定
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // 既存のストロークを再描画
      if (strokes.length > 0 || currentStroke.length > 0) {
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        strokes.forEach((stroke) => {
          if (stroke.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        });

        if (currentStroke.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
          for (let i = 1; i < currentStroke.length; i++) {
            ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
          }
          ctx.stroke();
        }
      }
    };

    resizeCanvas();

    // リサイズイベントリスナー
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [strokes, currentStroke]);

  // 描画開始
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (score !== null) return; // 既に評価済みの場合は描画不可

    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke([{ x, y }]);
  };

  // 描画中
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || score !== null) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  // 描画終了
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    e.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: [...currentStroke] }]);
      setCurrentStroke([]);
    }
  };

  // スコアを計算・評価
  const handleEvaluate = async () => {
    if (strokes.length === 0) return;

    setIsEvaluating(true);

    // スコア計算
    const userStrokeCount = strokes.length;
    const calculatedScore = calcStrokeScore(userStrokeCount, correctStrokeCount);

    setScore(calculatedScore);

    // Supabaseに保存
    if (userId && isSupabaseConfigured) {
      try {
        setIsSaving(true);
        const { error } = await supabase.from("stroke_tests").insert({
          user_id: userId,
          kanji_code: kanjiCode,
          score: calculatedScore,
        });

        if (error) {
          console.error("スコア保存エラー:", error);
        } else {
          // 保存成功後に進捗を再取得
          refetch();
        }
      } catch (err) {
        console.error("スコア保存エラー:", err);
      } finally {
        setIsSaving(false);
      }
    }

    setIsEvaluating(false);
  };

  // キャンバスをクリア
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setScore(null);
    setShowAnswer(false);
  };

  // リトライ（クリアして再描画可能に）
  const handleRetry = () => {
    handleClear();
  };

  return (
    <div className="space-y-4">
      {/* 進捗表示 */}
      {!isProgressLoading && progress.attemptCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-amber-900">
                最高スコア: {progress.latestScore}点
              </p>
              {progress.scoreDifference !== null && progress.scoreDifference > 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  前回より +{progress.scoreDifference}点
                </p>
              )}
            </div>
            <p className="text-xs text-amber-600">挑戦回数: {progress.attemptCount}回</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 左側: 書き取りキャンバス */}
        <div className="space-y-3">
          <div className="relative bg-gray-50 rounded-lg border border-border overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-64 touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            {/* スコア表示オーバーレイ */}
            {score !== null && (
              <div className="absolute inset-0 bg-white/95 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">{score}点</p>
                  <p className="text-sm text-muted-foreground">
                    ストローク数: {strokes.length} / {correctStrokeCount}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 操作ボタン */}
          <div className="flex gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={strokes.length === 0 || score !== null}
              className="flex-1"
            >
              クリア
            </Button>
            <Button
              onClick={handleEvaluate}
              disabled={strokes.length === 0 || score !== null || isEvaluating}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {isEvaluating ? "評価中..." : isSaving ? "保存中..." : "評価する"}
            </Button>
            {score !== null && (
              <Button onClick={handleRetry} className="flex-1">
                リトライ
              </Button>
            )}
          </div>
        </div>

        {/* 右側: 正解の書き順 */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-border p-4 h-64 flex items-center justify-center">
            {showAnswer ? (
              <KanjiSvgViewer ucsHex={ucsHex} kanji={kanji} size={200} />
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="mb-2">書き終えたら</p>
                <Button
                  onClick={() => setShowAnswer(true)}
                  variant="outline"
                  disabled={strokes.length === 0}
                >
                  書き順を確認する
                </Button>
              </div>
            )}
          </div>
          {showAnswer && (
            <Button
              onClick={() => setShowAnswer(false)}
              variant="outline"
              className="w-full"
            >
              隠す
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            ストローク数: {correctStrokeCount}画
          </p>
        </div>
      </div>
    </div>
  );
}
