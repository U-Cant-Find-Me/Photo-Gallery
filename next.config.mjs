/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  // transpilePackages: ['@clerk/nextjs'],
  // experimental: {
  //     serverActions: true,
  //     serverComponentsExternalPackages: ['@clerk/nextjs'],
  // },
};

export default nextConfig;