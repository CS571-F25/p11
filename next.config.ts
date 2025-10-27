import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  // Enable source maps for debugging
  productionBrowserSourceMaps: true,
  // Configure webpack for source maps
  webpack: (config, { dev }) => {
    // Enable source maps in development and production
    config.devtool = dev ? 'eval-cheap-module-source-map' : 'source-map';
    
    return config;
  },
};

export default nextConfig;
