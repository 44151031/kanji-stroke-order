import { MetadataRoute } from "next";
import { siteMeta } from "@/lib/siteMeta";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteMeta.url}/sitemap.xml`,
  };
}
