module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Caiden's Courage palette
        navy: {
          50: '#e8ecf2',
          100: '#c5cfe0',
          200: '#9fb0cb',
          300: '#7991b6',
          400: '#5c7aa6',
          500: '#243E70', // Primary navy (updated)
          600: '#203864',
          700: '#1b3057',
          800: '#16284a',
          900: '#0e1a32',
        },
        // Changed from coral/orange to yellow
        golden: {
          50: '#fefcf5',
          100: '#fcf6e3',
          200: '#f9edca',
          300: '#f5e3b0',
          400: '#f2da97',
          500: '#E5C06A', // Cinematic gold (aligned with brand)
          600: '#e8c255',
          700: '#deb23c',
          800: '#c99a28',
          900: '#a67d1c',
        },
        // Keep coral as alias for backward compatibility
        coral: {
          50: '#fefcf5',
          100: '#fcf6e3',
          200: '#f9edca',
          300: '#f5e3b0',
          400: '#f2da97',
          500: '#E5C06A', // Aligned with golden
          600: '#e8c255',
          700: '#deb23c',
          800: '#c99a28',
          900: '#a67d1c',
        },
        cream: '#faf9f7',
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
        },
        // Accessibility: Muted text token
        'text-muted': '#4b5563', // gray-600 - passes WCAG AA on white
        // Darkened blue for accessibility (replaces light blue-300/400/500)
        'brand-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd', // Accessible light blue
          400: '#60a5fa', // Accessible medium blue
          500: '#3b82f6', // Accessible primary blue (darker than default blue-500)
          600: '#2563eb', // Accessible dark blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-15px) translateX(8px)' },
          '50%': { transform: 'translateY(-20px) translateX(-5px)' },
          '75%': { transform: 'translateY(-10px) translateX(10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(36, 62, 112, 0.15)',
        'card-hover': '0 8px 30px rgba(36, 62, 112, 0.25)',
        'golden': '0 4px 20px rgba(240, 206, 110, 0.4)',
        'coral': '0 4px 20px rgba(240, 206, 110, 0.4)', // Updated for yellow
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
