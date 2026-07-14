import type { Config } from 'tailwindcss';

/**
 * Paleta UI — complemento D (círculo cromático)
 * Índigo pastel #5B59B5 · Durazno pastel #E5A87A
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B59B5', // índigo pastel
          hover: '#4A48A0',
          dark: '#3F3D9E',
        },
        accent: {
          DEFAULT: '#E5A87A', // durazno pastel
          hover: '#D99560',
          soft: '#F8E8D8',
        },
        flag: {
          blue: '#5B59B5',
          red: '#D94A52',
        },
        neutral: {
          card: '#FFFFFF',
        },
        surface: {
          border: '#DDDDEE',
          ring: '#D4D4E8',
        },
      },
    },
  },
  plugins: [],
};

export default config;
