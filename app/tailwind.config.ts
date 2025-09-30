import type { Config } from '@tailwindcss/vite';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',  // Scans both (web) and (platform) route groups
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    // Exclude legacy website source to prevent CSS conflicts
    '!./web/client/**',
  ],
};

export default config;