import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  deploymentId: process.env.DEPLOYMENT_VERSION,
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*"],
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
