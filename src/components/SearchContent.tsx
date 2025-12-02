"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanjiEntry {
  kanji: string;
  readings?: { onyomi: string[]; kunyomi: string[] };
  meanings?: string[];
  grade?: number;
  strokes?: number;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [kanjiData, setKanjiData] = useState<KanjiEntry[]>([]);
  const [results, setResults] = useState<KanjiEntry[]>([]);

  // URLパラメータ変更時にqueryを更新
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        const [joyoRes, metaRes] = await Promise.all([
          fetch("/api/kanji-data?type=joyo"),
          fetch("/api/kanji-data?type=meta"),
        ]);
        
        if (joyoRes.ok && metaRes.ok) {
          const joyo = await joyoRes.json();
          const meta = await metaRes.json();
          
          // データをマージ
          const merged = joyo.map((k: { kanji: string; grade: number; strokes: number }) => {
            const m = meta.find((m: KanjiEntry) => m.kanji === k.kanji);
            return { ...k, ...m };
          });
          setKanjiData(merged);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Fuse.js検索
  const fuse = useMemo(() => {
    return new Fuse(kanjiData, {
      keys: [
        { name: "kanji", weight: 2 },
        { name: "readings.onyomi", weight: 1 },
        { name: "readings.kunyomi", weight: 1 },
        { name: "meanings", weight: 0.5 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [kanjiData]);

  useEffect(() => {
    if (query.trim() && kanjiData.length > 0) {
      const searchResults = fuse.search(query).map((r) => r.item);
      setResults(searchResults.slice(0, 50));
    } else {
      setResults([]);
    }
  }, [query, fuse, kanjiData]);

  return (
    <>
      <div className="w-full max-w-md">
        <Input
          type="text"
          placeholder="漢字・読み・意味を入力..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-lg"
          autoFocus
        />
      </div>

      {results.length > 0 && (
        <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>検索結果 ({results.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {results.map((k) => (
                <Link
                  key={k.kanji}
                  href={`/kanji/${encodeURIComponent(k.kanji)}`}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <span className="text-3xl">{k.kanji}</span>
                  <div className="text-sm">
                    {k.readings?.onyomi?.[0] && (
                      <p className="text-muted-foreground">{k.readings.onyomi[0]}</p>
                    )}
                    {k.readings?.kunyomi?.[0] && (
                      <p>{k.readings.kunyomi[0]}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {query && results.length === 0 && kanjiData.length > 0 && (
        <p className="text-muted-foreground">「{query}」に一致する漢字が見つかりませんでした</p>
      )}
    </>
  );
}


