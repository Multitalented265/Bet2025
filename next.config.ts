import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
      }
    ],
  },
};

export default nextConfig;
