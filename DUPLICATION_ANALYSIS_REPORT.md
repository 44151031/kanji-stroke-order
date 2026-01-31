# 📊 コード重複分析レポート

## 調査目的
同じソースが複数回書かれていて、コンポーネント化することでメンテナンス性の向上が期待できる箇所を特定する。

## 🔍 発見された重複パターン

### 1. パンくずリスト（Breadcrumb Navigation）

**影響範囲**: 10以上のページファイル

#### 重複箇所
- `src/app/ranking/page.tsx` (55-65行目)
- `src/app/grade/[n]/page.tsx` (88-95行目)
- `src/app/strokes/[n]/page.tsx` (75-82行目)
- `src/app/lists/[type]/page.tsx` (112-119行目)
- `src/app/lists/misorder/page.tsx` (70-77行目)
- `src/app/mistake-kanji/page.tsx` (47-54行目)
- `src/app/confused-kanji/page.tsx` (45-52行目)
- `src/app/radical/page.tsx` (34-41行目)
- `src/app/radical/[slug]/page.tsx` (91-100行目)
- `src/app/kanji/[slug]/page.tsx` (314-325行目)
- `src/app/kanji/[slug]/practice/page.tsx` (198-211行目)

#### 重複コード例

```tsx
{/* パンくず */}
<nav className="w-full text-sm text-muted-foreground">
  <ol className="flex items-center gap-2">
    <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
    <li>/</li>
    <li className="text-foreground">{現在のページ名}</li>
  </ol>
</nav>
```

#### 推奨コンポーネント化
- **コンポーネント名**: `Breadcrumb` または `BreadcrumbNav`
- **ファイルパス**: `src/components/common/Breadcrumb.tsx`
- **props設計**:
  ```tsx
  interface BreadcrumbItem {
    label: string;
    href?: string;
  }
  
  interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
  }
  ```

#### メンテナンス効果
- ✅ 一箇所でスタイル・構造を管理可能
- ✅ アクセシビリティ属性（`aria-label`, `aria-current`）を統一
- ✅ デザイン変更時の影響範囲を最小化

---

### 2. ページヘッダー（Page Header）

**影響範囲**: 10以上のページファイル

#### 重複パターン

**パターンA: シンプルなヘッダー**
```tsx
<header className="text-center">
  <h1 className="text-4xl font-bold mb-2">{タイトル}</h1>
  <p className="text-muted-foreground">{説明文}</p>
</header>
```

**パターンB: 詳細なヘッダー（漢字ページ用）**
```tsx
<header className="text-center">
  <h1 className="text-8xl md:text-9xl font-bold mb-4 leading-none">{kanji}</h1>
  <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
    <span className="px-3 py-1 bg-secondary rounded-full">{gradeLabel}</span>
    <span className="px-3 py-1 bg-secondary rounded-full">{strokes}画</span>
  </div>
</header>
```

#### 重複箇所
- `src/app/ranking/page.tsx` (67-70行目)
- `src/app/lists/[type]/page.tsx` (121-127行目)
- `src/app/grade/[n]/page.tsx` (120-124行目)
- `src/app/strokes/[n]/page.tsx` (84-87行目)
- `src/app/search/page.tsx` (22-28行目)
- `src/app/radical/page.tsx` (43-47行目)
- `src/app/radical/[slug]/page.tsx` (103-112行目)
- `src/app/mistake-kanji/page.tsx` (56-59行目)
- `src/app/confused-kanji/page.tsx` (54-57行目)
- `src/app/lists/misorder/page.tsx` (80-86行目)
- `src/app/kanji/[slug]/page.tsx` (328-333行目)
- `src/app/kanji/[slug]/practice/page.tsx` (214-219行目)

#### 推奨コンポーネント化
- **コンポーネント名**: `PageHeader`
- **ファイルパス**: `src/components/common/PageHeader.tsx`
- **props設計**:
  ```tsx
  interface PageHeaderProps {
    title: string;
    description?: string;
    subtitle?: string;
    emoji?: string;
    badges?: Array<{ label: string; variant?: "default" | "secondary" }>;
    variant?: "default" | "large" | "kanji"; // kanjiは特大サイズ用
    className?: string;
  }
  ```

#### メンテナンス効果
- ✅ タイポグラフィの統一
- ✅ レスポンシブデザインの一貫性
- ✅ SEO最適化（h1タグの使い方）を一元管理

---

### 3. 関連リンクセクション（Related Links）

**影響範囲**: 8以上のページファイル

#### 重複パターン

```tsx
{/* 関連リンク */}
<div className="flex gap-4 text-sm flex-wrap justify-center">
  <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
    学年別一覧 →
  </Link>
  <Link href="/strokes/1" className="text-muted-foreground hover:text-foreground">
    画数別一覧 →
  </Link>
  <Link href="/radical" className="text-muted-foreground hover:text-foreground">
    部首別一覧 →
  </Link>
</div>
```

#### 重複箇所
- `src/app/ranking/page.tsx` (82-102行目)
- `src/app/grade/[n]/page.tsx` (200-208行目)
- `src/app/strokes/[n]/page.tsx` (162-171行目)
- `src/app/lists/[type]/page.tsx` (198-221行目)
- `src/app/mistake-kanji/page.tsx` (176-184行目)
- `src/app/confused-kanji/page.tsx` (173-181行目)
- `src/app/lists/misorder/page.tsx` (172-180行目)
- `src/app/radical/page.tsx` (102-111行目)
- `src/app/radical/[slug]/page.tsx` (174-182行目)

