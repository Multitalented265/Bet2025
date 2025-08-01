require('dotenv').config({ path: '.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    PAYCHANGU_PUBLIC_KEY: process.env.PAYCHANGU_PUBLIC_KEY,
    PAYCHANGU_SECRET_KEY: process.env.PAYCHANGU_SECRET_KEY,
    PAYCHANGU_CALLBACK_URL: process.env.PAYCHANGU_CALLBACK_URL,
    PAYCHANGU_RETURN_URL: process.env.PAYCHANGU_RETURN_URL,
    PAYCHANGU_WEBHOOK_URL: process.env.PAYCHANGU_WEBHOOK_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enable static optimization
  staticPageGenerationTimeout: 120,
  // Optimize images
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Add specific domains here if needed
    ],
  },
  // Enable compression
  compress: true,
  // Optimize bundle size
  // swcMinify is enabled by default in Next.js 15+
};

module.exports = nextConfig;
