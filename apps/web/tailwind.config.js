// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-primary-dark': 'var(--color-primary-dark)',
        'theme-primary-light': 'var(--color-primary-light)',
        'theme-secondary': 'var(--color-secondary)',
        'theme-secondary-dark': 'var(--color-secondary-dark)',
        'theme-secondary-light': 'var(--color-secondary-light)',
        'theme-accent': 'var(--color-accent)',
        'theme-background': 'var(--color-background)',
        'theme-surface': 'var(--color-surface)',
        'theme-text': 'var(--color-text)',
        'theme-text-secondary': 'var(--color-text-secondary)',
      },
    },
  },
  plugins: [],
};
