module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#FFB6C1',
        accent: '#FF85A2',
        love: {
          50: '#FFF5F7',
          100: '#FFE0E8',
          200: '#FFC1D1',
          300: '#FFA3BB',
          400: '#FF7AA4',
          500: '#FF528D',
          600: '#FF3876',
          700: '#E52360',
          800: '#C71F50',
          900: '#AF1C43',
        },
        pink: {
          50: '#FFF0F5',
          100: '#FFDBEB',
          200: '#FFBBD8',
          300: '#FF9CC5',
          400: '#FF7EB2',
          500: '#FF609F',
          600: '#FF428C',
          700: '#F02879',
          800: '#D91A66',
          900: '#B90F53',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease-in forwards',
        'fadeOut': 'fadeOut 0.3s ease-out forwards',
        'heartBeat': 'heartBeat 1.5s ease-in-out infinite',
        'slideIn': 'slideIn 0.4s ease-out forwards',
        'slideOut': 'slideOut 0.4s ease-in forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
      },
      backgroundImage: {
        'heart-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c-8-8-8-24 0-24 8 0 8 16 0 24zm0 0c8 8 24 8 24 0 0-8-16-8-24 0zm0 0c-8 8-8 24 0 24 8 0 8-16 0-24zm0 0c-8-8-24-8-24 0 0 8 16 8 24 0z' fill='%23FFC0CB' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
} 