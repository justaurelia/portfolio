/** @type {import('tailwindcss').Config} */

import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  darkMode: "selector", 
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        inkBlack: "#0D1821",
        yaleBlue: "#344966",
        powderBlue: "#B4CDED",
        porcelain: "#F0F4EF",
        drySage: "#BFCC94",
      },
    },
  },
  plugins: [],
});
