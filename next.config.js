/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // Remove deprecated experimental features that might cause issues in Next.js 15
  },
  // Ensure proper handling of environment variables in production
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Handle potential image optimization issues in Docker
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
