/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Gen-Z dark palette */
        void:        '#0A0A0A',   // body background
        surface:     '#111111',   // card / panel surface
        panel:       '#181818',   // elevated surfaces
        'border-dark': '#222222', // borders
        ink:         '#FFFFFF',   // primary text
        mid:         '#777777',   // muted text
        dim:         '#333333',   // very dim
        lime:        '#C8FF00',   // electric lime accent
        pink:        '#FF3366',   // hot pink
        cyan:        '#00D4FF',   // electric blue
        sale:        '#FF3366',   // sale price
        gold:        '#FFB800',   // gold / star
        neon:        '#C8FF00',   // alias for lime
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Inter', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow':   'spin 8s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'float3d':     'float3d 6s ease-in-out infinite',
        'spin3d':      'spin3d 12s linear infinite',
        'marquee':     'marquee 25s linear infinite',
        'slide-in':    'slideIn 0.3s ease',
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'scan-line':   'scanLine 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        float3d: {
          '0%,100%': { transform: 'translateY(0px) rotateX(0deg)' },
          '50%':     { transform: 'translateY(-14px) rotateX(4deg)' },
        },
        spin3d: {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
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
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(200,255,0,0.3), 0 0 60px rgba(200,255,0,0.1)' },
          '50%':     { boxShadow: '0 0 30px rgba(200,255,0,0.6), 0 0 80px rgba(200,255,0,0.3)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-lg':   '0 4px 20px rgba(0,0,0,0.1)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.6)',
        'btn':       '0 2px 8px rgba(0,0,0,0.2)',
        'glow-lime': '0 0 20px rgba(200,255,0,0.5), 0 0 60px rgba(200,255,0,0.2)',
        'glow-pink': '0 0 20px rgba(255,51,102,0.5)',
        'inner-glow':'inset 0 0 30px rgba(200,255,0,0.1)',
      },
    },
  },
  plugins: [],
};
