/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  poweredByHeader: false,
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
  },
}

module.exports = nextConfig
