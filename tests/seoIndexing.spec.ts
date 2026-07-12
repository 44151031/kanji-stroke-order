import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("SEO indexing safeguards", () => {
  test.each([
    ["Hand", "hand-radical"],
    ["Horse", "horse-radical"],
    ["Tree", "tree-radical"],
    ["Animal", "animal-radical"],
    ["Mountain", "mountain-radical"],
    ["Yumi-independent", "yumi-independent-radical"],
    ["Tamahen-left", "tamahen-left-radical"],
    ["Komanuki-bottom", "komanuki-bottom-radical"],
    ["Sei-independent", "sei-independent-radical"],
    ["Ishi-independent", "ishi-independent-radical"],
  ])("redirects legacy radical slug %s", (legacySlug, canonicalSlug) => {
    const request = new NextRequest(
      `https://kanji-stroke-order.com/radical/${legacySlug}`
    );
    const response = middleware(request);

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      `https://kanji-stroke-order.com/radical/${canonicalSlug}`
    );
  });
});
