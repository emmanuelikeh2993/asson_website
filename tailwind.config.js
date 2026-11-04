/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#087A3E',       // Primary green
          deep: '#064B2B',        // Deep forest green
          light: '#E7F5ED',       // Subtle green tint for badges/hovers
          red: '#C62828',         // Urgent / destructive red
          'red-light': '#FDE8E8', // Red tint for alert badges
          cyan: '#55C9D5',        // Cyan highlight
          'cyan-light': '#E8F9FB',// Cyan tint
        },
        surface: {
          bg: '#F6F8F7',          // Page background
          card: '#FFFFFF',        // Card & component background
          elevated: '#FFFFFF',
          subtle: '#EDF2E8',
        },
        text: {
          main: '#17232D',        // Charcoal primary text
          muted: '#5C6B75',       // Secondary grey text
          subtle: '#8C9BA5',
        },
        border: {
          light: '#D8E2DE',       // Neutral borders
          hover: '#B5C7C0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(8, 122, 62, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

