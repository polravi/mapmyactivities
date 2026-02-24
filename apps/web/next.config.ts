import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mma/types', '@mma/utils', '@mma/store', '@mma/api-client'],
};

export default nextConfig;
