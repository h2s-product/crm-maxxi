
import React, { useState, useEffect } from 'react';
// Added missing LayoutGrid and Trophy imports
import { Settings, Plus, Trash2, ToggleLeft, ToggleRight, List, FormInput, AlignLeft, Calendar, Hash, UploadCloud, LayoutDashboard, Target, Activity, Map, Edit, X, Save, ChevronDown, Search, Check, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, Building2, MapPin, MapPinned, Loader2, Info, ShieldCheck, Database, Eye, Lock, BarChart3, TrendingUp, PieChart, Users, Wrench, TableProperties, Briefcase, Percent, LayoutGrid, Trophy } from 'lucide-react';
import { FormFieldConfig, FormType, FieldType, DashboardWidgetConfig, RegionalZone, SubRegional } from '../types';
import { MOCK_FORM_CONFIG, REGIONAL_ZONES, INDONESIAN_PROVINCES } from '../mockData';

interface SystemConfigProps {
    activeTab: 'FORMS' | 'DASHBOARD' | 'REGIONAL';
    dashboardWidgets: DashboardWidgetConfig[];
    onUpdateDashboardConfigs: (configs: DashboardWidgetConfig[]) => void;
}

// Define the System Default Fields for each form to show in the UI
const SYSTEM_CORE_FIELDS: Record<FormType, { label: string; key: string; type: string; isRequired: boolean; source?: string }[]> = {
    [FormType.LEAD]: [
        { label: 'Nama Prospek', key: 'name', type: 'TEXT', isRequired: true },
        { label: 'Minat Produk', key: 'interest', type: 'SELECT', isRequired: true },
        { label: 'Regional', key: 'regionId', type: 'SELECT', isRequired: true },
        { label: 'Sumber Data', key: 'source', type: 'SELECT', isRequired: true }
    ],
    [FormType.CUSTOMER]: [
        { label: 'Kode Pelanggan', key: 'code', type: 'TEXT', isRequired: true },
        { label: 'NIK (KTP)', key: 'nik', type: 'NUMBER', isRequired: true },
        { label: 'NPWP', key: 'npwp', type: 'TEXT', isRequired: false },
        { label: 'Data Alamat BPS', key: 'bps_data', type: 'LOCATION', isRequired: true, source: 'API-EMS' },
        { label: 'Koordinat GPS', key: 'coordinates', type: 'MAP_POINT', isRequired: false }
    ],
    [FormType.TICKET]: [
        { label: 'Nomor Tiket', key: 'ticketNumber', type: 'TEXT', isRequired: true },
        { label: 'Nomor Rangka/Mesin', key: 'chassis_engine', type: 'TEXT', isRequired: true },
        { label: 'Hour Meter (HM)', key: 'hmReading', type: 'NUMBER', isRequired: true },
        { label: 'Foto Bukti Keluhan', key: 'evidence', type: 'FILE', isRequired: true }
    ],
    [FormType.SHOWROOM]: [
        { label: 'Nama Outlet', key: 'name', type: 'TEXT', isRequired: true },
        { label: 'Regional & Sub-Reg', key: 'regional_hierarchy', type: 'SELECT', isRequired: true },
        { label: 'Titik Lokasi Peta', key: 'lat_lng', type: 'MAP_POINT', isRequired: true },
        { label: 'Jam Operasional', key: 'hours', type: 'ARRAY', isRequired: true }
    ],
    [FormType.SERVICE_STATION]: [
        { label: 'Kapasitas Workshop', key: 'capacity', type: 'NUMBER', isRequired: true },
        { label: 'Daftar Mekanik', key: 'mechanics', type: 'RELATION', isRequired: true }
    ],
    // Removed duplicate [FormType.SERVICE_STATION] property which caused an object literal error on line 44
    [FormType.USER]: [
        { label: 'Role / Jabatan', key: 'role', type: 'SELECT', isRequired: true },
        { label: 'Regional Penugasan', key: 'regionId', type: 'SELECT', isRequired: true },
        { label: 'Target Omset', key: 'annualTarget', type: 'CURRENCY', isRequired: false },
        { label: 'Hak Akses Modul', key: 'permissions', type: 'ARRAY', isRequired: true }
    ]
};

