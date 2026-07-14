const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://jojtlhkbufkhyjxzbiii.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvanRsaGtidWZraHlqeHpiaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY2ODMsImV4cCI6MjA5NjQwMjY4M30.zvSHR2OHS-zmwh3OKFdPTelW7dQg4N7eEjAMwi3y7xY';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
