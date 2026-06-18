import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151119",        // Midnight Truffle
        purple: "#482d5a",     // Cocoa Royale
        caramel: "#cda84f",    // Caramel Luxe
        sun: "#e3cb85",        // Golden Velvet
        cream: "#FAF7F2",      // Soft Cream Canvas
        magenta: "#D96B82",    // Creative Accent Pink
        teal: "#4A7C79",       // ADDED: Matching deep organic sage teal for background placeholders and blobs
      },
      fontFamily: {
        // Corrected mapping syntax to fetch font variables safely in Next.js
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;