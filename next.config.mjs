/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // مهم جدًا لتفادي أخطاء framer-motion + hydration

  // ✅ مهم مع framer-motion في بعض الحالات
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    // 🆕 خاصية جديدة لحل مشكلة LCP للصور المهمة (بتنفع مع priority)
    dangerouslyAllowSVG: true, // لو محتاج SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },

  // 🔥 حل مهم جدًا لمشكلة prerender مع بعض مكتبات client-only
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