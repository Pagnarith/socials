/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  // Allow importing the shared content calendar from the repo root.
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
