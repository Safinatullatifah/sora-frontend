import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token tidak valid atau tidak ditemukan");
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        token,
        newPassword: password
      });
      
      setIsSuccess(true);
      toast.success("Password berhasil diubah!");
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      const msg = error.response?.data?.message || "Gagal merubah password. Token mungkin kedaluwarsa.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-sora-bg flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-[1000px] w-full min-h-[600px] lg:h-[600px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-sora-blue/10 overflow-hidden border border-gray-100">
        
        <div className="hidden lg:flex bg-sora-navy p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-sora-blue rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-8 shadow-lg">
              S
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4 tracking-tighter">
              Pemulihan <br/> <span className="text-sora-cyan text-3xl">Akses Akun.</span>
            </h1>
            <p className="text-sora-cyan/60 font-medium leading-relaxed text-sm">
              Buat kata sandi baru yang kuat dan mudah diingat. Minimal 8 karakter demi keamanan data Anda.
            </p>
          </div>
          
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sora-blue/20 rounded-full blur-3xl text-left"></div>
        </div>

        <div className="p-8 sm:p-10 lg:p-16 flex flex-col justify-center bg-white relative overflow-hidden">
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full max-w-md mx-auto">
            <div className="mb-10 text-left">
              <div className="lg:hidden w-14 h-14 bg-sora-blue rounded-xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-lg">S</div>
              <h2 className="text-2xl sm:text-3xl font-black text-sora-navy mb-2 tracking-tight">Buat Sandi Baru</h2>
              <p className="text-sora-gray font-medium text-sm">Silakan masukkan password baru Anda.</p>
            </div>

            {isSuccess ? (
              <div className="p-8 bg-sora-green/10 border border-sora-green/20 rounded-3xl text-center space-y-4">
                <CheckCircle2 className="text-sora-green mx-auto" size={48}/>
                <h4 className="font-black text-sora-navy text-sm uppercase">Berhasil Diubah!</h4>
                <p className="text-xs text-sora-gray">Mengarahkan ke halaman login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" 
                      placeholder="Minimal 8 Karakter" 
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" 
                      placeholder="Ulangi Password Baru" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-sora-blue"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sora-navy text-white font-black py-4 sm:py-5 rounded-[1.5rem] shadow-xl shadow-sora-navy/20 hover:bg-sora-blue transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] mt-4 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18}/> : "Simpan Password"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <button 
                onClick={() => navigate('/login')}
                className="text-[10px] font-black text-gray-500 hover:text-sora-navy transition-colors uppercase tracking-widest"
              >
                Kembali ke Login
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em]">
                SORA Engine v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}