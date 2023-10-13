import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Roboto",
          "var(--font-roboto)",
          "PingFang SC",
          "Hiragino Sans GB",
          "var(--font-noto-sans-sc)",
          "Microsoft YaHei",
          "sans-serif",
          "Apple Color Emoji",
          "Noto Color Emoji"
        ],
      },
      /* MD3 Color Tokens → Tailwind */
      colors: {
        md: {
          primary: 'var(--md-sys-color-primary)',
          'on-primary': 'var(--md-sys-color-on-primary)',
          'primary-container': 'var(--md-sys-color-primary-container)',
          'on-primary-container': 'var(--md-sys-color-on-primary-container)',
          secondary: 'var(--md-sys-color-secondary)',
          'on-secondary': 'var(--md-sys-color-on-secondary)',
          'secondary-container': 'var(--md-sys-color-secondary-container)',
          'on-secondary-container': 'var(--md-sys-color-on-secondary-container)',
          tertiary: 'var(--md-sys-color-tertiary)',
          'on-tertiary': 'var(--md-sys-color-on-tertiary)',
          'tertiary-container': 'var(--md-sys-color-tertiary-container)',
          'on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',
          error: 'var(--md-sys-color-error)',
          'on-error': 'var(--md-sys-color-on-error)',
          'error-container': 'var(--md-sys-color-error-container)',
          'on-error-container': 'var(--md-sys-color-on-error-container)',
          surface: 'var(--md-sys-color-surface)',
          'on-surface': 'var(--md-sys-color-on-surface)',
          'surface-variant': 'var(--md-sys-color-surface-variant)',
          'on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
          'surface-dim': 'var(--md-sys-color-surface-dim)',
          'surface-bright': 'var(--md-sys-color-surface-bright)',
          'surface-container-lowest': 'var(--md-sys-color-surface-container-lowest)',
          'surface-container-low': 'var(--md-sys-color-surface-container-low)',
          'surface-container': 'var(--md-sys-color-surface-container)',
          'surface-container-high': 'var(--md-sys-color-surface-container-high)',
          'surface-container-highest': 'var(--md-sys-color-surface-container-highest)',
          outline: 'var(--md-sys-color-outline)',
          'outline-variant': 'var(--md-sys-color-outline-variant)',
          'inverse-surface': 'var(--md-sys-color-inverse-surface)',
          'inverse-on-surface': 'var(--md-sys-color-inverse-on-surface)',
          'inverse-primary': 'var(--md-sys-color-inverse-primary)',
          background: 'var(--md-sys-color-background)',
          'on-background': 'var(--md-sys-color-on-background)',
        },
      },
      /* MD3 Shape → Border Radius */
      borderRadius: {
        'md3-xs': 'var(--md-sys-shape-xs)',
        'md3-sm': 'var(--md-sys-shape-sm)',
        'md3-md': 'var(--md-sys-shape-md)',
        'md3-lg': 'var(--md-sys-shape-lg)',
        'md3-xl': 'var(--md-sys-shape-xl)',
        'md3-xxl': 'var(--md-sys-shape-xxl)',
        'md3-full': 'var(--md-sys-shape-full)',
      },
      /* MD3 Elevation → Box Shadow */
      boxShadow: {
        'md3-1': 'var(--md-sys-elevation-1)',
        'md3-2': 'var(--md-sys-elevation-2)',
        'md3-3': 'var(--md-sys-elevation-3)',
        'md3-4': 'var(--md-sys-elevation-4)',
      },
      /* MD3 Motion → Duration & Easing */
      transitionDuration: {
        'md3-s2': '100ms',
        'md3-s3': '150ms',
        'md3-s4': '200ms',
        'md3-m1': '250ms',
        'md3-m2': '300ms',
        'md3-m4': '400ms',
        'md3-l2': '500ms',
      },
      transitionTimingFunction: {
        'md3-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'md3-emphasized-decel': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'md3-emphasized-accel': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
        'md3-standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'md3-standard-decel': 'cubic-bezier(0, 0, 0, 1)',
      },
      /* MD3 8-dp spacing scale */
      spacing: {
        '4dp': '0.25rem',
        '8dp': '0.5rem',
        '12dp': '0.75rem',
        '16dp': '1rem',
        '24dp': '1.5rem',
        '32dp': '2rem',
        '48dp': '3rem',
      },
    },
  },
  plugins: [],
};
export default config;
