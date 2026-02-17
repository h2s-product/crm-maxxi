
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Tractor, Users, ShoppingCart, Calendar, Menu, Settings, Briefcase, Wrench, Megaphone, Store, Bell, Check, X, AlertTriangle, Info, ShieldCheck, MessageSquare, MessageCircle, ChevronDown, ChevronRight, LogOut, User as UserIcon, FormInput, LayoutDashboard, Map as MapIcon, Maximize, Minimize, Package, UserPlus, CheckCheck, Trash2, FileBarChart, Target } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  user: User;
  onLogout: () => void;
}

export const MaxxiLogo = ({ className, variant }: { className?: string; variant?: string }) => null;

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
  children?: {
    id: string;
    label: string;
    icon?: React.ElementType;
    badgeCount?: number;
  }[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: Activity },
  { id: 'reports', label: 'Laporan & Analitik', icon: FileBarChart },
  { id: 'target-setting', label: 'Target Setting', icon: Target },
  { id: 'pipeline', label: 'Pipeline Penjualan', icon: Briefcase }, 
  { id: 'quotes', label: 'Buat Penawaran', icon: ShoppingCart },
  { id: 'leads', label: 'Manajemen Pelanggan', icon: Users },
  { id: 'inventory', label: 'Katalog Produk', icon: Tractor },
  { id: 'service', label: 'Layanan Purna Jual', icon: Wrench },
  { id: 'showrooms', label: 'Jaringan Showroom', icon: Store },
  { 
    id: 'communication', 
    label: 'Komunikasi', 
    icon: MessageSquare,
    badgeCount: 2,
    children: [
        { id: 'chat', label: 'Live Chat Customer', icon: MessageCircle, badgeCount: 2 },
        { id: 'campaigns', label: 'Broadcast Pesan', icon: Megaphone }
    ]
  },
  { id: 'demos', label: 'Jadwal Demo', icon: Calendar },
  { id: 'users', label: 'Manajemen User', icon: ShieldCheck },
  {
    id: 'config',
    label: 'Konfigurasi Sistem',
    icon: Settings,
    children: [
        { id: 'config-forms', label: 'Formulir & Data', icon: FormInput },
        { id: 'config-dashboard', label: 'Setting Dashboard', icon: LayoutDashboard },
        { id: 'config-regional', label: 'Master Regional', icon: MapIcon }
    ]
  }
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['communication', 'config']);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubMenu = (menuId: string) => {
      setExpandedMenus(prev => prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]);
  };

  const isSectionAllowed = (id: string) => {
    if (user.role === UserRole.SUPER_ADMIN) return true;
    const item = navItems.find(n => n.id === id);
    if (item && item.children) {
        return item.children.some(child => user.permissions?.includes(child.id));
    }
    return user.permissions?.includes(id);
  };

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden font-sans">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-maxxi-sidebar text-slate-800 transition-all duration-300 flex flex-col z-20 shadow-xl`}>
        <div className="p-4 flex items-center justify-between h-16 border-b border-slate-300/50">
          <div className={`${!sidebarOpen && 'hidden'} overflow-hidden transition-all duration-300`}>
             <span className="text-[10px] block font-black text-slate-500 uppercase tracking-[0.2em]">CRM Console</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-300/50 rounded-lg text-slate-500 transition-colors">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (!isSectionAllowed(item.id)) return null;
            const isActive = currentPage === item.id || (item.children && item.children.some(c => c.id === currentPage));
            const isExpanded = expandedMenus.includes(item.id);

            return (
                <div key={item.id} className="space-y-1">
                    <button
                        onClick={() => {
                            if (!sidebarOpen) setSidebarOpen(true);
                            if (item.children) toggleSubMenu(item.id); else onNavigate(item.id);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                            isActive ? 'bg-maxxi-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-300/50 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'} />
                            <span className={`whitespace-nowrap text-sm font-semibold ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {item.badgeCount && item.badgeCount > 0 && !isExpanded && sidebarOpen && (
                              <span className="bg-maxxi-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">{item.badgeCount}</span>
                           )}
                           {item.children && sidebarOpen && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                        </div>
                    </button>
                    {item.children && isExpanded && sidebarOpen && (
                        <div className="ml-4 space-y-1 mt-1 border-l border-slate-300">
                            {item.children.map(child => {
                                if (!isSectionAllowed(child.id)) return null;
                                return (
                                    <button 
                                      key={child.id} 
                                      onClick={() => onNavigate(child.id)} 
                                      className={`w-full flex items-center justify-between px-8 py-2 rounded-lg transition-all text-xs font-medium ${
                                        currentPage === child.id ? 'text-maxxi-primary font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/30'
                                      }`}
                                    >
                                        <div className="flex items-center gap-3">
                                           <span className="whitespace-nowrap">{child.label}</span>
                                        </div>
                                        {child.badgeCount && child.badgeCount > 0 && (
                                           <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-maxxi-primary text-white">{child.badgeCount}</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-300/50 bg-maxxi-sidebar">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-maxxi-primary hover:text-white transition-all duration-200 group"
            >
                <LogOut size={18} className="text-slate-500 group-hover:text-white" />
                <span className={`text-sm font-semibold ${!sidebarOpen && 'hidden'}`}>Logout</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white shadow-subtle z-10 p-4 flex justify-between items-center h-16 border-b border-[#E0E0E0]">
            <div className="flex items-center">
              <MaxxiLogo />
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-all relative ${showNotifications ? 'bg-red-50 text-[#D32F2F]' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D32F2F] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            3
                        </span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-sm">Notifikasi</h3>
                                <button className="text-[10px] font-bold text-[#D32F2F] uppercase hover:underline">Baca Semua</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                                <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-50">
                                  <p className="text-xs font-semibold text-gray-800">Tiket Servis Baru</p>
                                  <p className="text-[10px] text-gray-500 mt-1">#TKT-2025-005: Mesin overheat pada Bimo 110X</p>
                                  <span className="text-[9px] text-gray-400 mt-1 block">5 menit yang lalu</span>
                                </div>
                                <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                  <p className="text-xs font-semibold text-gray-800">Target Tercapai!</p>
                                  <p className="text-[10px] text-gray-500 mt-1">Region JATIM telah mencapai 95% target bulanan.</p>
                                  <span className="text-[9px] text-gray-400 mt-1 block">1 jam yang lalu</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div onClick={() => onNavigate('profile')} className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-800 group-hover:text-[#D32F2F] transition-colors">{user.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                          {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Sales Area'}
                        </p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-[#D32F2F] flex items-center justify-center text-white font-bold shadow-sm border border-white">
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F5F6F8]">
            <div className="max-w-full mx-auto min-h-full">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
