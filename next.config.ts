import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: "postgresql://tanjung:wibicon2020@192.168.2.6:5432/MJS2",
    DATABASE_URL_SECOND: "postgresql://postgres:root@localhost:5432/MJS_PLANING"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
