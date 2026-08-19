import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const isDev = process.env.NODE_ENV === 'development'
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : null
  } catch {
    return null
  }
})()
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com${supabaseOrigin ? ` ${supabaseOrigin}` : ''}`,
  "font-src 'self' data:",
  `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googleadservices.com https://connect.facebook.net${supabaseOrigin ? ` ${supabaseOrigin}` : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(!isDev ? ['upgrade-insecure-requests'] : []),
].join('; ')

const nextConfig: NextConfig = {
  allowedDevOrigins: isDev ? ['127.0.0.1'] : undefined,
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'landingsite.nl' }],
      destination: 'https://www.landingsite.nl/:path*',
      permanent: true,
    }]
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }, {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    }]
  },
};

export default withWorkflow(nextConfig);
