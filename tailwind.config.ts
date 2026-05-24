import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--kami-serif)"],
        sans: ["var(--kami-serif)"],
        mono: ["var(--kami-mono)"],
      },
      colors: {
        parchment: "var(--kami-parchment)",
        ivory: "var(--kami-ivory)",
        "paper-border": "var(--kami-border)",
        "paper-border-soft": "var(--kami-border-soft)",
        ink: "var(--kami-brand)",
        "ink-light": "var(--kami-brand-light)",
        "ink-tint": "var(--kami-brand-tint)",
        "near-black": "var(--kami-near-black)",
        "warm-dark": "var(--kami-dark-warm)",
        olive: "var(--kami-olive)",
        stone: "var(--kami-stone)",
        "danger-bg": "var(--kami-danger-bg)",
        "danger-fg": "var(--kami-danger-fg)",
      },
      boxShadow: {
        paper: "var(--kami-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
