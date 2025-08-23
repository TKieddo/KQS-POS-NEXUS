/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static exports for offline use
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig; 