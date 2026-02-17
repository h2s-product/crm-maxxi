
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_DEALS, MOCK_PRODUCTS, MOCK_CUSTOMERS, REGIONAL_ZONES, MOCK_LEADS } from '../mockData';
import { DealStage, ProductCategory, Deal, Product } from '../types';
import { 
  MoreHorizontal, Calendar, ArrowRight, DollarSign, 
  Package, CheckCircle, Clock, Truck, FileText, Filter, Map,
  LayoutGrid, List, Sparkles, X, TrendingUp, AlertCircle, 
  Plus, Save, GripVertical, Search, User, MapPin, Upload, Info, Image, CreditCard, ChevronRight, Activity, Check, Eye, Navigation, MapPinned, Loader2, Users, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const SalesPipeline: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'BOARD' | 'TABLE'>('BOARD');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  
  // Data State
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  
  // Interaction State
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  
  // Transition State
  const [pendingTransition, setPendingTransition] = useState<{ dealId: string; nextStage: DealStage } | null>(null);
  const [transitionFormData, setTransitionFormData] = useState<Record<string, any>>({});

  // BPS Data State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [loadingRegions, setLoadingRegions] = useState<Record<string, boolean>>({});

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerSourceTab, setCustomerSourceTab] = useState<'CUSTOMER' | 'LEAD'>('CUSTOMER');
  const [newDealForm, setNewDealForm] = useState({
      title: '',
      customerName: '',
      productName: '',
      value: 0,
      stage: DealStage.INQUIRY,
      probability: 20
  });

  // AI Forecast State
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<{
      scenarios: { name: string; value: number }[];
      stageBreakdown: { stage: string; count: number; total: number; weighted: number }[];
      insight: string;
  } | null>(null);
  
  // Stages Definition
  const stages = [
    { id: DealStage.INQUIRY, label: 'Permintaan / Leads', color: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-600' },
    { id: DealStage.DEMO_UNIT, label: 'Demo Unit', color: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: DealStage.LEASING_KUR, label: 'Leasing / KUR', color: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-600' },
    { id: DealStage.DOWN_PAYMENT, label: 'Uang Muka (DP)', color: 'border-green-400', bg: 'bg-green-50', text: 'text-green-600' },
    { id: DealStage.DELIVERY, label: 'Pengiriman', color: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-600' },
    { id: DealStage.HANDOVER_TRAINING, label: 'Serah Terima', color: 'border-teal-400', bg: 'bg-teal-50', text: 'text-teal-600' },
  ];

  // Fetch Provinces on Component Mount or when modal opens for DELIVERY
  useEffect(() => {
    if (pendingTransition?.nextStage === DealStage.DELIVERY) {
        fetchProvinces();
    }
  }, [pendingTransition]);

  const fetchProvinces = async () => {
    setLoadingRegions(prev => ({ ...prev, province: true }));
    try {
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const data = await response.json();
        setProvinces(data);
    } catch (error) {
        console.error("Error fetching provinces:", error);
    } finally {
        setLoadingRegions(prev => ({ ...prev, province: false }));
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    setLoadingRegions(prev => ({ ...prev, regency: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const data = await response.json();
        setRegencies(data);
    } catch (error) {
        console.error("Error fetching regencies:", error);
    } finally {
        setLoadingRegions(prev => ({ ...prev, regency: false }));
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    setLoadingRegions(prev => ({ ...prev, district: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        const data = await response.json();
        setDistricts(data);
    } catch (error) {
        console.error("Error fetching districts:", error);
    } finally {
        setLoadingRegions(prev => ({ ...prev, district: false }));
    }
  };

  const fetchVillages = async (districtId: string) => {
    setLoadingRegions(prev => ({ ...prev, village: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
        const data = await response.json();
        setVillages(data);
    } catch (error) {
        console.error("Error fetching villages:", error);
    } finally {
        setLoadingRegions(prev => ({ ...prev, village: false }));
    }
  };

  const handleProvinceChange = (id: string, name: string) => {
      setTransitionFormData({ 
          ...transitionFormData, 
          provinceId: id, 
          province: name, 
          cityId: "", city: "", 
          districtId: "", district: "", 
          villageId: "", village: "" 
      });
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      if (id) fetchRegencies(id);
  };

  const handleRegencyChange = (id: string, name: string) => {
      setTransitionFormData({ 
          ...transitionFormData, 
          cityId: id, 
          city: name, 
          districtId: "", district: "", 
          villageId: "", village: "" 
      });
      setDistricts([]);
      setVillages([]);
      if (id) fetchDistricts(id);
  };

  const handleDistrictChange = (id: string, name: string) => {
      setTransitionFormData({ 
          ...transitionFormData, 
          districtId: id, 
          district: name, 
          villageId: "", village: "" 
      });
      setVillages([]);
      if (id) fetchVillages(id);
  };

  const formatRupiahShort = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    return `Rp ${(value / 1000000).toFixed(0)}jt`;
  };

  const formatRupiahFull = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const getStageIcon = (stage: DealStage) => {
    switch (stage) {
      case DealStage.DEMO_UNIT: return <Calendar size={14} />;
      case DealStage.LEASING_KUR: return <FileText size={14} />;
      case DealStage.DELIVERY: return <Truck size={14} />;
      case DealStage.HANDOVER_TRAINING: return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStageBadgeColor = (stage: DealStage) => {
      switch(stage) {
          case DealStage.INQUIRY: return 'bg-slate-100 text-slate-700';
          case DealStage.DEMO_UNIT: return 'bg-blue-100 text-blue-700';
          case DealStage.LEASING_KUR: return 'bg-purple-100 text-purple-700';
          case DealStage.DOWN_PAYMENT: return 'bg-green-100 text-green-700';
          case DealStage.DELIVERY: return 'bg-orange-100 text-orange-700';
          case DealStage.HANDOVER_TRAINING: return 'bg-teal-100 text-teal-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getDealCategory = (productName: string): ProductCategory | undefined => {
      const product = MOCK_PRODUCTS.find(p => p.name === productName);
      return product?.category;
  };

  const getDealRegion = (customerName: string): string | undefined => {
      const customer = MOCK_CUSTOMERS.find(c => c.name === customerName);
      if (customer) return customer.regionId;
      const lead = MOCK_LEADS.find(l => l.name === customerName);
      return lead?.regionId;
  };

  const filteredDeals = useMemo(() => {
      return deals.filter(d => {
        if (categoryFilter !== 'ALL') {
            const category = getDealCategory(d.productName);
            if (category !== categoryFilter) return false;
        }
        if (regionFilter !== 'ALL') {
            const regionId = getDealRegion(d.customerName);
            if (regionId !== regionFilter) return false;
        }
        return true;
      });
  }, [deals, categoryFilter, regionFilter]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (handleDragOvere: React.DragEvent) => {
    handleDragOvere.preventDefault();
    handleDragOvere.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    const id = draggedDealId;
    if (!id) return;
    
    // Check if transition requires data
    if (newStage === DealStage.INQUIRY) {
        updateDealStage(id, newStage, {});
    } else {
        setPendingTransition({ dealId: id, nextStage: newStage });
        setTransitionFormData({});
    }
    
    setDraggedDealId(null);
  };

  const updateDealStage = (id: string, newStage: DealStage, data: any) => {
    let newProb = 20;
    switch(newStage) {
        case DealStage.DEMO_UNIT: newProb = 40; break;
        case DealStage.LEASING_KUR: newProb = 60; break;
        case DealStage.DOWN_PAYMENT: newProb = 85; break;
        case DealStage.DELIVERY: newProb = 95; break;
        case DealStage.HANDOVER_TRAINING: newProb = 100; break;
    }

    setDeals(prev => prev.map(deal => 
        deal.id === id ? { 
            ...deal, 
            stage: newStage, 
            probability: newProb, 
            lastActivity: `Stage update: ${newStage.replace('_', ' ')}`,
            stageData: { ...(deal.stageData || {}), [newStage]: data }
        } : deal
    ));
    setPendingTransition(null);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
      e.preventDefault();
      const product = MOCK_PRODUCTS.find(p => p.name === newDealForm.productName);
      
      const newDeal: Deal = {
          id: `d-${Date.now()}`,
          title: newDealForm.title,
          customerName: newDealForm.customerName,
          productName: newDealForm.productName,
          value: newDealForm.value,
          stage: newDealForm.stage,
          probability: newDealForm.probability,
          stockStatus: product?.stockStatus === 'READY' ? 'READY' : 'INDENT',
          lastActivity: 'Baru dibuat',
          stageData: {}
      };

      setDeals([newDeal, ...deals]);
      setIsAddModalOpen(false);
      setNewDealForm({
          title: '',
          customerName: '',
          productName: '',
          value: 0,
          stage: DealStage.INQUIRY,
          probability: 20
      });
  };

  const generateAIForecast = () => {
      setIsForecasting(true);
      setForecastResult(null);
      setTimeout(() => {
          const weightedPipeline = filteredDeals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
          const totalPipeline = filteredDeals.reduce((sum, d) => sum + d.value, 0);
          const conservativePipeline = filteredDeals
            .filter(d => d.probability >= 70)
            .reduce((sum, d) => sum + d.value, 0);

          const scenarios = [
              { name: 'Konservatif', value: conservativePipeline },
              { name: 'Realistis (Weighted)', value: weightedPipeline },
              { name: 'Optimis (Total)', value: totalPipeline },
          ];

          const stageBreakdown = stages.map(s => {
              const dealsInStage = filteredDeals.filter(d => d.stage === s.id);
              const total = dealsInStage.reduce((sum, d) => sum + d.value, 0);
              const weighted = dealsInStage.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
              return {
                  stage: s.label,
                  count: dealsInStage.length,
                  total,
                  weighted
              };
          }).filter(s => s.count > 0);

          let insightText = `AI memproyeksikan pendapatan realistis sebesar **${formatRupiahShort(weightedPipeline)}** bulan ini. `;
          setForecastResult({ scenarios, stageBreakdown, insight: insightText });
          setIsForecasting(false);
      }, 1200);
  };

  const renderPipelineSummary = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 animate-in fade-in duration-500">
            {stages.map(s => {
                const stageDeals = filteredDeals.filter(d => d.stage === s.id);
                const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                
                return (
                    <div key={s.id} className={`bg-white p-3 rounded-xl border-l-4 ${s.color} shadow-sm border border-slate-200 hover:shadow-md transition-all group`}>
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{s.label}</p>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${s.bg} ${s.text} shadow-inner`}>
                                {stageDeals.length}
                            </span>
                        </div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-maxxi-primary transition-colors">
                            {formatRupiahShort(totalValue)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
  };

  // --- TRANSITION MODAL RENDERING ---
  const renderTransitionModal = () => {
    if (!pendingTransition) return null;
    const { dealId, nextStage } = pendingTransition;
    const deal = deals.find(d => d.id === dealId);
    
    const stageInfo = stages.find(s => s.id === nextStage);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <TrendingUp size={20} className="text-maxxi-primary"/> Tahap: {stageInfo?.label}
                    </h3>
                    <button onClick={() => setPendingTransition(null)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); updateDealStage(dealId, nextStage, transitionFormData); }} className="p-6 space-y-5">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                        <p className="text-xs font-bold text-blue-800 flex items-center gap-2"><Info size={14}/> Masukkan data wajib untuk pindah ke tahap ini:</p>
                    </div>

                    {nextStage === DealStage.DEMO_UNIT && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Tanggal Demo Lapangan</label>
                                <input required type="date" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, demoDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Lokasi Lahan</label>
                                <input required type="text" placeholder="Kabupaten / Kecamatan / Link Maps" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, location: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">PIC Demo (Petugas)</label>
                                <input required type="text" placeholder="Nama Teknisi/Sales PIC" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, pic: e.target.value})} />
                            </div>
                        </>
                    )}

                    {nextStage === DealStage.LEASING_KUR && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Bank Penyelenggara KUR</label>
                                <select required className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-white outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, bank: e.target.value})}>
                                    <option value="">-- Pilih Bank --</option>
                                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                                    <option value="Bank Mandiri">Bank Mandiri</option>
                                    <option value="BNI">BNI</option>
                                    <option value="Bank Jatim">Bank Jatim</option>
                                    <option value="Lainnya">Lainnya (Leasing Swasta)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Estimasi Tenor (Bulan)</label>
                                <input required type="number" placeholder="12, 24, 36..." className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, tenor: e.target.value})} />
                            </div>
                        </>
                    )}

                    {nextStage === DealStage.DOWN_PAYMENT && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Jumlah DP Diterima (IDR)</label>
                                <input required type="number" placeholder="Nominal Rupiah" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800" onChange={e => setTransitionFormData({...transitionFormData, dpAmount: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Unggah Bukti Transfer / Kwitansi</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <input type="file" className="hidden" id="dp-proof" onChange={e => setTransitionFormData({...transitionFormData, proofFile: e.target.files?.[0]?.name || 'bukti_transfer.jpg'})} />
                                    <label htmlFor="dp-proof" className="cursor-pointer">
                                        <Image size={32} className="mx-auto text-slate-300 group-hover:text-maxxi-primary mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{transitionFormData.proofFile || 'Klik untuk pilih foto'}</p>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {nextStage === DealStage.DELIVERY && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Nomor Surat Jalan (ERP)</label>
                                    <input required type="text" placeholder="SJ/MX/..." className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all font-mono text-sm" onChange={e => setTransitionFormData({...transitionFormData, sjNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Estimasi Tiba</label>
                                    <input required type="date" className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm" onChange={e => setTransitionFormData({...transitionFormData, estimatedArrival: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPinned size={14}/> Alamat Pengiriman (Data BPS)</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Provinsi</label>
                                        <select 
                                            required 
                                            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white" 
                                            value={transitionFormData.provinceId || ""}
                                            onChange={e => {
                                                const selected = provinces.find(p => p.id === e.target.value);
                                                handleProvinceChange(e.target.value, selected?.name || "");
                                            }}
                                        >
                                            <option value="">-- Pilih Provinsi --</option>
                                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        {loadingRegions.province && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Kota / Kabupaten</label>
                                        <select 
                                            required 
                                            disabled={!transitionFormData.provinceId}
                                            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            value={transitionFormData.cityId || ""}
                                            onChange={e => {
                                                const selected = regencies.find(r => r.id === e.target.value);
                                                handleRegencyChange(e.target.value, selected?.name || "");
                                            }}
                                        >
                                            <option value="">-- Pilih Kota/Kab --</option>
                                            {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                        {loadingRegions.regency && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Kecamatan</label>
                                        <select 
                                            required 
                                            disabled={!transitionFormData.cityId}
                                            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            value={transitionFormData.districtId || ""}
                                            onChange={e => {
                                                const selected = districts.find(d => d.id === e.target.value);
                                                handleDistrictChange(e.target.value, selected?.name || "");
                                            }}
                                        >
                                            <option value="">-- Pilih Kecamatan --</option>
                                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                        {loadingRegions.district && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Desa / Kelurahan</label>
                                        <select 
                                            required 
                                            disabled={!transitionFormData.districtId}
                                            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            value={transitionFormData.villageId || ""}
                                            onChange={e => {
                                                const selected = villages.find(v => v.id === e.target.value);
                                                setTransitionFormData({...transitionFormData, villageId: e.target.value, village: selected?.name || ""});
                                            }}
                                        >
                                            <option value="">-- Pilih Desa/Kel --</option>
                                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                        {loadingRegions.village && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Alamat Lengkap & Detail Jalan</label>
                                    <textarea required rows={2} placeholder="Sebutkan patokan atau detail alamat" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm resize-none" onChange={e => setTransitionFormData({...transitionFormData, fullAddress: e.target.value})} />
                                </div>
                            </div>
                        </>
                    )}

                    {nextStage === DealStage.HANDOVER_TRAINING && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Nama Operator yang Dilatih</label>
                                <input required type="text" placeholder="Minimal 1 operator" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all" onChange={e => setTransitionFormData({...transitionFormData, trainee: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Status Checklist Training</label>
                                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                                    <input required type="checkbox" className="w-5 h-5 text-maxxi-primary rounded focus:ring-maxxi-primary" />
                                    <span className="text-xs font-bold text-slate-600 uppercase">Operator Mengerti Cara Operasi & Perawatan Harian</span>
                                </label>
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setPendingTransition(null)} className="px-6 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px]">Batal</button>
                        <button type="submit" className="bg-maxxi-primary text-white font-black px-8 py-3 rounded-xl shadow-lg hover:bg-red-700 flex items-center gap-2 uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                            Simpan & Pindahkan Stage <ChevronRight size={14} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderDealDetail = () => {
    if (!selectedDealId) return null;
    const deal = deals.find(d => d.id === selectedDealId);
    if (!deal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
                {/* Left Side: Summary Card - Changed from Black to Grayscale */}
                <div className="w-full lg:w-80 bg-slate-50 p-8 text-slate-800 flex flex-col justify-between shrink-0 border-r border-slate-200">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm ${getStageBadgeColor(deal.stage)}`}>
                                {deal.stage.replace('_', ' ')}
                            </span>
                            <button onClick={() => setSelectedDealId(null)} className="text-slate-400 hover:text-slate-900 transition-colors lg:hidden"><X size={24}/></button>
                        </div>
                        <h2 className="text-2xl font-black mb-2 leading-tight text-slate-900">{deal.title}</h2>
                        <p className="text-slate-500 text-sm mb-8 flex items-center gap-2 font-medium"><User size={14} className="text-slate-400"/> {deal.customerName}</p>
                        
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nilai Penawaran</p>
                                <p className="text-2xl font-black text-maxxi-primary">{formatRupiahFull(deal.value)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Probabilitas Close</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                                        <div className="bg-green-500 h-full" style={{width: `${deal.probability}%`}}></div>
                                    </div>
                                    <span className="font-black text-lg text-slate-700">{deal.probability}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <button className="w-full py-4 bg-maxxi-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                            <FileText size={16} /> Buat Invoice
                        </button>
                    </div>
                </div>

                {/* Right Side: Activity & Stage Data */}
                <div className="flex-1 overflow-y-auto p-8 bg-white relative">
                    <button onClick={() => setSelectedDealId(null)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors hidden lg:block"><X size={24}/></button>
                    
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-8">
                        <Activity size={20} className="text-maxxi-primary"/> Progress Deal & Dokumentasi
                    </h3>

                    <div className="space-y-8">
                        {stages.map((s, idx) => {
                            const isCompleted = stages.indexOf(stages.find(st => st.id === deal.stage)!) >= idx;
                            const hasData = deal.stageData && deal.stageData[s.id];

                            return (
                                <div key={s.id} className={`relative pl-8 pb-4 border-l-2 last:border-l-0 ${isCompleted ? 'border-maxxi-primary' : 'border-slate-100'}`}>
                                    <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${isCompleted ? 'bg-maxxi-primary' : 'bg-slate-200'}`}>
                                        {isCompleted && <Check size={10} className="text-white" />}
                                    </div>
                                    
                                    <div className="mb-2">
                                        <h4 className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>{s.label}</h4>
                                    </div>

                                    {hasData && (
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 grid grid-cols-2 gap-4 animate-in slide-in-from-left-2">
                                            {Object.entries(deal.stageData![s.id]).map(([key, value]: [string, any]) => (
                                                <div key={key} className={(key === 'proofFile' || key === 'fullAddress') ? 'col-span-2' : ''}>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    {key === 'proofFile' ? (
                                                        <div className="mt-2 group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-2 hover:border-maxxi-primary transition-all">
                                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                                                                <img 
                                                                    src="https://images.unsplash.com/photo-1554224155-169641357599?q=80&w=600&auto=format&fit=crop" 
                                                                    alt="Bukti Transfer DP" 
                                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-[10px] font-black uppercase tracking-widest">
                                                                        <Eye size={14} /> Lihat Bukti
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between px-1">
                                                                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">{value}</span>
                                                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">VERIFIED</span>
                                                            </div>
                                                        </div>
                                                    ) : key === 'fullAddress' ? (
                                                        <div className="bg-white p-3 rounded-xl border border-slate-200 mt-1 flex gap-3 items-start">
                                                            <MapPin size={16} className="text-maxxi-primary shrink-0 mt-1" />
                                                            <div className="text-xs font-bold text-slate-700 leading-relaxed uppercase">
                                                                {value}, 
                                                                {deal.stageData![s.id].village && ` DS. ${deal.stageData![s.id].village},`}
                                                                {deal.stageData![s.id].district && ` KEC. ${deal.stageData![s.id].district},`}
                                                                {deal.stageData![s.id].city && ` ${deal.stageData![s.id].city},`}
                                                                {deal.stageData![s.id].province && ` ${deal.stageData![s.id].province}`}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs font-bold text-slate-700">
                                                            {key === 'dpAmount' ? formatRupiahFull(parseFloat(value)) : (key.includes('Id') ? null : value)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!hasData && isCompleted && idx > 0 && (
                                        <div className="bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200">
                                            <p className="text-[10px] text-slate-400 italic">Data tidak terekam pada transisi manual lama.</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
  }

  const renderAddDealModal = () => {
    if (!isAddModalOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <Plus size={20} className="text-maxxi-primary"/> Tambah Deal Penjualan Baru
                    </h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
                </div>
                <form onSubmit={handleCreateDeal} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Judul Penawaran / Proyek</label>
                        <input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800 shadow-sm" placeholder="Contoh: Pengadaan 5 Unit Drone P60" value={newDealForm.title} onChange={e => setNewDealForm({...newDealForm, title: e.target.value})} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-1 ml-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Pilih Entitas (Tujuan Penawaran)</label>
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                            <button 
                                type="button"
                                onClick={() => setCustomerSourceTab('CUSTOMER')}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${customerSourceTab === 'CUSTOMER' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users size={14} /> Pelanggan Terdaftar
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCustomerSourceTab('LEAD')}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${customerSourceTab === 'LEAD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <MessageSquare size={14} /> Leads / Prospek
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <select required className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 bg-white outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newDealForm.customerName} onChange={e => setNewDealForm({...newDealForm, customerName: e.target.value})}>
                                    <option value="">-- Pilih {customerSourceTab === 'CUSTOMER' ? 'Pelanggan' : 'Lead'} --</option>
                                    {customerSourceTab === 'CUSTOMER' 
                                        ? MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name}>{c.name} ({c.type})</option>)
                                        : MOCK_LEADS.map(l => <option key={l.id} value={l.name}>{l.name} - {l.interest}</option>)
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Produk Alsintan</label>
                                <select required className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 bg-white outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newDealForm.productName} onChange={e => setNewDealForm({...newDealForm, productName: e.target.value})}>
                                    <option value="">-- Pilih Model Produk --</option>
                                    {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nilai Penawaran Realistis (IDR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-black text-sm">IDR</span>
                            <input required type="number" className="w-full border-2 border-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-maxxi-primary transition-all font-black text-slate-800 text-xl shadow-inner bg-white" placeholder="0" value={newDealForm.value || ''} onChange={e => setNewDealForm({...newDealForm, value: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tahap Awal</label>
                            <select className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 bg-white outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newDealForm.stage} onChange={e => setNewDealForm({...newDealForm, stage: e.target.value as DealStage})}>
                                {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Probabilitas Close (%)</label>
                            <input type="number" min="0" max="100" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newDealForm.probability} onChange={e => setNewDealForm({...newDealForm, probability: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-slate-800">Batal</button>
                        <button type="submit" className="bg-maxxi-primary text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 flex items-center gap-2 uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                            <Save size={20} /> Simpan Deal Baru
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderForecastPanel = () => {
      if (!isForecasting && !forecastResult) return null;
      return (
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 mb-6 animate-in slide-in-from-top-2 duration-300 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
                          <Sparkles size={20} className={isForecasting ? "animate-spin" : ""} />
                      </div>
                      <div>
                          <h3 className="text-indigo-900 font-bold text-lg">AI Sales Forecast & Analysis</h3>
                          <p className="text-indigo-600 text-xs">Prediksi berdasarkan probabilitas realtime</p>
                      </div>
                  </div>
                  {!isForecasting && <button onClick={() => setForecastResult(null)} className="text-indigo-400 hover:text-indigo-700"><X size={20} /></button>}
              </div>
              {isForecasting ? (
                  <div className="h-40 flex items-center justify-center text-indigo-700 gap-2"><span>Menganalisis pipeline...</span><span className="flex gap-1"><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span></span></div>
              ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> Skenario Pendapatan</h4>
                          <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={forecastResult?.scenarios} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                      <XAxis type="number" hide />
                                      <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fontWeight: 'bold'}} />
                                      <Tooltip formatter={(value: number) => formatRupiahFull(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                          {forecastResult?.scenarios.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 1 ? '#4f46e5' : index === 0 ? '#22c55e' : '#cbd5e1'} />)}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                      <div className="flex flex-col h-full">
                          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden flex-1 mb-3">
                              <table className="w-full text-xs text-left">
                                  <thead className="bg-indigo-50 text-indigo-800 font-bold border-b border-indigo-100">
                                      <tr><th className="px-4 py-3">Stage</th><th className="px-4 py-3 text-center">Deal</th><th className="px-4 py-3 text-right">Weighted (Est)</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-indigo-50">
                                      {forecastResult?.stageBreakdown.map((row, idx) => (
                                          <tr key={idx} className="hover:bg-indigo-50/30">
                                              <td className="px-4 py-2 font-medium text-slate-700">{row.stage}</td>
                                              <td className="px-4 py-2 text-center text-slate-600">{row.count}</td>
                                              <td className="px-4 py-2 text-right font-bold text-indigo-700">{formatRupiahShort(row.weighted)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                          <div className="bg-indigo-100/50 p-3 rounded-lg border border-indigo-200 text-indigo-900 text-sm flex items-start gap-2">
                              <Sparkles size={16} className="mt-0.5 text-indigo-600 flex-shrink-0" />
                              <p>{forecastResult?.insight.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderBoardView = () => (
    <div className="flex gap-4 h-full min-w-[1200px] pb-4">
        {stages.map((stage) => {
        const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

        return (
            <div 
                key={stage.id} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex-1 min-w-[280px] bg-slate-50 rounded-xl flex flex-col border transition-all ${
                    draggedDealId ? 'border-dashed border-indigo-300 ring-2 ring-indigo-50 ring-offset-2' : 'border-slate-200 shadow-sm'
                }`}
            >
            {/* Column Header */}
            <div className={`p-4 border-t-4 ${stage.color} bg-white rounded-t-xl shadow-sm`}>
                <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{stage.label}</h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    Total: {formatRupiahShort(totalValue)}
                </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stageDeals.length === 0 && !draggedDealId && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center px-4">
                        Tarik deal ke sini untuk pindah ke {stage.label}
                    </div>
                )}
                {stageDeals.map((deal) => (
                <div 
                    key={deal.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onClick={() => setSelectedDealId(deal.id)}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden ${
                        draggedDealId === deal.id ? 'opacity-30 scale-95 border-indigo-400 border-2' : ''
                    }`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${
                            deal.stockStatus === 'READY' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            <Package size={10} /> {deal.stockStatus}
                        </span>
                        <GripVertical size={14} className="text-slate-200 group-hover:text-slate-400" />
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mb-1">{deal.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><User size={10}/> {deal.customerName}</p>

                    <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-3 group-hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-1 text-xs text-slate-700 font-medium mb-1 truncate">
                            <Package size={12} className="text-maxxi-primary flex-shrink-0" />
                            <span className="truncate">{deal.productName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                            <DollarSign size={12} className="text-green-600" />
                            {formatRupiahShort(deal.value)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-1">
                            {getStageIcon(stage.id as DealStage)}
                            <span>{deal.probability}% Prob.</span>
                        </div>
                        {deal.stageData && deal.stageData[deal.stage] && (
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1">
                                <Check size={10}/> DATA OK
                            </span>
                        )}
                    </div>
                </div>
                ))}
            </div>
            </div>
        );
        })}
    </div>
  );

  const renderTableView = () => {
      const totalPipelineValue = filteredDeals.reduce((acc, curr) => acc + curr.value, 0);
      const totalWeightedValue = filteredDeals.reduce((acc, curr) => acc + (curr.value * (curr.probability / 100)), 0);
      return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-xs uppercase tracking-wide sticky top-0 z-10">
                          <tr><th className="px-6 py-4">Deal Info</th><th className="px-6 py-4">Produk</th><th className="px-6 py-4">Stage</th><th className="px-6 py-4 text-center">Prob.</th><th className="px-6 py-4 text-right">Nilai Deal</th><th className="px-6 py-4 text-right">Weighted</th><th className="px-6 py-4">Dokumen</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredDeals.map(deal => (
                              <tr key={deal.id} onClick={() => setSelectedDealId(deal.id)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                  <td className="px-6 py-4"><div className="font-bold text-slate-800 group-hover:text-maxxi-primary transition-colors">{deal.title}</div><div className="text-xs text-slate-500">{deal.customerName}</div></td>
                                  <td className="px-6 py-4"><div className="text-slate-700 flex items-center gap-2 truncate max-w-[150px]"><Package size={14} className="text-maxxi-primary" />{deal.productName}</div></td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${getStageBadgeColor(deal.stage)}`}>{deal.stage.replace('_', ' ')}</span></td>
                                  <td className="px-6 py-4 text-center"><span className="text-xs font-bold text-slate-600">{deal.probability}%</span></td>
                                  <td className="px-6 py-4 text-right font-medium text-slate-700">{formatRupiahFull(deal.value)}</td>
                                  <td className="px-6 py-4 text-right font-bold text-slate-800">{formatRupiahFull(deal.value * (deal.probability / 100))}</td>
                                  <td className="px-6 py-4">
                                      {deal.stageData && deal.stageData[deal.stage] ? (
                                          <div className="flex gap-1">
                                              <span className="p-1.5 bg-green-50 text-green-600 rounded-lg" title="Data Tahap Lengkap"><CheckCircle size={14}/></span>
                                          </div>
                                      ) : <span className="text-slate-300 italic text-xs">Kosong</span>}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                          <tr><td colSpan={4} className="px-6 py-4 text-right text-slate-600 uppercase text-xs">Total Pipeline ({filteredDeals.length} Deals)</td><td className="px-6 py-4 text-right text-slate-800">{formatRupiahFull(totalPipelineValue)}</td><td className="px-6 py-4 text-right text-green-700">{formatRupiahFull(totalWeightedValue)}</td><td></td></tr>
                      </tfoot>
                  </table>
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center px-1 gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800">Pipeline Penjualan</h2>
            <p className="text-slate-500 text-sm">Monitor progres kesepakatan dan dokumentasi tiap tahap.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button onClick={() => setViewMode('BOARD')} className={`p-1.5 rounded transition-all ${viewMode === 'BOARD' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('TABLE')} className={`p-1.5 rounded transition-all ${viewMode === 'TABLE' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}><List size={18} /></button>
            </div>

            <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2"><Plus size={16} /> Tambah Deal</button>

            <button onClick={generateAIForecast} disabled={isForecasting} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-70">
                <Sparkles size={16} className={isForecasting ? "animate-pulse" : ""} /> {isForecasting ? 'Analisis...' : 'AI Forecast'}
            </button>

            <div className="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <Map size={16} className="text-slate-400" />
                <select className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer max-w-[150px]" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                    <option value="ALL">Semua Regional</option>
                    {REGIONAL_ZONES.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                    <option value="ALL">Semua Kategori</option>
                    {/* Cast Object.values to string array to fix TypeScript type inference error */}
                    {(Object.values(ProductCategory) as string[]).map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                </select>
            </div>
        </div>
      </div>

      {renderPipelineSummary()}
      {renderForecastPanel()}

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          {viewMode === 'BOARD' ? renderBoardView() : renderTableView()}
      </div>

      {renderAddDealModal()}
      {renderTransitionModal()}
      {renderDealDetail()}
    </div>
  );
};

export default SalesPipeline;
