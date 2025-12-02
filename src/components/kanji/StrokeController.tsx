"use client";

import { Button } from "@/components/ui/button";

interface StrokeControllerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  speed: number;
  onSpeedChange: (val: number) => void;
  currentStroke?: number;
  totalStrokes?: number;
  disabled?: boolean;
}

export default function StrokeController({
  isPlaying,
  onTogglePlay,
  onReset,
  onPrev,
  onNext,
  speed,
  onSpeedChange,
  currentStroke,
  totalStrokes,
  disabled = false,
}: StrokeControllerProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 進捗表示 */}
      {currentStroke !== undefined && totalStrokes !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{currentStroke}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{totalStrokes} 画</span>
        </div>
      )}

      {/* プログレスバー */}
      {currentStroke !== undefined && totalStrokes !== undefined && totalStrokes > 0 && (
        <div className="w-full max-w-[300px] h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStroke / totalStrokes) * 100}%` }}
          />
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onPrev && (
          <Button
            onClick={onPrev}
            variant="outline"
            size="sm"
            disabled={disabled || currentStroke === 0}
            className="px-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="ml-1">前</span>
          </Button>
        )}

        <Button
          onClick={onTogglePlay}
          variant="default"
          size="sm"
          disabled={disabled}
          className={`px-4 min-w-[90px] ${
            isPlaying 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-primary hover:bg-primary/90"
          }`}
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

        {onNext && (
          <Button
            onClick={onNext}
            variant="outline"
            size="sm"
            disabled={disabled || (currentStroke !== undefined && totalStrokes !== undefined && currentStroke >= totalStrokes)}
            className="px-3"
          >
            <span className="mr-1">次</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Button>
        )}

        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="px-3"
          title="リセット"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
      </div>

      {/* 速度調整 */}
      <div className="flex items-center gap-3 w-full max-w-[300px]">
        <span className="text-lg">🐢</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.1}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary disabled:opacity-50"
        />
        <span className="text-lg">🐇</span>
        <span className="text-xs text-muted-foreground w-12 text-right">{speed.toFixed(1)}x</span>
      </div>

      {/* キーボードショートカットヒント */}
      <div className="text-xs text-muted-foreground text-center hidden sm:block">
        Space: 再生/停止 | ←→: 前/次 | R: リセット
      </div>
    </div>
  );
}

