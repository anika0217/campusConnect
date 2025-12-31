/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss/plugin')(function({ addVariant, modifySelectors, separator }) {
      // Define a custom 'dark' variant that matches when an ancestor has the .dark class
      addVariant('dark', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.dark .${className.split(separator).join(`\${separator}`)}`;
        });
      });
    })
  ],
};
