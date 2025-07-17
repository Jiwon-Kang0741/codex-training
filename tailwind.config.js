// tailwind.config.js
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}", // if using Next.js app router
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"OpenAI Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        },
      },
    },
    plugins: [],
  };
  