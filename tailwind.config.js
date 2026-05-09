/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Light theme palette */
        void:    '#f3f4f6',   // body background (light gray)
        surface: '#ffffff',   // card / panel surface
        card:    '#fafafa',   // subtle card
        ink:     '#111827',   // primary text / buttons
        dark:    '#1f2937',   // secondary text
        mid:     '#374151',   // muted text
        lite:    '#d1d5db',   // borders
        accent:  '#111827',   // primary accent (near-black)
        warm:    '#f9fafb',   // warm off-white
        sale:    '#dc2626',   // sale price
        gold:    '#f59e0b',   // badge highlight
        neon:    '#059669',   // success / free shipping
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow':  'spin 8s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'marquee':    'marquee 25s linear infinite',
        'slide-in':   'slideIn 0.3s ease',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.3 },
        },
      },
      boxShadow: {
        'card':    '0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-lg': '0 4px 20px rgba(0,0,0,0.1)',
        'btn':     '0 2px 8px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
