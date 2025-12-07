#!/usr/bin/env tsx

/**
 * 部首ページの404エラーを調査するスクリプト
 * 
 * 1. generateStaticParams で生成されるスラッグの一覧を取得
 * 2. data/radicals/ ディレクトリ内のJSONファイルの一覧を取得
 * 3. 差分を調査
 */

import * as fs from "fs";
import * as path from "path";
import radicalList, {
  buildSlugIndex,
  getUniqueSlug,
} from "../src/lib/radicalList";

const radicalsDir = path.join(process.cwd(), "data", "radicals");

console.log("========================================");
console.log("🔍 部首ページの404エラー調査");
console.log("========================================");
console.log();

// 1. generateStaticParams で生成されるスラッグの一覧
console.log("📝 generateStaticParams で生成されるスラッグ一覧を取得中...");
const counts = buildSlugIndex(radicalList);
const generatedSlugs = radicalList.map((r) => getUniqueSlug(r, counts));
console.log(`✅ ${generatedSlugs.length} 件のスラッグを生成`);
console.log();

// 2. data/radicals/ ディレクトリ内のJSONファイルの一覧
console.log("📁 data/radicals/ ディレクトリ内のJSONファイル一覧を取得中...");
let jsonFiles: string[] = [];
if (fs.existsSync(radicalsDir)) {
  jsonFiles = fs
    .readdirSync(radicalsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));
}
console.log(`✅ ${jsonFiles.length} 件のJSONファイルを検出`);
console.log();

// 3. 差分を調査
console.log("========================================");
console.log("📊 調査結果");
console.log("========================================");
console.log();

// generateStaticParams で生成されるが、JSONファイルが存在しない
const missingJsonFiles = generatedSlugs.filter((slug) => !jsonFiles.includes(slug));
if (missingJsonFiles.length > 0) {
  console.log(`❌ JSONファイルが存在しないスラッグ (${missingJsonFiles.length} 件):`);
  missingJsonFiles.forEach((slug) => {
    const radical = radicalList.find((r) => {
      const uniqueSlug = getUniqueSlug(r, counts);
      return uniqueSlug === slug;
    });
    console.log(`  - ${slug} (jp: ${radical?.jp || "不明"}, en: ${radical?.en || "不明"})`);
  });
  console.log();
} else {
  console.log("✅ すべての生成スラッグに対応するJSONファイルが存在します");
  console.log();
}

// JSONファイルが存在するが、generateStaticParams で生成されない
const unusedJsonFiles = jsonFiles.filter((jsonFile) => !generatedSlugs.includes(jsonFile));
if (unusedJsonFiles.length > 0) {
  console.log(`⚠️  JSONファイルが存在するが、生成されないスラッグ (${unusedJsonFiles.length} 件):`);
  unusedJsonFiles.slice(0, 20).forEach((slug) => {
    console.log(`  - ${slug}.json`);
  });
  if (unusedJsonFiles.length > 20) {
    console.log(`  ... 他 ${unusedJsonFiles.length - 20} 件`);
  }
  console.log();
} else {
  console.log("✅ すべてのJSONファイルがスラッグとして生成されています");
  console.log();
}

// スラッグの重複チェック
const duplicateSlugs = generatedSlugs.filter(
  (slug, index) => generatedSlugs.indexOf(slug) !== index
);
if (duplicateSlugs.length > 0) {
  console.log(`⚠️  重複しているスラッグ (${duplicateSlugs.length} 件):`);
  const uniqueDuplicates = Array.from(new Set(duplicateSlugs));
  uniqueDuplicates.forEach((slug) => {
    const duplicates = radicalList.filter((r) => {
      const uniqueSlug = getUniqueSlug(r, counts);
      return uniqueSlug === slug;
    });
    console.log(`  - ${slug}:`);
    duplicates.forEach((r) => {
      console.log(`      jp: ${r.jp}, en: ${r.en}, type: ${r.type}`);
    });
  });
  console.log();
} else {
  console.log("✅ スラッグの重複はありません");
  console.log();
}

// サマリー
console.log("========================================");
console.log("📊 サマリー");
console.log("========================================");
console.log(`生成されるスラッグ数: ${generatedSlugs.length}`);
console.log(`JSONファイル数: ${jsonFiles.length}`);
console.log(`JSONファイルが存在しないスラッグ: ${missingJsonFiles.length} 件`);
console.log(`生成されないJSONファイル: ${unusedJsonFiles.length} 件`);
console.log(`重複スラッグ: ${duplicateSlugs.length} 件`);
console.log();

// 404エラーの可能性があるスラッグ
if (missingJsonFiles.length > 0) {
  console.log("========================================");
  console.log("❌ 404エラーの可能性があるページ");
  console.log("========================================");
  missingJsonFiles.forEach((slug) => {
    console.log(`  /radical/${slug}`);
  });
  console.log();
}

console.log("========================================");
console.log("✅ 調査完了");
console.log("========================================");


