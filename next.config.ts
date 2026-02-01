import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, //causing issues with Builder, haven't found a solution yet
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
};

export default nextConfig;
