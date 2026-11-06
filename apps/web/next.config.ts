import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
