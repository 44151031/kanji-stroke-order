"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getKanjiLink } from "@/lib/linkUtils";

interface AutoStrokeAnimationProps {
  text: string;
  size?: number;
  autoPlay?: boolean;
}

export function AutoStrokeAnimation({ 
  text, 
  size = 280,
  autoPlay = true 
}: AutoStrokeAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  
  const [charIndex, setCharIndex] = useState(0);
  const [svg, setSvg] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  
  const playingRef = useRef(false);
  const strokeIdxRef = useRef(0);

  // 漢字のみのリストを作成（かなをスキップ）
  const getKanjiList = useCallback(() => {
    return text.split("").filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      // ひらがな (3040-309F) とカタカナ (30A0-30FF) をスキップ
      const isHiragana = code >= 0x3040 && code <= 0x309f;
      const isKatakana = code >= 0x30a0 && code <= 0x30ff;
      // 句読点・記号もスキップ
      const isPunctuation = /[、。・「」『』（）\s]/.test(char);
      return !isHiragana && !isKatakana && !isPunctuation;
    });
  }, [text]);

  const kanjiList = getKanjiList();
  const currentChar = kanjiList[charIndex] || "";

  // SVGパスを取得
  const getHexCodes = (char: string) => {
    const code = char.codePointAt(0);
    if (!code) return [];
    const hex = code.toString(16).toLowerCase();
    return [
      hex.padStart(5, "0"),
      hex.padStart(4, "0"),
      hex,
    ];
  };

  // SVGを読み込み
  const loadSvg = useCallback(async (char: string) => {
    setLoaded(false);
    setSvg(null);
    setStrokeIdx(0);
    strokeIdxRef.current = 0;
    
    if (!char) return;
    
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
    
    if (svgText) {
      // 不要な文字・タグを除去
      const cleanSvg = svgText
        .replace(/]>/g, "")
        .replace(/<\?xml[^>]*\?>/g, "")
        .replace(/<!DOCTYPE[^>]*>/g, "")
        .replace(/<!--[\s\S]*?-->/g, "");
      
      setSvg(cleanSvg);
    } else {
      // エラー時のフォールバック
      setSvg(`<svg width="${size}" height="${size}" viewBox="0 0 109 109">
        <text x="54.5" y="65" text-anchor="middle" font-size="50" fill="#999">${char}</text>
        <text x="54.5" y="90" text-anchor="middle" font-size="10" fill="#999">SVGなし</text>
      </svg>`);
    }
  }, [size]);

  // SVG描画準備
  useEffect(() => {
    if (!svg || !containerRef.current) return;
    
    containerRef.current.innerHTML = svg;
    
    // SVG調整
    const svgEl = containerRef.current.querySelector("svg");
    if (svgEl) {
      svgEl.setAttribute("width", size.toString());
      svgEl.setAttribute("height", size.toString());
      svgEl.setAttribute("viewBox", "0 0 109 109");
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
    
    // 自動再生
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [svg, size, autoPlay]);

  // 文字が変わったらSVG再読み込み
  useEffect(() => {
    if (currentChar) {
      loadSvg(currentChar);
    }
  }, [currentChar, loadSvg]);

  // テキスト変更時にリセット
  useEffect(() => {
    setCharIndex(0);
    setIsPlaying(false);
    playingRef.current = false;
  }, [text]);

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
    const duration = Math.max(0.15, 0.7 / speed);
    
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${duration}s ease-out`;
    p.style.strokeDashoffset = "0";
    
    await new Promise<void>((r) => setTimeout(r, duration * 1000));
    
    p.style.stroke = "#1a1a1a";
    p.style.strokeWidth = "4";
    highlightNumber(idx, false);
    
    return true;
  }, [speed, paintUntil, highlightNumber]);

  // 連続再生（自動で次の漢字へ）
  useEffect(() => {
    let cancelled = false;
    
    const playSequence = async () => {
      if (!loaded || !isPlaying) return;
      
      playingRef.current = true;
      
      // 現在の文字のストロークを再生
      for (let i = strokeIdxRef.current; i < totalStrokes; i++) {
        if (cancelled || !playingRef.current) break;
        
        await playOneStroke(i);
        
        if (cancelled || !playingRef.current) break;
        
        strokeIdxRef.current = i + 1;
        setStrokeIdx(i + 1);
      }
      
      if (cancelled || !playingRef.current) return;
      
      // 完了後、次の漢字へ
      if (charIndex < kanjiList.length - 1) {
        await new Promise((r) => setTimeout(r, 600)); // 文字間の間
        if (cancelled || !playingRef.current) return;
        setCharIndex((prev) => prev + 1);
        strokeIdxRef.current = 0;
        setStrokeIdx(0);
      } else {
        // 全文字完了
        setIsPlaying(false);
        playingRef.current = false;
      }
    };
    
    playSequence();
    
    return () => {
      cancelled = true;
    };
  }, [loaded, isPlaying, totalStrokes, charIndex, kanjiList.length, playOneStroke]);

  // リセット
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    setCharIndex(0);
    setStrokeIdx(0);
    strokeIdxRef.current = 0;
    
    // 少し待ってから再生開始
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  }, []);

  // 漢字がない場合
  if (kanjiList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>漢字が見つかりません</p>
        <p className="text-sm mt-2">ひらがな・カタカナはスキップされます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 現在の漢字 */}
      <div className="text-6xl font-bold text-foreground">{currentChar}</div>
      
      {/* SVG表示 */}
      <div
        ref={containerRef}
        className="bg-white border border-border rounded-xl p-4 shadow-inner"
        style={{ width: size + 32, height: size + 32 }}
      />

      {/* 進捗表示 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          漢字: <span className="font-medium text-foreground">{charIndex + 1}</span>/{kanjiList.length}
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">
          画数: <span className="font-medium text-foreground">{strokeIdx}</span>/{totalStrokes}
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-[340px] h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((charIndex + (strokeIdx / Math.max(totalStrokes, 1))) / kanjiList.length) * 100}%`,
          }}
        />
      </div>

      {/* 漢字セレクター */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {kanjiList.map((char, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              playingRef.current = false;
              setCharIndex(idx);
            }}
            className={`w-10 h-10 text-xl rounded-lg border transition-all ${
              idx === charIndex
                ? "bg-primary text-primary-foreground border-primary"
                : idx < charIndex
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-white border-border hover:bg-secondary"
            }`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* コントロール */}
      <div className="flex flex-col items-center gap-4 w-full">
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="px-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          最初から再生
        </Button>

        {/* 速度調整 */}
        <div className="flex items-center gap-3 w-full max-w-[340px]">
          <span className="text-lg">🐢</span>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <span className="text-lg">🐇</span>
          <span className="text-xs text-muted-foreground w-12 text-right">{speed.toFixed(1)}x</span>
        </div>
      </div>

      {/* 詳細ページへのリンク */}
      {currentChar && (
        <Link
          href={getKanjiLink(currentChar)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span className="text-xl">{currentChar}</span>
          <span>の詳細ページへ</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* スキップされた文字の表示 */}
      {text.length !== kanjiList.length && (
        <p className="text-xs text-muted-foreground text-center">
          ※ ひらがな・カタカナ・記号は自動スキップされます
        </p>
      )}
    </div>
  );
}

export default AutoStrokeAnimation;



















