import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          orange: '#FF6B35',
          'orange-dark': '#CC5529',
          green: '#4CAF50',
          'green-dark': '#388E3C',
          blue: '#2196F3',
          'blue-dark': '#1976D2',
          red: '#F44336',
          'red-dark': '#C62828',
          yellow: '#FFC107',
          'yellow-dark': '#F9A825',
          purple: '#9C27B0',
          'purple-dark': '#7B1FA2',
          gray: '#757575',
          'gray-dark': '#424242',
        },
        bg: {
          primary: '#0A0A0A',
          secondary: '#141414',
          card: '#1A1A2E',
          'card-hover': '#222240',
        },
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", 'monospace'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
