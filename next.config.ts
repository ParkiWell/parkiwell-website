import type { NextConfig } from "next";

/**
 * The site loads no third party scripts, fonts, or images: everything is
 * served from this origin. The policy below states that explicitly, so a
 * future change that reaches out to a CDN fails loudly instead of quietly
 * shipping.
 *
 * `unsafe-inline` stays on script-src because the framework emits inline
 * bootstrap scripts for statically rendered pages. React also needs
 * `unsafe-eval` while the development server is running, so that exception is
 * added only in development. Every other fetch directive is locked to `self`.
 */
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  // The launch list posts here and nowhere else.
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "child-src 'none'",
  "object-src 'none'",
  "worker-src 'none'",
  "manifest-src 'self'",
  "media-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSources}`,
  "connect-src 'self'",
].join("; ");
// `upgrade-insecure-requests` is deliberately absent: HTTPS is enforced by the
// Strict-Transport-Security header below, and the directive breaks plain HTTP
// local runs of the production build under WebKit.

// Every powerful feature the browser can gate is switched off. The site asks
// for none of them, so anything that starts asking is a bug worth failing on.
// Only features the engines actually recognise are listed: an unknown one is
// logged as a header error in the console and gates nothing, which trades a
// real signal for noise.
const permissionsPolicy = [
  "accelerometer",
  "autoplay",
  "bluetooth",
  "browsing-topics",
  "camera",
  "display-capture",
  "encrypted-media",
  "gamepad",
  "geolocation",
  "gyroscope",
  "hid",
  "idle-detection",
  "local-fonts",
  "magnetometer",
  "microphone",
  "midi",
  "payment",
  "picture-in-picture",
  "publickey-credentials-get",
  "screen-wake-lock",
  "serial",
  "usb",
  "xr-spatial-tracking",
]
  .map((feature) => `${feature}=()`)
  .join(", ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: permissionsPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const immutable = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };

    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/screens/:path*", headers: [immutable] },
      {
        // Brand artwork is meant to be embedded elsewhere: it is the share card
        // and the favicon. It is the one place the same-origin resource policy
        // above would do harm rather than good.
        source: "/brand/:path*",
        headers: [
          immutable,
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
