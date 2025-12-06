-- stroke_tests テーブル作成（書き取りテストスコア保存用）
-- 匿名ユーザーでも進捗管理ができるように設計

CREATE TABLE IF NOT EXISTS stroke_tests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid, -- 匿名ユーザーID（nullable）
  kanji_code text NOT NULL, -- 漢字コード（例: "u6c34"）
  score int, -- スコア（0-100点）
  created_at timestamp DEFAULT now()
);

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_stroke_tests_user_id ON stroke_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_stroke_tests_kanji_code ON stroke_tests(kanji_code);
CREATE INDEX IF NOT EXISTS idx_stroke_tests_created_at ON stroke_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stroke_tests_user_kanji ON stroke_tests(user_id, kanji_code);

-- RLS（Row Level Security）は無効化（匿名ユーザー対応のため）
ALTER TABLE stroke_tests DISABLE ROW LEVEL SECURITY;

-- コメント
COMMENT ON TABLE stroke_tests IS '書き取りテストスコア保存テーブル（匿名ユーザー対応）';
COMMENT ON COLUMN stroke_tests.user_id IS 'ユーザーID（匿名ユーザーUUID）';
COMMENT ON COLUMN stroke_tests.kanji_code IS '漢字コード（例: u6c34）';
COMMENT ON COLUMN stroke_tests.score IS 'スコア（0-100点）';
COMMENT ON COLUMN stroke_tests.created_at IS '作成日時';
