import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://151.243.222.93:30550/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig