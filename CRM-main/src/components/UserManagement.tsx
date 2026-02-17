
import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, ShieldCheck, Mail, Phone, MapPin, Building2, Save, X, Target, TrendingUp, Award, BarChart3, Lock, Check, Wrench, Briefcase, Boxes, GraduationCap, Microscope, HardHat, Shield, Store, Map as MapIcon2 } from 'lucide-react';
import { MOCK_USERS, REGIONAL_ZONES, MOCK_SHOWROOMS } from '../mockData';
import { User, UserRole } from '../types';

const APP_SECTIONS = [
    { id: 'dashboard', label: 'Dashboard Utama' },
    { id: 'pipeline', label: 'Pipeline Penjualan' },
    { id: 'quotes', label: 'Buat Penawaran' },
    { id: 'leads', label: 'Manajemen Pelanggan' },
    { id: 'inventory', label: 'Katalog Produk' },
    { id: 'service', label: 'Layanan Purna Jual' },
    { id: 'showrooms', label: 'Jaringan Showroom' },
    { id: 'chat', label: 'Live Chat Customer' },
    { id: 'campaigns', label: 'Broadcast Pesan' },
    { id: 'demos', label: 'Jadwal Demo' },
    { id: 'users', label: 'Manajemen User' },
    { id: 'config-forms', label: 'Config: Formulir' },
    { id: 'config-dashboard', label: 'Config: Dashboard' },
    { id: 'config-regional', label: 'Config: Regional' },
];

const ROLE_GROUPS = [
    {
        label: 'Sistem & Operasional Utama',
        roles: [
            { id: UserRole.SUPER_ADMIN, label: 'Super Admin (Head Office)' },
            { id: UserRole.ADMIN_CRM, label: 'Admin CRM (Showroom)' },
            { id: UserRole.SALES_AREA, label: 'Sales Area Executive' },
            { id: UserRole.DIRECTOR, label: 'Director' },
            { id: UserRole.BUSINESS_DEVELOPMENT, label: 'Business Development' },
        ]
    },
    {
        label: 'Management & Control',
        roles: [
            { id: UserRole.MANAGEMENT_REPRESENTATIVE, label: 'Management Representative' },
            { id: UserRole.QMS_DOCUMENT_CONTROL, label: 'QMS dan Document Control' },
            { id: UserRole.FINANCE_ACCOUNTING, label: 'Finance & Accounting' },
            { id: UserRole.QA_MANAGER, label: 'QA Manager' },
            { id: UserRole.QA_SUPERVISOR, label: 'QA Supervisor' },
            { id: UserRole.QA_WORKER, label: 'QA Support Worker' },
        ]
    },
    {
        label: 'R & D',
        roles: [
            { id: UserRole.RD_ADMIN_PP, label: 'R & D dan Admin PP' },
            { id: UserRole.RISET_SUPERVISOR, label: 'Riset Supervisor' },
            { id: UserRole.DESIGN_SUPERVISOR, label: 'Design Supervisor' },
            { id: UserRole.DESIGN_CREATIVE_SUPERVISOR, label: 'Design Creative Supervisor' },
        ]
    },
    {
        label: 'HR & Legal',
        roles: [
            { id: UserRole.HR_MANAGER, label: 'HR Manager' },
            { id: UserRole.PERSONALIA, label: 'Personalia' },
            { id: UserRole.LEGAL, label: 'LEGAL' },
        ]
    },
    {
        label: 'Logistic & Purchasing',
        roles: [
            { id: UserRole.LOGISTIC_PURCHASING_MANAGER, label: 'Logistic & Purchasing Manager' },
            { id: UserRole.PURCHASING_SUPERVISOR, label: 'Purchasing Supervisor' },
            { id: UserRole.LOGISTIC_SUPPORT, label: 'Logistic Support' },
        ]
    },
    {
        label: 'Marketing & Sales',
        roles: [
            { id: UserRole.MARKETING_MANAGER, label: 'Marketing Manager' },
            { id: UserRole.MARKETING_BRANCH_HEAD, label: 'Marketing & Branch Head' },
            { id: UserRole.BRANCH_HEAD, label: 'Branch Head' },
            { id: UserRole.COLLECTION_STAFF, label: 'Collection Staff' },
            { id: UserRole.MARKETING_STAFF, label: 'Marketing Staff' },
            { id: UserRole.TRAINING_MARKETING_ADMIN, label: 'Training & Marketing Administration' },
            { id: UserRole.SALES_PART_SUPERVISOR, label: 'Sales Part Supervisor' },
            { id: UserRole.SALES_PART_STAFF, label: 'Sales Part Staff' },
            { id: UserRole.PART_WAREHOUSE_SUPERVISOR, label: 'Part Warehouse Supervisor' },
            { id: UserRole.STOCK_WAREHOUSE_WORKER, label: 'Stock & Warehouse Support Worker' },
        ]
    },
    {
        label: 'Production',
        roles: [
            { id: UserRole.PRODUCTION_MANAGER, label: 'Production Manager' },
            { id: UserRole.FABRICATION, label: 'Fabrication' },
            { id: UserRole.FABRICATION_WORKER, label: 'Fabrication Support Worker' },
            { id: UserRole.ASSEMBLY, label: 'Assembly' },
            { id: UserRole.ASSEMBLY_SUPPORT, label: 'Assembly Support' },
            { id: UserRole.PAINTING_SUPERVISOR, label: 'Painting Supervisor' },
            { id: UserRole.PAINTING_WORKER, label: 'Painting Support Worker' },
            { id: UserRole.MATERIAL_WAREHOUSE_SUPERVISOR, label: 'Material Warehouse Supervisor' },
            { id: UserRole.STOCK_KEEPER, label: 'Stock Keeper' },
            { id: UserRole.MAINTENANCE_SUPERVISOR, label: 'Maintenance Supervisor' },
            { id: UserRole.MAINTENANCE_WORKER, label: 'Maintenance Support Worker' },
        ]
    },
    {
        label: 'After Sales Service',
        roles: [
            { id: UserRole.AFTER_SALES_SERVICE, label: 'After Sales Service Manager' },
            { id: UserRole.SERVICE_CENTER, label: 'Service Center Staff' },
            { id: UserRole.SAHABAT_MAXXI, label: 'Sahabat MAXXI' },
            { id: UserRole.SERVICE_MECHANIC, label: 'Service Mechanic' },
            { id: UserRole.SERVICE_SUPPORT, label: 'Service Support' },
        ]
    }
];

