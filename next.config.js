/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // OpenAI-compat URL shape:
  //   client hits  https://api.codecrack.dev/v1/chat/completions
  //   physical route lives at /api/v1/chat/completions
  // These rewrites bridge the two so SDKs that auto-append /chat/completions
  // to base_url="https://api.codecrack.dev/v1" Just Work.
  async rewrites() {
    return [
      { source: "/v1/:path*", destination: "/api/v1/:path*" },
      { source: "/health", destination: "/api/health" },
    ];
  },
};

module.exports = nextConfig;
