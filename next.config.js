/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // App Router is default in 15; nothing to enable.
  },
  async headers() {
    return [
      {
        // Gateway routes — public API, never cached.
        source: "/api/v1/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-transform" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
        ],
      },
      {
        source: "/api/health",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;
