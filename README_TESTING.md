# 🧪 テスト・検証ガイド

## 📋 概要

このプロジェクトでは、メタ情報と構造化データの統合を自動検証・テストするためのスクリプトとテストを用意しています。

## 🔍 検証スクリプト

### 使用方法

```bash
# メタ情報・構造化データの整合性を検証
npm run verify:metadata
```

### 検証内容

1. **Import 整合性チェック**
   - 全ページで `generateMetadata` / JSON-LD 関数の import 元が正しいか
   - `@/lib/metadata` または `@/lib/structuredData` からインポートしているか

2. **重複定義チェック**
   - ページ内で直接 `metadata` や JSON-LD を定義していないか
   - `lib/metadata.ts` や `lib/structuredData.ts` の関数を使用しているか

3. **循環参照チェック**
   - `metadata.ts` と `structuredData.ts` の間に循環参照がないか

4. **旧関数検出**
   - 非推奨の関数名が使用されていないか

5. **Export 確認**
   - 必要な関数がすべて export されているか

## 🧪 テスト

### セットアップ

```bash
# Vitest をインストール（初回のみ）
npm install -D vitest @vitest/ui
```

### テスト実行

```bash
# 全テストを実行
npm run test

# ウォッチモード（ファイル変更を検知して自動実行）
npm run test:watch

# UIモード（ブラウザでテスト結果を確認）
npm run test:ui
```

### テスト内容

#### メタデータ生成関数のテスト
- `generateKanjiMetadata()` - 漢字ページ用メタデータ
- `generateKanjiPracticeMetadata()` - 書き取りテスト用メタデータ
- `generatePageMetadata()` - 汎用ページ用メタデータ
- `generateGradeMetadata()` - 学年ページ用メタデータ
- `generateStrokesMetadata()` - 画数ページ用メタデータ
- `generateRadicalMetadata()` - 部首ページ用メタデータ

#### 構造化データ（JSON-LD）関数のテスト
- `getTopPageJsonLd()` - トップページ用
- `getKanjiJsonLd()` - 漢字ページ用
- `getKanjiItemJsonLd()` - 漢字ページ用（ランキング連携版）
- `getKanjiPracticeJsonLd()` - 書き取りテスト用
- `getRankingJsonLd()` - ランキングページ用
- `getRankingSeriesJsonLd()` - ランキングシリーズ用
- `getArticleJsonLd()` - 記事ページ用
- `getKanjiDefinedTermJsonLd()` - 漢字ページ用（DefinedTerm版）

#### 統合テスト
- メタデータと JSON-LD の URL 整合性
- タイトルと名前の整合性

## 📁 ファイル構成

```
.
├── scripts/
│   └── verify-metadata-imports.ts  # 検証スクリプト
├── tests/
│   └── metadataStructuredData.spec.ts  # テストファイル
├── vitest.config.ts                # Vitest設定
└── VERIFICATION_REPORT.md          # 検証結果レポート
```

## ✅ 成功基準

- ✅ 検証スクリプトがエラーなしで実行完了
- ✅ すべてのテストが PASS
- ✅ 循環参照がない
- ✅ すべてのページで統一された import を使用

## 🔧 トラブルシューティング

### 検証スクリプトでエラーが出る場合

1. **Import エラー**
   - `@/lib/metadata` または `@/lib/structuredData` から正しくインポートしているか確認
   - ページ内で直接定義していないか確認

2. **循環参照エラー**
   - `metadata.ts` が `structuredData.ts` を import するのは OK
   - 逆方向（`structuredData.ts` → `metadata.ts`）は NG

### テストが失敗する場合

1. **関数が見つからない**
   - `lib/metadata.ts` または `lib/structuredData.ts` に関数が定義されているか確認
   - export されているか確認

2. **型エラー**
   - TypeScript の型定義が正しいか確認
   - `vitest.config.ts` の alias 設定が正しいか確認

## 📚 参考リンク

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org JSON-LD](https://schema.org/docs/gs.html)









