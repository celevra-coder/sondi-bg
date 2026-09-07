import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { getIndexableSettlements } from "@/lib/settlements";

const BASE_URL = "https://www.sondi.bg";

const EXCLUDED_PREFIXES = [
  "/account",
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/pro",
  "/expert-access",
  "/geology/report",
];

function getPageRoutes(dir: string, appDir: string): string[] {
  const routes: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name.startsWith("[") ||
        entry.name.startsWith("(") ||
        entry.name.startsWith("_")
      ) {
        continue;
      }

      routes.push(...getPageRoutes(fullPath, appDir));
      continue;
    }

    if (entry.name !== "page.tsx") {
      continue;
    }

    const relativeDir = path.relative(appDir, dir);
    const route =
      relativeDir === ""
        ? "/"
        : "/" + relativeDir.split(path.sep).join("/");

    const excluded =
      route === "/geology" ||
      EXCLUDED_PREFIXES.some(
        (prefix) => route === prefix || route.startsWith(prefix + "/"),
      );

    if (!excluded) {
      routes.push(route);
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(
    process.cwd(),
    "app",
  );

  const routes = Array.from(
    new Set(
      getPageRoutes(appDir, appDir),
    ),
  ).sort();

  const staticEntries: MetadataRoute.Sitemap =
    routes.map((route) => ({
      url:
        route === "/"
          ? BASE_URL
          : `${BASE_URL}${route}`,
      changeFrequency:
        route === "/"
          ? "daily"
          : route.startsWith("/knowledge/")
            ? "monthly"
            : "weekly",
      priority:
        route === "/"
          ? 1
          : route === "/map" ||
              route === "/explore" ||
              route === "/water"
            ? 0.9
            : route.startsWith("/knowledge/")
              ? 0.7
              : 0.8,
    }));

  const settlementEntries: MetadataRoute.Sitemap =
    getIndexableSettlements().map(
      (settlement) => ({
        url:
          `${BASE_URL}/water/${settlement.slug}`,
        changeFrequency: "monthly",
        priority: 0.75,
      }),
    );

  return [
    ...staticEntries,
    ...settlementEntries,
  ];
}
