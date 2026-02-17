
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Search, Building2, ExternalLink, Navigation, Wrench, Store, ArrowLeft, Globe, Share2, UserCog, Plus, Save, X, Check, Edit, ArrowUpDown, Trash2, Download, TrendingUp, Target, Loader2, Map as MapIcon, MapPinned, ChevronRight, Hash } from 'lucide-react';
import { MOCK_SHOWROOMS, MOCK_MECHANICS, REGIONAL_ZONES, MOCK_FORM_CONFIG } from '../mockData';
import { Showroom, Mechanic, FormType, FieldType } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- INTERNAL COMPONENTS FOR MAP PICKER ---

const LocationMarker = ({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const MapFocus = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
};

const ShowroomList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SHOWROOM' | 'SERVICE'>('SHOWROOM');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<'REGION' | 'NAME' | 'PROVINCE'>('REGION');
  
  const [showrooms, setShowrooms] = useState<Showroom[]>(MOCK_SHOWROOMS);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);

  // Map Picker State
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pickerPos, setPickerPos] = useState<[number, number]>([-7.3, 112.7]); // Default SBY

  // Edit Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Showroom | null>(null);

  // Add New Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newShowroomData, setNewShowroomData] = useState<Partial<Showroom> & { type: 'SHOWROOM' | 'SERVICE' }>({
      type: 'SHOWROOM',
      name: '',
      phone: '',
      address: '',
      province: 'Jawa Timur',
      marketingRegion: { id: REGIONAL_ZONES[0].id, name: REGIONAL_ZONES[0].name },
      subRegionId: '',
      mechanics: [],
      hours: ['Senin - Sabtu : 08.00 - 16.00'],
      lat: -7.3,
      lng: 112.7
  });
  
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // Summary counts
  const totalShowrooms = showrooms.filter(s => !s.name.toLowerCase().includes('service station')).length;
  const totalServiceStations = showrooms.filter(s => s.name.toLowerCase().includes('service station')).length;

  const getSubRegionName = (regionId?: string, subId?: string) => {
    if (!regionId || !subId) return null;
    const region = REGIONAL_ZONES.find(r => r.id === regionId);
    return region?.subRegions?.find(s => s.id === subId)?.name;
  };

  const filteredList = showrooms
    .filter(item => {
        const isServiceStation = item.name.toLowerCase().includes('service station');
        const matchesTab = activeTab === 'SERVICE' ? isServiceStation : !isServiceStation;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = regionFilter === 'ALL' || item.marketingRegion?.id === regionFilter;

        return matchesTab && matchesSearch && matchesRegion;
    })
    .sort((a, b) => {
        switch (sortOption) {
            case 'REGION':
                const regA = a.marketingRegion?.id || 'zzz';
                const regB = b.marketingRegion?.id || 'zzz';
                return regA.localeCompare(regB);
            case 'PROVINCE':
                return a.province.localeCompare(b.province);
            case 'NAME':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

  const handleExportExcel = () => {
    setIsExporting(true);
    
    // Column Headers
    const headers = ["ID", "Nama Outlet", "Kategori", "Regional", "Sub-Regional", "Provinsi", "Alamat Lengkap", "Nomor Telepon", "Latitude", "Longitude"];
    
    // Map data to rows
    const csvRows = filteredList.map(item => [
      item.id,
      item.name,
      activeTab,
      item.marketingRegion?.name || 'PUSAT',
      getSubRegionName(item.marketingRegion?.id, item.subRegionId) || 'Regional Center',
      item.province,
      `"${item.address.replace(/"/g, '""')}"`, // Handle commas in address
      item.phone,
      item.lat || '0',
      item.lng || '0'
    ]);

    // Combine into CSV string
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    
    // Create download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `MAXXI_Data_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        setIsExporting(false);
    }, 500);
  };

  const handleSearchLocation = async () => {
      if (!mapSearchTerm.trim()) return;
      setIsSearching(true);
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchTerm)}&countrycodes=id`);
          const data = await response.json();
          if (data && data.length > 0) {
              const { lat, lon } = data[0];
              setPickerPos([parseFloat(lat), parseFloat(lon)]);
          } else {
              alert("Lokasi tidak ditemukan. Coba masukkan nama kota atau jalan yang lebih spesifik.");
          }
      } catch (e) {
          console.error("Search error", e);
      } finally {
          setIsSearching(false);
      }
  };

  const handleEditClick = (showroom: Showroom) => {
      setEditFormData({ ...showroom });
      setPickerPos([showroom.lat || -7.3, showroom.lng || 112.7]);
      setCustomFields(showroom.customFields || {});
      setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editFormData) return;
      const updatedShowroom = { 
          ...editFormData, 
          lat: pickerPos[0],
          lng: pickerPos[1],
          customFields: customFields 
      };
      const updatedShowrooms = showrooms.map(s => s.id === editFormData.id ? updatedShowroom : s);
      setShowrooms(updatedShowrooms);
      if (selectedShowroom && selectedShowroom.id === editFormData.id) setSelectedShowroom(updatedShowroom);
      setIsEditModalOpen(false);
  };

  const handleAddNewClick = () => {
      setNewShowroomData({
          type: activeTab,
          name: '',
          phone: '',
          address: '',
          province: 'Jawa Timur',
          marketingRegion: { id: REGIONAL_ZONES[0].id, name: REGIONAL_ZONES[0].name },
          subRegionId: '',
          mechanics: [],
          hours: ['Senin - Sabtu : 08.00 - 16.00'],
          lat: -7.3,
          lng: 112.7
      });
      setPickerPos([-7.3, 112.7]);
      setCustomFields({});
      setIsAddModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
      e.preventDefault();
      const newId = `${newShowroomData.type === 'SERVICE' ? 'ss' : 'sh'}-${Date.now()}`;
      const newItem: Showroom = {
          id: newId,
          name: newShowroomData.name || '',
          phone: newShowroomData.phone || '-',
          address: newShowroomData.address || '',
          province: newShowroomData.province || '',
          marketingRegion: newShowroomData.marketingRegion,
          subRegionId: newShowroomData.subRegionId,
          hours: newShowroomData.hours || [],
          mechanics: newShowroomData.mechanics || [],
          lat: pickerPos[0],
          lng: pickerPos[1],
          annualTarget: 0,
          achievedRevenue: 0,
          customFields: customFields
      };
      setShowrooms(prev => [newItem, ...prev]);
      setIsAddModalOpen(false);
  };

  const renderLocationPicker = () => (
      <div className="space-y-3">
          <div className="flex justify-between items-end">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Titik Lokasi Showroom (GPS)</label>
              <div className="flex gap-2 text-[10px] font-mono font-bold text-maxxi-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  <span>LAT: {pickerPos[0].toFixed(6)}</span>
                  <span>LNG: {pickerPos[1].toFixed(6)}</span>
              </div>
          </div>
          
          <div className="relative group">
              <input 
                  type="text" 
                  placeholder="Cari alamat, gedung, atau kota..." 
                  className="w-full pl-10 pr-20 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-maxxi-primary outline-none transition-all font-bold shadow-sm"
                  value={mapSearchTerm}
                  onChange={e => setMapSearchTerm(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
              />
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <button 
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={isSearching}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                  {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Cari'}
              </button>
          </div>

          <div className="h-64 w-full rounded-2xl border-2 border-slate-100 overflow-hidden shadow-inner relative z-0">
              <MapContainer center={pickerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                  <LocationMarker position={pickerPos} setPosition={setPickerPos} />
                  <MapFocus position={pickerPos} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-slate-500 pointer-events-none uppercase tracking-tighter">
                  Klik pada peta untuk memindahkan Pin
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        
        {/* SUMMARY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
                onClick={() => setActiveTab('SHOWROOM')}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${activeTab === 'SHOWROOM' ? 'bg-white border-maxxi-primary shadow-xl shadow-red-100 ring-4 ring-red-50' : 'bg-white/50 border-slate-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
            >
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all ${activeTab === 'SHOWROOM' ? 'bg-maxxi-primary text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <Store size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Jaringan Showroom</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className={`text-4xl font-black ${activeTab === 'SHOWROOM' ? 'text-slate-800' : 'text-slate-400'}`}>{totalShowrooms}</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase">Unit Nasional</span>
                        </div>
                    </div>
                </div>
            </div>

            <div 
                onClick={() => setActiveTab('SERVICE')}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${activeTab === 'SERVICE' ? 'bg-white border-purple-600 shadow-xl shadow-purple-100 ring-4 ring-purple-50' : 'bg-white/50 border-slate-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
            >
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all ${activeTab === 'SERVICE' ? 'bg-purple-600 text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <Wrench size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Service Stations</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className={`text-4xl font-black ${activeTab === 'SERVICE' ? 'text-slate-800' : 'text-slate-400'}`}>{totalServiceStations}</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase">Titik Layanan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CTO Dashboard Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
                <button 
                    onClick={() => setActiveTab('SHOWROOM')} 
                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SHOWROOM' ? 'bg-maxxi-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <Store size={16} /> List Showroom
                </button>
                <button 
                    onClick={() => setActiveTab('SERVICE')} 
                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SERVICE' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <Wrench size={16} /> List Service
                </button>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={`Cari ${activeTab.toLowerCase()}...`}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-maxxi-primary outline-none shadow-sm min-w-[280px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={handleAddNewClick} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Plus size={18} /> Tambah Data
                </button>
            </div>
        </div>

        {/* Unified Data List */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${activeTab === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                        {activeTab === 'SERVICE' ? <Wrench size={24} /> : <Store size={24} />}
                    </div>
                    <div>
                        <h2 className="font-black text-slate-800 uppercase tracking-tight">Database {activeTab === 'SERVICE' ? 'Service Station' : 'Showroom Resmi'}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{filteredList.length} Lokasi Terfilter</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <Globe size={14} className="text-slate-400" />
                        <select 
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                        >
                            <option value="ALL">Semua Regional</option>
                            {REGIONAL_ZONES.map(reg => <option key={reg.id} value={reg.id}>{reg.name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-800 shadow-sm transition-all flex items-center gap-2"
                        title="Download Data (Excel/CSV)"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin text-maxxi-primary" /> : <Download size={18} />}
                        {isExporting && <span className="text-[10px] font-black uppercase">Exporting...</span>}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 font-black border-b border-slate-100 uppercase tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-6">Nama & Identitas</th>
                            <th className="px-6 py-6">Regional / Sub-Reg</th>
                            <th className="px-6 py-6">Provinsi & Alamat</th>
                            <th className="px-6 py-6">Kontak</th>
                            <th className="px-6 py-6 text-center">Status GPS</th>
                            <th className="px-8 py-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">Data Tidak Ditemukan</td>
                            </tr>
                        ) : (
                            filteredList.map(item => (
                                <tr key={item.id} onClick={() => setSelectedShowroom(item)} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-sm ${activeTab === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm group-hover:text-maxxi-primary transition-colors uppercase tracking-tight">{item.name}</div>
                                                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-0.5">ID: {item.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">{item.marketingRegion?.name}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{getSubRegionName(item.marketingRegion?.id, item.subRegionId) || 'Regional Center'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight mb-1">{item.province}</div>
                                        <div className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px]">{item.address}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-600">
                                            <Phone size={12} className="text-slate-300" />
                                            {item.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        {item.lat ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-green-50 text-green-700 border border-green-100 uppercase tracking-widest shadow-sm">
                                                <MapPinned size={10} /> Validated
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-200 uppercase tracking-widest">
                                                <X size={10} /> No GPS
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => {e.stopPropagation(); handleEditClick(item);}}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-maxxi-primary hover:bg-red-50 rounded-xl transition-all">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><Plus size={20} className="text-maxxi-primary"/> Registrasi Outlet Baru</h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSaveNew} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Column 1: Info Dasar */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">1. Informasi Outlet</h4>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Outlet / Showroom</label>
                                    <input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800 shadow-sm" value={newShowroomData.name} onChange={e => setNewShowroomData({...newShowroomData, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Regional</label>
                                        <select required className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white shadow-sm" value={newShowroomData.marketingRegion?.id} onChange={e => { const reg = REGIONAL_ZONES.find(r => r.id === e.target.value); if (reg) setNewShowroomData({...newShowroomData, marketingRegion: { id: reg.id, name: reg.name }, subRegionId: ''}); }}>
                                            {REGIONAL_ZONES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Sub-Regional</label>
                                        <select className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white disabled:bg-slate-50 shadow-sm" value={newShowroomData.subRegionId} disabled={!newShowroomData.marketingRegion?.id} onChange={e => setNewShowroomData({...newShowroomData, subRegionId: e.target.value})}>
                                            <option value="">-- Pilih Sub-Reg --</option>
                                            {REGIONAL_ZONES.find(r => r.id === newShowroomData.marketingRegion?.id)?.subRegions?.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Telepon</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newShowroomData.phone} onChange={e => setNewShowroomData({...newShowroomData, phone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Provinsi</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={newShowroomData.province} onChange={e => setNewShowroomData({...newShowroomData, province: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Lengkap</label>
                                    <textarea required rows={2} className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm font-bold text-slate-700 shadow-sm resize-none" value={newShowroomData.address} onChange={e => setNewShowroomData({...newShowroomData, address: e.target.value})} />
                                </div>
                            </div>

                            {/* Column 2: Map Picker */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">2. Penentuan Koordinat Peta</h4>
                                {renderLocationPicker()}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-slate-800 transition-colors">Batal</button>
                            <button type="submit" className="bg-maxxi-primary text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 uppercase tracking-widest text-[11px] active:scale-95 transition-all flex items-center gap-2">
                                <Save size={18} /> Simpan Data Outlet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editFormData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><Edit size={20} className="text-maxxi-primary"/> Edit Data Outlet</h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Column 1 */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">1. Perubahan Informasi</h4>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Outlet / Showroom</label>
                                    <input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800 shadow-sm" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Regional</label>
                                        <select required className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white shadow-sm" value={editFormData.marketingRegion?.id} onChange={e => { const reg = REGIONAL_ZONES.find(r => r.id === e.target.value); if (reg) setEditFormData({...editFormData, marketingRegion: { id: reg.id, name: reg.name }, subRegionId: ''}); }}>
                                            {REGIONAL_ZONES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Sub-Regional</label>
                                        <select className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white disabled:bg-slate-50 shadow-sm" value={editFormData.subRegionId || ''} disabled={!editFormData.marketingRegion?.id} onChange={e => setEditFormData({...editFormData, subRegionId: e.target.value})}>
                                            <option value="">-- Pilih Sub-Reg --</option>
                                            {REGIONAL_ZONES.find(r => r.id === editFormData.marketingRegion?.id)?.subRegions?.map(sub => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Telepon</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Provinsi</label>
                                        <input type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 shadow-sm" value={editFormData.province} onChange={e => setEditFormData({...editFormData, province: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">2. Update Koordinat Peta</h4>
                                {renderLocationPicker()}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:text-slate-800 transition-colors">Batal</button>
                            <button type="submit" className="bg-slate-900 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black uppercase tracking-widest text-[11px] active:scale-95 transition-all flex items-center gap-2">
                                <Save size={18} /> Update Data Outlet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Selected Detail View */}
        {selectedShowroom && !isEditModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className={`h-32 ${activeTab === 'SERVICE' ? 'bg-gradient-to-r from-purple-800 to-indigo-900' : 'bg-gradient-to-r from-red-800 to-orange-900'} p-8 relative`}>
                        <button onClick={() => setSelectedShowroom(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full"><X size={20} /></button>
                        <div className="flex items-end h-full">
                            <div><h2 className="text-3xl font-black text-white mb-1 tracking-tight uppercase">{selectedShowroom.name}</h2><p className="text-white/80 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><MapPin size={14}/> {selectedShowroom.address}</p></div>
                        </div>
                    </div>
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
                                    <h3 className="font-black text-slate-700 flex items-center gap-2 text-xs uppercase tracking-widest"><Store size={18} /> Detail Informasi Outlet</h3>
                                    <div className="flex justify-between border-b pb-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Telepon</span><span className="font-black text-slate-700">{selectedShowroom.phone}</span></div>
                                    <div className="flex justify-between border-b pb-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Regional</span><span className="font-black text-slate-700">{selectedShowroom.marketingRegion?.name}</span></div>
                                    <div className="flex justify-between border-b pb-2"><span className="text-slate-400 font-bold uppercase text-[10px]">Sub-Regional</span><span className="font-black text-slate-700">{getSubRegionName(selectedShowroom.marketingRegion?.id, selectedShowroom.subRegionId) || 'Semua'}</span></div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-400 font-bold uppercase text-[10px]">Titik Koordinat</span>
                                        <div className="flex gap-2">
                                            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-black">{selectedShowroom.lat?.toFixed(5)}, {selectedShowroom.lng?.toFixed(5)}</span>
                                            {selectedShowroom.lat && (
                                                <a href={`https://www.google.com/maps?q=${selectedShowroom.lat},${selectedShowroom.lng}`} target="_blank" className="p-1 bg-slate-200 rounded text-slate-600 hover:bg-maxxi-primary hover:text-white transition-colors"><ExternalLink size={14} /></a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-full min-h-[300px] rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-xl relative">
                                {selectedShowroom.lat && selectedShowroom.lng ? (
                                    <MapContainer center={[selectedShowroom.lat, selectedShowroom.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                                        <Marker position={[selectedShowroom.lat, selectedShowroom.lng]} />
                                    </MapContainer>
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Peta tidak tersedia</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setSelectedShowroom(null)} className="px-6 py-3 font-black uppercase text-[10px] text-slate-500 tracking-widest">Tutup</button>
                        <button onClick={() => handleEditClick(selectedShowroom)} className="px-8 py-3 bg-maxxi-primary text-white font-black rounded-2xl hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-100 uppercase text-[10px] tracking-widest active:scale-95 transition-all"><Edit size={16} /> Edit Data Outlet</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ShowroomList;
