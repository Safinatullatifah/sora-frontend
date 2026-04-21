/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna Utama Logo SORA
        'sora-navy': '#1A2F4C',   // Teks judul dan bagian gelap logo
        'sora-blue': '#0088CC',   // Biru terang pada gir dan buku
        'sora-cyan': '#45B6FE',   // Gradasi biru paling terang
        'sora-green': '#6BCB52',  // Hijau terang pada piksel dan grafik batang
        'sora-gray': '#64748B',   // Abu-abu untuk teks subtitle dan deskripsi
        'sora-bg': '#F8FAFC',     // Latar belakang web (putih keabu-abuan lembut)
      }
    },
  },
  plugins: [],
}