"use client";

import { useEffect, useState, useCallback } from "react";

type Props = {
  ucsHex: string;
  kanji: string;
  size?: number;
};

export default function KanjiSvgViewer({ ucsHex, kanji, size = 260 }: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSvg = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // publicフォルダから直接読み込み
      const response = await fetch(`/kanjivg/${ucsHex}.svg`);
      if (!response.ok) {
        throw new Error("SVG not found");
      }
      const svg = await response.text();
      const animatedSvg = animateSvg(svg, size);
      setSvgContent(animatedSvg);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [ucsHex, size]);

  useEffect(() => {
    loadSvg();
  }, [loadSvg]);

  // 再生ボタン用
  const handleReplay = () => {
    loadSvg();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !svgContent) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
        <span className="text-8xl font-light">{kanji}</span>
        <span className="text-sm mt-2">SVG準備中</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="svg-container"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <button
        onClick={handleReplay}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        🔄 もう一度再生
      </button>
    </div>
  );
}

function animateSvg(svgString: string, size: number): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  
  if (!svg) return svgString;

  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 109 109");

  const paths = svg.querySelectorAll("path[d]");
  let totalDelay = 0;
  const strokeDuration = 0.5;

  paths.forEach((pathEl) => {
    const d = pathEl.getAttribute("d");
    if (!d) return;

    const length = estimateLength(d);
    pathEl.setAttribute("stroke", "#1a1a1a");
    pathEl.setAttribute("stroke-width", "4");
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute("stroke-linejoin", "round");
    pathEl.setAttribute("stroke-dasharray", length.toString());
    pathEl.setAttribute("stroke-dashoffset", length.toString());
    pathEl.setAttribute("style", `animation: drawStroke ${strokeDuration}s ease-out ${totalDelay}s forwards;`);
    
    totalDelay += strokeDuration * 0.8;
  });

  let style = svg.querySelector("style") as SVGStyleElement | null;
  if (!style) {
    style = doc.createElementNS("http://www.w3.org/2000/svg", "style") as SVGStyleElement;
    svg.insertBefore(style, svg.firstChild);
  }
  style.textContent = `
    @keyframes drawStroke { to { stroke-dashoffset: 0; } }
    text { display: none; }
  `;

  return new XMLSerializer().serializeToString(svg);
}

function estimateLength(d: string): number {
  const commands = d.match(/[MLHVCSQTAZ]/gi) || [];
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  return Math.max(commands.length * 20 + numbers.length * 5, 150);
}
