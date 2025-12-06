"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const ANONYMOUS_USER_KEY = "kanji_anonymous_user_id";

/**
 * 匿名ユーザーセッション管理フック
 * Supabase Authの匿名認証を使用し、localStorageに保存して再利用
 */
export function useAnonymousUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getOrCreateAnonymousUser = async () => {
      setIsLoading(true);

      try {
        // 既にlocalStorageに保存されている場合は再利用
        const savedUserId = localStorage.getItem(ANONYMOUS_USER_KEY);
        if (savedUserId) {
          setUserId(savedUserId);
          setIsLoading(false);
          return;
        }

        // Supabaseが設定されている場合は匿名認証を試みる
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) {
              console.warn("匿名認証エラー（フォールバック）:", error.message);
              // エラーの場合はUUIDを生成してフォールバック
              const fallbackUserId = crypto.randomUUID();
              localStorage.setItem(ANONYMOUS_USER_KEY, fallbackUserId);
              setUserId(fallbackUserId);
            } else if (data.user) {
              // 匿名認証成功
              const anonymousUserId = data.user.id;
              localStorage.setItem(ANONYMOUS_USER_KEY, anonymousUserId);
              setUserId(anonymousUserId);
            }
          } catch (err) {
            console.warn("Supabase匿名認証失敗（フォールバック）:", err);
            // ネットワークエラーなどの場合はUUIDを生成
            const fallbackUserId = crypto.randomUUID();
            localStorage.setItem(ANONYMOUS_USER_KEY, fallbackUserId);
            setUserId(fallbackUserId);
          }
        } else {
          // Supabaseが設定されていない場合はUUIDを生成
          const fallbackUserId = crypto.randomUUID();
          localStorage.setItem(ANONYMOUS_USER_KEY, fallbackUserId);
          setUserId(fallbackUserId);
        }
      } catch (err) {
        console.error("匿名ユーザー作成エラー:", err);
        // 最終的なフォールバック
        const fallbackUserId = crypto.randomUUID();
        localStorage.setItem(ANONYMOUS_USER_KEY, fallbackUserId);
        setUserId(fallbackUserId);
      } finally {
        setIsLoading(false);
      }
    };

    getOrCreateAnonymousUser();
  }, []);

  return { userId, isLoading };
}
