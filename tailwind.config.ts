import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ["var(--font-fredoka)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        arabic: ["var(--font-amiri)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