const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'USERS' | 'TARGETS'>('USERS');
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | 'ALL'>('ALL');
    const [regionFilter, setRegionFilter] = useState<string>('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        phone: '',
        role: UserRole.SALES_AREA,
        status: 'ACTIVE',
        regionId: '',
        subRegionId: '',
        showroomId: '',
        annualTarget: 0,
        achievedRevenue: 0,
        permissions: []
    });

    const selectedRegion = REGIONAL_ZONES.find(r => r.id === formData.regionId);
    
    const availableShowrooms = formData.regionId 
        ? MOCK_SHOWROOMS.filter(s => s.marketingRegion?.id === formData.regionId)
        : [];

    const filteredUsers = users.filter(user => {
        const nameMatch = String(user.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = String(user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesRegion = regionFilter === 'ALL' || user.regionId === regionFilter;
        
        return matchesSearch && matchesRole && matchesRegion;
    });

    const salesUsers = users.filter(user => user.role === UserRole.SALES_AREA);

    const formatRupiah = (num: number | undefined) => {
        if (num === undefined || num === null) return '-';
        if (num >= 1000000000) {
            return `Rp ${(num / 1000000000).toFixed(1)}M`;
        }
        return `Rp ${(num / 1000000).toFixed(0)} Jt`;
    };

    const handleAddNew = () => {
        setIsEditMode(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: UserRole.SALES_AREA,
            status: 'ACTIVE',
            regionId: '',
            subRegionId: '',
            showroomId: '',
            annualTarget: 0,
            achievedRevenue: 0,
            permissions: ['dashboard', 'leads', 'inventory'] // Default set
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setIsEditMode(true);
        setFormData({ ...user, permissions: user.permissions || [] });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const togglePermission = (id: string) => {
        const current = formData.permissions || [];
        if (current.includes(id)) {
            setFormData({ ...formData, permissions: current.filter(p => p !== id) });
        } else {
            setFormData({ ...formData, permissions: [...current, id] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalData = { ...formData };
        if (finalData.role !== UserRole.SALES_AREA) {
            delete finalData.annualTarget;
            delete finalData.achievedRevenue;
        }

        if (isEditMode && formData.id) {
            setUsers(prev => prev.map(u => u.id === formData.id ? { ...u, ...finalData } as User : u));
        } else {
            const newUser: User = {
                id: `u-${Date.now()}`,
                name: finalData.name || '',
                email: finalData.email || '',
                phone: finalData.phone || '',
                role: finalData.role || UserRole.SALES_AREA,
                status: finalData.status || 'ACTIVE',
                regionId: (finalData.role === UserRole.SUPER_ADMIN || finalData.role === UserRole.DIRECTOR) ? undefined : finalData.regionId,
                subRegionId: finalData.subRegionId,
                showroomId: (finalData.role === UserRole.SUPER_ADMIN || finalData.role === UserRole.DIRECTOR) ? 'pusat' : finalData.showroomId,
                lastLogin: '-',
                annualTarget: finalData.role === UserRole.SALES_AREA ? finalData.annualTarget : undefined,
                achievedRevenue: finalData.role === UserRole.SALES_AREA ? 0 : undefined,
                permissions: (finalData.role === UserRole.SUPER_ADMIN || finalData.role === UserRole.DIRECTOR) ? undefined : finalData.permissions
            };
            setUsers(prev => [newUser, ...prev]);
        }
        setIsModalOpen(false);
    };

    const getRoleBadge = (role: UserRole) => {
        const roleLabel = String(role || '').replace(/_/g, ' ');
        let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

        if (['DIRECTOR', 'SUPER_ADMIN', 'MARKETING_MANAGER', 'PRODUCTION_MANAGER'].includes(role)) {
            colorClass = "bg-purple-100 text-purple-700 border-purple-200";
        } else if (role.includes('MANAGER') || role.includes('HEAD')) {
            colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        } else if (role.includes('SUPERVISOR')) {
            colorClass = "bg-indigo-100 text-indigo-700 border-indigo-200";
        } else if (role === 'SALES_AREA') {
            colorClass = "bg-green-100 text-green-700 border-green-200";
        } else if (role.includes('WORKER') || role.includes('KEEPER') || role.includes('MECHANIC')) {
            colorClass = "bg-amber-100 text-amber-700 border-amber-200";
        }

        return <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${colorClass}`}>{roleLabel}</span>;
    };

    const getShowroomName = (idOrObj?: any) => {
        if (!idOrObj) return '-';
        if (typeof idOrObj === 'object') return idOrObj.name || idOrObj.id || '-';
        
        const id = String(idOrObj);
        if (id === 'pusat') return 'Kantor Pusat';
        const showroom = MOCK_SHOWROOMS.find(s => s.id === id);
        return showroom ? showroom.name : id;
    };

    const renderUsersTab = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-maxxi-primary outline-none text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none text-xs font-black uppercase tracking-widest"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">Semua Jabatan</option>
                        {ROLE_GROUPS.map(group => (
                            <optgroup key={group.label} label={group.label}>
                                {group.roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none text-xs font-black uppercase tracking-widest"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="ALL">Semua Regional</option>
                        {REGIONAL_ZONES.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-400 font-black border-b border-slate-100 text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-5">Informasi Personel</th>
                            <th className="px-6 py-5">Jabatan / Role</th>
                            <th className="px-6 py-5">Lokasi Penugasan</th>
                            <th className="px-6 py-5">Kontak</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                    Tidak ada data personel ditemukan.
                                </td>
                            </tr>
                        ) : filteredUsers.map(user => {
                            const region = REGIONAL_ZONES.find(r => r.id === user.regionId);
                            const subRegion = region?.subRegions?.find(s => s.id === user.subRegionId);
                            
                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-200 shadow-inner transition-all">
                                                {String(user.name || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm">{user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {String(user.id || '').toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-5">
                                        {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DIRECTOR) ? (
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                                                <Building2 size={12} /> Kantor Pusat (HQ)
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-black text-[10px] uppercase">
                                                    <MapPin size={12} className="text-maxxi-primary" />
                                                    {region?.name || '-'} {subRegion && <span className="text-slate-400 font-bold">/ {subRegion.name}</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[9px] uppercase tracking-tighter truncate max-w-[150px]">
                                                    <Store size={12} className="text-slate-400" />
                                                    {getShowroomName(user.showroomId)}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1 text-[11px] font-bold">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Mail size={12} className="text-slate-400" /> {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone size={12} className="text-slate-400" /> {user.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {user.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                                                <CheckCircle size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                                                <XCircle size={10} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTargetTab = () => {
        const filteredSales = salesUsers.filter(u => {
            const matchesSearch = String(u.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRegion = regionFilter === 'ALL' || u.regionId === regionFilter;
            return matchesSearch && matchesRegion;
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-maxxi-primary transition-all">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Target size={32} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Total Sales Area</p>
                            <p className="text-3xl font-black text-slate-800">{salesUsers.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-maxxi-primary transition-all">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><Award size={32} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Top Achiever</p>
                            <p className="text-xl font-black text-slate-800 truncate max-w-[150px]">
                                {salesUsers.length > 0 ? salesUsers.reduce((prev, current) => (prev.achievedRevenue || 0) > (current.achievedRevenue || 0) ? prev : current).name : '-'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-maxxi-primary transition-all">
                        <div className="p-4 bg-red-50 text-maxxi-primary rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp size={32} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Avg. Achievement</p>
                            <p className="text-3xl font-black text-maxxi-primary">
                                {salesUsers.length > 0 ? Math.round((salesUsers.reduce((acc, u) => acc + (u.achievedRevenue || 0), 0) / salesUsers.reduce((acc, u) => acc + (u.annualTarget || 1), 0)) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama sales..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-maxxi-primary outline-none text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none text-xs font-black uppercase tracking-widest"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="ALL">Semua Regional</option>
                        {REGIONAL_ZONES.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-400 font-black border-b border-slate-100 text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Nama Sales Area</th>
                                <th className="px-6 py-5">Regional</th>
                                <th className="px-6 py-5 text-right">Target Tahunan</th>
                                <th className="px-6 py-5 text-right">Pencapaian Riil</th>
                                <th className="px-6 py-5 w-64 text-center">Progres (%)</th>
                                <th className="px-6 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        Tidak ada personel sales area ditemukan.
                                    </td>
                                </tr>
                            ) : filteredSales.map(user => {
                                const achieved = user.achievedRevenue || 0;
                                const target = user.annualTarget || 1;
                                const percent = Math.min(Math.round((achieved / target) * 100), 100);
                                
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-slate-800 text-sm">{user.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-slate-600 text-[10px] uppercase">
                                            {REGIONAL_ZONES.find(r => r.id === user.regionId)?.name || '-'}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-700 text-xs">
                                            {formatRupiah(user.annualTarget)}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-green-600 text-xs">
                                            {formatRupiah(user.achievedRevenue)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-700 ${percent >= 100 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : percent >= 70 ? 'bg-blue-500' : 'bg-maxxi-primary'}`} 
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[10px] font-black min-w-[32px] text-right ${percent >= 100 ? 'text-green-600' : 'text-slate-600'}`}>{percent}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => handleEdit(user)}
                                                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 ml-auto shadow-sm active:scale-95"
                                            >
                                                <Edit size={12} /> Set Target
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Personel & Struktur Organisasi</h1>
                    <p className="text-slate-500 text-sm font-medium">Database SDM Terpadu PT. Corin Mulia Gemilang 2025.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleAddNew}
                        className="bg-maxxi-primary hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-red-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} /> Registrasi User
                    </button>
                </div>
            </div>

            <div className="flex border-b border-slate-200 gap-8">
                <button 
                    onClick={() => setActiveTab('USERS')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'USERS' ? 'text-maxxi-primary' : 'text-slate-400 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 px-1">
                        <Users size={16} /> Database User
                    </div>
                    {activeTab === 'USERS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-maxxi-primary rounded-t-full shadow-[0_-4px_10px_rgba(220,38,38,0.3)]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('TARGETS')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'TARGETS' ? 'text-maxxi-primary' : 'text-slate-400 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 px-1">
                        <BarChart3 size={16} /> Performa Sales
                    </div>
                    {activeTab === 'TARGETS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-maxxi-primary rounded-t-full shadow-[0_-4px_10px_rgba(220,38,38,0.3)]"></div>}
                </button>
            </div>

            {activeTab === 'USERS' ? renderUsersTab() : renderTargetTab()}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <ShieldCheck size={24} className="text-maxxi-primary"/>
                                {isEditMode ? 'Update Data Personel' : 'Registrasi Personel Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={28} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-full md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Lengkap Sesuai KTP</label>
                                    <input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-800" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Jabatan (Struktur 2025)</label>
                                    <select 
                                        className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white font-bold text-slate-800 text-sm"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    >
                                        {ROLE_GROUPS.map(group => (
                                            <optgroup key={group.label} label={group.label}>
                                                {group.roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Perusahaan / SSO</label>
                                    <input required type="email" placeholder="nama@maxxi.co.id" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-800" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nomor WhatsApp Aktif</label>
                                    <input required type="text" placeholder="0812..." className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-800" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Status Keaktifan Akun</label>
                                    <select className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white font-bold text-slate-800" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}>
                                        <option value="ACTIVE">AKTIF (Active)</option>
                                        <option value="INACTIVE">NON-AKTIF (Inactive)</option>
                                    </select>
                                </div>
                            </div>

                            {!(formData.role === UserRole.SUPER_ADMIN || formData.role === UserRole.DIRECTOR) && (
                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 ml-1">Regional Penugasan</label>
                                            <select required className="w-full border-2 border-white rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white font-bold text-slate-800" value={formData.regionId || ''} onChange={(e) => setFormData({ ...formData, regionId: e.target.value, subRegionId: '', showroomId: '' })}>
                                                <option value="">-- Pilih Regional --</option>
                                                {REGIONAL_ZONES.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 ml-1">Sub-Regional</label>
                                            <select 
                                                disabled={!formData.regionId} 
                                                className="w-full border-2 border-white rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400 font-bold text-slate-800" 
                                                value={formData.subRegionId || ''} 
                                                onChange={(e) => setFormData({ ...formData, subRegionId: e.target.value })}
                                            >
                                                <option value="">-- Pilih Sub-Reg --</option>
                                                {selectedRegion?.subRegions?.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 ml-1">Showroom / Homebase</label>
                                            <select required disabled={!formData.regionId} className="w-full border-2 border-white rounded-2xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400 font-bold text-slate-800" value={formData.showroomId || ''} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}>
                                                <option value="">-- Pilih Showroom --</option>
                                                {availableShowrooms.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!(formData.role === UserRole.SUPER_ADMIN || formData.role === UserRole.DIRECTOR) && (
                                <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                        <Lock size={18} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Akses Modul Sistem (Permissions)</h4>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto bg-white custom-scrollbar">
                                        {APP_SECTIONS.map(section => {
                                            const isSelected = formData.permissions?.includes(section.id);
                                            return (
                                                <div 
                                                    key={section.id} 
                                                    onClick={() => togglePermission(section.id)}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{section.label}</span>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-slate-50 border-slate-200'}`}>
                                                        {isSelected && <Check size={12} className="text-blue-600" strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {formData.role === UserRole.SALES_AREA && (
                                <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl">
                                    <label className="block text-[10px] font-black text-red-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Target size={18}/> Target Omset Sales (Annual Target)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-red-400 font-black text-sm">IDR</span>
                                        <input type="number" className="w-full border-2 border-white rounded-2xl pl-12 pr-4 py-3 focus:border-maxxi-primary outline-none font-black text-slate-800 text-xl" value={formData.annualTarget || ''} onChange={(e) => setFormData({ ...formData, annualTarget: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-slate-800">Batal</button>
                                <button type="submit" className="px-12 py-4 bg-maxxi-primary text-white font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 flex items-center gap-2 uppercase tracking-widest text-[11px] active:scale-95 transition-all"><Save size={20} /> Simpan Data Personel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
