/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-roboto)', 'Roboto', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        brand: 'var(--brand)',
        brandDark: 'var(--brand-dark)',
        brandSoft: 'var(--brand-soft)',
        onBrand: 'var(--on-brand)',
        danger: 'var(--danger)',
        ok: 'var(--ok)',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
      borderRadius: {
        card: '1.25rem',
      },
    },
  },
  plugins: [],
};