#### 推奨コンポーネント化
- **コンポーネント名**: `RelatedLinks` または `PageNavigationLinks`
- **ファイルパス**: `src/components/common/RelatedLinks.tsx`
- **props設計**:
  ```tsx
  interface RelatedLink {
    label: string;
    href: string;
    emoji?: string;
    show?: boolean; // 条件付き表示用
  }
  
  interface RelatedLinksProps {
    links: RelatedLink[];
    variant?: "default" | "minimal";
    className?: string;
  }
  ```

#### メンテナンス効果
- ✅ リンク一覧を一元管理
- ✅ ナビゲーション構造の変更を容易に
- ✅ 条件付き表示ロジックを統一

---

### 4. JSON-LD構造化データのスクリプトタグ

**影響範囲**: 5ページファイル

#### 重複パターン

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

#### 重複箇所
- `src/app/layout.tsx` (87-88行目)
- `src/app/ranking/page.tsx` (44-50行目)
- `src/app/kanji/[slug]/page.tsx` (300-307行目)
- `src/app/kanji/[slug]/practice/page.tsx` (187-192行目)
- `src/app/articles/common-misorder-kanji/page.tsx` (93-98行目)

#### 推奨コンポーネント化
- **コンポーネント名**: `StructuredDataScript`
- **ファイルパス**: `src/components/common/StructuredDataScript.tsx`
- **props設計**:
  ```tsx
  interface StructuredDataScriptProps {
    data: object | object[]; // 単一または複数のJSON-LDオブジェクト
    id?: string;
  }
  ```

#### メンテナンス効果
- ✅ エスケープ処理を一元管理
- ✅ 複数のJSON-LDを配列で渡せる
- ✅ 型安全性の向上

---

### 5. ページラッパー（Page Container）

**影響範囲**: ほぼ全ページ

#### 重複パターン

```tsx
<div className="flex flex-col items-center gap-8">
  {/* コンテンツ */}
</div>
```

または

```tsx
<div className="flex flex-col items-center gap-10">
  {/* コンテンツ */}
</div>
```

#### 重複箇所
- ほぼすべてのページファイル

#### 推奨コンポーネント化
- **コンポーネント名**: `PageContainer`
- **ファイルパス**: `src/components/layout/PageContainer.tsx`
- **props設計**:
  ```tsx
  interface PageContainerProps {
    children: React.ReactNode;
    gap?: "sm" | "md" | "lg"; // gap-8, gap-10, gap-12など
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
    className?: string;
  }
  ```

#### メンテナンス効果
- ✅ レイアウトの一貫性
- ✅ レスポンシブ調整を一元管理

---

### 6. 漢字カードグリッド（Kanji Grid）

**影響範囲**: 4ページファイル

#### 重複パターン

```tsx
<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
  {kanjiList.map((k) => (
    <Link
      key={k.kanji}
      href={getKanjiLink(k.kanji)}
      className="flex flex-col items-center p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all group"
    >
      <span className="text-3xl font-bold group-hover:scale-110 transition-transform">
        {k.kanji}
      </span>
      {/* メタ情報 */}
    </Link>
  ))}
</div>
```

#### 重複箇所
- `src/app/lists/[type]/page.tsx` (135-154行目)
- `src/app/grade/[n]/page.tsx` (類似パターン)
- `src/app/strokes/[n]/page.tsx` (類似パターン)

#### 推奨コンポーネント化
- **コンポーネント名**: `KanjiGrid`
- **ファイルパス**: `src/components/kanji/KanjiGrid.tsx`
- **既存コンポーネント**: `KanjiFeatureList.tsx` が類似しているが、より汎用的に

#### メンテナンス効果
- ✅ グリッドレイアウトの統一
- ✅ ホバーエフェクトの一貫性
- ✅ レスポンシブ対応を一元管理

---

## 📊 優先度別まとめ

### 🔴 高優先度（即座にコンポーネント化推奨）

1. **パンくずリスト** - 10ファイル以上で重複、アクセシビリティ向上の余地あり
2. **ページヘッダー** - 10ファイル以上で重複、SEO最適化の統一に有効

### 🟡 中優先度（次フェーズでコンポーネント化）

3. **関連リンクセクション** - 8ファイル以上で重複
4. **JSON-LDスクリプトタグ** - 型安全性とエスケープ処理の統一

### 🟢 低優先度（将来的に検討）

5. **ページラッパー** - レイアウトの統一化に有効だが、既存コードへの影響大
6. **漢字カードグリッド** - 既存の `KanjiFeatureList` との統合を検討

---

## 💡 推奨実装順序

1. **Phase 1**: パンくずリスト + ページヘッダー
2. **Phase 2**: 関連リンクセクション + JSON-LDスクリプトタグ
3. **Phase 3**: ページラッパー + 漢字カードグリッドの改善

---

## 📝 実装時の注意点

1. **既存のデザインを維持** - コンポーネント化時に見た目を変更しない
2. **段階的移行** - 一度にすべてを変更せず、ページごとに順次移行
3. **型安全性** - TypeScriptの型定義を適切に設定
4. **アクセシビリティ** - ARIA属性などを統一
5. **テスト** - コンポーネント化後の動作確認を徹底

---

**生成日時**: 2025-01-03  
**調査範囲**: `src/app/**/*.tsx` 全ファイル










