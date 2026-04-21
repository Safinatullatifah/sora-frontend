import { useState, useEffect } from 'react';
import { 
  LogIn, Lock, User, Mail, ArrowLeft, 
  Eye, EyeOff, Send, CheckCircle2 
} from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Efek untuk mematikan scroll di seluruh halaman login
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // LOGIKA PINTU RAHASIA ADMIN
    // Jika username mengandung kata 'admin' atau keyword tertentu, login sebagai admin
    // Selain itu, otomatis login sebagai siswa
    let role = 'siswa';
    if (username.toLowerCase().includes('admin') || username === 'fina_sora') {
      role = 'admin';
    }

    if (username && password) {
      onLogin({ role, name: username, username });
    } else {
      alert("Masukkan username dan password!");
    }
  };

  return (
    // Tambahkan h-screen dan overflow-hidden di container utama
    <div className="h-screen w-screen bg-sora-bg flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="max-w-[1000px] w-full h-[600px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-sora-blue/10 overflow-hidden border border-gray-100">
        
        {/* SISI KIRI: VISUAL & BRANDING */}
        <div className="hidden lg:flex bg-sora-navy p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-sora-blue rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-8 shadow-lg">
              S
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4 tracking-tighter">
              SORA <br/> <span className="text-sora-cyan text-3xl">Digitalization.</span>
            </h1>
            <p className="text-sora-cyan/60 font-medium leading-relaxed text-sm">
              Sistem Operasional dan Administrasi Sekolah Masa Kini. Kelola data dan pembayaran dalam satu genggaman.
            </p>
          </div>
          
          <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-2">Pemberitahuan</p>
            <p className="text-[11px] text-white/80 leading-relaxed font-medium">
              Gunakan akun resmi yang diberikan oleh Tata Usaha. Hubungi admin jika terjadi kendala akses.
            </p>
          </div>

          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sora-blue/20 rounded-full blur-3xl text-left"></div>
        </div>

        {/* SISI KANAN: FORM AREA */}
        <div className="p-10 lg:p-16 flex flex-col justify-center bg-white relative overflow-hidden">
          
          {!isForgot ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-10 text-left">
                <h2 className="text-3xl font-black text-sora-navy mb-2 tracking-tight">Selamat Datang!</h2>
                <p className="text-sora-gray font-medium text-sm">Silakan masuk untuk melanjutkan.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Username / NISN</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" 
                      placeholder="Masukkan username..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-sora-blue"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsForgot(true)}
                    className="text-[10px] font-black text-sora-blue hover:text-sora-navy transition-colors uppercase tracking-widest"
                  >
                    Lupa Password?
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sora-navy text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-sora-navy/20 hover:bg-sora-blue transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] mt-4"
                >
                  <LogIn size={18}/> Sign In ke Portal
                </button>
              </form>
            </div>
          ) : (
            /* Bagian Forgot Password tetap sama, tapi dengan h-full agar tidak scroll */
            <div className="animate-in fade-in zoom-in-95 duration-500 text-left">
               <button 
                onClick={() => setIsForgot(false)}
                className="flex items-center gap-2 text-sora-gray hover:text-sora-navy mb-8 font-bold text-[10px] uppercase tracking-widest"
              >
                <ArrowLeft size={16}/> Kembali
              </button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-sora-navy mb-2 tracking-tight">Reset Akses</h2>
                <p className="text-sora-gray text-sm font-medium">Link pemulihan akan dikirimkan ke email.</p>
              </div>

              {emailSent ? (
                <div className="p-8 bg-sora-green/10 border border-sora-green/20 rounded-3xl text-center space-y-4">
                  <CheckCircle2 className="text-sora-green mx-auto" size={48}/>
                  <h4 className="font-black text-sora-navy text-sm uppercase">Email Terkirim!</h4>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setEmailSent(true); }} className="space-y-6">
                  <input 
                    type="email" 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all text-sm" 
                    placeholder="Masukkan email Anda..." 
                  />
                  <button className="w-full bg-sora-blue text-white font-black py-5 rounded-[1.5rem] uppercase tracking-[0.2em] text-[10px]">Kirim Link</button>
                </form>
              )}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em]">
              SORA Engine v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}