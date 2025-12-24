// robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://chefalarab.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // صفحات الـ API
          "/admin/",        // صفحات الإدارة
          "/private/",      // ملفات حساسة مستقبلية
          "/secret/",       // أي مجلدات خاصة
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
