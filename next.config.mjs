/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./src/data/recipes.json"],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    minimumCacheTTL: 14400,
    maximumDiskCacheSize: 300_000_000,
    maximumResponseBody: 8_000_000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280],
    imageSizes: [64, 128, 256, 384],
         qualities: [68, 70, 72],
    formats: ["image/webp"],
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
      { pathname: "/card/**", search: "" },
      { pathname: "/ads/**", search: "" },
    ],
    dangerouslyAllowSVG: false,
  },

  turbopack: {
    rules: {
      "*.mp4": { type: "asset" },
      "*.webm": { type: "asset" },
    },
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.chefalarab.com" }],
        destination: "https://chefalarab.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/card/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
