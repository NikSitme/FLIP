import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!/^https?:\/\//.test(site.baseUrl)) return [];
  return [
    "",
    "/services",
    "/prices",
    "/projects",
    "/projects/kvartira-52-m2",
    "/about",
    "/contacts",
  ].map((path) => ({
    url: `${site.baseUrl.replace(/\/$/, "")}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.7 : 1,
  }));
}
