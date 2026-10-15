import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getAllDocsSlugs } from "@/lib/docs-articles";

const SITE_URL = "https://clipforge-2wkpqkqxx-chachi420s-projects.vercel.app";

// Public marketing routes only — /dashboard, /admin, /login, /auth are excluded.
// Note: /policies has no index page; the four policy documents are listed instead.
const STATIC_ROUTES = [
  "/",
  "/brands",
  "/clip",
  "/pricing",
  "/faq",
  "/trust",
  "/onboard",
  "/blog",
  "/docs",
  "/contact",
  "/policies/clipper-terms",
  "/policies/privacy-policy",
  "/policies/terms-of-service",
  "/policies/grievance-officer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getAllDocsSlugs().map((slug) => ({
      url: `${SITE_URL}/docs/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
