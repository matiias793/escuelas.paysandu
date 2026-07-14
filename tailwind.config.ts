import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8BCF85',
          hover: '#6BBF71',
          dark: '#3F8A4A',
        },
        neutral: {
          card: '#FFFFFF',
        },
        surface: {
          border: '#E5DCEB',
          ring: '#DDD2E8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
