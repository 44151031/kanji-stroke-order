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
      <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50 mx-4 sm:mx-0">
        <CardHeader className="pb-2 px-4 sm:px-6 pt-3 sm:pt-4">
          <CardTitle className="text-base sm:text-lg font-medium">漢字を検索</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-3 sm:pb-4">
          <div className="flex gap-1">
            <Input
              type="text"
              placeholder="漢字を入力..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-11 sm:h-12 text-base sm:text-lg"
            />
            <Button onClick={handleSearch} className="h-11 sm:h-12 px-4 sm:px-6">
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビューエリア */}
      {previewChar && (
        <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300 mx-4 sm:mx-0 mt-4 sm:mt-6">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
              <span>プレビュー:</span>
              <span className="text-xl sm:text-2xl">{previewChar}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="w-56 h-56 sm:w-64 sm:h-64 border border-border rounded-xl flex items-center justify-center bg-white shadow-inner">
              <SvgAnimator character={previewChar} size={200} />
            </div>
            <Button 
              onClick={navigateToDetail} 
              variant="outline" 
              className="w-full h-11 sm:h-12"
            >
              詳細ページへ →
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}





