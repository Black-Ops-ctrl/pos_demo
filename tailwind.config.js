/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      /* ---------------- Fonts ---------------- */
      fontFamily: {
        poppins: ["Poppins"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        helvetica: ["Helvetica"],
        inter: ["Inter"]
      },

      /* ---------------- Font Sizes ---------------- */
      fontSize: {
        tiny: "0.625rem",   // 10px
        tiny1: "0.725rem",  // 12px
        sm: "0.875rem",     // 14px
        base: "1rem",       // 16px 
        lg: "1.125rem",     // 18px
        xl: "1.25rem",      // 20px
        "2xl": "1.5rem",    // 24px
        "3xl": "1.875rem",  // 30px
        "4xl": "2.25rem",   // 36px
        "5xl": "3rem",      // 48px
        "6xl": "4rem",      // 64px
        huge: "5rem",       // 80px
      },

      /* ---------------- REQUIRED (for border-border etc.) ---------------- */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ---------------- YOUR ORIGINAL POS COLORS ---------------- */
        primary: "#ffffff",   
        secondary: "#000000", 
        greenColor: "#4CAF4F",    
        blackColor: "#263238",
        greyColor: "#4D4D4D",
        greyColorOne: "#EAEFEF",
        lightGreyColor: "#F8F8F8",
        redColor: "#EB4C4C",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
  ],
};
