import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 環境変数が設定されていない場合は警告を出す（エラーは投げない）
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase 環境変数が設定されていません。フォールバックデータを使用します。");
}

// Supabase クライアントを作成（環境変数がなくてもnullにならないようダミーURLで初期化）
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Supabaseが利用可能かどうかをチェック
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);





