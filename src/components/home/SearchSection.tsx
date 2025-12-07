"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SvgAnimator from "@/components/SvgAnimator";
import { getKanjiLink } from "@/lib/linkUtils";

export default function SearchSection() {
  const [searchText, setSearchText] = useState("");
  const [previewChar, setPreviewChar] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = () => {
    if (searchText.trim()) {
      const char = searchText.trim()[0];
      setPreviewChar(char);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const navigateToDetail = () => {
    if (previewChar) {
      router.push(getKanjiLink(previewChar));
    }
  };

  return (
    <>
      {/* 検索エリア */}
      <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">漢字を検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="漢字を入力..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-12 text-lg"
            />
            <Button onClick={handleSearch} className="h-12 px-6">
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビューエリア */}
      {previewChar && (
        <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span>プレビュー:</span>
              <span className="text-2xl">{previewChar}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-64 h-64 border border-border rounded-xl flex items-center justify-center bg-white shadow-inner">
              <SvgAnimator character={previewChar} size={220} />
            </div>
            <Button 
              onClick={navigateToDetail} 
              variant="outline" 
              className="w-full h-12"
            >
              詳細ページへ →
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}




