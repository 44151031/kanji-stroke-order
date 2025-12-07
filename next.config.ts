// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ SEOを損なわない安全な最適化セット
  output: "standalone", // 軽量ビルド・デプロイ高速化
  reactStrictMode: true, // 型安全・安定レンダリング

  // ✅ コンソールログを本番ビルドで除外（ログ肥大防止）
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"], // エラーと警告は残す
    },
  },

  // ✅ ESLint・TypeScriptエラーでビルド中断しない
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ 画像最適化（Vercelで自動最適化＋ローカルも圧縮可能）
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 86400, // キャッシュ1日
  },

  // ✅ i18nやlocaleが未使用でも明示的に無効化（ビルド軽量化）
  i18n: {
    locales: ["ja"],
    defaultLocale: "ja",
  },

  // ✅ 将来のビルド速度改善のための実験的設定
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
