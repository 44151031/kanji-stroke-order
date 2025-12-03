"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchKanjiSvg } from "@/lib/kanjivg";
import { animateSvgStrokes, resetSvgAnimation } from "@/lib/svgUtils";

type Props = {
  character: string;
  size?: number;
  autoPlay?: boolean;
};

export default function SvgAnimator({ character, size = 200, autoPlay = true }: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSvg = async () => {
      setLoading(true);
      setError(null);
      try {
        const svg = await fetchKanjiSvg(character);
        if (svg) {
          const animatedSvg = animateSvgStrokes(svg, size);
          setSvgContent(animatedSvg);
        } else {
          setError("SVGが見つかりません");
        }
      } catch (err) {
        setError("読み込みエラー");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (autoPlay) {
      loadSvg();
    }
  }, [character, size, autoPlay]);

  const replay = useCallback(() => {
    if (containerRef.current) {
      resetSvgAnimation(containerRef.current);
    }
  }, []);

  // グローバルに再生関数を公開（外部からの呼び出し用）
  useEffect(() => {
    const replayButton = document.getElementById("replay-btn");
    if (replayButton) {
      replayButton.addEventListener("click", replay);
      return () => replayButton.removeEventListener("click", replay);
    }
  }, [replay, svgContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground gap-2">
        <span className="text-7xl font-light">{character}</span>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="svg-container flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svgContent || "" }}
    />
  );
}








