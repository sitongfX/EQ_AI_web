/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'export' output to enable API routes for secure server-side API calls
  // API routes don't work with static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
