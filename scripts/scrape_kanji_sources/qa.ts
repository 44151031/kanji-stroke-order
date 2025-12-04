/**
 * 漢字データ品質保証（QA）スクリプト
 * 生成されたJSONファイルの整合性をチェック
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

interface QAResult {
  file: string;
  status: "pass" | "fail" | "warn";
  message: string;
  details?: string[];
}

interface KanjiEntry {
  kanji: string;
  meaning?: string;
  category?: string[];
  sources?: string[];
}

function checkFileExists(filename: string): QAResult {
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return {
      file: filename,
      status: "pass",
      message: `File exists (${(stats.size / 1024).toFixed(1)} KB)`,
    };
  }
  return {
    file: filename,
    status: "fail",
    message: "File not found",
  };
}

function checkJsonValid(filename: string): QAResult {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return {
      file: filename,
      status: "fail",
      message: "File not found",
    };
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    JSON.parse(content);
    return {
      file: filename,
      status: "pass",
      message: "Valid JSON",
    };
  } catch (error) {
    return {
      file: filename,
      status: "fail",
      message: `Invalid JSON: ${error}`,
    };
  }
}

function checkArrayLength(filename: string, minLength: number): QAResult {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return {
      file: filename,
      status: "fail",
      message: "File not found",
    };
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return {
        file: filename,
        status: "fail",
        message: "Data is not an array",
      };
    }

    if (data.length >= minLength) {
      return {
        file: filename,
        status: "pass",
        message: `Array has ${data.length} entries (min: ${minLength})`,
      };
    } else {
      return {
        file: filename,
        status: "warn",
        message: `Array has only ${data.length} entries (expected: ${minLength}+)`,
      };
    }
  } catch (error) {
    return {
      file: filename,
      status: "fail",
      message: `Error reading file: ${error}`,
    };
  }
}

function checkRequiredFields(filename: string, fields: string[]): QAResult {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return {
      file: filename,
      status: "fail",
      message: "File not found",
    };
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data: KanjiEntry[] = JSON.parse(content);
    
    if (!Array.isArray(data) || data.length === 0) {
      return {
        file: filename,
        status: "fail",
        message: "Empty or invalid data",
      };
    }

    const missingFields: string[] = [];
    const sampleEntry = data[0];
    
    for (const field of fields) {
      if (!(field in sampleEntry)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length === 0) {
      return {
        file: filename,
        status: "pass",
        message: `All required fields present: ${fields.join(", ")}`,
      };
    } else {
      return {
        file: filename,
        status: "warn",
        message: `Missing fields: ${missingFields.join(", ")}`,
      };
    }
  } catch (error) {
    return {
      file: filename,
      status: "fail",
      message: `Error checking fields: ${error}`,
    };
  }
}

function checkNoDuplicates(filename: string): QAResult {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return {
      file: filename,
      status: "fail",
      message: "File not found",
    };
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data: KanjiEntry[] = JSON.parse(content);
    
    const kanjiSet = new Set<string>();
    const duplicates: string[] = [];
    
    for (const entry of data) {
      if (kanjiSet.has(entry.kanji)) {
        duplicates.push(entry.kanji);
      } else {
        kanjiSet.add(entry.kanji);
      }
    }

    if (duplicates.length === 0) {
      return {
        file: filename,
        status: "pass",
        message: "No duplicate kanji found",
      };
    } else {
      return {
        file: filename,
        status: "warn",
        message: `Found ${duplicates.length} duplicate(s)`,
        details: duplicates.slice(0, 10),
      };
    }
  } catch (error) {
    return {
      file: filename,
      status: "fail",
      message: `Error checking duplicates: ${error}`,
    };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║     漢字データ QA チェック                     ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  const results: QAResult[] = [];
  
  // ファイル存在チェック
  const requiredFiles = [
    "kanji_exam.json",
    "kanji_mistake.json",
    "kanji_confused.json",
    "kanji_normalized.json",
    "kanji_master.json",
  ];

  console.log("📁 File Existence Check:");
  console.log("─".repeat(50));
  for (const file of requiredFiles) {
    const result = checkFileExists(file);
    results.push(result);
    const icon = result.status === "pass" ? "✅" : "❌";
    console.log(`${icon} ${file}: ${result.message}`);
  }

  // JSON形式チェック
  console.log("\n📋 JSON Validation:");
  console.log("─".repeat(50));
  for (const file of requiredFiles) {
    const result = checkJsonValid(file);
    results.push(result);
    const icon = result.status === "pass" ? "✅" : "❌";
    console.log(`${icon} ${file}: ${result.message}`);
  }

  // 配列長チェック
  console.log("\n📊 Data Volume Check:");
  console.log("─".repeat(50));
  const volumeChecks: [string, number][] = [
    ["kanji_exam.json", 100],
    ["kanji_mistake.json", 50],
    ["kanji_confused.json", 50],
    ["kanji_master.json", 200],
  ];
  for (const [file, min] of volumeChecks) {
    const result = checkArrayLength(file, min);
    results.push(result);
    const icon = result.status === "pass" ? "✅" : result.status === "warn" ? "⚠️" : "❌";
    console.log(`${icon} ${file}: ${result.message}`);
  }

  // 必須フィールドチェック
  console.log("\n🔍 Required Fields Check:");
  console.log("─".repeat(50));
  const fieldResult = checkRequiredFields("kanji_master.json", ["kanji", "category", "sources"]);
  results.push(fieldResult);
  const fieldIcon = fieldResult.status === "pass" ? "✅" : "⚠️";
  console.log(`${fieldIcon} kanji_master.json: ${fieldResult.message}`);

  // 重複チェック
  console.log("\n🔄 Duplicate Check:");
  console.log("─".repeat(50));
  const dupResult = checkNoDuplicates("kanji_master.json");
  results.push(dupResult);
  const dupIcon = dupResult.status === "pass" ? "✅" : "⚠️";
  console.log(`${dupIcon} kanji_master.json: ${dupResult.message}`);
  if (dupResult.details) {
    console.log(`   Duplicates: ${dupResult.details.join(", ")}`);
  }

  // サマリー
  console.log("\n" + "═".repeat(50));
  const passed = results.filter((r) => r.status === "pass").length;
  const warnings = results.filter((r) => r.status === "warn").length;
  const failed = results.filter((r) => r.status === "fail").length;
  
  console.log(`📈 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  
  if (failed > 0) {
    console.log("\n❌ QA check failed!");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("\n⚠️ QA check passed with warnings");
    process.exit(0);
  } else {
    console.log("\n✅ All QA checks passed!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("QA script error:", error);
  process.exit(1);
});







