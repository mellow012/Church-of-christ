import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:       'var(--background)',
        foreground:       'var(--foreground)',
        'primary-deep':   'var(--primary-deep)',
        'primary-warm':   'var(--primary-warm)',
        'neutral-surface':'var(--neutral-surface)',
        gold:             'var(--gold)',
        amber:            'var(--amber)',
        'gold-dark':      'var(--gold-dark)',
        'forest-green':   'var(--forest-green)',
        terracotta:       'var(--terracotta)',
        heading:          'var(--heading)',
        body:             'var(--body)',
        caption:          'var(--caption)',
        card: {
          DEFAULT:        'var(--card)',
          foreground:     'var(--card-foreground)',
        },
        popover: {
          DEFAULT:        'var(--popover)',
          foreground:     'var(--popover-foreground)',
        },
        primary: {
          DEFAULT:        'var(--primary)',
          foreground:     'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:        'var(--secondary)',
          foreground:     'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:        'var(--muted)',
          foreground:     'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:        'var(--accent)',
          foreground:     'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:        'var(--destructive)',
          foreground:     'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input:  'var(--input)',
        ring:   'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT:              'var(--sidebar)',
          foreground:           'var(--sidebar-foreground)',
          primary:              'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent:               'var(--sidebar-accent)',
          'accent-foreground':  'var(--sidebar-accent-foreground)',
          border:               'var(--sidebar-border)',
          ring:                 'var(--sidebar-ring)',
        },
      },
      fontFamily: {
        // Montserrat = brand font (Century Gothic equivalent for web)
        sans:  ['var(--font-montserrat)', 'Century Gothic', 'Trebuchet MS', 'system-ui', 'sans-serif'],
        serif: ['var(--font-montserrat)', 'Century Gothic', 'Trebuchet MS', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;