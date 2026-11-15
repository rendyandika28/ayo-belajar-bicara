import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // ponytail: new React Compiler rules flag intentional mount-time shuffles and
    // localStorage reads (kept client-only to avoid hydration mismatch). Warn, not
    // error; rewrite effects when adopting the React Compiler.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    files: ["__tests__/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  { ignores: [".next/**", "coverage/**", "public/sw.js", "next-env.d.ts"] },
];

export default config;
