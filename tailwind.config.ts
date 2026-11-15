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
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-soft": "var(--accent-soft)",
        "accent-muted": "var(--accent-muted)",
        "on-accent": "var(--on-accent)",
        good: "var(--good)",
        warn: "var(--warn)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        "good-strong": "var(--good-strong)",
        "warn-strong": "var(--warn-strong)",
        "danger-strong": "var(--danger-strong)",
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
