import type { MetadataRoute } from "next";

const SITE_URL = "https://clipforge-2wkpqkqxx-chachi420s-projects.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
