import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mirolo Brand Colors
        primary: {
          50: "#f6f7f4",
          100: "#e9ecdf",
          200: "#d4dac1",
          300: "#b7c199",
          400: "#9ba870",
          500: "#7a8471", // Salbeigrün - Main brand color
          600: "#6b7361",
          700: "#555c4e",
          800: "#454a40",
          900: "#393e35",
          950: "#1d201a",
          DEFAULT: "#7a8471",
          foreground: "#ffffff",
        },
        background: "#fefdfb", // Warmes Creme
        foreground: "#2d2d2d",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2d2d2d",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2d2d2d",
        },
        muted: {
          DEFAULT: "#f1f2f0",
          foreground: "#6b7361",
        },
        accent: {
          DEFAULT: "#f1f2f0",
          foreground: "#2d2d2d",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e4e4e7",
        input: "#e4e4e7",
        ring: "#7a8471",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;