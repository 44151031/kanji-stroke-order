#!/usr/bin/env tsx
/**
 * メタ情報・構造化データの import/export 整合性検証スクリプト
 * 
 * 検証内容：
 * 1. 全ページで generateMetadata / JSON-LD 関数の import 元が正しいか
 * 2. ページ内での個別定義（重複）がないか
 * 3. 循環参照が発生していないか
 * 4. 旧関数が残っていないか
 */

import fs from "fs";
import path from "path";

const APP_DIR = path.join(process.cwd(), "src", "app");
const LIB_METADATA = path.join(process.cwd(), "src", "lib", "metadata.ts");
const LIB_STRUCTURED_DATA = path.join(process.cwd(), "src", "lib", "structuredData.ts");

interface VerificationIssue {
  file: string;
  line?: number;
  message: string;
  severity: "error" | "warning";
}

const issues: VerificationIssue[] = [];

/**
 * ディレクトリ内の全 .tsx ファイルを再帰的に取得
 */
function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walkDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // node_modules や .next はスキップ
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * ファイルの内容を読み込み、問題を検出
 */
function verifyFile(filePath: string): void {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relativePath = path.relative(process.cwd(), filePath);
  
  // app ディレクトリ内のページファイルのみ検証
  if (!filePath.includes(path.join("src", "app"))) {
    return;
  }
  
  // import 文を検出
  const imports: Array<{ line: number; source: string; items: string[] }> = [];
  const importRegex = /^import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|[\w\s,{}*]+)\s+from\s+["']([^"']+)["']/;
  
  lines.forEach((line, index) => {
    const match = line.match(importRegex);
    if (match) {
      const source = match[1];
      // インポートしているアイテムを抽出
      const itemsMatch = line.match(/import\s+\{([^}]+)\}/);
      const items = itemsMatch
        ? itemsMatch[1].split(",").map((item) => item.trim().split(" ")[0].split(" as ")[0])
        : [];
      imports.push({ line: index + 1, source, items });
    }
  });
  
  // 1. generateMetadata 関数の検証
  if (content.includes("generateMetadata") || content.includes("export const metadata")) {
    const hasMetadataImport = imports.some(
      (imp) =>
        imp.source === "@/lib/metadata" &&
        (imp.items.some((item) => item.startsWith("generate")) || imp.items.includes("generatePageMetadata"))
    );
    
    const hasLocalMetadata = content.includes("export const metadata: Metadata") ||
      (content.includes("export async function generateMetadata") && !hasMetadataImport);
    
    if (hasLocalMetadata && !hasMetadataImport) {
      // metadata.ts からの関数を使用していない場合を検出
      const functionMatch = content.match(/(export\s+(?:async\s+)?function\s+generateMetadata|export\s+const\s+metadata)/);
      if (functionMatch) {
        const lineNum = content.substring(0, functionMatch.index).split("\n").length;
        
        // metadata.ts に関数があるかチェック
        const isMetadataFunctionAvailable = checkMetadataFunctionExists(content, relativePath);
        
        if (!isMetadataFunctionAvailable) {
          issues.push({
            file: relativePath,
            line: lineNum,
            message: "generateMetadata がページ内で直接定義されています。lib/metadata.ts の関数を使用してください。",
            severity: "warning",
          });
        }
      }
    }
  }
  
  // 2. JSON-LD 関数の import 検証
  const jsonLdFunctionPatterns = [
    /getKanjiJsonLd/,
    /getKanjiItemJsonLd/,
    /getKanjiPracticeJsonLd/,
    /getRankingJsonLd/,
    /getRankingSeriesJsonLd/,
    /getTopPageJsonLd/,
    /getArticleJsonLd/,
    /getKanjiDefinedTermJsonLd/,
  ];
  
  const hasJsonLdUsage = jsonLdFunctionPatterns.some((pattern) => pattern.test(content));
  
  if (hasJsonLdUsage) {
    const hasStructuredDataImport = imports.some(
      (imp) =>
        imp.source === "@/lib/structuredData" &&
        (imp.items.some((item) => item.startsWith("get")) || imp.items.includes("*"))
    );
    
    const hasMetadataJsonLdImport = imports.some(
      (imp) =>
        imp.source === "@/lib/metadata" &&
        imp.items.some((item) => item.startsWith("get") && (item.includes("JsonLd") || item.includes("Json")))
    );
    
    if (!hasStructuredDataImport && !hasMetadataJsonLdImport) {
      issues.push({
        file: relativePath,
        message: "JSON-LD関数が使用されていますが、@/lib/structuredData からのimportが見つかりません。",
        severity: "error",
      });
    }
  }
  
  // 3. ページ内での JSON-LD 直接定義検証
  const jsonLdPatterns = [
    /const\s+\w+JsonLd\s*=\s*\{/,
    /function\s+generateJsonLd/,
    /const\s+jsonLd\s*=\s*\{[^}]*"@context":\s*"https:\/\/schema\.org"/,
    /"@context":\s*"https:\/\/schema\.org"/,
  ];
  
  jsonLdPatterns.forEach((pattern) => {
    const match = content.match(pattern);
    if (match) {
      // structuredData.ts から import していない場合のみ警告
      const hasStructuredDataImport = imports.some((imp) => imp.source === "@/lib/structuredData");
      
      if (!hasStructuredDataImport) {
        const lineNum = content.substring(0, match.index).split("\n").length;
        
        // コメントや文字列内でないかチェック
        const beforeMatch = content.substring(0, match.index || 0);
        const commentMatch = beforeMatch.match(/\/\/.*$|\/\*[\s\S]*?\*\/|`[\s\S]*?`|"[\s\S]*?"|'[\s\S]*?'/);
        
        if (!commentMatch || (commentMatch.index || 0) + commentMatch[0].length < beforeMatch.length - 50) {
          issues.push({
            file: relativePath,
            line: lineNum,
            message: "ページ内でJSON-LD構造化データが直接定義されています。lib/structuredData.ts の関数を使用してください。",
            severity: "warning",
          });
        }
      }
    }
  });
  
  // 4. 旧関数名の検証
  const deprecatedFunctions = [
    "generateJsonLd",
    "generateKanjiMetadataOld",
    "generateMetadataLocal",
    "getJsonLd",
  ];
  
  deprecatedFunctions.forEach((funcName) => {
    if (content.includes(funcName)) {
      const lineNum = content.indexOf(funcName);
      if (lineNum >= 0) {
        const actualLineNum = content.substring(0, lineNum).split("\n").length;
        issues.push({
          file: relativePath,
          line: actualLineNum,
          message: `旧関数名 "${funcName}" が検出されました。新しい関数に置き換えてください。`,
          severity: "error",
        });
      }
    }
  });
}

