module.exports = {
  // Use array form to list PostCSS plugins (functions returned by require)
  plugins: [
    // Tailwind v4 uses the '@tailwindcss/postcss' adapter
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
