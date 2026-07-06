import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Spoonacular serves recipe images from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "img.spoonacular.com" },
      { protocol: "https", hostname: "spoonacular.com" },
    ],
  },
};

export default nextConfig;
