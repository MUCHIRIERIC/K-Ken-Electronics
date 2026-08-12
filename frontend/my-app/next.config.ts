/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even with type errors
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
