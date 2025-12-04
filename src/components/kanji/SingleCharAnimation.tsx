"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import StrokeController from "./StrokeController";
import Link from "next/link";
import { getKanjiLink } from "@/lib/linkUtils";

interface SingleCharAnimationProps {
  char: string;
  size?: number;
  showDetailLink?: boolean;
}

export function SingleCharAnimation({ 
  char, 
  size = 280,
  showDetailLink = true 
}: SingleCharAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  
  const playingRef = useRef(false);
  const currentIdxRef = useRef(0);

  // SVGパスを取得
  const getHexCodes = (c: string) => {
    const code = c.codePointAt(0);
    if (!code) return [];
    const hex = code.toString(16).toLowerCase();
    return [
      hex.padStart(5, "0"),
      hex.padStart(4, "0"),
      hex,
    ];
  };

  // SVGを読み込み
  const loadSvg = useCallback(async () => {
    setLoaded(false);
    setError(false);
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    
    const hexCodes = getHexCodes(char);
    const pathsToTry = [
      ...hexCodes.map(hex => `/svg/u${hex}.svg`),
      ...hexCodes.map(hex => `/kanjivg/${hex}.svg`),
    ];
    
    let svgText: string | null = null;
    
    for (const path of pathsToTry) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          svgText = await res.text();
          break;
        }
      } catch {
        // 次を試行
      }
    }
    
    try {
      if (!svgText) throw new Error("SVG not found");
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svgText;
        
        const svg = containerRef.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", size.toString());
          svg.setAttribute("height", size.toString());
          svg.setAttribute("viewBox", "0 0 109 109");
        }
        
        // テキスト・番号を非表示
        containerRef.current.querySelectorAll("text:not(.stroke-number)").forEach((t) => t.remove());
        const strokeNumbers = containerRef.current.querySelector('g[id^="kvg:StrokeNumbers"]');
        if (strokeNumbers) strokeNumbers.remove();
        
        // パス初期化
        const paths = Array.from(
          containerRef.current.querySelectorAll("path[d]")
        ) as SVGPathElement[];
        
        pathsRef.current = paths;
        setTotalStrokes(paths.length);
        
        paths.forEach((p) => {
          const len = p.getTotalLength();
          p.style.fill = "none";
          p.style.stroke = "#e5e5e5";
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
  }, [char, size]);

  useEffect(() => {
    if (char) loadSvg();
  }, [char, loadSvg]);

  // 筆順番号ハイライト
  const highlightNumber = useCallback((idx: number, active: boolean) => {
    if (!containerRef.current) return;
    const numbers = containerRef.current.querySelectorAll('.stroke-number');
    numbers.forEach((num, i) => {
      const el = num as SVGTextElement;
      if (i === idx && active) {
        el.style.fill = "#e11d48";
        el.style.fontSize = "12px";
        el.style.fontWeight = "bold";
      } else if (i < idx) {
        el.style.fill = "#1a1a1a";
        el.style.fontSize = "8px";
        el.style.fontWeight = "normal";
      } else {
        el.style.fill = "#999";
        el.style.fontSize = "8px";
        el.style.fontWeight = "normal";
      }
    });
  }, []);

  // 指定インデックスまで描画
  const paintUntil = useCallback((uptoExclusive: number) => {
    const paths = pathsRef.current;
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.transition = "none";
      p.style.strokeDashoffset = i < uptoExclusive ? "0" : `${len}`;
      p.style.stroke = i < uptoExclusive ? "#1a1a1a" : "#e5e5e5";
    });
    highlightNumber(uptoExclusive - 1, false);
  }, [highlightNumber]);

  // 1画描画
  const playOneStroke = useCallback(async (idx: number): Promise<boolean> => {
    const p = pathsRef.current[idx];
    if (!p) return false;
    
    paintUntil(idx);
    highlightNumber(idx, true);
    
    p.style.stroke = "#e11d48";
    p.style.strokeWidth = "5";
    
    const len = p.getTotalLength();
    const duration = Math.max(0.15, 0.8 / speed);
    
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${duration}s ease-out`;
    p.style.strokeDashoffset = "0";
    
    await new Promise<void>((r) => setTimeout(r, duration * 1000));
    
    p.style.stroke = "#1a1a1a";
    p.style.strokeWidth = "4";
    highlightNumber(idx, false);
    
    return true;
  }, [speed, paintUntil, highlightNumber]);

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

  // コントロール関数
  const handleTogglePlay = useCallback(() => {
    if (currentIdx >= totalStrokes) {
      setCurrentIdx(0);
      currentIdxRef.current = 0;
      paintUntil(0);
    }
    setIsPlaying((p) => !p);
  }, [currentIdx, totalStrokes, paintUntil]);

  const handlePrev = useCallback(() => {
    if (!loaded || currentIdx === 0) return;
    setIsPlaying(false);
    playingRef.current = false;
    const next = Math.max(0, currentIdx - 1);
    setCurrentIdx(next);
    currentIdxRef.current = next;
    paintUntil(next);
  }, [loaded, currentIdx, paintUntil]);

  const handleNext = useCallback(async () => {
    if (!loaded || currentIdx >= totalStrokes) return;
    setIsPlaying(false);
    playingRef.current = false;
    
    await playOneStroke(currentIdx);
    
    const next = Math.min(totalStrokes, currentIdx + 1);
    setCurrentIdx(next);
    currentIdxRef.current = next;
  }, [loaded, currentIdx, totalStrokes, playOneStroke]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    setCurrentIdx(0);
    currentIdxRef.current = 0;
    paintUntil(0);
  }, [paintUntil]);

  // インデックス変更時の描画
  useEffect(() => {
    if (!loaded || isPlaying) return;
    paintUntil(currentIdx);
  }, [loaded, currentIdx, isPlaying, paintUntil]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
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

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-secondary/30 rounded-xl">
        <span className="text-7xl font-bold text-foreground/80">{char}</span>
        <p className="text-sm text-muted-foreground mt-2">書き順データがありません</p>
      </div>
    );
  }

  // ローディング
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2 text-muted-foreground">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG表示 */}
      <div
        ref={containerRef}
        className="bg-white border border-border rounded-xl p-4 shadow-inner"
        style={{ width: size + 32, height: size + 32 }}
      />

      {/* コントローラー */}
      <StrokeController
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onPrev={handlePrev}
        onNext={handleNext}
        speed={speed}
        onSpeedChange={setSpeed}
        currentStroke={currentIdx}
        totalStrokes={totalStrokes}
        disabled={!loaded}
      />

      {/* 詳細ページへのリンク */}
      {showDetailLink && char && (
        <Link
          href={getKanjiLink(char)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span className="text-xl">{char}</span>
          <span>の詳細ページへ</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default SingleCharAnimation;







