/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Warna Bawaan Shadcn UI ---
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        
        // --- Warna Utama Logo SORA ---
        'sora-navy': '#1A2F4C',   // Teks judul dan bagian gelap logo
        'sora-blue': '#0088CC',   // Biru terang pada gir dan buku
        'sora-cyan': '#45B6FE',   // Gradasi biru paling terang
        'sora-green': '#6BCB52',  // Hijau terang pada piksel dan grafik batang
        'sora-gray': '#64748B',   // Abu-abu untuk teks subtitle dan deskripsi
        'sora-bg': '#F8FAFC',     // Latar belakang web (putih keabu-abuan lembut)
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [], // Jika kamu memakai komponen animasi shadcn, biasanya ini diisi dengan require("tailwindcss-animate")
}