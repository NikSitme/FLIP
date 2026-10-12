import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/privacy", "/consent"],
    },
    ...(/^https?:\/\//.test(site.baseUrl)
      ? { sitemap: `${site.baseUrl.replace(/\/$/, "")}/sitemap.xml` }
      : {}),
  };
}
