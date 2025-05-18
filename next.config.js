/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(json)$/,
      type: 'javascript/auto',
      use: 'json-loader',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        fs: false,
        tls: false,
        dns: false,
        http2: false,
        os: false,
        path: false,
        'utf-8-validate': false,
        'bufferutil': false,
        'encoding': false,
      };
    }

    return config;
  },
  images: {
    domains: ['media.giphy.com', 'firebasestorage.googleapis.com'],
  },
  transpilePackages: ['react-lottie-player', '@lottiefiles/react-lottie-player'],
};

module.exports = withPWA(nextConfig);

