/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primaire - Bleu électrique (style Ornikar)
        primary: {
          50: '#E6F0FF',
          100: '#CCE1FF',
          200: '#99C3FF',
          300: '#66A5FF',
          400: '#3387FF',
          500: '#0066FF',  // Couleur principale
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        
        // Accent - Jaune soleil
        accent: {
          50: '#FFFBEB',
          100: '#FFF4CC',
          200: '#FFE999',
          300: '#FFDD66',
          400: '#FFD233',
          500: '#FFD500',  // Jaune vif
          600: '#CCAA00',
          700: '#998000',
          800: '#665500',
          900: '#332B00',
        },
        
        // Succès - Vert flash
        success: {
          50: '#E6FFF2',
          100: '#CCFFE6',
          200: '#99FFCC',
          300: '#66FFB3',
          400: '#33FF99',
          500: '#00D563',  // Vert succès
          600: '#00AA4F',
          700: '#00803B',
          800: '#005528',
          900: '#002B14',
        },
        
        // Danger - Rouge clair
        danger: {
          50: '#FFE6E6',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#FF3B30',
          600: '#CC2F26',
          700: '#99231D',
          800: '#661813',
          900: '#330C0A',
        },
        
        // Neutre - Gris chaud
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // Compatibilité legacy (garder pour ne pas casser l'existant)
        iade: {
          blue: {
            50: '#E6F0FF',
            500: '#0066FF',
            600: '#0052CC',
            700: '#003D99',
          },
          green: {
            50: '#E6FFF2',
            500: '#00D563',
            600: '#00AA4F',
          },
          purple: {
            50: '#faf5ff',
            500: '#a855f7',
            600: '#9333ea',
          },
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            500: '#737373',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
        },
      },
      fontFamily: {
        sans: ['Circular', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Circular', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['64px', { lineHeight: '1.1', fontWeight: '800' }],
        '4xl': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        '3xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        '2xl': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'xl': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'lg': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
        'base': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Legacy compatibility
        'iade-sm': '0 1px 2px 0 rgba(0, 102, 255, 0.05)',
        'iade': '0 4px 6px -1px rgba(0, 102, 255, 0.1), 0 2px 4px -1px rgba(0, 102, 255, 0.06)',
        'iade-lg': '0 10px 15px -3px rgba(0, 102, 255, 0.1), 0 4px 6px -2px rgba(0, 102, 255, 0.05)',
        'iade-xl': '0 20px 25px -5px rgba(0, 102, 255, 0.1), 0 10px 10px -5px rgba(0, 102, 255, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-big': 'bounceBig 0.6s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shake-strong': 'shakeStrong 0.5s ease-in-out',
        'scale-bounce': 'scaleBounce 0.3s ease-in-out',
        'confetti': 'confetti 3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceBig: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 255, 1)' },
        },
        shakeStrong: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        scaleBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(500px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
