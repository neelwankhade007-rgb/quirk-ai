/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c', // Dark near-black
        surface: '#18181b', // Dark charcoal
        primary: '#8b5cf6', // Purple primary accent
        secondary: '#c4b5fd', // Soft lavender
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        border: '#27272a',
      }
    },
  },
  plugins: [],
}
