
import React, { useState } from 'react';
import { User, UserRole } from '../types';
// Add missing TrendingUp import
import { User as UserIcon, Mail, Phone, MapPin, Building2, Shield, Key, Save, AlertCircle, CheckCircle, Camera, LogOut, TrendingUp } from 'lucide-react';
import { REGIONAL_ZONES, MOCK_SHOWROOMS } from '../mockData';

interface ProfilePageProps {
    user: User;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY'>('GENERAL');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{type: 'SUCCESS' | 'ERROR', message: string} | null>(null);

    // Edit Profile State
    const [profileForm, setProfileForm] = useState({
        name: user.name,
        phone: user.phone,
        email: user.email // Read only usually, but displayed
    });

    // Change Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const getRegionalName = (id?: string) => {
        if (!id) return '-';
        return REGIONAL_ZONES.find(r => r.id === id)?.name || id;
    };

    const getShowroomName = (id?: string) => {
        if (!id) return '-';
        if (id === 'pusat') return 'Kantor Pusat';
        return MOCK_SHOWROOMS.find(s => s.id === id)?.name || id;
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        // Simulate API Call
        setTimeout(() => {
            setIsLoading(false);
            setNotification({ type: 'SUCCESS', message: 'Profil berhasil diperbarui.' });
            // In a real app, you would update the global user state here via a callback prop
        }, 1000);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setNotification({ type: 'ERROR', message: 'Konfirmasi password baru tidak sesuai.' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setNotification({ type: 'ERROR', message: 'Password minimal 6 karakter.' });
            return;
        }

        setIsLoading(true);

        // Simulate API Call
        setTimeout(() => {
            setIsLoading(false);
            setNotification({ type: 'SUCCESS', message: 'Password berhasil diubah. Silakan login ulang nanti.' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-maxxi-primary flex items-center justify-center text-3xl font-bold text-white">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full border-2 border-white shadow-sm group-hover:bg-maxxi-primary transition-colors">
                                        <Camera size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-16 pb-6 px-6 text-center">
                            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">
                                {user.role === UserRole.SUPER_ADMIN ? 'Head Office Administrator' : 
                                 user.role === UserRole.ADMIN_CRM ? 'Admin Showroom' : 'Sales Area Executive'}
                            </p>
                            
                            <div className="mt-6 flex flex-col gap-3 text-left">
                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <Building2 size={16} className="text-slate-400" />
                                    <span>{getShowroomName(user.showroomId)}</span>
                                </div>
                                {user.regionId && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span>Regional {getRegionalName(user.regionId)}</span>
                                    </div>
                                )}
                            </div>

                            {/* EXPLICIT LOGOUT BUTTON */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button 
                                    onClick={onLogout}
                                    className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 border border-red-100 transition-all active:scale-95 shadow-sm"
                                >
                                    <LogOut size={16} /> Keluar dari Sistem
                                </button>
                                <p className="text-[9px] text-slate-400 mt-3 font-medium uppercase tracking-tight italic text-center">Sesi Anda akan diakhiri di perangkat ini.</p>
                            </div>
                        </div>
                    </div>

                    {/* KPI Card (Only for Sales) */}
                    {user.role === UserRole.SALES_AREA && user.annualTarget && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                                <TrendingUp size={16} className="text-maxxi-primary" /> Performa Sales 2025
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Target Tahunan</span>
                                        <span className="font-bold text-slate-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(user.annualTarget)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Tercapai</span>
                                        <span className="font-bold text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(user.achievedRevenue || 0)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                                        <div 
                                            className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(((user.achievedRevenue || 0) / user.annualTarget) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-xs font-black text-green-600 mt-2">
                                        {Math.round(((user.achievedRevenue || 0) / user.annualTarget) * 100)}% ACHIEVEMENT
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Settings Forms */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 bg-slate-50/50">
                            <button 
                                onClick={() => setActiveTab('GENERAL')}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest text-center border-b-2 transition-all ${
                                    activeTab === 'GENERAL' ? 'border-maxxi-primary text-maxxi-primary bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <UserIcon size={16} /> Informasi Umum
                                </div>
                            </button>
                            <button 
                                onClick={() => setActiveTab('SECURITY')}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest text-center border-b-2 transition-all ${
                                    activeTab === 'SECURITY' ? 'border-maxxi-primary text-maxxi-primary bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Shield size={16} /> Keamanan Akun
                                </div>
                            </button>
                        </div>

                        <div className="p-6 md:p-10">
                            {notification && (
                                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
                                    notification.type === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {notification.type === 'SUCCESS' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-bold">{notification.message}</p>
                                </div>
                            )}

                            {activeTab === 'GENERAL' ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                value={profileForm.name}
                                                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                value={profileForm.phone}
                                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Perusahaan</label>
                                            <div className="relative group">
                                                <input 
                                                    type="email" 
                                                    value={profileForm.email}
                                                    disabled
                                                    className="w-full border-2 border-slate-50 bg-slate-50 text-slate-400 rounded-xl px-4 py-3 cursor-not-allowed font-medium"
                                                />
                                                <div className="absolute right-4 top-3 text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-black">READ ONLY</div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Hubungi administrator IT Pusat untuk permohonan perubahan email.</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50">
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="bg-slate-800 hover:bg-slate-900 text-white font-black py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 text-xs uppercase tracking-widest"
                                        >
                                            {isLoading ? 'Menyimpan...' : (
                                                <>
                                                    <Save size={18} /> Simpan Perubahan
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-xs text-amber-800 mb-8 flex items-start gap-4">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Key size={20}/></div>
                                        <div>
                                            <p className="font-black uppercase tracking-widest mb-1 text-[10px]">Proteksi Akun</p>
                                            Gunakan kombinasi minimal 8 karakter yang menyertakan huruf besar, angka, dan simbol untuk keamanan maksimal data pelanggan.
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password Saat Ini</label>
                                            <input 
                                                required
                                                type="password" 
                                                value={passwordForm.currentPassword}
                                                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="h-px bg-slate-50 my-4"></div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password Baru</label>
                                            <input 
                                                required
                                                type="password" 
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Konfirmasi Password Baru</label>
                                            <input 
                                                required
                                                type="password" 
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50">
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="bg-maxxi-primary hover:bg-red-700 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 text-xs uppercase tracking-widest"
                                        >
                                            {isLoading ? 'Memproses...' : (
                                                <>
                                                    <Shield size={18} /> Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
