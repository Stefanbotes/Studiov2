/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel will handle distDir automatically - no need to customize
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep this false to catch TypeScript errors during build
    ignoreBuildErrors: false,
  },
  // Enable image optimization on Vercel
  images: {
    domains: [],
    // Remove unoptimized: true to use Vercel's image optimization
  },
  // Output file tracing - Vercel handles this automatically
  // experimental: {
  //   outputFileTracingRoot: undefined,
  // },
};

module.exports = nextConfig;
