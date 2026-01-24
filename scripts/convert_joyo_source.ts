/**
 * kanji-source.json から JOYO_DATA を生成するスクリプト
 */

import * as fs from "fs";
import * as path from "path";

interface SourceKanji {
  strokes: number;
  grade: number;
  freq?: number;
  meanings?: string[];
  readings_on?: string[];
  readings_kun?: string[];
}

interface JoyoEntry {
  kanji: string;
  grade: number;
  strokes: number;
}

async function main() {
  const sourcePath = path.join(process.cwd(), "data", "kanji-source.json");
  const outputPath = path.join(process.cwd(), "scripts", "build_joyo_index.ts");
  
  // ソースデータを読み込み
  const sourceData: Record<string, SourceKanji> = JSON.parse(
    fs.readFileSync(sourcePath, "utf-8")
  );
  
  // 常用漢字（grade 1-8）をフィルタリング
  const joyoList: JoyoEntry[] = [];
  
  for (const [kanji, data] of Object.entries(sourceData)) {
    if (data.grade >= 1 && data.grade <= 8) {
      joyoList.push({
        kanji,
        grade: data.grade,
        strokes: data.strokes,
      });
    }
  }
  
  // 学年順・画数順・漢字コード順にソート
  joyoList.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.strokes !== b.strokes) return a.strokes - b.strokes;
    return a.kanji.localeCompare(b.kanji);
  });
  
  console.log(`✅ Found ${joyoList.length} Joyo kanji`);
  
  // TypeScriptコードを生成
  let tsCode = `/**
 * 常用漢字リスト生成スクリプト
 * 文部科学省「常用漢字表」(平成22年内閣告示第2号)に基づく2136字
 * データソース: https://github.com/davidluzgouveia/kanji-data
 */

import * as fs from "fs";
import * as path from "path";

// 常用漢字の完全データ（学年・画数付き）- 2136字
const JOYO_DATA: Array<{ kanji: string; grade: number; strokes: number }> = [
`;

  // 学年ごとにコメントを追加
  let currentGrade = 0;
  const gradeLabels: Record<number, string> = {
    1: "小学1年生 (80字)",
    2: "小学2年生 (160字)",
    3: "小学3年生 (200字)",
    4: "小学4年生 (202字)",
    5: "小学5年生 (193字)",
    6: "小学6年生 (191字)",
    8: "中学校以降 (1110字)",
  };
  
  for (const entry of joyoList) {
    if (entry.grade !== currentGrade) {
      currentGrade = entry.grade;
      const label = gradeLabels[currentGrade] || `Grade ${currentGrade}`;
      tsCode += `  // ${label}\n`;
    }
    tsCode += `  { kanji: "${entry.kanji}", grade: ${entry.grade}, strokes: ${entry.strokes} },\n`;
  }
  
  tsCode += `];

function getUcsHex(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return "";
  return codePoint.toString(16).padStart(5, "0");
}

async function main() {
  const outputPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  
  const kanjiList = JOYO_DATA.map((item) => ({
    kanji: item.kanji,
    ucsHex: getUcsHex(item.kanji),
    grade: item.grade,
    strokes: item.strokes,
  }));

  fs.writeFileSync(outputPath, JSON.stringify(kanjiList, null, 2), "utf-8");
  console.log(\`✅ Generated \${kanjiList.length} kanji entries to \${outputPath}\`);
}

main().catch(console.error);
`;

  fs.writeFileSync(outputPath, tsCode, "utf-8");
  console.log(`📁 Generated ${outputPath}`);
  
  // 統計を表示
  const gradeStats: Record<number, number> = {};
  for (const entry of joyoList) {
    gradeStats[entry.grade] = (gradeStats[entry.grade] || 0) + 1;
  }
  
  console.log("\n📊 Grade distribution:");
  for (const [grade, count] of Object.entries(gradeStats).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const label = gradeLabels[Number(grade)] || `Grade ${grade}`;
    console.log(`   ${label}: ${count}`);
  }
}

main().catch(console.error);



