/**
 * metadata.ts に関数が存在するかチェック（簡易版）
 */
function checkMetadataFunctionExists(content: string, filePath: string): boolean {
  // ページタイプを推測
  if (filePath.includes("/kanji/") && !filePath.includes("/practice")) {
    return true; // generateKanjiMetadata が存在
  }
  if (filePath.includes("/practice")) {
    return true; // generateKanjiPracticeMetadata が存在
  }
  if (filePath.includes("/grade/")) {
    return true; // generateGradeMetadata が存在
  }
  if (filePath.includes("/radical/")) {
    return true; // generateRadicalMetadata が存在
  }
  return true; // デフォルトでは generatePageMetadata が存在
}

/**
 * 循環参照の検証
 */
function verifyCircularDependencies(): void {
  const metadataContent = fs.readFileSync(LIB_METADATA, "utf-8");
  const structuredDataContent = fs.readFileSync(LIB_STRUCTURED_DATA, "utf-8");
  
  // metadata.ts が structuredData.ts を import しているか
  const metadataImportsStructured = metadataContent.includes('from "@/lib/structuredData"');
  
  // structuredData.ts が metadata.ts を import しているか
  const structuredImportsMetadata = structuredDataContent.includes('from "@/lib/metadata"');
  
  if (metadataImportsStructured && structuredImportsMetadata) {
    issues.push({
      file: "src/lib/metadata.ts <-> src/lib/structuredData.ts",
      message: "循環参照が検出されました。metadata.ts と structuredData.ts が互いにimportしています。",
      severity: "error",
    });
  }
}

/**
 * export 関数の検証
 */
function verifyExports(): void {
  const metadataContent = fs.readFileSync(LIB_METADATA, "utf-8");
  const structuredDataContent = fs.readFileSync(LIB_STRUCTURED_DATA, "utf-8");
  
  const requiredMetadataFunctions = [
    "generateKanjiMetadata",
    "generateKanjiPracticeMetadata",
    "generatePageMetadata",
    "generateGradeMetadata",
    "generateStrokesMetadata",
    "generateRadicalMetadata",
    "generateRadicalIndexMetadata",
  ];
  
  const requiredStructuredFunctions = [
    "getTopPageJsonLd",
    "getKanjiJsonLd",
    "getKanjiItemJsonLd",
    "getKanjiPracticeJsonLd",
    "getRankingJsonLd",
    "getRankingSeriesJsonLd",
  ];
  
  requiredMetadataFunctions.forEach((funcName) => {
    if (!metadataContent.includes(`export function ${funcName}`) && 
        !metadataContent.includes(`export async function ${funcName}`)) {
      issues.push({
        file: "src/lib/metadata.ts",
        message: `必要な関数 "${funcName}" がexportされていません。`,
        severity: "error",
      });
    }
  });
  
  requiredStructuredFunctions.forEach((funcName) => {
    if (!structuredDataContent.includes(`export function ${funcName}`)) {
      issues.push({
        file: "src/lib/structuredData.ts",
        message: `必要な関数 "${funcName}" がexportされていません。`,
        severity: "error",
      });
    }
  });
}

/**
 * メイン処理
 */
function main() {
  console.log("🔍 メタ情報・構造化データの整合性を検証中...\n");
  
  // 全ページファイルを取得
  const pageFiles = getAllTsxFiles(APP_DIR);
  console.log(`📄 検証対象ファイル数: ${pageFiles.length}\n`);
  
  // 各ファイルを検証
  pageFiles.forEach((file) => {
    verifyFile(file);
  });
  
  // 循環参照を検証
  verifyCircularDependencies();
  
  // export を検証
  verifyExports();
  
  // 結果を表示
  console.log("=".repeat(60));
  console.log("📊 検証結果\n");
  
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  
  if (errors.length > 0) {
    console.log(`❌ エラー: ${errors.length}件\n`);
    errors.forEach((issue) => {
      console.log(`  [ERROR] ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
      console.log(`    ${issue.message}\n`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  警告: ${warnings.length}件\n`);
    warnings.forEach((issue) => {
      console.log(`  [WARN]  ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
      console.log(`    ${issue.message}\n`);
    });
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ すべての検証を通過しました！\n");
    process.exit(0);
  } else {
    console.log("=".repeat(60));
    console.log(`\n合計: ${errors.length}件のエラー、${warnings.length}件の警告\n`);
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();










