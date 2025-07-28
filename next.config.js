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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'times.mw',
      },
      {
        protocol: 'https',
        hostname: 'www.nyasatimes.com',
      },
      {
        protocol: 'https',
        hostname: 'www.sadc.int',
      },
      {
        protocol: 'https',
        hostname: 'www.peaceparks.org',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fnbo19-2.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.globalthinkersforum.org',
      }
    ],
  },
  // Enable compression
  compress: true,
  // Optimize bundle size
  swcMinify: true,
};

module.exports = nextConfig;