const SystemConfig: React.FC<SystemConfigProps> = ({ activeTab, dashboardWidgets, onUpdateDashboardConfigs }) => {
    // Forms State
    const [activeFormType, setActiveFormType] = useState<FormType>(FormType.LEAD);
    const [fields, setFields] = useState<FormFieldConfig[]>(MOCK_FORM_CONFIG);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newField, setNewField] = useState<Partial<FormFieldConfig>>({
        label: '',
        key: '',
        type: FieldType.TEXT,
        required: false,
        isActive: true,
        options: []
    });
    const [optionsString, setOptionsString] = useState('');

    // Local Global Target State
    const [globalTarget, setGlobalTarget] = useState(60000000000);

    // Regional State
    const [regions, setRegions] = useState<RegionalZone[]>(REGIONAL_ZONES);
    const [viewingRegionId, setViewingRegionId] = useState<string | null>(null);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState<RegionalZone | null>(null);
    const [regionForm, setRegionForm] = useState<RegionalZone>({ id: '', name: '', province: '', provinceIds: [] });
    
    // Sub-Regional Modal State
    const [isSubRegionModalOpen, setIsSubRegionModalOpen] = useState(false);
    const [editingSubRegion, setEditingSubRegion] = useState<SubRegional | null>(null);
    const [subRegionForm, setSubRegionForm] = useState<SubRegional>({ id: '', name: '', cities: [] });
    const [availableCities, setAvailableCities] = useState<any[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    
    // UI Helpers
    const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
    const [provinceSearch, setProvinceSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof RegionalZone; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'asc' });

    useEffect(() => {
        if (viewingRegionId) {
            const region = regions.find(r => r.id === viewingRegionId);
            if (region?.provinceIds?.length) {
                fetchAllCitiesForRegion(region.provinceIds);
            }
        }
    }, [viewingRegionId, regions]);

    const fetchAllCitiesForRegion = async (provinceIds: string[]) => {
        setLoadingCities(true);
        try {
            const promises = provinceIds.map(id => 
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json`).then(r => r.json())
            );
            const results = await Promise.all(promises);
            const flattened = results.flat();
            setAvailableCities(flattened);
        } catch (e) {
            console.error("Failed to fetch cities", e);
        } finally {
            setLoadingCities(false);
        }
    };

    const getFormTypeName = (type: FormType) => {
        switch(type) {
            case FormType.LEAD: return 'Manajemen Leads (Prospek)';
            case FormType.CUSTOMER: return 'Master Pelanggan (CRM)';
            case FormType.TICKET: return 'Tiket Servis (After-Sales)';
            case FormType.SHOWROOM: return 'Outlet & Showroom';
            case FormType.SERVICE_STATION: return 'Bengkel / Service Station';
            case FormType.USER: return 'Personel & Akun User';
            default: return type;
        }
    };

    const getFieldTypeIcon = (type: string | FieldType) => {
        switch (type) {
            case FieldType.TEXT: return <AlignLeft size={14} />;
            case FieldType.NUMBER: return <Hash size={14} />;
            case FieldType.DATE: return <Calendar size={14} />;
            case FieldType.SELECT: return <List size={14} />;
            case FieldType.FILE: return <UploadCloud size={14} />;
            case 'MAP_POINT': return <MapPin size={14} />;
            case 'LOCATION': return <MapPinned size={14} />;
            case 'ARRAY': return <List size={14} />;
            case 'RELATION': return <Database size={14} />;
            default: return <AlignLeft size={14} />;
        }
    };

    const getWidgetIcon = (id: string) => {
        switch(id) {
            case 'w-metrics': return <LayoutGrid size={28} />;
            case 'w-revenue-chart': return <Target size={28} />;
            case 'w-yoy-chart': return <BarChart3 size={28} />;
            case 'w-performance-table': return <TableProperties size={28} />;
            case 'w-leaderboard': return <Trophy size={28} />;
            case 'w-contribution-donut': return <Percent size={28} />;
            case 'w-service-monitor': return <Wrench size={28} />;
            default: return <LayoutDashboard size={28} />;
        }
    };

    const getWidgetColor = (id: string) => {
        switch(id) {
            case 'w-metrics': return 'bg-red-50 text-red-600';
            case 'w-revenue-chart': return 'bg-maxxi-primary/10 text-maxxi-primary';
            case 'w-yoy-chart': return 'bg-blue-50 text-blue-600';
            case 'w-performance-table': return 'bg-slate-50 text-slate-600';
            case 'w-leaderboard': return 'bg-amber-50 text-amber-600';
            case 'w-contribution-donut': return 'bg-indigo-50 text-indigo-600';
            case 'w-service-monitor': return 'bg-purple-50 text-purple-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    }

    const handleToggleWidget = (id: string) => {
        const updated = dashboardWidgets.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w);
        onUpdateDashboardConfigs(updated);
    };

    const handleToggleActiveField = (id: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    };

    const handleDeleteField = (id: string) => {
        if (window.confirm('Hapus field ini? Data yang tersimpan mungkin akan hilang dari tampilan.')) {
            setFields(prev => prev.filter(f => f.id !== id));
        }
    };

    const handleSaveField = (e: React.FormEvent) => {
        e.preventDefault();
        const generatedKey = newField.key || newField.label?.toLowerCase().replace(/\s+/g, '_') || `custom_${Date.now()}`;
        const fieldToAdd: FormFieldConfig = {
            id: `fc-${Date.now()}`,
            formType: activeFormType,
            label: newField.label || 'New Field',
            key: generatedKey,
            type: newField.type || FieldType.TEXT,
            required: newField.required || false,
            isActive: true,
            options: newField.type === FieldType.SELECT ? optionsString.split(',').map(s => s.trim()) : undefined
        };
        setFields([...fields, fieldToAdd]);
        setIsAddModalOpen(false);
        setNewField({ label: '', key: '', type: FieldType.TEXT, required: false, isActive: true });
        setOptionsString('');
    };

    const handleEditRegion = (region: RegionalZone) => {
        setEditingRegion(region);
        setRegionForm({ ...region, provinceIds: region.provinceIds || [] });
        setIsRegionModalOpen(true);
    };

    const handleAddRegion = () => {
        const maxId = regions.reduce((max, r) => {
            const num = parseInt(r.id.replace('REG-', ''));
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        const nextId = `REG-${String(maxId + 1).padStart(3, '0')}`;
        setEditingRegion(null);
        setRegionForm({ id: nextId, name: '', province: '', provinceIds: [], subRegions: [] });
        setIsRegionModalOpen(true);
    };

    const handleProvinceToggle = (provinceObj: {id: string, name: string}) => {
        const currentIds = regionForm.provinceIds || [];
        const currentNames = regionForm.province ? regionForm.province.split(',').map(s => s.trim()) : [];
        let newIds, newNames;
        if (currentIds.includes(provinceObj.id)) {
            newIds = currentIds.filter(id => id !== provinceObj.id);
            newNames = currentNames.filter(n => n !== provinceObj.name);
        } else {
            newIds = [...currentIds, provinceObj.id];
            newNames = [...currentNames, provinceObj.name];
        }
        setRegionForm({ ...regionForm, provinceIds: newIds, province: newNames.join(', ') });
    };

    const handleSaveRegion = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRegion) {
            setRegions(prev => prev.map(r => r.id === editingRegion.id ? regionForm : r));
        } else {
            setRegions(prev => [...prev, regionForm]);
        }
        setIsRegionModalOpen(false);
    };

    const handleAddSubRegion = () => {
        setEditingSubRegion(null);
        setSubRegionForm({ id: `sub-${Date.now()}`, name: '', cities: [] });
        setIsSubRegionModalOpen(true);
    };

    const handleEditSubRegion = (sub: SubRegional) => {
        setEditingSubRegion(sub);
        setSubRegionForm(sub);
        setIsSubRegionModalOpen(true);
    };

    const handleToggleCity = (cityName: string) => {
        const currentCities = subRegionForm.cities || [];
        if (currentCities.includes(cityName)) {
            setSubRegionForm({ ...subRegionForm, cities: currentCities.filter(c => c !== cityName) });
        } else {
            setSubRegionForm({ ...subRegionForm, cities: [...currentCities, cityName] });
        }
    };

    const handleSaveSubRegion = (e: React.FormEvent) => {
        e.preventDefault();
        setRegions(prev => prev.map(region => {
            if (region.id === viewingRegionId) {
                const currentSubs = region.subRegions || [];
                let updatedSubs;
                if (editingSubRegion) {
                    updatedSubs = currentSubs.map(s => s.id === editingSubRegion.id ? subRegionForm : s);
                } else {
                    updatedSubs = [...currentSubs, subRegionForm];
                }
                return { ...region, subRegions: updatedSubs };
            }
            return region;
        }));
        setIsSubRegionModalOpen(false);
    };

    const handleDeleteSubRegion = (subId: string) => {
        if (window.confirm('Hapus Sub-Regional ini?')) {
            setRegions(prev => prev.map(region => {
                if (region.id === viewingRegionId) {
                    return { ...region, subRegions: (region.subRegions || []).filter(s => s.id !== subId) };
                }
                return region;
            }));
        }
    };

    const handleSort = (key: keyof RegionalZone) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedRegions = [...regions].sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key: keyof RegionalZone) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-maxxi-primary" /> : <ArrowDown size={14} className="text-maxxi-primary" />;
    };

    const renderRegionalDetailView = () => {
        const region = regions.find(r => r.id === viewingRegionId);
        if (!region) return null;
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setViewingRegionId(null)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all"><X size={24} /></button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{region.name}</h2>
                                <span className="bg-slate-100 px-3 py-1 rounded-full font-mono text-xs font-bold text-slate-500">{region.id}</span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mt-1">Cakupan: {region.province}</p>
                        </div>
                    </div>
                    <button onClick={() => handleEditRegion(region)} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"><Edit size={16} /> Edit Info</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2"><Building2 size={18} className="text-maxxi-primary" /> Hirarki Sub-Regional</h3>
                            <button onClick={handleAddSubRegion} className="flex items-center gap-2 text-maxxi-primary font-black text-xs uppercase tracking-widest hover:underline"><Plus size={16} /> Tambah Sub-Reg</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {region.subRegions?.map(sub => (
                                <div key={sub.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><MapPin size={20}/></div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditSubRegion(sub)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteSubRegion(sub.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-2">{sub.name}</h4>
                                    <div className="flex flex-wrap gap-1.5">{sub.cities.map(city => (<span key={city} className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">{city}</span>))}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={100} /></div>
                             <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-6">Quick Stats</h3>
                             <div className="space-y-6 relative z-10">
                                 <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Sub-Regional</p><p className="text-3xl font-black text-maxxi-primary">{region.subRegions?.length || 0}</p></div>
                                 <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Cakupan Kota/Kab</p><p className="text-3xl font-black">{region.subRegions?.reduce((acc, sub) => acc + sub.cities.length, 0) || 0}</p></div>
                             </div>
                        </div>
                    </div>
                </div>
                {isSubRegionModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><MapPin size={20} className="text-maxxi-primary"/>{editingSubRegion ? 'Edit Sub-Regional' : 'Tambah Sub-Regional'}</h3>
                                <button onClick={() => setIsSubRegionModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveSubRegion} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Sub-Regional</label><input required type="text" placeholder="Contoh: JATIM 1 - Mataraman" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800" value={subRegionForm.name} onChange={e => setSubRegionForm({...subRegionForm, name: e.target.value})} /></div>
                                <div><div className="flex justify-between items-end mb-3 ml-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Cakupan Kota / Kabupaten</label><span className="text-[10px] font-black text-maxxi-primary uppercase">{subRegionForm.cities.length} Terpilih</span></div><div className="relative mb-4"><Search className="absolute left-4 top-3 text-slate-400" size={16} /><input type="text" placeholder="Cari Kota/Kabupaten..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-maxxi-primary outline-none font-medium" value={citySearch} onChange={e => setCitySearch(e.target.value)} /></div>{loadingCities ? (<div className="py-20 text-center flex flex-col items-center gap-3"><Loader2 className="animate-spin text-maxxi-primary" size={32} /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mengambil data BPS...</p></div>) : (<div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-2xl p-4 bg-slate-50/30">{availableCities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).map(city => { const isSelected = subRegionForm.cities.includes(city.name); return (<div key={city.id} onClick={() => handleToggleCity(city.name)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-slate-300'}`}>{isSelected && <Check size={10} className="text-blue-600" strokeWidth={4} />}</div><span className="text-[11px] font-black uppercase truncate tracking-tighter">{city.name}</span></div>) })}</div>)}</div>
                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3"><button type="button" onClick={() => setIsSubRegionModalOpen(false)} className="px-6 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px]">Batal</button><button type="submit" className="bg-maxxi-primary text-white font-black px-10 py-3 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 flex items-center gap-2 uppercase tracking-widest text-[10px] active:scale-95 transition-all"><Save size={16} /> Simpan Sub-Regional</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderRegionalConfig = () => (
        <div className="space-y-6">
            {viewingRegionId ? renderRegionalDetailView() : (
                <><div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200"><div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Map size={20} className="text-maxxi-primary" /> Master Data Regional</h2><p className="text-slate-500 text-sm">Kelola daftar regional dan cakupan provinsi.</p></div><button onClick={handleAddRegion} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"><Plus size={16} /> Tambah Regional</button></div><div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100"><tr><th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}><div className="flex items-center gap-2">ID Regional {getSortIcon('id')}</div></th><th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}><div className="flex items-center gap-2">Nama Regional {getSortIcon('name')}</div></th><th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('province')}><div className="flex items-center gap-2">Cakupan Provinsi {getSortIcon('province')}</div></th><th className="px-6 py-4 text-center">Sub-Reg</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{sortedRegions.map((region) => (<tr key={region.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setViewingRegionId(region.id)}><td className="px-6 py-4 font-mono font-medium text-slate-600">{region.id}</td><td className="px-6 py-4"><div className="font-bold text-slate-800 group-hover:text-maxxi-primary transition-all">{region.name}</div></td><td className="px-6 py-4 text-slate-600 max-w-md truncate">{region.province}</td><td className="px-6 py-4 text-center"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-500">{region.subRegions?.length || 0}</span></td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}><button onClick={() => handleEditRegion(region)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button><button onClick={() => setViewingRegionId(region.id)} className="p-1.5 text-slate-400 hover:text-maxxi-primary rounded transition-colors"><ChevronRight size={20} /></button></div></td></tr>))}</tbody></table></div></>
            )}
        </div>
    );

    const renderFormConfig = () => {
        // Fix: Added missing declarations for coreFields and filteredFields
        const coreFields = SYSTEM_CORE_FIELDS[activeFormType] || [];
        const filteredFields = fields.filter(f => f.formType === activeFormType);

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-fit"><div className="p-5 border-b border-slate-100 bg-slate-50 font-black text-[11px] uppercase tracking-widest text-slate-500 flex items-center gap-2"><Settings size={18} className="text-maxxi-primary" /> Kategori Modul</div><div className="flex flex-col p-2 gap-1">{(Object.values(FormType) as string[]).map(type => (<button key={type} onClick={() => setActiveFormType(type as FormType)} className={`px-4 py-3 text-xs font-black uppercase tracking-tight text-left rounded-xl transition-all ${activeFormType === type ? 'bg-maxxi-primary text-white shadow-lg shadow-red-100' : 'text-slate-500 hover:bg-slate-50'}`}>{getFormTypeName(type as FormType)}</button>))}</div></div>
                    <div className="lg:col-span-3 space-y-6"><div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><div><h2 className="font-black text-slate-800 flex items-center gap-2 text-lg uppercase tracking-tight"><FormInput size={24} className="text-maxxi-primary"/> Konfigurasi Metadata Form</h2><p className="text-slate-500 text-sm font-medium mt-1">Struktur data untuk {getFormTypeName(activeFormType)}.</p></div><button onClick={() => setIsAddModalOpen(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"><Plus size={18} /> Tambah Custom Field</button></div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"><div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><ShieldCheck size={16} className="text-blue-500" /> 1. Field Utama (System Defaults)</h3><span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">READ ONLY</span></div><div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{coreFields.map((cf, idx) => (<div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4"><div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">{getFieldTypeIcon(cf.type)}</div><div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-700 uppercase tracking-tighter truncate">{cf.label}</p><p className="text-[10px] font-mono text-slate-400 mt-0.5">{cf.key}</p><div className="flex items-center gap-2 mt-2"><span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${cf.isRequired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-400'}`}>{cf.isRequired ? 'Mandatory' : 'Optional'}</span>{cf.source && <span className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1"><Database size={8}/> {cf.source}</span>}</div></div><Lock size={12} className="text-slate-300" /></div>))}</div></div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"><div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Plus size={16} className="text-maxxi-primary" /> 2. Field Dinamis (Custom Fields)</h3><span className="text-[9px] font-black text-maxxi-primary bg-red-50 px-2 py-0.5 rounded-full border border-red-100">EDITABLE</span></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><tr><th className="px-6 py-5">Label Tampilan</th><th className="px-6 py-5">Key Database</th><th className="px-6 py-5">Tipe Data</th><th className="px-6 py-4 text-center">Wajib?</th><th className="px-6 py-4 text-center">Aktif?</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-50">{filteredFields.length === 0 ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">Belum ada konfigurasi field tambahan untuk modul ini.</td></tr>) : filteredFields.map(field => (<tr key={field.id} className="hover:bg-slate-50 transition-colors group"><td className="px-6 py-5"><p className="font-black text-slate-800 uppercase tracking-tight">{field.label}</p></td><td className="px-6 py-5 font-mono text-[10px] font-bold text-slate-400">{field.key}</td><td className="px-6 py-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-100 px-2.5 py-1 rounded-lg w-fit border border-slate-200 text-slate-600">{getFieldTypeIcon(field.type)}{field.type}</div></td><td className="px-6 py-4 text-center">{field.required ? (<span className="inline-flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase">Mandatory</span>) : (<span className="text-[9px] font-black text-slate-400 uppercase">Optional</span>)}</td><td className="px-6 py-4 text-center"><button onClick={() => handleToggleActiveField(field.id)} className={`transition-all active:scale-90 ${field.isActive ? 'text-green-600' : 'text-slate-300'}`}>{field.isActive ? <ToggleRight size={32} strokeWidth={1.5} /> : <ToggleLeft size={32} strokeWidth={1.5} />}</button></td><td className="px-6 py-4 text-right"><button onClick={() => handleDeleteField(field.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div></div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDashboardConfig = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><Target size={24} className="text-maxxi-primary" /> Target Revenue Nasional 2025</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Acuan performa KPI yang akan ditampilkan pada dashboard Command Center.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100"><span className="text-slate-400 font-black text-xs uppercase tracking-widest ml-4">IDR</span><input type="number" className="bg-white border-2 border-slate-100 rounded-xl px-4 py-3 font-black text-slate-800 text-2xl w-80 outline-none focus:ring-2 focus:ring-maxxi-primary shadow-inner" value={globalTarget} onChange={e => setGlobalTarget(parseFloat(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardWidgets.map(widget => (
                    <div key={widget.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl shadow-sm ${getWidgetColor(widget.id)}`}>{getWidgetIcon(widget.id)}</div>
                            <button onClick={() => handleToggleWidget(widget.id)} className={`transition-all active:scale-90 ${widget.isVisible ? 'text-maxxi-primary' : 'text-slate-200'}`}>{widget.isVisible ? <ToggleRight size={48} strokeWidth={1} /> : <ToggleLeft size={48} strokeWidth={1} />}</button>
                        </div>
                        <div><h4 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-2">{widget.label}</h4><p className="text-sm text-slate-500 font-medium leading-relaxed">{widget.description}</p></div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between"><span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${widget.isVisible ? 'text-green-600' : 'text-slate-400'}`}>{widget.isVisible ? <><Check size={12} strokeWidth={3}/> Widget Aktif</> : 'Tersembunyi'}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            {activeTab === 'FORMS' && renderFormConfig()}
            {activeTab === 'DASHBOARD' && renderDashboardConfig()}
            {activeTab === 'REGIONAL' && renderRegionalConfig()}
        </div>
    );
};

export default SystemConfig;
