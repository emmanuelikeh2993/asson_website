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
        brand: {
          green: 'var(--brand-green)',       // Primary emerald green
          deep: 'var(--brand-deep)',         // Deep forest green
          light: 'var(--brand-light)',       // Subtle green tint for badges/hovers
          red: '#C62828',                    // Urgent / destructive red
          'red-light': '#FDE8E8',            // Red tint for alert badges
          cyan: '#55C9D5',                   // Cyan highlight
          'cyan-light': '#E8F9FB',           // Cyan tint
        },
        surface: {
          bg: 'var(--surface-bg)',           // Adaptive page background
          card: 'var(--surface-card)',       // Adaptive card & component background
          elevated: 'var(--surface-elevated)',
          subtle: 'var(--surface-subtle)',
        },
        text: {
          main: 'var(--text-main)',          // Adaptive primary text
          muted: 'var(--text-muted)',        // Adaptive secondary text
          subtle: 'var(--text-subtle)',
        },
        border: {
          light: 'var(--border-light)',      // Adaptive neutral borders
          hover: 'var(--border-hover)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(16, 185, 129, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
