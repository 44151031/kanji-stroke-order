import sitemap from "../src/app/sitemap";
import radicalList, {
  buildSlugIndex,
  findRadicalBySlug,
  getUniqueSlug,
} from "../src/lib/radicalList";

async function main() {
  const baseUrlArg = process.argv.find((arg) => arg.startsWith("--base-url="));
  const baseUrl = baseUrlArg?.slice("--base-url=".length).replace(/\/$/, "");
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  const errors: string[] = [];

  if (new Set(urls).size !== urls.length) {
    errors.push("The sitemap contains duplicate URLs.");
  }

  for (const url of urls) {
    if (url.includes("/api/")) {
      errors.push(`API URL must not be in the sitemap: ${url}`);
    }

    const kanjiMatch = url.match(/\/kanji\/(u[0-9A-Fa-f]+)$/);
    const canonicalKanjiSlug = kanjiMatch?.[1]
      .toUpperCase()
      .replace(/^U/, "u");
    if (kanjiMatch && kanjiMatch[1] !== canonicalKanjiSlug) {
      errors.push(`Non-canonical kanji slug: ${url}`);
    }
  }

  const radicalCounts = buildSlugIndex(radicalList);
  for (const radical of radicalList) {
    const slug = getUniqueSlug(radical, radicalCounts);
    if (!findRadicalBySlug(slug, radicalList)) {
      errors.push(`Radical route does not resolve: /radical/${slug}`);
    }
  }

  if (baseUrl) {
    const concurrency = 12;
    let cursor = 0;

    const worker = async () => {
      while (cursor < urls.length) {
        const index = cursor++;
        const pathname = new URL(urls[index]).pathname;
        const target = `${baseUrl}${pathname}`;
        const response = await fetch(target, {
          method: "HEAD",
          redirect: "manual",
        });

        if (response.status !== 200) {
          errors.push(`${response.status} ${target}`);
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
  }

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `SEO route audit passed for ${urls.length} sitemap URLs${
        baseUrl ? ` against ${baseUrl}` : ""
      }.`
    );
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
