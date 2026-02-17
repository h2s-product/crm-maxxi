
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_UNITS, MOCK_PRODUCTS, REGIONAL_ZONES, MOCK_SHOWROOMS, MOCK_FORM_CONFIG } from '../mockData';
import { CustomerType, LeadSource, LeadStatus, Customer, MachineUnit, ProductCategory, Lead, FormType, FieldType } from '../types';
import { 
  Users, Sprout, MapPin, Phone, MessageCircle, 
  Smartphone, Facebook, Globe, CheckCircle, 
  Search, Filter, Mail, ArrowLeft,
  Tractor, Calendar, Map as MapIcon, Signal, Battery,
  Plus, Edit, Trash2, X, Save, Package, Layers, Target, Plane,
  Bot, Wheat, Info, ChevronDown, Building2, Store, CheckSquare, Wrench, UserPlus, MessageSquare, TrendingUp, MapPinned, CreditCard, Fingerprint, Hash, Loader2,
  ChevronRight, Contact, Landmark, FileText, BadgeInfo, Map as MapIcon2, Navigation, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Download, SlidersHorizontal, User, Check
} from 'lucide-react';
// Import Leaflet dependencies
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createCustomIcon = (type: 'UNIT' | 'SHOWROOM' | 'SERVICE' | 'LEAD' | 'CUSTOMER', category?: ProductCategory, isSelected?: boolean) => {
    let bgColor = 'bg-blue-600';
    let iconHtml = '';

    if (type === 'SHOWROOM') {
        bgColor = isSelected ? 'bg-red-700 ring-4 ring-red-200 scale-110' : 'bg-red-600 shadow-md';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-5"/><path d="M9 22v-5"/><path d="M2 7h20"/><path d="M12 7v5"/></svg>`;
    } else if (type === 'SERVICE') {
        bgColor = isSelected ? 'bg-purple-800 ring-4 ring-purple-200 scale-110' : 'bg-purple-600 shadow-md';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    } else if (type === 'CUSTOMER') {
        bgColor = isSelected ? 'bg-blue-800 ring-4 ring-blue-200 scale-110' : 'bg-blue-600 shadow-md';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    } else if (type === 'LEAD') {
        bgColor = isSelected ? 'bg-indigo-700 ring-4 ring-indigo-200 scale-110' : 'bg-indigo-600 shadow-lg';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>`;
    } else {
        const colorMap: Record<string, string> = {
            [ProductCategory.DRONE]: 'bg-sky-500',
            [ProductCategory.HARVESTER]: 'bg-amber-500',
            [ProductCategory.ROBOTICS]: 'bg-indigo-500',
            [ProductCategory.LAND_PREP]: 'bg-red-600',
            [ProductCategory.PLANTING]: 'bg-green-600'
        };
        bgColor = colorMap[category || ''] || 'bg-slate-500';
        if (isSelected) bgColor += ' ring-4 ring-yellow-300 scale-110';
        iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h9l1 7"/><path d="M4 11V4"/><path d="M8 10V4"/></svg>`;
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="${bgColor} w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 hover:scale-125">
                ${iconHtml}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const LeadManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'CUSTOMERS' | 'MAP'>('LEADS');
  const [customerFilter, setCustomerFilter] = useState<CustomerType | 'ALL'>('ALL');
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isExporting, setIsExporting] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [units, setUnits] = useState<MachineUnit[]>(MOCK_UNITS); 
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Map Visibility State
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['SHOWROOM', 'SERVICE', 'CUSTOMER', 'LEAD', 'FARM']));

  // Region Fetch States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [loadingRegions, setLoadingRegions] = useState<Record<string, boolean>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Customer> & { provinceId?: string; cityId?: string; districtId?: string; }>({});
  const [leadFormData, setLeadFormData] = useState<Partial<Lead>>({
      name: '',
      phone: '',
      interest: '',
      source: LeadSource.DIRECT,
      regionId: '',
      location: ''
  });
  
  const [customerCustomFields, setCustomerCustomFields] = useState<Record<string, any>>({});

  // BPS Data Fetchers
  const fetchProvinces = async () => {
    setLoadingRegions(p => ({ ...p, province: true }));
    try {
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        setProvinces(await response.json());
    } catch (e) { console.error(e); }
    finally { setLoadingRegions(p => ({ ...p, province: false })); }
  };

  const fetchRegencies = async (provinceId: string) => {
    setLoadingRegions(p => ({ ...p, regency: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        setRegencies(await response.json());
    } catch (e) { console.error(e); }
    finally { setLoadingRegions(p => ({ ...p, regency: false })); }
  };

  const fetchDistricts = async (regencyId: string) => {
    setLoadingRegions(p => ({ ...p, district: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        setDistricts(await response.json());
    } catch (e) { console.error(e); }
    finally { setLoadingRegions(p => ({ ...p, district: false })); }
  };

  const fetchVillages = async (districtId: string) => {
    setLoadingRegions(p => ({ ...p, village: true }));
    try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
        setVillages(await response.json());
    } catch (e) { console.error(e); }
    finally { setLoadingRegions(p => ({ ...p, village: false })); }
  };

  useEffect(() => {
    if (isFormOpen) fetchProvinces();
  }, [isFormOpen]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => {
      const matchesType = customerFilter === 'ALL' || c.type === customerFilter;
      const matchesRegion = regionFilter === 'ALL' || c.regionId === regionFilter;
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (c.code?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesRegion && matchesSearch;
    });

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [customers, customerFilter, regionFilter, searchTerm, sortConfig]);

  const filteredLeads = useMemo(() => {
      let result = leads.filter(l => {
          const matchesStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
          const matchesRegion = regionFilter === 'ALL' || l.regionId === regionFilter;
          const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               l.interest.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesStatus && matchesRegion && matchesSearch;
      });

      if (sortConfig) {
        result.sort((a: any, b: any) => {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return result;
  }, [leads, leadStatusFilter, regionFilter, searchTerm, sortConfig]);

  const handleExportExcel = () => {
    setIsExporting(true);
    
    let csvContent = "";
    let filename = "";

    if (activeTab === 'LEADS') {
        const headers = ["ID", "Nama Prospek", "Sumber", "Status", "Minat Produk", "Lokasi", "Region ID", "Nomor HP", "Tanggal Masuk"];
        const rows = filteredLeads.map(l => [
            l.id, l.name, l.source, l.status, l.interest, l.location, l.regionId, l.phone, l.createdAt
        ]);
        csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        filename = `MAXXI_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
        const headers = ["Kode Pelanggan", "Nama Pelanggan", "Kategori", "Provinsi", "Kota/Kab", "Telepon", "HP/WA", "Email", "NIK", "NPWP", "Alamat", "Latitude", "Longitude", "Total Unit"];
        const rows = filteredCustomers.map(c => {
            const unitCount = units.filter(u => u.customerId === c.id).length;
            return [
                c.code, c.name, c.type, c.province || "-", c.city || "-", c.phone || "-", c.mobile || "-", c.email || "-", c.nik || "-", c.npwp || "-", 
                `"${c.address.replace(/"/g, '""')}"`, c.lat || "0", c.lng || "0", unitCount
            ];
        });
        csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        filename = `MAXXI_Customers_Export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 800);
  };

  const handleAddNew = () => {
      if (activeTab === 'LEADS') {
          setLeadFormData({
            name: '',
            phone: '',
            interest: 'Combine Harvester Bimo 110X',
            source: LeadSource.DIRECT,
            regionId: REGIONAL_ZONES[0].id,
            location: ''
          });
          setIsLeadFormOpen(true);
      } else {
          setFormData({ 
              code: `CUS-${new Date().getFullYear()}-${String(customers.length + 1).padStart(4, '0')}`,
              name: '', 
              type: CustomerType.INDIVIDUAL, 
              contactInfo: '', 
              email: '', 
              regionId: '',
              subRegionId: '',
              mobile: '',
              phone: '',
              nik: '',
              npwp: '',
              address: '',
              lat: undefined,
              lng: undefined
          });
          setCustomerCustomFields({});
          setIsEditMode(false);
          setIsFormOpen(true);
      }
  };

  const handleEdit = (customer: Customer) => {
      setFormData({ ...customer });
      setCustomerCustomFields(customer.customFields || {});
      setIsEditMode(true);
      setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditMode && formData.id) {
          setCustomers(prev => prev.map(c => {
              if (c.id === formData.id) {
                  const updated: Customer = { ...c, ...formData, customFields: customerCustomFields } as Customer;
                  if (selectedCustomer?.id === updated.id) setSelectedCustomer(updated);
                  return updated;
              }
              return c;
          }));
      } else {
          const newCustomer: Customer = { 
              ...formData, 
              id: `c-${Date.now()}`, 
              farms: [],
              customFields: customerCustomFields 
          } as Customer;
          setCustomers(prev => [newCustomer, ...prev]);
      }
      setIsFormOpen(false);
  };

  const handleSaveLead = (e: React.FormEvent) => {
      e.preventDefault();
      const newLead: Lead = {
          ...leadFormData,
          id: `l-${Date.now()}`,
          status: LeadStatus.NEW,
          createdAt: new Date().toISOString().split('T')[0]
      } as Lead;
      
      setLeads(prev => [newLead, ...prev]);
      setIsLeadFormOpen(false);
  };

  const toggleLayer = (layerId: string) => {
      const newVisible = new Set(visibleLayers);
      if (newVisible.has(layerId)) {
          newVisible.delete(layerId);
      } else {
          newVisible.add(layerId);
      }
      setVisibleLayers(newVisible);
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-maxxi-primary" /> : <ArrowDown size={14} className="text-maxxi-primary" />;
  };

  const renderCustomerDetail = () => {
    if (!selectedCustomer) return null;
    const customerUnits = units.filter(u => u.customerId === selectedCustomer.id);
    const region = REGIONAL_ZONES.find(r => r.id === selectedCustomer.regionId);
    const subRegion = region?.subRegions?.find(s => s.id === selectedCustomer.subRegionId);
    
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-500">
            {/* Header Profil */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl font-black text-slate-300 shadow-xl border-4 border-white">
                        {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                        <button onClick={() => setSelectedCustomer(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2 hover:text-maxxi-primary group transition-colors">
                            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
                        </button>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCustomer.name}</h2>
                            <span className="px-3 py-1 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                                {selectedCustomer.type}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <BadgeInfo size={12} className="text-maxxi-primary" /> CODE: <span className="font-mono text-slate-800">{selectedCustomer.code}</span>
                             </div>
                             {region && <div className="h-3 w-px bg-slate-300"></div>}
                             {region && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <Globe size={12} className="text-blue-500" /> REGIONAL {region.name}
                             </div>}
                             {subRegion && <div className="h-3 w-px bg-slate-300"></div>}
                             {subRegion && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <MapIcon2 size={12} className="text-indigo-500" /> SUB-REG: {subRegion.name}
                             </div>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleEdit(selectedCustomer)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Edit size={16} /> Edit Profil</button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-maxxi-primary text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all"><Wrench size={16} /> Service Ticket</button>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Landmark size={80} /></div>
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em] flex items-center gap-2 mb-6">
                            <Fingerprint size={16} className="text-maxxi-primary" /> Identitas & Legal
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">NIK (Kependudukan)</p>
                                <p className="text-sm font-bold text-slate-800">{selectedCustomer.nik || '-'}</p>
                            </div>
                            <div className="h-px bg-slate-50"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">NPWP (Perpajakan)</p>
                                <p className="text-sm font-bold text-slate-800">{selectedCustomer.npwp || '-'}</p>
                            </div>
                            <div className="h-px bg-slate-50"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Telepon</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedCustomer.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Nomor HP / WA</p>
                                    <p className="text-sm font-black text-maxxi-primary">{selectedCustomer.mobile || selectedCustomer.contactInfo}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><MapPinned size={80} /></div>
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em] flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-blue-600" /> Detail Alamat Korespondensi
                        </h3>
                        <div className="space-y-5">
                            <div className="bg-white p-4 rounded-2xl border border-blue-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Alamat Lengkap</p>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">{selectedCustomer.address}</p>
                            </div>
                            
                            <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden group/coord">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/coord:scale-110 transition-transform"><Navigation size={40} /></div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Globe size={10} /> Koordinat GPS
                                    </p>
                                    {selectedCustomer.lat && selectedCustomer.lng && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${selectedCustomer.lat},${selectedCustomer.lng}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-[8px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded font-black uppercase tracking-tighter transition-colors flex items-center gap-1"
                                        >
                                            <ExternalLink size={8} /> Buka Maps
                                        </a>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Latitude</p>
                                        <p className="text-xs font-mono font-black text-maxxi-secondary">{selectedCustomer.lat || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Longitude</p>
                                        <p className="text-xs font-mono font-black text-maxxi-secondary">{selectedCustomer.lng || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Provinsi</p>
                                    <p className="text-xs font-bold text-slate-800 uppercase">{selectedCustomer.province || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Kota / Kabupaten</p>
                                    <p className="text-xs font-bold text-slate-800 uppercase">{selectedCustomer.city || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Kecamatan</p>
                                    <p className="text-xs font-bold text-slate-800 uppercase">{selectedCustomer.district || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Desa / Kelurahan</p>
                                    <p className="text-xs font-bold text-slate-800 uppercase">{selectedCustomer.village || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em] flex items-center gap-2 mb-6">
                            <Tractor size={16} className="text-maxxi-primary" /> Kepemilikan Armada ({customerUnits.length})
                        </h3>
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                            {customerUnits.map(unit => {
                                const product = MOCK_PRODUCTS.find(p => p.id === unit.productId);
                                const sourceShowroom = MOCK_SHOWROOMS.find(s => s.id === unit.showroomId);
                                return (
                                    <div key={unit.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-red-200 transition-all cursor-pointer">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                            <Tractor size={24} className="text-maxxi-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter">{product?.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 font-bold mb-1">{unit.serialNumber}</p>
                                            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-200">
                                                <Store size={10} className="text-maxxi-secondary" />
                                                <span className="text-[8px] font-black text-slate-500 uppercase truncate">Asal: {sourceShowroom?.name || 'Kantor Pusat'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-maxxi-primary" />
                                    </div>
                                )
                            })}
                            {customerUnits.length === 0 && (
                                <div className="text-center py-12">
                                    <Package size={40} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada unit terdaftar</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                            <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100">
                                <Plus size={14} /> Tambah Unit Armada
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderLeadsTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('name')}>
                            <div className="flex items-center gap-2">Nama Prospek {getSortIcon('name')}</div>
                        </th>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('interest')}>
                            <div className="flex items-center gap-2">Minat Produk {getSortIcon('interest')}</div>
                        </th>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('status')}>
                            <div className="flex items-center gap-2">Status {getSortIcon('status')}</div>
                        </th>
                        <th className="px-6 py-5">Lokasi & Region</th>
                        <th className="px-6 py-5">Kontak</th>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all text-right" onClick={() => handleSort('createdAt')}>
                            <div className="flex items-center justify-end gap-2">Tgl Masuk {getSortIcon('createdAt')}</div>
                        </th>
                        <th className="px-6 py-5 text-right w-20">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredLeads.map(lead => {
                        const region = REGIONAL_ZONES.find(r => r.id === lead.regionId);
                        return (
                            <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="font-black text-slate-800">{lead.name}</p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Source: {lead.source}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="bg-slate-100 px-3 py-1 rounded-lg text-[11px] font-bold text-slate-700 w-fit">
                                        {lead.interest}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        lead.status === 'NEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        lead.status === 'QUALIFIED' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <p className="font-bold text-slate-700 text-xs">{lead.location}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{region?.name || '-'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-black text-blue-600 text-xs">{lead.phone}</p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <p className="text-xs font-bold text-slate-600">{new Date(lead.createdAt).toLocaleDateString('id-ID')}</p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 text-slate-400 hover:text-maxxi-primary transition-all">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredLeads.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                                Data Prospek Tidak Ditemukan
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('code')}>
                            <div className="flex items-center gap-2">Code {getSortIcon('code')}</div>
                        </th>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('name')}>
                            <div className="flex items-center gap-2">Nama Pelanggan {getSortIcon('name')}</div>
                        </th>
                        <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort('type')}>
                            <div className="flex items-center gap-2">Kategori {getSortIcon('type')}</div>
                        </th>
                        <th className="px-6 py-5">Regional & Lokasi</th>
                        <th className="px-6 py-5">Kontak Aktif</th>
                        <th className="px-6 py-5 text-center">Unit</th>
                        <th className="px-6 py-5 text-right w-24">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredCustomers.map(customer => {
                        const region = REGIONAL_ZONES.find(r => r.id === customer.regionId);
                        const unitCount = units.filter(u => u.customerId === customer.id).length;
                        return (
                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                <td className="px-6 py-5 font-mono text-[10px] font-black text-slate-400 uppercase">
                                    {customer.code}
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-black text-slate-800 group-hover:text-maxxi-primary transition-colors">{customer.name}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest">
                                        {customer.type}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <p className="font-bold text-slate-700 text-xs truncate max-w-[150px]">{customer.city || customer.province}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{region?.name || '-'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-black text-maxxi-primary text-xs">{customer.mobile || customer.contactInfo}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex items-center justify-center gap-1.5 font-black text-slate-800">
                                        <Tractor size={14} className="text-slate-300" />
                                        {unitCount}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(customer); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-maxxi-primary rounded-lg hover:bg-red-50">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredCustomers.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                                Data Pelanggan Tidak Ditemukan
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderLeadFormModal = () => {
    if (!isLeadFormOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <UserPlus size={20} className="text-maxxi-primary"/> Registrasi Prospek (Lead) Baru
                    </h3>
                    <button onClick={() => setIsLeadFormOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSaveLead} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nama Prospek</label>
                        <input required type="text" placeholder="Contoh: H. Ahmad Fauzi" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800" value={leadFormData.name} onChange={e => setLeadFormData({...leadFormData, name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nomor HP / WhatsApp</label>
                            <input required type="text" placeholder="0812..." className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={leadFormData.phone} onChange={e => setLeadFormData({...leadFormData, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Sumber Data</label>
                            <select className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white" value={leadFormData.source} onChange={e => setLeadFormData({...leadFormData, source: e.target.value as LeadSource})}>
                                {(Object.values(LeadSource) as string[]).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Minat Produk Alsintan</label>
                        <select className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white" value={leadFormData.interest} onChange={e => setLeadFormData({...leadFormData, interest: e.target.value})}>
                            <option value="Combine Harvester Bimo 110X">Combine Harvester Bimo 110X</option>
                            <option value="Traktor Maxxi 4WD">Traktor Maxxi 4WD</option>
                            <option value="Drone Sprayer XAG P60">Drone Sprayer XAG P60</option>
                            <option value="Smart Farming Kit">Smart Farming Kit</option>
                            <option value="Suku Cadang / Sparepart">Suku Cadang / Sparepart</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Regional Target</label>
                            <select className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white" value={leadFormData.regionId} onChange={e => setLeadFormData({...leadFormData, regionId: e.target.value})}>
                                {REGIONAL_ZONES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Area / Lokasi Lahan</label>
                            <input required type="text" placeholder="Kecamatan / Kabupaten" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={leadFormData.location} onChange={e => setLeadFormData({...leadFormData, location: e.target.value})} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsLeadFormOpen(false)} className="px-6 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px]">Batal</button>
                        <button type="submit" className="bg-indigo-600 text-white font-black px-10 py-3 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 flex items-center gap-2 uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                            <Save size={16} /> Simpan Prospek
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderFormModal = () => {
    if (!isFormOpen) return null;
    const selectedRegion = REGIONAL_ZONES.find(r => r.id === formData.regionId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        {isEditMode ? <Edit size={20} className="text-maxxi-primary"/> : <Plus size={20} className="text-maxxi-primary"/>}
                        {isEditMode ? 'Edit Profil Pelanggan' : 'Daftarkan Pelanggan Baru'}
                    </h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSaveCustomer} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Kolom 1: Profil & Legal */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Fingerprint size={14} className="text-maxxi-primary" /> Data Identitas & Legalitas
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Code Pelanggan (System)</label>
                                    <input required disabled type="text" className="w-full border-2 border-slate-50 bg-slate-100 rounded-xl px-4 py-3 outline-none font-mono text-sm text-slate-400" value={formData.code} />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Kategori Pelanggan</label>
                                    <select className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                        {(Object.values(CustomerType) as string[]).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nama Pelanggan / Nama Instansi</label>
                                <input required type="text" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nomor Induk Kependudukan (NIK)</label>
                                    <input type="text" maxLength={16} placeholder="16 Digit NIK" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nomor Pokok Wajib Pajak (NPWP)</label>
                                    <input type="text" placeholder="Format: 00.000..." className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={formData.npwp} onChange={e => setFormData({...formData, npwp: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nomor HP / WhatsApp (Aktif)</label>
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-4 top-3.5 text-slate-300" />
                                        <input required type="text" placeholder="0812..." className="w-full border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Telepon Kantor / Rumah</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-4 top-3.5 text-slate-300" />
                                        <input type="text" placeholder="031-..." className="w-full border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom 2: Alamat Berbasis BPS */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <MapPinned size={14} className="text-blue-600" /> Lokasi & Domisili (Standard BPS)
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Regional MAXXI</label>
                                    <select required className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white" value={formData.regionId} onChange={e => setFormData({...formData, regionId: e.target.value, subRegionId: ''})}>
                                        <option value="">-- Pilih Regional --</option>
                                        {REGIONAL_ZONES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Sub-Regional</label>
                                    <select disabled={!formData.regionId} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-400" value={formData.subRegionId} onChange={e => setFormData({...formData, subRegionId: e.target.value})}>
                                        <option value="">-- Pilih Sub-Reg --</option>
                                        {selectedRegion?.subRegions?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Provinsi</label>
                                    <select required className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white font-bold" value={formData.provinceId || ""} onChange={e => { setFormData({...formData, province: e.target.options[e.target.selectedIndex].text, provinceId: e.target.value}); fetchRegencies(e.target.value); }}>
                                        <option value="">-- Pilih Provinsi --</option>
                                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    {loadingRegions.province && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Kota / Kabupaten</label>
                                    <select required disabled={!formData.province} className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 font-bold" value={formData.cityId || ""} onChange={e => { setFormData({...formData, city: e.target.options[e.target.selectedIndex].text, cityId: e.target.value}); fetchDistricts(e.target.value); }}>
                                        <option value="">-- Pilih Kota/Kab --</option>
                                        {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    {loadingRegions.regency && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Kecamatan</label>
                                    <select required disabled={!formData.city} className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 font-bold" value={formData.districtId || ""} onChange={e => { setFormData({...formData, district: e.target.options[e.target.selectedIndex].text, districtId: e.target.value}); fetchVillages(e.target.value); }}>
                                        <option value="">-- Pilih Kecamatan --</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {loadingRegions.district && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Desa / Kelurahan</label>
                                    <select required disabled={!formData.district} className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-maxxi-primary transition-all text-sm bg-white disabled:bg-slate-50 font-bold" value={formData.village || ""} onChange={e => setFormData({...formData, village: e.target.options[e.target.selectedIndex].text})}>
                                        <option value="">-- Pilih Desa/Kel --</option>
                                        {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                    {loadingRegions.village && <Loader2 className="absolute right-8 top-8 animate-spin text-slate-400" size={14} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Latitude</label>
                                    <input type="number" step="any" placeholder="-7.4043" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm font-bold text-slate-700" value={formData.lat || ''} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Longitude</label>
                                    <input type="number" step="any" placeholder="111.4423" className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm font-bold text-slate-700" value={formData.lng || ''} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Alamat Lengkap (Dusun/Jalan/RT/RW)</label>
                                <textarea required rows={2} placeholder="Sebutkan detail alamat selengkapnya..." className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm resize-none font-bold text-slate-700" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-800 transition-colors">Batal</button>
                        <button type="submit" className="bg-maxxi-primary text-white font-black px-12 py-3 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center gap-2">
                            <Edit size={16} /> {isEditMode ? 'Simpan Perubahan' : 'Selesaikan Registrasi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
  };

  const activeLeadsCount = leads.filter(l => l.status !== LeadStatus.CONVERTED && l.status !== LeadStatus.LOST).length;
  const gapoktanCount = customers.filter(c => c.type === CustomerType.GAPOKTAN).length;

  return (
    <div className="space-y-6 pb-12">
        {/* Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group overflow-hidden relative"><div className="absolute -right-4 -top-4 bg-indigo-50 p-8 rounded-full opacity-50 group-hover:scale-110 transition-transform"><MessageSquare size={40} className="text-indigo-400" /></div><div className="relative z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Leads</p><h3 className="text-2xl font-black text-indigo-600">{leads.length}</h3><div className="flex items-center gap-1.5 mt-2"><span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{activeLeadsCount} Aktif</span></div></div></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group overflow-hidden relative"><div className="absolute -right-4 -top-4 bg-red-50 p-8 rounded-full opacity-50 group-hover:scale-110 transition-transform"><Users size={40} className="text-maxxi-primary opacity-40" /></div><div className="relative z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pelanggan</p><h3 className="text-2xl font-black text-maxxi-primary">{customers.length}</h3><div className="flex items-center gap-1.5 mt-2"><span className="text-[10px] font-bold bg-red-50 text-maxxi-primary px-1.5 py-0.5 rounded border border-red-100">{gapoktanCount} Gapoktan</span></div></div></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group overflow-hidden relative"><div className="absolute -right-4 -top-4 bg-amber-50 p-8 rounded-full opacity-50 group-hover:scale-110 transition-transform"><MapPin size={40} className="text-amber-400" /></div><div className="relative z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wilayah Aktif</p><h3 className="text-2xl font-black text-amber-600">{Array.from(new Set(customers.map(c => c.regionId))).length}</h3><p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Globe size={10} /> Regional</p></div></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group overflow-hidden relative"><div className="absolute -right-4 -top-4 bg-green-50 p-8 rounded-full opacity-50 group-hover:scale-110 transition-transform"><Target size={40} className="text-green-400" /></div><div className="relative z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p><h3 className="text-2xl font-black text-green-600">{Math.round((leads.filter(l => l.status === LeadStatus.CONVERTED).length / (leads.length || 1)) * 100)}%</h3><p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Win Rate</p></div></div>
        </div>

        {/* Refined Navigation & Action Bar */}
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button 
                        onClick={() => { setActiveTab('LEADS'); setSortConfig(null); }} 
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'LEADS' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <MessageCircle size={14} /> Leads
                    </button>
                    <button 
                        onClick={() => { setActiveTab('CUSTOMERS'); setSortConfig(null); }} 
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'CUSTOMERS' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Users size={14} /> Pelanggan
                    </button>
                    <button 
                        onClick={() => setActiveTab('MAP')} 
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'MAP' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <MapIcon size={14} /> Peta Sebaran
                    </button>
                </div>
                
                {activeTab !== 'MAP' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {isExporting ? 'Exporting...' : 'Export'}
                        </button>
                        <button 
                            onClick={handleAddNew} 
                            className={`flex-[2] sm:flex-none hover:opacity-90 text-white px-6 py-2 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-widest text-[11px] ${activeTab === 'LEADS' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-maxxi-primary shadow-red-100'}`}
                        >
                            <Plus size={16} /> {activeTab === 'LEADS' ? 'Tambah Prospek' : 'Registrasi Pelanggan'}
                        </button>
                    </div>
                )}
            </div>

            {/* Dedicated Filter & Search Bar */}
            {activeTab !== 'MAP' && (
                <div className="flex flex-col lg:flex-row gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Cari berdasarkan nama, kode, atau minat...`}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maxxi-primary outline-none transition-all font-bold text-slate-800 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <SlidersHorizontal size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Filter:</span>
                            
                            {activeTab === 'LEADS' && (
                                <select 
                                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                                    value={leadStatusFilter}
                                    onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                                >
                                    <option value="ALL">Semua Status</option>
                                    {(Object.values(LeadStatus) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}

                            {activeTab === 'CUSTOMERS' && (
                                <select 
                                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                                    value={customerFilter}
                                    onChange={(e) => setCustomerFilter(e.target.value as any)}
                                >
                                    <option value="ALL">Semua Tipe</option>
                                    {(Object.values(CustomerType) as string[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            )}
                        </div>

                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <Globe size={14} className="text-slate-400" />
                            <select 
                                className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                            >
                                <option value="ALL">Semua Regional</option>
                                {REGIONAL_ZONES.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                            </select>
                        </div>

                        {(searchTerm || customerFilter !== 'ALL' || leadStatusFilter !== 'ALL' || regionFilter !== 'ALL') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setCustomerFilter('ALL'); setLeadStatusFilter('ALL'); setRegionFilter('ALL'); }}
                                className="text-[10px] font-black text-maxxi-primary uppercase tracking-widest hover:underline px-2"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Tab Content Rendering */}
        <div className="animate-in fade-in duration-700">
            {activeTab === 'LEADS' && renderLeadsTab()}
            {activeTab === 'CUSTOMERS' && (selectedCustomer ? renderCustomerDetail() : renderCustomersTab())}
            {activeTab === 'MAP' && (
                <div className="h-[700px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative animate-in zoom-in duration-500">
                    <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                        
                        <LayersControl position="topright">
                            {/* Native Layer Control linked to interactive legend via visibleLayers */}
                            <LayersControl.Overlay checked={visibleLayers.has('SHOWROOM')} name="Jaringan Showroom">
                                <></>
                            </LayersControl.Overlay>
                            <LayersControl.Overlay checked={visibleLayers.has('SERVICE')} name="Service Stations">
                                <></>
                            </LayersControl.Overlay>
                            <LayersControl.Overlay checked={visibleLayers.has('CUSTOMER')} name="Titik Pelanggan">
                                <></>
                            </LayersControl.Overlay>
                            <LayersControl.Overlay checked={visibleLayers.has('LEAD')} name="Titik Prospek (Leads)">
                                <></>
                            </LayersControl.Overlay>
                            <LayersControl.Overlay checked={visibleLayers.has('FARM')} name="Lokasi Lahan / Unit">
                                <></>
                            </LayersControl.Overlay>
                        </LayersControl>

                        {/* Rendering Markers based on visibleLayers state */}
                        {visibleLayers.has('SHOWROOM') && MOCK_SHOWROOMS.filter(s => !s.name.toLowerCase().includes('service station')).map(showroom => (
                            showroom.lat && showroom.lng && (
                                <Marker key={showroom.id} position={[showroom.lat, showroom.lng]} icon={createCustomIcon('SHOWROOM')}>
                                    <Popup className="custom-popup">
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-red-100 rounded-lg text-red-600"><Store size={14}/></div>
                                                <h4 className="font-black text-sm text-slate-800 uppercase leading-none">{showroom.name}</h4>
                                            </div>
                                            <div className="space-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                <p className="flex items-center gap-1"><MapPin size={10}/> {showroom.province}</p>
                                                <p className="flex items-center gap-1"><Phone size={10}/> {showroom.phone}</p>
                                                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between">
                                                    <span>Reg: {showroom.marketingRegion?.name}</span>
                                                    <span className="text-red-600 font-black">SHOWROOM</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}

                        {visibleLayers.has('SERVICE') && MOCK_SHOWROOMS.filter(s => s.name.toLowerCase().includes('service station')).map(station => (
                            station.lat && station.lng && (
                                <Marker key={station.id} position={[station.lat, station.lng]} icon={createCustomIcon('SERVICE')}>
                                    <Popup className="custom-popup">
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600"><Wrench size={14}/></div>
                                                <h4 className="font-black text-sm text-slate-800 uppercase leading-none">{station.name}</h4>
                                            </div>
                                            <div className="space-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                <p className="flex items-center gap-1"><Users size={10}/> {station.mechanics?.length || 0} Mekanik Aktif</p>
                                                <p className="flex items-center gap-1"><Phone size={10}/> {station.phone}</p>
                                                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-purple-600 font-black">
                                                    <span>READY FOR 3S</span>
                                                    <span>SERVICE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}

                        {visibleLayers.has('CUSTOMER') && customers.map(c => (
                            c.lat && c.lng && (
                                <Marker key={c.id} position={[c.lat, c.lng]} icon={createCustomIcon('CUSTOMER')}>
                                    <Popup className="custom-popup">
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Users size={14}/></div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-800 uppercase leading-none">{c.name}</h4>
                                                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">{c.code}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                <p className="flex items-center gap-1"><Building2 size={10}/> {c.type}</p>
                                                <p className="flex items-start gap-1"><MapPin size={10} className="mt-0.5"/> <span className="line-clamp-2">{c.address}</span></p>
                                                <div className="mt-2 pt-2 border-t border-slate-100 text-blue-600 font-black">ALAMAT KORESPONDENSI</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}

                        {visibleLayers.has('LEAD') && leads.map(l => (
                            l.lat && l.lng && (
                                <Marker key={l.id} position={[l.lat, l.lng]} icon={createCustomIcon('LEAD')}>
                                    <Popup className="custom-popup">
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><UserPlus size={14}/></div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-800 uppercase leading-none">{l.name}</h4>
                                                    <p className="text-[9px] font-bold text-indigo-500 mt-0.5 uppercase">Status: {l.status}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                <p className="flex items-center gap-1"><Package size={10}/> Minat: {l.interest}</p>
                                                <p className="flex items-center gap-1"><Smartphone size={10}/> {l.phone}</p>
                                                <p className="flex items-center gap-1"><Globe size={10}/> Source: {l.source}</p>
                                                <div className="mt-2 pt-2 border-t border-slate-100 text-indigo-600 font-black">PROSPEK BARU (LEADS)</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}

                        {visibleLayers.has('FARM') && customers.map(c => c.farms.map(f => f.lat && f.lng && (
                            <Marker key={f.id} position={[f.lat, f.lng]} icon={createCustomIcon('UNIT', f.primaryCrop === 'PADI' ? ProductCategory.LAND_PREP : ProductCategory.PLANTING)}>
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><Tractor size={14}/></div>
                                            <h4 className="font-black text-sm text-slate-800 uppercase leading-none">{c.name} - Lahan</h4>
                                        </div>
                                        <div className="space-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                            <p className="flex items-center gap-1"><Sprout size={10}/> Komoditas: {f.primaryCrop}</p>
                                            <p className="flex items-center gap-1"><Layers size={10}/> Luas: {f.landAreaHectares} Ha</p>
                                            <div className="mt-2 pt-2 border-t border-slate-100 text-amber-600 font-black">TITIK OPERASIONAL</div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )))}
                    </MapContainer>

                    {/* INTERACTIVE LEGEND */}
                    <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200 min-w-[240px]">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                            Kontrol Lapisan Data
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{visibleLayers.size} / 5</span>
                        </h5>
                        <div className="space-y-2">
                            {/* Layer Toggle: Showroom */}
                            <label onClick={() => toggleLayer('SHOWROOM')} className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${visibleLayers.has('SHOWROOM') ? 'bg-red-50 border border-red-100' : 'bg-transparent grayscale border border-transparent opacity-50 hover:opacity-80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm"><Store size={14} strokeWidth={3}/></div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Showroom Resmi</span>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${visibleLayers.has('SHOWROOM') ? 'bg-red-600 border-red-600 shadow-sm' : 'bg-white border-slate-200'}`}>
                                    {visibleLayers.has('SHOWROOM') && <Check size={12} className="text-white" strokeWidth={4}/>}
                                </div>
                            </label>

                            {/* Layer Toggle: Service Station */}
                            <label onClick={() => toggleLayer('SERVICE')} className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${visibleLayers.has('SERVICE') ? 'bg-purple-50 border border-purple-100' : 'bg-transparent grayscale border border-transparent opacity-50 hover:opacity-80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm"><Wrench size={14} strokeWidth={3}/></div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Service Station</span>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${visibleLayers.has('SERVICE') ? 'bg-purple-600 border-purple-600 shadow-sm' : 'bg-white border-slate-200'}`}>
                                    {visibleLayers.has('SERVICE') && <Check size={12} className="text-white" strokeWidth={4}/>}
                                </div>
                            </label>

                            {/* Layer Toggle: Customer */}
                            <label onClick={() => toggleLayer('CUSTOMER')} className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${visibleLayers.has('CUSTOMER') ? 'bg-blue-50 border border-blue-100' : 'bg-transparent grayscale border border-transparent opacity-50 hover:opacity-80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm"><Users size={14} strokeWidth={3}/></div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Domisili Pelanggan</span>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${visibleLayers.has('CUSTOMER') ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-200'}`}>
                                    {visibleLayers.has('CUSTOMER') && <Check size={12} className="text-white" strokeWidth={4}/>}
                                </div>
                            </label>

                            {/* Layer Toggle: Leads */}
                            <label onClick={() => toggleLayer('LEAD')} className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${visibleLayers.has('LEAD') ? 'bg-indigo-50 border border-indigo-100' : 'bg-transparent grayscale border border-transparent opacity-50 hover:opacity-80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm"><UserPlus size={14} strokeWidth={3}/></div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Titik Prospek (Leads)</span>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${visibleLayers.has('LEAD') ? 'bg-indigo-600 border-indigo-100 shadow-sm' : 'bg-white border-slate-200'}`}>
                                    {visibleLayers.has('LEAD') && <Check size={12} className="text-white" strokeWidth={4}/>}
                                </div>
                            </label>

                            {/* Layer Toggle: Farms */}
                            <label onClick={() => toggleLayer('FARM')} className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-all ${visibleLayers.has('FARM') ? 'bg-amber-50 border border-amber-100' : 'bg-transparent grayscale border border-transparent opacity-50 hover:opacity-80'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm"><Tractor size={14} strokeWidth={3}/></div>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Titik Lahan / Unit</span>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${visibleLayers.has('FARM') ? 'bg-amber-500 border-amber-500 shadow-sm' : 'bg-white border-slate-200'}`}>
                                    {visibleLayers.has('FARM') && <Check size={12} className="text-white" strokeWidth={4}/>}
                                </div>
                            </label>
                        </div>

                        <button 
                            onClick={() => visibleLayers.size > 0 ? setVisibleLayers(new Set()) : setVisibleLayers(new Set(['SHOWROOM', 'SERVICE', 'CUSTOMER', 'LEAD', 'FARM']))}
                            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors"
                        >
                            {visibleLayers.size > 0 ? 'Sembunyikan Semua' : 'Tampilkan Semua'}
                        </button>
                    </div>
                </div>
            )}
        </div>
        {renderFormModal()}
        {renderLeadFormModal()}
    </div>
  );
};

export default LeadManagement;
