import type { Config } from "tailwindcss";

export default {
  // darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ['"Fredoka"', '"Nunito"', "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
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
        star: {
          DEFAULT: "hsl(var(--star))",
          foreground: "hsl(var(--star-foreground))",
        },
        happy: "hsl(var(--happy))",
        sleepy: "hsl(var(--sleepy))",
        hungry: "hsl(var(--hungry))",
        sad: "hsl(var(--sad))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
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
        "bounce-soft": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        blink: {
          "0%,90%,100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        celebrate: {
          "0%": { transform: "scale(1) rotate(0)" },
          "25%": { transform: "scale(1.15) rotate(-5deg)" },
          "50%": { transform: "scale(1.2) rotate(5deg)" },
          "75%": { transform: "scale(1.15) rotate(-5deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
        "bubble-in": {
          "0%": { transform: "scale(0.6) translateY(8px)", opacity: "0" },
          "70%": { transform: "scale(1.05) translateY(0)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-soft": "bounce-soft 2.5s ease-in-out infinite",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        blink: "blink 4s ease-in-out infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        float: "float 3s ease-in-out infinite",
        celebrate: "celebrate 0.8s ease-in-out",
        shake: "shake 0.4s ease-in-out",
        "bubble-in": "bubble-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
