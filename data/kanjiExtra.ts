/**
 * 表外漢字メタデータ
 * 
 * 常用漢字以外の漢字に分類情報を付与
 * 書き順SVGが存在する漢字のみを定義
 */

export interface KanjiExtraMeta {
  unicode: string;        // "u9B31" 形式（大文字）
  isExtra: boolean;       // 表外漢字か
  isName: boolean;        // 人名用漢字か
  isClassical: boolean;   // 古典文献用か
  rarityScore?: number;   // 難読度（0-100、高いほどレア）
}

/**
 * 表外漢字メタデータリスト
 * 書き順SVGが存在する漢字のみを定義
 */
export const extraKanjiMeta: KanjiExtraMeta[] = [
  // 難読・稀少漢字（rarityScore >= 70）
  { unicode: "u9B31", isExtra: true, isName: false, isClassical: true, rarityScore: 95 },  // 鬱
  { unicode: "u7C60", isExtra: true, isName: false, isClassical: false, rarityScore: 85 },  // 籠
  { unicode: "u9F8D", isExtra: true, isName: true, isClassical: true, rarityScore: 82 },    // 龍
  { unicode: "u9DF9", isExtra: true, isName: false, isClassical: false, rarityScore: 88 },  // 鷹
  { unicode: "u9E92", isExtra: true, isName: false, isClassical: true, rarityScore: 92 },   // 麒
  { unicode: "u9E9F", isExtra: true, isName: false, isClassical: true, rarityScore: 93 },   // 麟
  { unicode: "u9957", isExtra: true, isName: false, isClassical: true, rarityScore: 90 },   // 饗
  { unicode: "u9955", isExtra: true, isName: false, isClassical: true, rarityScore: 95 },   // 饕
  { unicode: "u9A4D", isExtra: true, isName: false, isClassical: true, rarityScore: 91 },   // 驍
  { unicode: "u9A65", isExtra: true, isName: false, isClassical: true, rarityScore: 89 },   // 驥
  { unicode: "u9DF6", isExtra: true, isName: false, isClassical: false, rarityScore: 75 },  // 鷲
  { unicode: "u9DFA", isExtra: true, isName: false, isClassical: false, rarityScore: 78 },  // 鷺
  { unicode: "u9DD7", isExtra: true, isName: false, isClassical: false, rarityScore: 72 },  // 鷗
  { unicode: "u9D6C", isExtra: true, isName: false, isClassical: true, rarityScore: 80 },   // 鵬
  { unicode: "u9E1E", isExtra: true, isName: false, isClassical: true, rarityScore: 96 },   // 鸞
  { unicode: "u9D1B", isExtra: true, isName: false, isClassical: false, rarityScore: 70 },  // 鴛
  { unicode: "u9D26", isExtra: true, isName: false, isClassical: false, rarityScore: 71 },  // 鴦
  { unicode: "u9D3B", isExtra: true, isName: false, isClassical: true, rarityScore: 76 },   // 鴻
  { unicode: "u9D60", isExtra: true, isName: false, isClassical: true, rarityScore: 84 },   // 鵠
  { unicode: "u9D72", isExtra: true, isName: false, isClassical: false, rarityScore: 73 },  // 鵲
  { unicode: "u9D7A", isExtra: true, isName: false, isClassical: false, rarityScore: 85 },  // 鵺
  
  // 人名漢字
  { unicode: "u9F9C", isExtra: true, isName: true, isClassical: true, rarityScore: 88 },    // 龜（亀の旧字体）
  { unicode: "u9F4B", isExtra: true, isName: true, isClassical: false, rarityScore: 72 },   // 齋（斎の異体字）
  
  // その他表外漢字（isExtraのみ、難読・人名・古典以外）
  { unicode: "u864E", isExtra: true, isName: false, isClassical: false, rarityScore: 45 },  // 虎（常用外だが使用頻度高い）
];
