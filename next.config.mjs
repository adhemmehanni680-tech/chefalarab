/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  outputFileTracingIncludes: {
    "/*": [
      "./src/data/recipes.json",
      "./src/data/recipes-index.json",
      "./src/data/recipes-catalog.json",
      "./src/data/recipes-search.json",
    ],
  },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    // الصور في المشروع WebP جاهزة، وعرضها مباشرة يمنع استهلاك
    // Image Optimization على الاستضافة ويزيل أخطاء 402 الخاصة بها.
    unoptimized: true,
    minimumCacheTTL: 14400,
    // لا نحتاج كاش محسن الصور لأن الصور تُخدم مباشرة من public.
    // هذا يمنع تضخم .next/cache/images على الاستضافة والجهاز المحلي.
    maximumDiskCacheSize: 0,
    maximumResponseBody: 8_000_000,
    deviceSizes: [360, 414, 640, 768, 1024, 1280],
    imageSizes: [64, 128, 256, 384],
    qualities: [68, 70, 72, 75],
    formats: ["image/webp"],
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
      { pathname: "/card/**", search: "" },
      { pathname: "/ads/**", search: "" },
      { pathname: "/banner/**", search: "" },
      { pathname: "/icons/**", search: "" },
      { pathname: "/Heeder.webp", search: "" },
      { pathname: "/favicon.webp", search: "" },
      { pathname: "/og-image.jpg", search: "" },
      { pathname: "/apple-touch-icon.png", search: "" },
    ],
    dangerouslyAllowSVG: false,
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.chefalarab.com" }],
        destination: "https://chefalarab.com/:path*",
        permanent: true,
      },
      {
        source: "/recipe",
        destination: "/recipes",
        permanent: true,
      },
      {
        source: "/recipes/:slug",
        destination: "/recipe/:slug",
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
            value: "public, max-age=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source: "/card/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
