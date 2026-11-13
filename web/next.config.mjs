import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O repositório tem dois package-lock.json (API na raiz e esta interface);
  // a raiz do Next é esta pasta, o que também silencia o aviso do build.
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
};

export default nextConfig;
