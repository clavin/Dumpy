/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{html,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Archivo', 'Inter', 'sans-serif'],
      'sans-black': ['Archivo Black', 'Archivo', 'Inter', 'sans-serif'],
      monospace: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
  },
  plugins: [],
}
