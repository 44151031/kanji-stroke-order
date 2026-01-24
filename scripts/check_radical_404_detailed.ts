#!/usr/bin/env tsx

/**
 * 部首ページの404エラーを詳細に調査するスクリプト
 * 
 * 問題: normalizeSlug がスラッグを正規化するが、radicalList の en フィールドが
 * 既に `-{type}` を含んでいる場合、findRadicalBySlug が正しく動作しない
 */

import * as fs from "fs";
import * as path from "path";
import radicalList, {
  buildSlugIndex,
  getUniqueSlug,
  findRadicalBySlug,
  normalizeSlug,
} from "../src/lib/radicalList";

const radicalsDir = path.join(process.cwd(), "data", "radicals");

console.log("========================================");
console.log("🔍 部首ページの404エラー詳細調査");
console.log("========================================");
console.log();

const counts = buildSlugIndex(radicalList);

// 問題があるスラッグを検出
console.log("🔍 問題のあるスラッグを検出中...");
const problematicSlugs: Array<{
  slug: string;
  normalized: string;
  found: boolean;
  radical: { jp: string; en: string; type: string } | null;
}> = [];

for (const radical of radicalList) {
  const uniqueSlug = getUniqueSlug(radical, counts);
  
  // JSONファイルの存在確認
  const jsonPath = path.join(radicalsDir, `${uniqueSlug}.json`);
  const jsonExists = fs.existsSync(jsonPath);
  
  // findRadicalBySlug で見つかるか確認
  const found = findRadicalBySlug(uniqueSlug, radicalList);
  const normalized = normalizeSlug(uniqueSlug);
  
  if (!found || !jsonExists) {
    problematicSlugs.push({
      slug: uniqueSlug,
      normalized,
      found: !!found,
      radical: found ? { jp: found.jp, en: found.en, type: found.type } : null,
    });
  }
}

if (problematicSlugs.length > 0) {
  console.log(`❌ 問題のあるスラッグ (${problematicSlugs.length} 件):`);
  console.log();
  
  // findRadicalBySlug で見つからない
  const notFound = problematicSlugs.filter((p) => !p.found);
  if (notFound.length > 0) {
    console.log(`❌ findRadicalBySlug で見つからないスラッグ (${notFound.length} 件):`);
    notFound.forEach((p) => {
      const radical = radicalList.find((r) => {
        const uniqueSlug = getUniqueSlug(r, counts);
        return uniqueSlug === p.slug;
      });
      console.log(`  - ${p.slug}`);
      console.log(`    正規化後: ${p.normalized}`);
      console.log(`    radicalList の en: ${radical?.en || "不明"}`);
      console.log(`    radicalList の type: ${radical?.type || "不明"}`);
      console.log();
    });
  }
  
  // JSONファイルが存在しない
  const missingJson = problematicSlugs.filter((p) => {
    const jsonPath = path.join(radicalsDir, `${p.slug}.json`);
    return !fs.existsSync(jsonPath);
  });
  if (missingJson.length > 0) {
    console.log(`❌ JSONファイルが存在しないスラッグ (${missingJson.length} 件):`);
    missingJson.forEach((p) => {
      console.log(`  - ${p.slug}.json`);
    });
    console.log();
  }
  
  console.log("========================================");
  console.log("❌ 404エラーの可能性があるページ");
  console.log("========================================");
  notFound.forEach((p) => {
    console.log(`  /radical/${p.slug}`);
  });
} else {
  console.log("✅ 問題のあるスラッグは見つかりませんでした");
}

console.log();
console.log("========================================");
console.log("📊 サマリー");
console.log("========================================");
console.log(`総スラッグ数: ${radicalList.length}`);
console.log(`問題のあるスラッグ: ${problematicSlugs.length} 件`);
console.log(`findRadicalBySlug で見つからない: ${problematicSlugs.filter((p) => !p.found).length} 件`);
console.log(`JSONファイルが存在しない: ${problematicSlugs.filter((p) => {
  const jsonPath = path.join(radicalsDir, `${p.slug}.json`);
  return !fs.existsSync(jsonPath);
}).length} 件`);
console.log();
console.log("========================================");
console.log("✅ 調査完了");
console.log("========================================");








