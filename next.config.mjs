const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://jojtlhkbufkhyjxzbiii.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvanRsaGtidWZraHlqeHpiaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY2ODMsImV4cCI6MjA5NjQwMjY4M30.zvSHR2OHS-zmwh3OKFdPTelW7dQg4N7eEjAMwi3y7xY';

const supabaseHostname = new URL(supabaseUrl).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Cache largo en el Edge: menos regeneraciones = menos Image Optimization requests.
    minimumCacheTTL: 2_678_400, // 31 días
    // Pocos anchos → menos variantes cacheadas.
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [96, 128, 256, 384],
  },
};

export default nextConfig;
