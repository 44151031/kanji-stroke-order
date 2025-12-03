/**
 * SVGファイルに筆順番号を追加するスクリプト
 * 各strokeの開始位置に番号（①②③...）を表示
 */

import * as fs from "fs";
import * as path from "path";

const SVG_DIR = path.join(process.cwd(), "public", "svg");

// 丸数字（①〜⑳）
const CIRCLED_NUMBERS = [
  "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩",
  "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳",
  "㉑", "㉒", "㉓", "㉔", "㉕", "㉖", "㉗", "㉘", "㉙", "㉚",
];

/**
 * パスのd属性から開始点を取得
 */
function getPathStartPoint(d: string): { x: number; y: number } | null {
  // Mコマンド（moveto）から座標を取得
  const match = d.match(/M\s*(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/i);
  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    };
  }
  return null;
}

/**
 * SVGに筆順番号を追加
 */
function addStrokeNumbers(svgContent: string): string {
  // 既に番号が追加されている場合はスキップ
  if (svgContent.includes('class="stroke-number"')) {
    return svgContent;
  }
  
  // パス要素を抽出
  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
  const paths: { match: string; d: string; index: number }[] = [];
  let match;
  
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push({
      match: match[0],
      d: match[1],
      index: match.index,
    });
  }
  
  if (paths.length === 0) {
    return svgContent;
  }
  
  // 各パスの開始位置に番号を追加
  const numberElements: string[] = [];
  
  paths.forEach((p, i) => {
    const startPoint = getPathStartPoint(p.d);
    if (!startPoint) return;
    
    const num = i < CIRCLED_NUMBERS.length ? CIRCLED_NUMBERS[i] : `${i + 1}`;
    
    // 番号テキスト要素を作成
    const textElement = `<text 
      class="stroke-number" 
      data-stroke="${i}" 
      x="${startPoint.x - 3}" 
      y="${startPoint.y - 3}" 
      font-size="8" 
      fill="#999" 
      font-family="sans-serif"
      style="pointer-events: none;"
    >${num}</text>`;
    
    numberElements.push(textElement);
  });
  
  // </svg>の前に番号要素を挿入
  const insertPoint = svgContent.lastIndexOf("</svg>");
  if (insertPoint === -1) {
    return svgContent;
  }
  
  // 番号をグループ化して挿入
  const numbersGroup = `
  <g class="stroke-numbers" opacity="0.7">
    ${numberElements.join("\n    ")}
  </g>`;
  
  return (
    svgContent.slice(0, insertPoint) +
    numbersGroup +
    "\n" +
    svgContent.slice(insertPoint)
  );
}

async function main() {
  console.log("🔢 Adding stroke numbers to SVGs...\n");
  
  if (!fs.existsSync(SVG_DIR)) {
    console.error(`❌ Directory not found: ${SVG_DIR}`);
    console.log("   Run 'npm run fetch:svg' first to download SVGs.");
    process.exit(1);
  }
  
  const files = fs.readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));
  
  if (files.length === 0) {
    console.log("No SVG files found.");
    return;
  }
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = path.join(SVG_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, "utf8");
      
      // 既に番号が追加されている場合はスキップ
      if (content.includes('class="stroke-number"')) {
        console.log(`⏭️  Skip (already has numbers): ${file}`);
        skipped++;
        continue;
      }
      
      const modified = addStrokeNumbers(content);
      
      if (modified !== content) {
        fs.writeFileSync(filePath, modified, "utf8");
        console.log(`✅ Added numbers: ${file}`);
        processed++;
      } else {
        console.log(`⏭️  Skip (no paths): ${file}`);
        skipped++;
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
      errors++;
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`✅ Completed!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);





