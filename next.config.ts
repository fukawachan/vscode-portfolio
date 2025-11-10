import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com', protocol: 'https' },
      { hostname: 'imgur.com', protocol: 'https' },
    ],
  },
  transpilePackages: ['@react95/core'],
};

export default nextConfig;
