-- =============================================
-- kanji_view_logs テーブル作成（期間別ランキング用）
-- =============================================

-- 閲覧ログテーブル（各閲覧を個別に記録）
CREATE TABLE IF NOT EXISTS kanji_view_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kanji TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（期間フィルタ用）
CREATE INDEX IF NOT EXISTS idx_kanji_view_logs_kanji ON kanji_view_logs(kanji);
CREATE INDEX IF NOT EXISTS idx_kanji_view_logs_viewed_at ON kanji_view_logs(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_kanji_view_logs_kanji_viewed_at ON kanji_view_logs(kanji, viewed_at DESC);

-- RLSを無効化
ALTER TABLE kanji_view_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 閲覧ログを追加する関数
-- =============================================
CREATE OR REPLACE FUNCTION log_kanji_view(target_kanji TEXT)
RETURNS void AS $$
BEGIN
  -- 閲覧ログを追加
  INSERT INTO kanji_view_logs (kanji, viewed_at)
  VALUES (target_kanji, NOW());
  
  -- 既存のkanji_viewsも更新（後方互換性のため）
  INSERT INTO kanji_views (kanji, views, updated_at)
  VALUES (target_kanji, 1, NOW())
  ON CONFLICT (kanji)
  DO UPDATE SET 
    views = kanji_views.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 期間別ランキング取得関数
-- =============================================
CREATE OR REPLACE FUNCTION get_kanji_ranking_by_period(period_days INTEGER DEFAULT 7)
RETURNS TABLE (
  kanji TEXT,
  view_count BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kvl.kanji,
    COUNT(*) as view_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
  FROM kanji_view_logs kvl
  WHERE kvl.viewed_at >= (NOW() - (period_days || ' days')::INTERVAL)
  GROUP BY kvl.kanji
  ORDER BY view_count DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON TABLE kanji_view_logs IS '漢字ページの閲覧ログ（期間別ランキング用）';
COMMENT ON COLUMN kanji_view_logs.kanji IS '閲覧された漢字';
COMMENT ON COLUMN kanji_view_logs.viewed_at IS '閲覧日時';
COMMENT ON FUNCTION log_kanji_view IS '漢字の閲覧を記録する関数';
COMMENT ON FUNCTION get_kanji_ranking_by_period IS '期間別ランキングを取得する関数';
