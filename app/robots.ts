import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: "https://www.sondi.bg/sitemap.xml",
    host: "https://www.sondi.bg",
  };
}