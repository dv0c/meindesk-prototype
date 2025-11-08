import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false, // avoid redirect /api/analytics/ -> /api/analytics
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // wildcard — allows any domain
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
