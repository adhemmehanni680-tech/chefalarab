/** @type {import('next').NextConfig} */
const imageOptimizationDisabled =
  process.env.NEXT_IMAGE_UNOPTIMIZED?.trim().toLowerCase() === "true";

const nextConfig = {
  output: "standalone",

  outputFileTracingIncludes: {
    "/*": [
      "./src/data/recipes.json",
      "./src/data/recipes-catalog.json",
    ],
  },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    /*
     * Optimized images are the default because they materially improve LCP
     * and image-delivery Lighthouse audits. Set NEXT_IMAGE_UNOPTIMIZED=true
     * only on a host that cannot run the Next.js image optimizer.
     */
    unoptimized: imageOptimizationDisabled,
    minimumCacheTTL: 2_592_000,
    deviceSizes: [360, 414, 640, 768, 828, 1024, 1200, 1440],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 72, 75],
    formats: ["image/avif", "image/webp"],
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
    const staticImageCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=2592000, stale-while-revalidate=31536000",
      },
    ];

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
      { source: "/uploads/:path*", headers: staticImageCache },
      { source: "/card/:path*", headers: staticImageCache },
      { source: "/ads/:path*", headers: staticImageCache },
      { source: "/icons/:path*", headers: staticImageCache },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
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
