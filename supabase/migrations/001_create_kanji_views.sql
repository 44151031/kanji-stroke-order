-- =============================================
-- kanji_views テーブル作成
-- =============================================

-- UUID拡張を有効化（必要な場合）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- テーブル作成
CREATE TABLE IF NOT EXISTS kanji_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kanji TEXT NOT NULL UNIQUE,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（kanji検索用）
CREATE INDEX IF NOT EXISTS idx_kanji_views_kanji ON kanji_views(kanji);
CREATE INDEX IF NOT EXISTS idx_kanji_views_views ON kanji_views(views DESC);

-- RLSを無効化（public read/write）
ALTER TABLE kanji_views DISABLE ROW LEVEL SECURITY;

-- =============================================
-- views をインクリメントする RPC関数
-- =============================================
CREATE OR REPLACE FUNCTION increment_kanji_views(target_kanji TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO kanji_views (kanji, views, updated_at)
  VALUES (target_kanji, 1, NOW())
  ON CONFLICT (kanji)
  DO UPDATE SET 
    views = kanji_views.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 人気ランキング取得用ビュー
-- =============================================
CREATE OR REPLACE VIEW kanji_ranking AS
SELECT 
  kanji,
  views,
  updated_at,
  ROW_NUMBER() OVER (ORDER BY views DESC) as rank
FROM kanji_views
WHERE views > 0
ORDER BY views DESC;

-- コメント追加
COMMENT ON TABLE kanji_views IS '漢字ページの閲覧数を記録するテーブル';
COMMENT ON COLUMN kanji_views.kanji IS '漢字一文字';
COMMENT ON COLUMN kanji_views.views IS '閲覧回数';
COMMENT ON COLUMN kanji_views.updated_at IS '最終更新日時';
COMMENT ON FUNCTION increment_kanji_views IS '指定した漢字の閲覧数を+1する関数';










