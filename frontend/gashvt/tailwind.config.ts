import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Add this!
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'class', // Add this to enable the .dark class toggle
  theme: {
    extend: {
      colors: {
        brand: {
          panel: 'var(--brand-panel)',
          dark: 'var(--brand-dark)',
          border: 'var(--brand-border)',
        },
        text: {
          main: 'var(--text-main)',
        }
      }
    },
  },
  plugins: [],
};
export default config;