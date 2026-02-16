/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        trail: {
          50: '#f6f5f0',
          100: '#e8e6db',
          200: '#d4cfb9',
          300: '#b8b08f',
          400: '#a0966e',
          500: '#8a7f56',
          600: '#726845',
          700: '#5c5339',
          800: '#4d4532',
          900: '#433c2d',
        },
        forest: {
          50: '#f3faf3',
          100: '#e3f5e3',
          200: '#c8eac9',
          300: '#9dd89f',
          400: '#6bbe6e',
          500: '#46a34a',
          600: '#358538',
          700: '#2d692f',
          800: '#285429',
          900: '#224524',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
