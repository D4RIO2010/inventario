/** @type {import('next').NextConfig} */
const withPWAInit = require("@ducanh2912/next-pwa").default;

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Se desactiva en dev
});

const nextConfig = {
  reactStrictMode: true,
  // Si tenías otras configuraciones en tu nextConfig original, agrégalas aquí
};

module.exports = withPWA(nextConfig);