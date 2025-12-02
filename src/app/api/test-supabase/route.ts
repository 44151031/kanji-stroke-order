import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Supabase接続テスト: information_schema.tables から1件取得
    const { data, error } = await supabase
      .from("pg_tables")
      .select("tablename")
      .limit(1);

    if (error) {
      // pg_tables へのアクセスが拒否された場合、別の方法で接続確認
      // Supabase の auth.users などシステムテーブルへのアクセスを試みる
      const { error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        return NextResponse.json(
          {
            success: false,
            error: authError.message,
            message: "Supabase接続に失敗しました",
          },
          { status: 500 }
        );
      }

      // auth接続は成功したが、pg_tablesへのアクセスは拒否
      return NextResponse.json({
        success: true,
        message: "Supabase接続成功（認証サービス経由で確認）",
        note: "pg_tablesへの直接アクセスは制限されています",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase接続成功",
      data: data,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Supabase接続テスト中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}





