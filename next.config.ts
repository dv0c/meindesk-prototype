import type { NextConfig } from "next";

const imageHostAllowlist = (process.env.NEXT_IMAGE_HOSTS || "res.cloudinary.com")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const frameAncestors =
  process.env.CMS_FRAME_ANCESTORS?.trim() ||
  "'self' https://efindly.gr https://*.efindly.gr";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, //causing issues with Builder, haven't found a solution yet
  trailingSlash: false, // avoid redirect /api/analytics/ -> /api/analytics
  images: {
    remotePatterns: imageHostAllowlist.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
