
import React, { useState } from 'react';
import { MOCK_USERS } from '../mockData';
import { User } from '../types';
import { Lock, Mail, ArrowRight, AlertCircle, Tractor } from 'lucide-react';
import { MaxxiLogo } from './Layout';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('hendra.it@maxxi.co.id'); // Default for demo
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        if (foundUser.status === 'INACTIVE') {
            setError('Akun Anda dinonaktifkan. Hubungi HRD/IT.');
            setIsLoading(false);
            return;
        }
        onLogin(foundUser);
      } else {
        setError('Email atau password salah.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding & Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-red-700 relative overflow-hidden">
        {/* Background Image Overlay - Changed to Red to Grey Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/95 to-slate-600/85 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2070&auto=format&fit=crop" 
            alt="Agriculture Machinery" 
            className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 flex flex-col justify-between p-12 w-full text-white">
            <div>
                <div className="mb-4">
                    <MaxxiLogo variant="white" className="h-12" />
                </div>
                <p className="text-white/80 tracking-widest text-sm font-semibold uppercase mt-2">Corin Mulia Gemilang</p>
            </div>

            <div className="space-y-6">
                <h1 className="text-5xl font-black leading-tight tracking-tighter">
                    MEMBANGUN PERTANIAN <br/> 
                    <span className="text-white">MASA DEPAN</span>
                </h1>
                <p className="text-slate-100 text-lg max-w-md leading-relaxed font-medium">
                    Sistem Manajemen Terpadu untuk penjualan alat mesin pertanian, smart farming, dan layanan purna jual di seluruh Indonesia.
                </p>
                <div className="flex gap-2 pt-4">
                    <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">Alsintan</span>
                    <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">Smart Farming</span>
                    <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">Service Network</span>
                </div>
            </div>

            <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} PT. CORIN MULIA GEMILANG. ALL RIGHTS RESERVED.
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 animate-in slide-in-from-right duration-500">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start items-center mb-10">
                    <MaxxiLogo variant="primary" className="h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
                <p className="text-slate-500 mt-2 font-medium">Silakan masuk ke akun CRM Anda.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Perusahaan</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:border-transparent outline-none transition-all font-bold text-slate-700"
                                placeholder="nama@maxxi.co.id"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Keamanan</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600 focus:bg-white focus:border-transparent outline-none transition-all font-bold text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-600" />
                        <span className="text-slate-500 font-bold group-hover:text-slate-700 transition-colors">Ingat saya di perangkat ini</span>
                    </label>
                    <a href="#" className="font-black text-red-600 hover:text-red-800 uppercase tracking-tighter">Lupa password?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                    {isLoading ? 'Memvalidasi Sesi...' : 'Masuk ke Dashboard'}
                    {!isLoading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="pt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 uppercase font-black tracking-widest">
                <p>Butuh bantuan akses? Hubungi <a href="#" className="text-slate-900 hover:underline">Tim IT Support CMG</a></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
