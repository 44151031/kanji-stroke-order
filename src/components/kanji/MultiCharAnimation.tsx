"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getKanjiLink } from "@/lib/linkUtils";

interface MultiCharAnimationProps {
  text: string;
  size?: number;
}

export function MultiCharAnimation({ text, size = 280 }: MultiCharAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  
  const [charIndex, setCharIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  
  const playingRef = useRef(false);
  const strokeIdxRef = useRef(0);

  const chars = text.split("");
  const currentChar = chars[charIndex] || "";

  // 文字からSVGパスを取得
  const getHexCode = (char: string) => {
    const code = char.codePointAt(0);
    return code ? code.toString(16).padStart(5, "0") : "00000";
  };

  // SVGを読み込み
  const loadSvg = useCallback(async (char: string) => {
    setLoaded(false);
    setError(false);
    setStrokeIdx(0);
    strokeIdxRef.current = 0;
    
    const hexCode = getHexCode(char);
    
    try {
      const res = await fetch(`/kanjivg/${hexCode}.svg`);
      if (!res.ok) throw new Error("SVG not found");
      
      const svgText = await res.text();
      
      if (containerRef.current) {
        containerRef.current.innerHTML = svgText;
        
        // SVG調整
        const svg = containerRef.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", size.toString());
          svg.setAttribute("height", size.toString());
          svg.setAttribute("viewBox", "0 0 109 109");
        }
        
        // テキスト・番号を非表示
        containerRef.current.querySelectorAll("text").forEach((t) => t.remove());
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
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <svg width="${size}" height="${size}" viewBox="0 0 109 109">
            <text x="54.5" y="70" text-anchor="middle" font-size="60" fill="#999">${char}</text>
            <text x="54.5" y="95" text-anchor="middle" font-size="10" fill="#999">SVGなし</text>
          </svg>
        `;
      }
    }
  }, [size]);

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

  // 指定インデックスまで描画
  const paintUntil = useCallback((uptoExclusive: number) => {
    const paths = pathsRef.current;
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.transition = "none";
      p.style.strokeDashoffset = i < uptoExclusive ? "0" : `${len}`;
      p.style.stroke = i < uptoExclusive ? "#1a1a1a" : "#e5e5e5";
    });
  }, []);

  // 1画描画
  const playOneStroke = useCallback(async (idx: number): Promise<boolean> => {
    const p = pathsRef.current[idx];
    if (!p) return false;
    
    paintUntil(idx);
    p.style.stroke = "#e11d48";
    p.style.strokeWidth = "5";
    
    const len = p.getTotalLength();
    const duration = Math.max(0.15, 0.6 / speed);
    
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset ${duration}s ease-out`;
    p.style.strokeDashoffset = "0";
    
    await new Promise<void>((r) => setTimeout(r, duration * 1000));
    
    p.style.stroke = "#1a1a1a";
    p.style.strokeWidth = "4";
    
    return true;
  }, [speed, paintUntil]);

  // 連続再生
  useEffect(() => {
    let cancelled = false;
    
    const playSequence = async () => {
      if (!loaded || !isPlaying || error) return;
      
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
      
      // 完了後、次の文字へ
      if (charIndex < chars.length - 1) {
        await new Promise((r) => setTimeout(r, 500)); // 文字間の間
        if (cancelled || !playingRef.current) return;
        setCharIndex((prev) => prev + 1);
        strokeIdxRef.current = 0;
        setStrokeIdx(0);
      } else {
        setIsPlaying(false);
        playingRef.current = false;
      }
    };
    
    playSequence();
    
    return () => {
      cancelled = true;
    };
  }, [loaded, isPlaying, totalStrokes, charIndex, chars.length, error, playOneStroke]);

  // 再生開始時に最初から
  const handlePlay = () => {
    if (strokeIdx >= totalStrokes && charIndex >= chars.length - 1) {
      // 完了状態なら最初から
      setCharIndex(0);
      setStrokeIdx(0);
      strokeIdxRef.current = 0;
    }
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    playingRef.current = false;
  };

  const handlePrevChar = () => {
    if (charIndex > 0) {
      setIsPlaying(false);
      playingRef.current = false;
      setCharIndex((prev) => prev - 1);
    }
  };

  const handleNextChar = () => {
    if (charIndex < chars.length - 1) {
      setIsPlaying(false);
      playingRef.current = false;
      setCharIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    playingRef.current = false;
    setCharIndex(0);
    setStrokeIdx(0);
    strokeIdxRef.current = 0;
    paintUntil(0);
  };

  // インデックス変更時の描画
  useEffect(() => {
    if (!loaded || isPlaying) return;
    paintUntil(strokeIdx);
  }, [loaded, strokeIdx, isPlaying, paintUntil]);

  if (!text) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        文字を入力してください
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 文字セレクター */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {chars.map((char, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsPlaying(false);
              playingRef.current = false;
              setCharIndex(idx);
            }}
            className={`w-12 h-12 text-2xl rounded-lg border transition-all ${
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

      {/* SVG表示エリア */}
      <div
        ref={containerRef}
        className="bg-white border border-border rounded-xl p-4 shadow-inner"
        style={{ width: size + 32, height: size + 32 }}
      />

      {/* 進捗表示 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>文字: {charIndex + 1}/{chars.length}</span>
        <span>|</span>
        <span>画数: {strokeIdx}/{totalStrokes}</span>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-[340px] h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((charIndex + strokeIdx / Math.max(totalStrokes, 1)) / chars.length) * 100}%`,
          }}
        />
      </div>

      {/* コントロール */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          onClick={handlePrevChar}
          variant="outline"
          size="sm"
          disabled={charIndex === 0}
        >
          ◀ 前字
        </Button>
        
        {isPlaying ? (
          <Button onClick={handleStop} variant="default" size="sm" className="min-w-[80px]">
            ⏸ 停止
          </Button>
        ) : (
          <Button onClick={handlePlay} variant="default" size="sm" className="min-w-[80px]">
            ▶ 再生
          </Button>
        )}
        
        <Button
          onClick={handleNextChar}
          variant="outline"
          size="sm"
          disabled={charIndex >= chars.length - 1}
        >
          次字 ▶
        </Button>
        
        <Button onClick={handleReset} variant="outline" size="sm">
          ↺ リセット
        </Button>
      </div>

      {/* 速度調整 */}
      <div className="flex items-center gap-3 w-full max-w-[340px]">
        <span className="text-xs text-muted-foreground">🐢</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.1}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">🐇</span>
        <span className="text-xs text-muted-foreground w-12 text-right">{speed.toFixed(1)}x</span>
      </div>

      {/* 詳細ページリンク */}
      {currentChar && (
        <Link
          href={getKanjiLink(currentChar)}
          className="text-sm text-primary hover:underline"
        >
          「{currentChar}」の詳細ページへ →
        </Link>
      )}
    </div>
  );
}

export default MultiCharAnimation;

