import { describe, expect, test } from "vitest";
import sitemap from "@/app/sitemap";
import { getKanjiLink, kanjiToId } from "@/lib/linkUtils";
import radicalList, {
  buildSlugIndex,
  findRadicalBySlug,
  getUniqueSlug,
} from "@/lib/radicalList";
import { generateRadicalMetadata } from "@/lib/metadata";

describe("SEO URL integrity", () => {
  test("kanji links use the same uppercase Unicode slug as canonical URLs", () => {
    expect(kanjiToId("柔")).toBe("u67D4");
    expect(getKanjiLink("柔")).toBe("/kanji/u67D4");
  });

  test("sitemap contains only canonical, indexable URLs", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith("https://kanji-stroke-order.com"))).toBe(true);
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
    expect(urls.some((url) => /\/kanji\/u[0-9a-f]*[a-f][0-9a-f]*$/.test(url))).toBe(false);
  });

  test("every radical sitemap slug resolves to a canonical radical", () => {
    const counts = buildSlugIndex(radicalList);

    for (const radical of radicalList) {
      const slug = getUniqueSlug(radical, counts);
      expect(findRadicalBySlug(slug, radicalList)).not.toBeNull();
    }
  });

  test("radical route slugs contain ASCII characters only", () => {
    const counts = buildSlugIndex(radicalList);

    for (const radical of radicalList) {
      expect(getUniqueSlug(radical, counts)).toMatch(/^[a-z0-9-]+$/i);
    }
  });

  test("radical metadata can use the canonical route slug", () => {
    const metadata = generateRadicalMetadata(
      "てへん（Hand）",
      "Hand",
      "hand-radical"
    );

    expect(metadata.alternates?.canonical).toBe(
      "https://kanji-stroke-order.com/radical/hand-radical"
    );
  });
});
