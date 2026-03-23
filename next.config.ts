import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const imageHostnames = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: isProd,
  serverExternalPackages: ["better-sqlite3"],
  /** Site/page asset forms send JSON + base64 images; default limit is too small */
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  ...(imageHostnames.length > 0 && {
    images: {
      remotePatterns: imageHostnames.map((hostname) => ({
        protocol: "https",
        hostname,
      })),
    },
  }),
};

export default nextConfig;
