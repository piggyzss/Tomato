/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./sidepanel.html",
    "./popup.html",
    "./options.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tomato: {
          DEFAULT: '#E55C5C',
          light: '#FF8573',
          dark: '#D84848',
        },
        cream: {
          DEFAULT: '#FFF9F3',
          dark: '#FFF0E0',
        }
      },
      fontFamily: {
        sans: ['"Quicksand"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Nunito"', '"Quicksand"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'cat': '16px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
