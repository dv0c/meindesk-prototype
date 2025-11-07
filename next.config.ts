import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false, // avoid redirect /api/analytics/ -> /api/analytics
  images: {
    domains: ["res.cloudinary.com"], // Add Cloudinary domain here
  },

  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
