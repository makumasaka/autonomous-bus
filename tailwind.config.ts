import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Robobus brand palette (dark-first)
        robobus: {
          bg: "#070B14", // deep navy
          surface: "#0B1222", // slate surface
          surface2: "#0E1930",
          border: "rgba(148, 163, 184, 0.14)", // slate-300 @ low alpha
          teal: "#22C1B5",
          teal2: "#14B8A6",
          orange: "#F97316",
        },
      },
      boxShadow: {
        surface:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;

