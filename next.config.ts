import type { NextConfig } from "next";

const imageHostAllowlist = (process.env.NEXT_IMAGE_HOSTS || "res.cloudinary.com")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

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
};

export default nextConfig;
