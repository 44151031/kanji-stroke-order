# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## プロジェクト概要

漢字の書き順をSVGアニメーションで表示する教育サイト（kanji-stroke-order.com）。Next.js 16 App Router + TypeScript + Tailwind CSS 4 + shadcn/ui。Vercelにデプロイ。

## コマンド

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint実行

# テスト
npm test             # Vitest実行（全テスト）
npm run test:watch   # ウォッチモード
npm run test:ui      # Vitest UI

# データ生成
npm run generate:kanji    # 全漢字データ一括ビルド（scripts/build_all.ts）
npm run generate:details  # 個別漢字JSONファイル生成
npm run scrape:all        # Webスクレイピング一括実行
npm run scrape:qa         # スクレイピング後QAチェック
npm run radical:pipeline  # 部首データ全パイプライン
```

## アーキテクチャ

### ルーティング（App Router）

- `/kanji/[slug]` — 漢字詳細ページ。slugはUnicode形式（例: `u5C71` = 山）
- `/kanji/[slug]/practice` — 書き順練習モード
- `/grade/[n]` — 学年別（1〜6: 小学校、7: 中学校）
- `/strokes/[n]` — 画数別
- `/radical/[slug]` — 部首別
- ミドルウェア（`src/middleware.ts`）が `/kanji/山` → `/kanji/u5C71` へ301リダイレクト、小文字スラッグの大文字正規化も処理

### データレイヤー

**静的JSONファイル（`data/`ディレクトリ）:**
- `kanji-joyo.json` — 常用漢字2136字のインデックス
- `kanji-meta.json` — 各漢字のメタデータ
- `kanji-dictionary.json` — 漢字辞典データ
- `words-by-kanji.json` — 漢字別の例語
- `kanji-details/` — 個別漢字の詳細JSONファイル（2100+件）

**SVGデータ（外部取得）:**
- KanjiVG（GitHub raw）→ 漢字の書き順SVG
- animCJK（GitHub raw）→ ひらがな・カタカナSVG

**Supabase:** オプション（未設定時はフォールバックモードで動作）。匿名ユーザー追跡・ランキング・閲覧履歴に使用。

### API Routes（`src/app/api/`）

- `/api/generate-svg?char=水` — KanjiVGからSVG取得
- `/api/kanji-data?type=joyo|meta|words|extra` — 漢字データ取得
- `/api/og-home`, `/api/og-kanji` — OGP画像生成（@vercel/og）

### 主要コンポーネント

- `SvgAnimator.tsx` — SVGアニメーションのコア
- `StrokeAnimation.tsx` / `StrokeController.tsx` — 書き順アニメーション制御
- `StrokePracticeCanvas.tsx` — 練習モードのCanvas
- `SearchContent.tsx` — fuse.jsによる検索

### データ生成パイプライン

`scripts/`配下にデータ生成スクリプト群（tsxで実行）。GitHub Actionsで毎週日曜3:00 JST自動スクレイピング（`.github/workflows/scrape-kanji.yml`）。

## コーディング規約

- TypeScript必須、`src/`ベースのディレクトリ構成
- パスエイリアス: `@/*` → `./src/*`
- UIデザイン: 白ベースのミニマルデザイン（背景 `#f8f7f2`、テキスト `#111`）
- UIコンポーネント: shadcn/ui（new-yorkスタイル、Lucide Reactアイコン）
- SEOファースト: 各ページにメタデータ・構造化データ（JSON-LD）・OGP画像を設定
- Supabase未設定でも動作するようフォールバック必須
