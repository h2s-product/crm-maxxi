
import React, { useState, useMemo, useEffect } from 'react';
import { Target, TrendingUp, Store, MapPin, Building2, Save, ChevronRight, ChevronLeft, ArrowRight, Info, AlertCircle, CheckCircle, BarChart3, PieChart, Coins, LayoutGrid, Scale, Zap, Loader2, Edit3, Sparkles, CalendarDays } from 'lucide-react';
import { REGIONAL_ZONES, MOCK_SHOWROOMS } from '../mockData';
import { RegionalZone, SubRegional, Showroom } from '../types';

const TargetSetting: React.FC = () => {
    // Current System Context
    const CURRENT_YEAR = new Date().getFullYear();
    
    // Selection state for drill-down
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedSubRegionId, setSelectedSubRegionId] = useState<string | null>(null);

    // AI Processing state
    const [isBalancing, setIsBalancing] = useState(false);
    const [isGlobalBalancing, setIsGlobalBalancing] = useState(false);

    // Data states - Initialize with current system performance data
    const [regions, setRegions] = useState<RegionalZone[]>(REGIONAL_ZONES.map(r => {
        // Calculate current achievement from mock showrooms
        const regionShowrooms = MOCK_SHOWROOMS.filter(s => s.marketingRegion?.id === r.id);
        const currentAchieved = regionShowrooms.reduce((acc, s) => acc + (s.achievedRevenue || 0), 0);
        
        return { 
            ...r, 
            annualTarget: r.annualTarget || (r.id === 'REG-001' ? 12000000000 : 8000000000),
            currentYearAchievement: currentAchieved || (r.lastYearRevenue ? r.lastYearRevenue * 0.4 : 2000000000) 
        };
    }));
    
    const [showrooms, setShowrooms] = useState<Showroom[]>(MOCK_SHOWROOMS.map(s => ({ 
        ...s, 
        annualTarget: s.annualTarget || 500000000,
        currentYearAchievement: s.achievedRevenue || (s.lastYearRevenue ? s.lastYearRevenue * 0.3 : 100000000)
    })));

    // National Target State
    const [nationalTarget, setNationalTarget] = useState<number>(0);

    useEffect(() => {
        const total = regions.reduce((acc, r) => acc + (r.annualTarget || 0), 0);
        setNationalTarget(total);
    }, []);

    const activeRegion = regions.find(r => r.id === selectedRegionId);
    const activeSubRegion = activeRegion?.subRegions?.find(s => s.id === selectedSubRegionId);

    const formatRupiah = (num: number = 0) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Calculate distributions sums
    const getSubRegionTargetSum = (region: RegionalZone) => {
        return (region.subRegions || []).reduce((acc, sub) => acc + (sub.annualTarget || 0), 0);
    };

    const getShowroomTargetSum = (subRegionId: string) => {
        return showrooms
            .filter(s => s.subRegionId === subRegionId)
            .reduce((acc, s) => acc + (s.annualTarget || 0), 0);
    };

    // Manual change handler for National Target
    const handleNationalTargetChange = (val: string) => {
        const newTotal = parseFloat(val) || 0;
        setNationalTarget(newTotal);
        distributeProportionally(newTotal);
    };

    const distributeProportionally = (newTotal: number) => {
        const currentTotal = regions.reduce((acc, r) => acc + (r.annualTarget || 0), 0);
        if (currentTotal === 0) return;

        const subRegionMultipliers: Record<string, number> = {};

        const nextRegions = regions.map(r => {
            const regionRatio = (r.annualTarget || 0) / currentTotal;
            const newRegionTarget = Math.round(newTotal * regionRatio);
            
            const currentRegionSum = (r.subRegions || []).reduce((acc, s) => acc + (s.annualTarget || 0), 0);
            
            const nextSubRegions = (r.subRegions || []).map(s => {
                const subRatio = currentRegionSum > 0 ? (s.annualTarget || 0) / currentRegionSum : 1 / (r.subRegions?.length || 1);
                const newSubTarget = Math.round(newRegionTarget * subRatio);
                subRegionMultipliers[s.id] = s.annualTarget ? newSubTarget / s.annualTarget : 1;
                return { ...s, annualTarget: newSubTarget };
            });

            return { ...r, annualTarget: newRegionTarget, subRegions: nextSubRegions };
        });

        setRegions(nextRegions);
        setShowrooms(prev => prev.map(s => {
            if (s.subRegionId && subRegionMultipliers[s.subRegionId]) {
                return { ...s, annualTarget: Math.round((s.annualTarget || 0) * subRegionMultipliers[s.subRegionId]) };
            }
            return s;
        }));
    };

    // --- AI DISTRIBUTION BASED ON CURRENT SYSTEM YEAR DATA ---
    const handleAINationalDistribution = () => {
        if (nationalTarget <= 0) {
            alert("Harap masukkan angka Target Nasional terlebih dahulu.");
            return;
        }

        setIsGlobalBalancing(true);

        // Simulated AI analyzing current year's real-time productivity (Current System Year)
        setTimeout(() => {
            // 1. Calculate Total Performance of Current Year
            const nationalPerformanceTotal = regions.reduce((acc, r) => acc + ((r as any).currentYearAchievement || 0), 0);

            // 2. Distribute to Regions based on Current Year Contribution
            const nextRegions = regions.map(region => {
                const regionPerformanceRatio = nationalPerformanceTotal > 0 
                    ? ((region as any).currentYearAchievement || 0) / nationalPerformanceTotal 
                    : 1 / regions.length;
                
                const newRegionTarget = Math.round(nationalTarget * regionPerformanceRatio);

                // 3. Within Region, distribute to Sub-Regions based on current performance
                // In this mock, we fallback to last year or split evenly for sub-regions if current not available
                const regionPerformanceTotal = (region.subRegions || []).reduce((acc, sub) => acc + (sub.lastYearRevenue || 0), 0);
                
                const updatedSubRegions = (region.subRegions || []).map(sub => {
                    const subRatio = regionPerformanceTotal > 0 
                        ? (sub.lastYearRevenue || 0) / regionPerformanceTotal 
                        : 1 / (region.subRegions?.length || 1);
                    
                    return { ...sub, annualTarget: Math.round(newRegionTarget * subRatio) };
                });

                return { ...region, annualTarget: newRegionTarget, subRegions: updatedSubRegions };
            });

            setRegions(nextRegions);

            // 4. Update all showrooms based on current year productivity
            setShowrooms(prev => prev.map(showroom => {
                if (!showroom.subRegionId) return showroom;

                let parentSubTarget = 0;
                let subPerformanceTotal = 0;

                nextRegions.forEach(r => {
                    const sub = r.subRegions?.find(s => s.id === showroom.subRegionId);
                    if (sub) {
                        parentSubTarget = sub.annualTarget || 0;
                        const siblings = showrooms.filter(sh => sh.subRegionId === showroom.subRegionId);
                        subPerformanceTotal = siblings.reduce((acc, sib) => acc + ((sib as any).currentYearAchievement || 0), 0);
                    }
                });

                const showroomRatio = subPerformanceTotal > 0 
                    ? ((showroom as any).currentYearAchievement || 0) / subPerformanceTotal 
                    : 1;

                return { ...showroom, annualTarget: Math.round(parentSubTarget * showroomRatio) };
            }));

            setIsGlobalBalancing(false);
        }, 1800);
    };

    const handleRegionTargetChange = (regionId: string, val: string) => {
        const num = parseFloat(val) || 0;
        const regionToUpdate = regions.find(r => r.id === regionId);
        if (!regionToUpdate) return;

        const currentRegionSum = (regionToUpdate.subRegions || []).reduce((acc, s) => acc + (s.annualTarget || 0), 0);
        const subRegionMultipliers: Record<string, number> = {};

        const nextRegions = regions.map(r => {
            if (r.id === regionId) {
                const updatedSubRegions = (r.subRegions || []).map(s => {
                    const subRatio = currentRegionSum > 0 ? (s.annualTarget || 0) / currentRegionSum : 1 / (r.subRegions?.length || 1);
                    const newSubTarget = Math.round(num * subRatio);
                    subRegionMultipliers[s.id] = s.annualTarget ? newSubTarget / s.annualTarget : 1;
                    return { ...s, annualTarget: newSubTarget };
                });
                return { ...r, annualTarget: num, subRegions: updatedSubRegions };
            }
            return r;
        });

        setRegions(nextRegions);
        setNationalTarget(nextRegions.reduce((acc, r) => acc + (r.annualTarget || 0), 0));

        setShowrooms(prev => prev.map(s => {
            if (s.subRegionId && subRegionMultipliers[s.subRegionId]) {
                return { ...s, annualTarget: Math.round((s.annualTarget || 0) * subRegionMultipliers[s.subRegionId]) };
            }
            return s;
        }));
    };

    const handleSubRegionTargetChange = (regionId: string, subId: string, val: string) => {
        const num = parseFloat(val) || 0;
        setRegions(prev => prev.map(r => {
            if (r.id === regionId) {
                return {
                    ...r,
                    subRegions: r.subRegions?.map(sub => sub.id === subId ? { ...sub, annualTarget: num } : sub)
                };
            }
            return r;
        }));
    };

    const handleShowroomTargetChange = (showroomId: string, val: string) => {
        const num = parseFloat(val) || 0;
        setShowrooms(prev => prev.map(s => s.id === showroomId ? { ...s, annualTarget: num } : s));
    };

    const handleAIAutoBalance = () => {
        setIsBalancing(true);
        setTimeout(() => {
            if (selectedSubRegionId && activeSubRegion) {
                const relevantShowrooms = showrooms.filter(s => s.subRegionId === selectedSubRegionId);
                if (relevantShowrooms.length === 0) { setIsBalancing(false); return; }
                const parentTarget = activeSubRegion.annualTarget || 0;
                const totalPerformance = relevantShowrooms.reduce((acc, s) => acc + ((s as any).currentYearAchievement || 0), 0);
                
                setShowrooms(prev => prev.map(s => {
                    if (s.subRegionId === selectedSubRegionId) {
                        const ratio = totalPerformance > 0 ? ((s as any).currentYearAchievement || 0) / totalPerformance : 1 / relevantShowrooms.length;
                        return { ...s, annualTarget: Math.round(parentTarget * ratio) };
                    }
                    return s;
                }));
            } 
            else if (selectedRegionId && activeRegion) {
                const relevantSubs = activeRegion.subRegions || [];
                if (relevantSubs.length === 0) { setIsBalancing(false); return; }
                const parentTarget = activeRegion.annualTarget || 0;
                // For sub-regions, we use their aggregated current performance
                const totalPerformance = relevantSubs.reduce((acc, s) => acc + (s.lastYearRevenue || 0), 0);
                
                setRegions(prev => prev.map(r => {
                    if (r.id === selectedRegionId) {
                        return {
                            ...r,
                            subRegions: r.subRegions?.map(sub => {
                                const ratio = totalPerformance > 0 ? (sub.lastYearRevenue || 0) / totalPerformance : 1 / relevantSubs.length;
                                return { ...sub, annualTarget: Math.round(parentTarget * ratio) };
                            })
                        };
                    }
                    return r;
                }));
            }
            setIsBalancing(false);
        }, 1200);
    };

    const renderRegionalList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {regions.map(region => {
                const distributed = getSubRegionTargetSum(region);
                const percent = Math.min(Math.round((distributed / (region.annualTarget || 1)) * 100), 100);
                const isOver = distributed > (region.annualTarget || 0);

                return (
                    <div 
                        key={region.id} 
                        onClick={() => setSelectedRegionId(region.id)}
                        className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-maxxi-primary transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-maxxi-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">Region {region.id}</span>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">{region.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4">{region.province}</p>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 group-hover:border-red-100 transition-colors">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Target Anggaran {CURRENT_YEAR}</p>
                                <p className="text-lg font-black text-slate-800">{formatRupiah(region.annualTarget)}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Terbagi ke Sub-Reg</span>
                                    <span className={`text-[10px] font-black ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatRupiah(distributed)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-700 ${isOver ? 'bg-red-600' : 'bg-maxxi-primary'}`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400 group-hover:text-maxxi-primary transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest">{region.subRegions?.length || 0} Sub-Regional</span>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderSubRegionDetail = () => {
        if (!activeRegion) return null;
        const subRegionTotal = getSubRegionTargetSum(activeRegion);
        const diff = (activeRegion.annualTarget || 0) - subRegionTotal;
        const isExceeded = diff < 0;

        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedRegionId(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><ChevronLeft size={24} /></button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Kuota Regional: {activeRegion.name}</h2>
                        <p className="text-slate-500 text-sm font-medium">Atur proporsi target ke level Sub-Regional.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between lg:col-span-1">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={150} /></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Pagu Regional ({CURRENT_YEAR})</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Total Target {activeRegion.name} (IDR)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 font-black text-2xl text-white outline-none focus:ring-2 focus:ring-maxxi-primary transition-all"
                                            value={activeRegion.annualTarget || ''}
                                            onChange={(e) => handleRegionTargetChange(activeRegion.id, e.target.value)}
                                        />
                                        <Edit3 size={16} className="absolute right-4 top-4 text-white/30" />
                                    </div>
                                </div>
                                <div className="h-px bg-white/10 w-full"></div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                        <span>Status Penyerapan</span>
                                        <span className={isExceeded ? 'text-red-400' : 'text-green-400'}>
                                            {isExceeded ? 'Over Allocated' : diff === 0 ? 'Full' : 'Sisa Kuota'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-3xl font-black tracking-tighter">{formatRupiah(Math.abs(diff))}</h4>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : 'bg-maxxi-primary'}`} 
                                            style={{ width: `${Math.min((subRegionTotal / (activeRegion.annualTarget || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" /> Distribusi Dinamis Sub-Reg
                                </h3>
                                <button 
                                    onClick={handleAIAutoBalance}
                                    disabled={isBalancing}
                                    className="text-[10px] font-black text-maxxi-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isBalancing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="fill-maxxi-primary" />} 
                                    {isBalancing ? 'AI Syncing...' : 'AI Sync: Performa Berjalan'}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {activeRegion.subRegions?.map(sub => {
                                    const showroomTotal = getShowroomTargetSum(sub.id);
                                    return (
                                        <div 
                                            key={sub.id} 
                                            className="group flex flex-col md:flex-row items-center gap-4 p-5 rounded-[1.8rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer relative"
                                            onClick={() => setSelectedSubRegionId(sub.id)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-800 mb-0.5">{sub.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.cities.length} Kota/Kabupaten</p>
                                                <div className="mt-3 flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                                        <Store size={10} /> {MOCK_SHOWROOMS.filter(s => s.subRegionId === sub.id).length} Outlet
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                                                        <CheckCircle size={10} /> Allocated: {formatRupiah(showroomTotal)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64" onClick={e => e.stopPropagation()}>
                                                <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Target Sub-Reg (IDR)</label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-maxxi-primary transition-all font-black text-slate-700 bg-white"
                                                        value={sub.annualTarget || ''}
                                                        onChange={(e) => handleSubRegionTargetChange(activeRegion.id, sub.id, e.target.value)}
                                                    />
                                                    <button onClick={() => setSelectedSubRegionId(sub.id)} className="absolute right-2 top-1.5 p-1 text-slate-200 hover:text-maxxi-primary hover:bg-red-50 rounded-lg transition-all"><ChevronRight size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderShowroomDetail = () => {
        if (!activeRegion || !activeSubRegion) return null;
        const subRegionShowrooms = showrooms.filter(s => s.subRegionId === activeSubRegion.id);
        const showroomTargetTotal = getShowroomTargetSum(activeSubRegion.id);
        const diff = (activeSubRegion.annualTarget || 0) - showroomTargetTotal;
        const isExceeded = diff < 0;

        return (
            <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedSubRegionId(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all"><ChevronLeft size={24} /></button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Detail Outlet: {activeSubRegion.name}</h2>
                        <p className="text-slate-500 text-sm font-medium">Turunkan target hingga ke unit operasional showroom.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><MapPin size={14}/> Info Terkini</h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Jatah Sub-Regional</p>
                                    <p className="text-lg font-black text-slate-800">{formatRupiah(activeSubRegion.annualTarget)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Kuota Showroom</p>
                                    <p className={`text-lg font-black ${isExceeded ? 'text-red-600' : 'text-blue-600'}`}>{formatRupiah(showroomTargetTotal)}</p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${isExceeded ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                    <p className="text-[8px] font-black uppercase mb-1">{isExceeded ? 'Melebihi Kapasitas' : 'Sisa Pagu'}</p>
                                    <p className="text-lg font-black">{formatRupiah(Math.abs(diff))}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="font-black text-[11px] uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Store size={18} className="text-maxxi-secondary" /> Kuota per Showroom ({subRegionShowrooms.length} Lokasi)
                                </div>
                                <button 
                                    onClick={handleAIAutoBalance}
                                    disabled={isBalancing}
                                    className="text-[10px] font-black text-maxxi-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isBalancing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="fill-maxxi-primary" />} 
                                    {isBalancing ? 'AI Balancing...' : 'AI Sync: Kontribusi Sistem'}
                                </button>
                            </div>
                            <div className="flex-1 p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {subRegionShowrooms.map(s => (
                                    <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                                        <div className="md:col-span-5">
                                            <h4 className="font-black text-slate-800 uppercase tracking-tight">{s.name}</h4>
                                            <div className="mt-1 flex items-center gap-3">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><MapPin size={10}/> {s.province}</p>
                                                <div className="h-3 w-px bg-slate-200"></div>
                                                <p className="text-[9px] font-black text-blue-600 uppercase">Real-time Ach: {formatRupiah((s as any).currentYearAchievement)}</p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-7">
                                            <div className="flex flex-col md:flex-row items-center gap-4">
                                                <div className="flex-1 w-full">
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-1">Target Baru (IDR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-[10px] font-black text-slate-300">Rp</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-full border-2 border-white bg-white rounded-xl pl-8 pr-4 py-2 outline-none focus:border-maxxi-primary transition-all font-black text-slate-700 shadow-sm group-hover:border-slate-100"
                                                            value={s.annualTarget || ''}
                                                            onChange={(e) => handleShowroomTargetChange(s.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-24 text-center">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Proporsi</p>
                                                    <p className="text-xs font-black text-slate-800">{Math.round(((s.annualTarget || 0) / (activeSubRegion.annualTarget || 1)) * 100)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                                <button onClick={() => setSelectedSubRegionId(null)} className="bg-maxxi-primary text-white font-black px-8 py-3 rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                    <CheckCircle size={16} /> Finalisasi Kuota Sub-Regional
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Content */}
            {!selectedRegionId && (
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 animate-in fade-in duration-300">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-maxxi-primary/10 rounded-3xl flex items-center justify-center text-maxxi-primary shadow-inner">
                            <Target size={32} strokeWidth={2.5} />
                        </div>
                        <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Budgeting & Target {CURRENT_YEAR}</h1>
                                <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Active System Year</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Sinkronisasi target nasional berdasarkan data performa sistem tahun berjalan secara cerdas.</p>
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-[480px] bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={120} className="text-white" /></div>
                        <div className="relative z-10 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-3 ml-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pagu Nasional (IDR)</label>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-400 uppercase">
                                        <CalendarDays size={12} /> TA {CURRENT_YEAR}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-4 text-maxxi-primary font-black text-xl">Rp</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-white/10 border-2 border-white/10 rounded-[1.5rem] pl-12 pr-4 py-5 font-black text-3xl text-white outline-none focus:ring-2 focus:ring-maxxi-primary transition-all shadow-inner"
                                            placeholder="0"
                                            value={nationalTarget || ''}
                                            onChange={(e) => handleNationalTargetChange(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAINationalDistribution}
                                        disabled={isGlobalBalancing || !nationalTarget}
                                        className={`p-5 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 shadow-lg group ${isGlobalBalancing ? 'bg-indigo-600 animate-pulse' : 'bg-maxxi-primary hover:bg-red-700 shadow-red-900/20 disabled:bg-slate-800 disabled:shadow-none'}`}
                                        title="AI Smart Distribution based on Current System Year Productivity"
                                    >
                                        {isGlobalBalancing ? <Loader2 size={24} className="text-white animate-spin" /> : <Sparkles size={24} className="text-white group-hover:rotate-12 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                            
                            {isGlobalBalancing && (
                                <div className="flex items-center gap-3 bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30 animate-in slide-in-from-top-2">
                                    <Loader2 size={16} className="text-indigo-300 animate-spin" />
                                    <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">AI sedang mensinkronkan target dengan data sistem berjalan...</p>
                                </div>
                            )}

                            {!isGlobalBalancing && (
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest flex items-center gap-2 px-1">
                                    <Info size={12} className="text-maxxi-primary" /> Distribusi otomatis akan mengikuti rasio produktivitas data real-time {CURRENT_YEAR}.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(selectedRegionId || selectedSubRegionId) && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4">
                    <button onClick={() => { setSelectedRegionId(null); setSelectedSubRegionId(null); }} className="text-slate-400 hover:text-maxxi-primary transition-colors">Target Nasional {CURRENT_YEAR}</button>
                    {selectedRegionId && (
                        <>
                            <ChevronRight size={14} className="text-slate-300" />
                            <button onClick={() => setSelectedSubRegionId(null)} className={`transition-colors ${!selectedSubRegionId ? 'text-maxxi-primary' : 'text-slate-400 hover:text-maxxi-primary'}`}>Regional {activeRegion?.name}</button>
                        </>
                    )}
                    {selectedSubRegionId && (
                        <>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-maxxi-primary">Sub-Reg {activeSubRegion?.name}</span>
                        </>
                    )}
                </div>
            )}

            {!selectedRegionId && renderRegionalList()}
            {selectedRegionId && !selectedSubRegionId && renderSubRegionDetail()}
            {selectedSubRegionId && renderShowroomDetail()}
        </div>
    );
};

export default TargetSetting;
