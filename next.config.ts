import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.18"],

  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
  ],

  outputFileTracingIncludes: {
    "/api/expert-pdf/render-save": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/pro": [
      "./data/surface-water-wetness/**/*.tif",
    ],
  },

  outputFileTracingExcludes: {
    "/api/provider-register": [
      "./data/surface-water-wetness/**/*",
    ],
    "/knowledge/practice/property-conclusions": [
      "./data/surface-water-wetness/**/*",
    ],
    "/knowledge/practice/protection-zones": [
      "./data/surface-water-wetness/**/*",
    ],
    "/services/provider/[id]": [
      "./data/surface-water-wetness/**/*",
    ],
  },
};

export default nextConfig;