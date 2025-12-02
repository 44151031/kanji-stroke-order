"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface StrokeAnimationProps {
  id: string;
  kanji: string;
  size?: number;
}

export function StrokeAnimation({ id, kanji, size = 300 }: StrokeAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  
  const playingRef = useRef(false);
  const currentIdxRef = useRef(0);

  // SVGを読み込み
  useEffect(() => {
    let cancelled = false;
    
    async function loadSvg() {
      setLoaded(false);
      setError(false);
      setIsPlaying(false);
      setCurrentIdx(0);
      currentIdxRef.current = 0;
      
      const hexCode = id.startsWith("u") ? id.slice(1).padStart(5, "0") : id;
      
      try {
        const res = await fetch(`/kanjivg/${hexCode}.svg`);
        if (!res.ok) throw new Error("SVG not found");
        
        const svgText = await res.text();
        if (cancelled) return;
        
        if (containerRef.current) {
          // SVGを挿入
          containerRef.current.innerHTML = svgText;
          
          // SVG要素を調整
          const svg = containerRef.current.querySelector("svg");
          if (svg) {
            svg.setAttribute("width", size.toString());
            svg.setAttribute("height", size.toString());
            svg.setAttribute("viewBox", "0 0 109 109");
            svg.style.display = "block";
          }
          
          // テキストと番号を非表示
          containerRef.current.querySelectorAll("text").forEach((t) => t.remove());
          const strokeNumbers = containerRef.current.querySelector('g[id^="kvg:StrokeNumbers"]');
          if (strokeNumbers) strokeNumbers.remove();
          
          // パスを取得して初期化
          const paths = Array.from(
            containerRef.current.querySelectorAll("path[d]")
          ) as SVGPathElement[];
          
          pathsRef.current = paths;
          setTotalStrokes(paths.length);
          
          // 各パスを初期化
          paths.forEach((p) => {
            const len = p.getTotalLength();
            p.style.fill = "none";
            p.style.stroke = "#1a1a1a";
            p.style.strokeWidth = "4";
            p.style.strokeLinecap = "round";
            p.style.strokeLinejoin = "round";
            p.style.strokeDasharray = `${len}`;
            p.style.strokeDashoffset = `${len}`;
            p.style.transition = "none";
          });
          
          setLoaded(true);
        }
      } catch (err) {
        console.error("SVG load error:", err);
        setError(true);
      }
    }
    
    loadSvg();
    return () => { cancelled = true; };
  }, [id, size]);

  // 指定インデックスまでのパスを描画（即座に）
  const paintUntil = useCallback((uptoExclusive: number) => {
    const paths = pathsRef.current;
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.transition = "none";
      p.style.strokeDashoffset = i < uptoExclusive ? "0" : `${len}`;
      p.style.stroke = i < uptoExclusive ? "#1a1a1a" : "#e5e5e5";
    });
  }, []);

  // 1画をアニメーション描画
  const playOneStroke = useCallback(async (idx: number): Promise<boolean> => {
    const p = pathsRef.current[idx];
    if (!p) return false;
    
    // 現在のインデックスまで即座に描画
    paintUntil(idx);
    
    // 現在描画中の画を赤色に
    p.style.stroke = "#e11d48";
    p.style.strokeWidth = "5";
    
    const len = p.getTotalLength();
    const duration = Math.min(3, Math.max(0.15, 0.8 / speed));
    
    // reflow強制
    p.getBoundingClientRect();
    
    // アニメーション開始
    p.style.transition = `stroke-dashoffset ${duration}s ease-out`;
    p.style.strokeDashoffset = "0";
    
    // アニメーション完了を待つ
    await new Promise<void>((resolve) => setTimeout(resolve, duration * 1000));
    
    // 完了後は黒色に戻す
    p.style.stroke = "#1a1a1a";
    p.style.strokeWidth = "4";
    
    return true;
  }, [speed, paintUntil]);

  // 連続再生
  useEffect(() => {
    let cancelled = false;
    
    const playSequence = async () => {
      if (!loaded || !isPlaying) return;
      
      playingRef.current = true;
      
      for (let i = currentIdxRef.current; i < totalStrokes; i++) {
        if (cancelled || !playingRef.current) break;
        
        await playOneStroke(i);
        
        if (cancelled || !playingRef.current) break;
        
        currentIdxRef.current = i + 1;
        setCurrentIdx(i + 1);
      }
      
      if (!cancelled) {
        setIsPlaying(false);
        playingRef.current = false;
      }
    };
    
    playSequence();
    
    return () => {
      cancelled = true;
      playingRef.current = false;
    };
  }, [loaded, isPlaying, totalStrokes, playOneStroke]);

  // 再生/停止トグル
  const handleTogglePlay = useCallback(() => {
    if (currentIdx >= totalStrokes) {
      // 終了状態なら最初から
      setCurrentIdx(0);
      currentIdxRef.current = 0;
      paintUntil(0);
    }
    setIsPlaying((p) => !p);
  }, [currentIdx, totalStrokes, paintUntil]);

  // 前の画
  const handlePrev = useCallback(() => {
    if (!loaded || currentIdx === 0) return;
    setIsPlaying(false);
    playingRef.current = false;
    const next = Math.max(0, currentIdx - 1);
    setCurrentIdx(next);
    currentIdxRef.current = next;
    paintUntil(next);
  }, [loaded, currentIdx, paintUntil]);

  // 次の画
  const handleNext = useCallback(async () => {
    if (!loaded || currentIdx >= totalStrokes) return;
    setIsPlaying(false);
    playingRef.current = false;
    
    await playOneStroke(currentIdx);
    
    const next = Math.min(totalStrokes, currentIdx + 1);
    setCurrentIdx(next);
    currentIdxRef.current = next;
  }, [loaded, currentIdx, totalStrokes, playOneStroke]);

  // リセット
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    paintUntil(0);
  }, [paintUntil]);

  // インデックス変更時の描画更新（再生中でないとき）
  useEffect(() => {
    if (!loaded || isPlaying) return;
    paintUntil(currentIdx);
  }, [loaded, currentIdx, isPlaying, paintUntil]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドでは無効化
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleReset();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay, handlePrev, handleNext, handleReset]);

  // ローディング
  if (!loaded && !error) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2 text-muted-foreground">書き順を読み込み中...</span>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 bg-secondary/30 rounded-xl">
        <span className="text-8xl font-bold text-foreground/80">{kanji}</span>
        <p className="text-sm text-muted-foreground mt-2">
          書き順SVGを読み込めませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG表示エリア */}
      <div
        ref={containerRef}
        className="bg-white border border-border rounded-xl p-4 shadow-inner"
        style={{ width: size + 32, height: size + 32 }}
      />
      
      {/* 画数インジケーター */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{currentIdx}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{totalStrokes} 画</span>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-[340px] h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentIdx / totalStrokes) * 100}%` }}
        />
      </div>

      {/* コントロールボタン */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          onClick={handlePrev}
          variant="outline"
          size="sm"
          disabled={!loaded || currentIdx === 0}
          className="px-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="ml-1">前</span>
        </Button>
        
        <Button
          onClick={handleTogglePlay}
          variant="default"
          size="sm"
          disabled={!loaded}
          className="px-4 min-w-[90px]"
        >
          {isPlaying ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              停止
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              再生
            </>
          )}
        </Button>
        
        <Button
          onClick={handleNext}
          variant="outline"
          size="sm"
          disabled={!loaded || currentIdx >= totalStrokes}
          className="px-3"
        >
          <span className="mr-1">次</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          disabled={!loaded}
          className="px-3"
          title="リセット (R)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
      </div>

      {/* 速度調整 */}
      <div className="flex items-center gap-3 w-full max-w-[340px]">
        <span className="text-xs text-muted-foreground">🐢</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
        <span className="text-xs text-muted-foreground">🐇</span>
        <span className="text-xs text-muted-foreground w-12 text-right">{speed.toFixed(2)}x</span>
      </div>

      {/* キーボードショートカットヒント */}
      <div className="text-xs text-muted-foreground text-center">
        <span className="hidden sm:inline">
          Space: 再生/停止 | ←→: 前/次 | R: リセット
        </span>
      </div>
    </div>
  );
}

export default StrokeAnimation;
