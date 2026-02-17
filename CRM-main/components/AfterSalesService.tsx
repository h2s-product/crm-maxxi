
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_UNITS, MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SERVICE_TICKETS, MOCK_SHOWROOMS, INDONESIAN_PROVINCES, REGIONAL_ZONES, MOCK_MECHANICS } from '../mockData';
import { MachineUnit, ServiceTicket, ProductCategory, Product, Customer, ServiceReport } from '../types';
import { createServiceTicket } from '../services/crmService';
import { 
  Wrench, Clock, AlertTriangle, CheckCircle, Search, 
  History, Activity, PenTool, User, Calendar, Filter, Trash2, Plus, X, Save, FileText, MapPin, Phone, Store, Printer, FileCheck, Download, Loader2, Timer, Tractor, AlertCircle, Info, ShieldCheck, Award, ArrowUpDown, Image as ImageIcon, Camera, UserCheck, Hash, FileWarning, Check, Building2, MapPinned, LayoutGrid, List, ChevronRight, Package, GripVertical, Globe, SlidersHorizontal, Settings2, Thermometer, Zap, Gauge, Droplets, Upload, Trash
} from 'lucide-react';
import { MaxxiLogo } from './Layout';

const AfterSalesService: React.FC<{ initialParams?: any }> = ({ initialParams }) => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'TICKETS'>('TICKETS');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  
  // Basic search & Sort
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketSort, setTicketSort] = useState('NEWEST');

  // Advanced Filters
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [subRegionFilter, setSubRegionFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [picFilter, setPicFilter] = useState('ALL');
  const [reporterFilter, setReporterFilter] = useState('');

  const [tickets, setTickets] = useState<ServiceTicket[]>(MOCK_SERVICE_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  
  // Refs
  const ticketDetailRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const registrationFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop State
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  // Transition Modal State
  const [pendingStatusChange, setPendingStatusChange] = useState<{ ticketId: string; newStatus: string } | null>(null);
  const [transitionPic, setTransitionPic] = useState('');
  const [transitionActionPoints, setTransitionActionPoints] = useState<string[]>(['']);

  // UI States
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [ticketForm, setTicketForm] = useState<Partial<ServiceTicket>>({
      complaintDate: new Date().toISOString().split('T')[0],
      reporterName: '',
      customerName: '',
      customerPhone: '',
      province: '',
      city: '',
      district: '',
      village: '',
      address: '',
      subject: '',
      description: '',
      productName: '',
      chassisNumber: '',
      engineNumber: '',
      hmReading: '',
      responseDate: '',
      resolution: '',
      completionDate: '',
      assignedTo: '',
      correctiveAction: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      notes: '',
      evidenceUrls: []
  });

  // Handle auto-open from external params
  useEffect(() => {
    if (initialParams?.action === 'CREATE_TICKET') {
      setIsTicketFormOpen(true);
      if (initialParams.customerId) {
        const customer = MOCK_CUSTOMERS.find(c => c.id === initialParams.customerId);
        if (customer) {
          setTicketForm(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.mobile || customer.contactInfo,
            province: customer.province || '',
            city: customer.city || '',
            address: customer.address || '',
            customerId: customer.id,
            evidenceUrls: []
          }));
        }
      }
    }
  }, [initialParams]);

  const selectedRegion = REGIONAL_ZONES.find(r => r.id === regionFilter);

  // Consolidated Filter Logic
  const getFilteredTickets = (ticketList: ServiceTicket[]) => {
      return ticketList.filter(t => {
          const matchesSearch = t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                              t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                              t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
          const matchesReporter = !reporterFilter || t.reporterName.toLowerCase().includes(reporterFilter.toLowerCase());
          const matchesProduct = productFilter === 'ALL' || t.productName === productFilter;
          const matchesPIC = picFilter === 'ALL' || t.assignedTo === picFilter;
          const customer = MOCK_CUSTOMERS.find(c => c.id === t.customerId);
          const matchesRegion = regionFilter === 'ALL' || customer?.regionId === regionFilter;
          const matchesSubReg = subRegionFilter === 'ALL' || customer?.subRegionId === subRegionFilter;

          return matchesSearch && matchesReporter && matchesProduct && matchesPIC && matchesRegion && matchesSubReg;
      }).sort((a, b) => {
          if (ticketSort === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (ticketSort === 'PRIORITY') {
              const pMap: any = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
              return pMap[b.priority] - pMap[a.priority];
          }
          return 0;
      });
  };

  const filteredTickets = useMemo(() => getFilteredTickets(tickets), [tickets, ticketSearch, ticketSort, regionFilter, subRegionFilter, productFilter, picFilter, reporterFilter]);

  const stats = {
    total: filteredTickets.length,
    open: filteredTickets.filter(t => t.status === 'OPEN').length,
    processing: filteredTickets.filter(t => ['READY_TO_PROCESS', 'IN_PROGRESS'].includes(t.status)).length,
    waitingParts: filteredTickets.filter(t => t.status === 'WAITING_PARTS').length,
    resolved: filteredTickets.filter(t => t.status === 'RESOLVED').length,
    critical: filteredTickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length
  };

  const getSLAStatus = (createdAt: string, status: string) => {
    if (status === 'RESOLVED') return { label: 'Selesai', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
    if (diffHours >= 48) return { label: `SLA Breached (${diffHours}j)`, color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
    if (diffHours >= 24) return { label: `Warning (${diffHours}j)`, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
    return { label: `Active (${diffHours}j)`, color: 'text-blue-600', bg: 'bg-blue-50', icon: Timer };
  };

  const handleDownloadPDF = async () => {
    if (!ticketDetailRef.current || !selectedTicket) return;
    
    setIsDownloading(true);
    
    const element = ticketDetailRef.current;
    const opt = {
      margin: 5,
      filename: `Service_Report_${selectedTicket.ticketNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicketId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const ticketId = draggedTicketId;
    if (!ticketId) return;

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if ((newStatus === 'READY_TO_PROCESS' && ticket.status === 'OPEN') || (newStatus === 'IN_PROGRESS' && ticket.status !== 'IN_PROGRESS')) {
      setPendingStatusChange({ ticketId, newStatus });
      setTransitionPic(ticket.assignedTo || '');
      setTransitionActionPoints(ticket.correctiveAction ? ticket.correctiveAction.split('\n') : ['']);
    } else {
      setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status: newStatus as any } : t
      ));
    }
    setDraggedTicketId(null);
  };

  const confirmStatusTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingStatusChange) return;
    const { ticketId, newStatus } = pendingStatusChange;
    
    const actionText = transitionActionPoints.filter(p => p.trim() !== '').join('\n');
    
    // Default Report Object if going to IN_PROGRESS
    const defaultReport: ServiceReport = {
        isWarranty: false,
        startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        finishTime: '',
        chronologyDiagnosis: '',
        technicalInspectionResult: '',
        spareparts: [],
        checklist: {
            oilPressureBefore: '',
            oilPressureAfter: '',
            tempValue: '',
            smokeStatus: '',
            intakeStatus: '',
            noiseStatus: '',
            batteryVoltage: '',
            radiatorLevel: '',
            airFilterStatus: '',
            fuelFilterStatus: ''
        },
        evidenceChecklist: {
            photoOwnerId: false,
            photoUnit: false,
            photoPlate: false,
            photoEngineHours: false,
            photoOldParts: false,
            photoNewParts: false
        }
    };

    setTickets(prev => prev.map(t => 
        t.id === ticketId ? { 
            ...t, 
            status: newStatus as any,
            assignedTo: transitionPic || t.assignedTo,
            correctiveAction: actionText || t.correctiveAction,
            responseDate: (newStatus === 'READY_TO_PROCESS' && t.status === 'OPEN') ? new Date().toISOString().split('T')[0] : t.responseDate,
            report: (newStatus === 'IN_PROGRESS' && !t.report) ? defaultReport : t.report,
            evidenceUrls: t.evidenceUrls || []
        } : t
    ));
    setPendingStatusChange(null);
    setTransitionPic('');
    setTransitionActionPoints(['']);
  };

  const handleActionPointChange = (index: number, val: string) => {
      const newPoints = [...transitionActionPoints];
      newPoints[index] = val;
      setTransitionActionPoints(newPoints);
  };

  const addActionPoint = () => setTransitionActionPoints([...transitionActionPoints, '']);
  const removeActionPoint = (index: number) => setTransitionActionPoints(transitionActionPoints.filter((_, i) => i !== index));

  const handleUpdateTicketData = (ticketId: string, updates: Partial<ServiceTicket>) => {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
      if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, ...updates } : null);
      }
  };

  const handleUpdateReportData = (ticketId: string, reportUpdates: Partial<ServiceReport>) => {
      setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
              return { ...t, report: { ...(t.report as ServiceReport), ...reportUpdates } };
          }
          return t;
      }));
      if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => {
              if (!prev) return null;
              return { ...prev, report: { ...(prev.report as ServiceReport), ...reportUpdates } };
          });
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTicket || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const currentPhotos = selectedTicket.evidenceUrls || [];
      if (currentPhotos.length >= 5) {
        alert("Maksimal 5 foto bukti visual.");
        return;
      }
      handleUpdateTicketData(selectedTicket.id, { evidenceUrls: [...currentPhotos, url] });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegistrationPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const currentUrls = ticketForm.evidenceUrls || [];
    
    if (currentUrls.length + files.length > 5) {
        alert("Maksimal 5 foto bukti visual.");
        return;
    }

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const url = event.target?.result as string;
            setTicketForm(prev => ({
                ...prev,
                evidenceUrls: [...(prev.evidenceUrls || []), url].slice(0, 5)
            }));
        };
        reader.readAsDataURL(file);
    });

    if (registrationFileInputRef.current) registrationFileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    if (!selectedTicket) return;
    const currentPhotos = selectedTicket.evidenceUrls || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== idx);
    handleUpdateTicketData(selectedTicket.id, { evidenceUrls: newPhotos });
  };

  const removeRegistrationPhoto = (idx: number) => {
    setTicketForm(prev => ({
        ...prev,
        evidenceUrls: (prev.evidenceUrls || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const result = await createServiceTicket(ticketForm);
      if (result.success && result.ticket) {
          setTickets([result.ticket, ...tickets]);
          setSubmitSuccess(result.message);
          setTimeout(() => {
              setIsTicketFormOpen(false);
              setSubmitSuccess(null);
              setTicketForm({
                complaintDate: new Date().toISOString().split('T')[0],
                status: 'OPEN',
                priority: 'MEDIUM',
                evidenceUrls: []
              });
          }, 2000);
      } else {
          alert(result.message);
      }
      setIsSubmitting(false);
  };

  const resetFilters = () => {
      setRegionFilter('ALL');
      setSubRegionFilter('ALL');
      setProductFilter('ALL');
      setPicFilter('ALL');
      setReporterFilter('');
      setTicketSearch('');
  };

  const renderTransitionModal = () => {
    if (!pendingStatusChange) return null;
    const ticket = tickets.find(t => t.id === pendingStatusChange.ticketId);
    const isWip = pendingStatusChange.newStatus === 'IN_PROGRESS';

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${isWip ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight text-sm">
                        {isWip ? <Activity size={18} className="text-blue-600"/> : <Wrench size={18} className="text-maxxi-primary"/>}
                        {isWip ? 'Mulai Pengerjaan & Input Progres' : 'Konfirmasi Penugasan (Antrian)'}
                    </h3>
                    <button onClick={() => setPendingStatusChange(null)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
                </div>
                
                <form onSubmit={confirmStatusTransition} className="p-8 space-y-6">
                    <div className={`${isWip ? 'bg-blue-100/50 border-blue-200' : 'bg-slate-100 border-slate-200'} p-4 rounded-xl border`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${isWip ? 'text-blue-800' : 'text-slate-600'}`}><Info size={14}/> Info Tiket</p>
                        <p className="text-xs font-bold text-slate-700">{ticket?.ticketNumber} - {ticket?.customerName}</p>
                    </div>

                    {!isWip && (
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih PIC Penanganan (Mekanik)</label>
                            <select 
                                required
                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 bg-white shadow-sm"
                                value={transitionPic}
                                onChange={e => setTransitionPic(e.target.value)}
                            >
                                <option value="">-- Pilih Teknisi --</option>
                                {MOCK_MECHANICS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    )}

                    {isWip && (
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Poin-Poin Tindakan Korektif Awal</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {transitionActionPoints.map((point, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <div className="bg-blue-50 text-blue-600 w-8 h-10 rounded-lg flex items-center justify-center font-black text-xs border border-blue-100 shrink-0">{idx + 1}</div>
                                        <input 
                                            required
                                            placeholder="Masukkan langkah perbaikan..."
                                            className="flex-1 border-2 border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700"
                                            value={point}
                                            onChange={e => handleActionPointChange(idx, e.target.value)}
                                        />
                                        {transitionActionPoints.length > 1 && (
                                            <button type="button" onClick={() => removeActionPoint(idx)} className="p-2 text-slate-300 hover:text-red-500"><X size={16} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="button" 
                                onClick={addActionPoint}
                                className="w-full py-2 border-2 border-dashed border-blue-100 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Tambah Baris Tindakan
                            </button>
                        </div>
                    )}

                    {!isWip && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanggal Respon (Auto)</span>
                                <span className="text-[10px] font-bold text-slate-700">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex flex-col gap-2">
                        <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2 ${isWip ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-maxxi-primary shadow-red-100 hover:bg-red-700'}`}>
                            <Check size={18} /> {isWip ? 'Simpan & Mulai Kerja' : 'Konfirmasi Masuk Antrian'}
                        </button>
                        <button type="button" onClick={() => setPendingStatusChange(null)} className="w-full py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderTicketForm = () => {
    if (!isTicketFormOpen) return null;
    if (submitSuccess) {
        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm border border-green-100">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle size={48} /></div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Berhasil!</h3>
                  <p className="text-slate-500 font-medium">{submitSuccess}</p>
              </div>
          </div>
        );
    }

    const registrationPhotos = ticketForm.evidenceUrls || [];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight"><Plus size={24} className="text-maxxi-primary"/> Registrasi Tiket Layanan Purna Jual Baru</h3>
                    <button onClick={() => setIsTicketFormOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={28} /></button>
                </div>
                <form onSubmit={handleSaveTicket} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3"><UserCheck size={16} className="text-blue-500" /> 1. Informasi Pelapor & Pelanggan</h4>
                            <div className="space-y-4">
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tanggal Komplain</label><input required type="date" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={ticketForm.complaintDate} onChange={e => setTicketForm({...ticketForm, complaintDate: e.target.value})} /></div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Pelapor</label><input required type="text" placeholder="Nama orang yang menghubungi" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={ticketForm.reporterName} onChange={e => setTicketForm({...ticketForm, reporterName: e.target.value})} /></div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Pelanggan / Kelompok</label><input required type="text" placeholder="Nama pemilik unit" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={ticketForm.customerName} onChange={e => setTicketForm({...ticketForm, customerName: e.target.value})} /></div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">No. Telp / HP Pelanggan</label><input required type="text" placeholder="0812..." className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={ticketForm.customerPhone} onChange={e => setTicketForm({...ticketForm, customerPhone: e.target.value})} /></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3"><Tractor size={16} className="text-maxxi-primary" /> 2. Alamat Unit & Detail Alsintan</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Provinsi</label><input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 text-sm" value={ticketForm.province} onChange={e => setTicketForm({...ticketForm, province: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Kota / Kabupaten</label><input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700 text-sm" value={ticketForm.city} onChange={e => setTicketForm({...ticketForm, city: e.target.value})} /></div>
                                </div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Lengkap Unit</label><textarea required rows={2} className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm resize-none font-bold text-slate-700" value={ticketForm.address} onChange={e => setTicketForm({...ticketForm, address: e.target.value})} /></div>
                                <div className="pt-2"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Produk Alsintan (Dikeluhkan)</label><input required type="text" placeholder="Contoh: Bimo 110X SS" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-700" value={ticketForm.productName} onChange={e => setTicketForm({...ticketForm, productName: e.target.value})} /></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3"><Activity size={16} className="text-amber-500" /> 3. Data Teknis & Keluhan</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nomor Rangka</label><input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-mono text-xs font-bold" value={ticketForm.chassisNumber} onChange={e => setTicketForm({...ticketForm, chassisNumber: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nomor Mesin</label><input required type="text" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-mono text-xs font-bold" value={ticketForm.engineNumber} onChange={e => setTicketForm({...ticketForm, engineNumber: e.target.value})} /></div>
                                </div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">HM Terakhir</label><input required type="text" placeholder="Angka HM saat komplain" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-black text-maxxi-primary" value={ticketForm.hmReading} onChange={e => setTicketForm({...ticketForm, hmReading: e.target.value})} /></div>
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Subyek & Keluhan</label><input required type="text" placeholder="Contoh: Mesin overheat" className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all font-bold text-slate-800 mb-2" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} /><textarea required rows={3} placeholder="Jelaskan detail masalah..." className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-maxxi-primary transition-all text-sm resize-none font-medium text-slate-600" value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} /></div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Bukti Foto Registrasi (Maks 5) */}
                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Camera size={16} className="text-maxxi-primary" /> 4. Bukti Foto Pendukung (Maks. 5 Foto)
                            </h4>
                            {registrationPhotos.length < 5 && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        ref={registrationFileInputRef}
                                        type="file" 
                                        accept="image/*" 
                                        multiple
                                        className="hidden" 
                                        onChange={handleRegistrationPhotoUpload} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => registrationFileInputRef.current?.click()}
                                        className="bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center gap-2"
                                    >
                                        <Upload size={14} /> Pilih Foto Bukti
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => {
                                const photo = registrationPhotos[i];
                                return (
                                    <div key={i} className={`aspect-square rounded-3xl border-2 overflow-hidden relative group shadow-sm transition-all ${photo ? 'border-white ring-4 ring-slate-50' : 'border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center'}`}>
                                        {photo ? (
                                            <>
                                                <img src={photo} alt={`Bukti ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeRegistrationPhoto(i)}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1.5 text-center">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">BUKTI {i+1}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Camera size={24} className="mx-auto text-slate-200 mb-1" />
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Slot Kosong</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic mt-2">* Foto yang diunggah akan memudahkan teknisi melakukan diagnosa awal.</p>
                    </div>

                    <div className="pt-8 flex justify-end gap-3 sticky bottom-0 bg-white pb-4 border-t border-slate-100">
                        <button type="button" disabled={isSubmitting} onClick={() => setIsTicketFormOpen(false)} className="px-10 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-800 transition-colors">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="bg-maxxi-primary text-white font-black px-16 py-4 rounded-[1.5rem] shadow-2xl shadow-red-200 hover:bg-red-700 uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center gap-3">{isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}{isSubmitting ? 'Memproses...' : 'Simpan Laporan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
  };

  const renderTicketDetail = () => {
    if (!selectedTicket) return null;
    const isWip = selectedTicket.status === 'IN_PROGRESS';
    const report = selectedTicket.report;
    const actionPoints = selectedTicket.correctiveAction ? selectedTicket.correctiveAction.split('\n') : [];
    const evidencePhotos = selectedTicket.evidenceUrls || [];

    const handleUpdatePoint = (idx: number, val: string) => {
        const points = [...actionPoints];
        points[idx] = val;
        handleUpdateTicketData(selectedTicket.id, { correctiveAction: points.join('\n') });
    };

    const handleAddNewPoint = () => {
        const points = [...actionPoints, ''];
        handleUpdateTicketData(selectedTicket.id, { correctiveAction: points.join('\n') });
    };

    const handleRemovePoint = (idx: number) => {
        const points = actionPoints.filter((_, i) => i !== idx);
        handleUpdateTicketData(selectedTicket.id, { correctiveAction: points.join('\n') });
    };

    const addSparepartRow = () => {
        const current = report?.spareparts || [];
        handleUpdateReportData(selectedTicket.id, { spareparts: [...current, { code: '', name: '', qty: '', origin: '' }] });
    };

    const updateSparepartRow = (idx: number, field: keyof any, val: string) => {
        const current = [...(report?.spareparts || [])];
        current[idx] = { ...current[idx], [field]: val };
        handleUpdateReportData(selectedTicket.id, { spareparts: current });
    };

    const removeSparepartRow = (idx: number) => {
        const current = (report?.spareparts || []).filter((_, i) => i !== idx);
        handleUpdateReportData(selectedTicket.id, { spareparts: current });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2rem w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
                    <div className="flex gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border-4 border-white"><Wrench size={40} className="text-maxxi-primary" /></div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-black text-3xl text-slate-800 tracking-tight">{selectedTicket.ticketNumber}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTicket.status.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Digital Service Report - PT. MAXXI</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-maxxi-primary shadow-sm transition-all"><Printer size={20} /></button>
                        <button onClick={() => setSelectedTicket(null)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-800 shadow-sm transition-all"><X size={20}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" ref={ticketDetailRef}>
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b pb-12 border-slate-100">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><User size={80} /></div>
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <UserCheck size={16} className="text-blue-500" /> Profil Unit & Lokasi
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Customer</p><p className="text-sm font-bold text-slate-800">{selectedTicket.customerName}</p></div>
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">No. HP</p><p className="text-sm font-bold text-blue-600">{selectedTicket.customerPhone}</p></div>
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Model Unit</p><p className="text-sm font-bold text-slate-800 uppercase">{selectedTicket.productName}</p></div>
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">No. Rangka</p><p className="text-xs font-mono font-bold text-slate-600">{selectedTicket.chassisNumber}</p></div>
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">No. Mesin</p><p className="text-xs font-mono font-bold text-slate-600">{selectedTicket.engineNumber}</p></div>
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">HM Unit</p><p className="text-sm font-black text-maxxi-primary">{selectedTicket.hmReading} Jam</p></div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Alamat Lengkap (Desa/Kec/Kab/Prov)</p>
                                        <p className="text-xs font-bold text-slate-700 uppercase leading-relaxed">{selectedTicket.address}, {selectedTicket.village}, {selectedTicket.district}, {selectedTicket.city}, {selectedTicket.province}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner space-y-6">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Timer size={16} className="text-maxxi-primary" /> Waktu Pengerjaan
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Mulai Kerja</label>
                                            <input 
                                                disabled={!isWip}
                                                type="time" 
                                                className="w-full bg-white border-2 border-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-maxxi-primary outline-none shadow-sm"
                                                value={report?.startTime || ''}
                                                onChange={e => handleUpdateReportData(selectedTicket.id, { startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Selesai Kerja</label>
                                            <input 
                                                disabled={!isWip}
                                                type="time" 
                                                className="w-full bg-white border-2 border-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-maxxi-primary outline-none shadow-sm"
                                                value={report?.finishTime || ''}
                                                onChange={e => handleUpdateReportData(selectedTicket.id, { finishTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                disabled={!isWip}
                                                type="checkbox" 
                                                className="w-5 h-5 rounded text-maxxi-primary focus:ring-maxxi-primary"
                                                checked={report?.isWarranty || false}
                                                onChange={e => handleUpdateReportData(selectedTicket.id, { isWarranty: e.target.checked })}
                                            />
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-maxxi-primary transition-colors">Unit Masih Garansi</span>
                                        </label>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Teknisi Bertugas</p>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-green-600" /> {selectedTicket.assignedTo || 'Belum Ditugaskan'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileWarning size={16} className="text-amber-500" /> Diagnosa & Kronologi Kerusakan
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Komplain Kerusakan (User)</label>
                                    <textarea 
                                        readOnly
                                        rows={4}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-medium text-slate-600 outline-none resize-none italic"
                                        value={selectedTicket.description}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. Kronologi & Diagnosa (Teknisi)</label>
                                    <textarea 
                                        disabled={!isWip}
                                        rows={4}
                                        placeholder="Jelaskan kronologi penemuan masalah..."
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-800 outline-none focus:border-maxxi-primary transition-all resize-none shadow-sm"
                                        value={report?.chronologyDiagnosis || ''}
                                        onChange={e => handleUpdateReportData(selectedTicket.id, { chronologyDiagnosis: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. Hasil Akhir Pemeriksaan</label>
                                    <textarea 
                                        disabled={!isWip}
                                        rows={4}
                                        placeholder="Penyebab utama dan status akhir unit..."
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-800 outline-none focus:border-maxxi-primary transition-all resize-none shadow-sm"
                                        value={report?.technicalInspectionResult || ''}
                                        onChange={e => handleUpdateReportData(selectedTicket.id, { technicalInspectionResult: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Gauge size={16} className="text-blue-500" /> Form Pengecekan Teknis Standar
                            </h4>
                            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-blue-600"/> Pelumasan & Suhu</p>
                                    <div className="space-y-3">
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Tekanan Oli (Sblm/Ssdh)</label>
                                            <div className="flex gap-1 mt-1">
                                                <input disabled={!isWip} type="text" placeholder="0,4" className="w-1/2 p-2 rounded-lg border border-slate-200 text-xs font-black" value={report?.checklist.oilPressureBefore || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), oilPressureBefore: e.target.value }})} />
                                                <input disabled={!isWip} type="text" placeholder="0,4" className="w-1/2 p-2 rounded-lg border border-slate-200 text-xs font-black" value={report?.checklist.oilPressureAfter || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), oilPressureAfter: e.target.value }})} />
                                            </div>
                                        </div>
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Suhu Temp (C)</label>
                                            <input disabled={!isWip} type="text" placeholder="40" className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-black" value={report?.checklist.tempValue || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), tempValue: e.target.value }})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} className="text-slate-400"/> Kondisi Mesin</p>
                                    <div className="space-y-3">
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Kondisi Asap Knalpot</label>
                                            <select disabled={!isWip} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-bold" value={report?.checklist.smokeStatus || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), smokeStatus: e.target.value }})}>
                                                <option value="">-- Pilih --</option><option value="NORMAL">Normal</option><option value="ABNORMAL">Tidak Normal</option>
                                            </select>
                                        </div>
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Suara Mesin</label>
                                            <select disabled={!isWip} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-bold" value={report?.checklist.noiseStatus || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), noiseStatus: e.target.value }})}>
                                                <option value="">-- Pilih --</option><option value="NORMAL">Halus</option><option value="ABNORMAL">Kasar</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Droplets size={14} className="text-sky-500"/> Pendinginan</p>
                                    <div className="space-y-3">
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Air Radiator</label>
                                            <select disabled={!isWip} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-bold" value={report?.checklist.radiatorLevel || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), radiatorLevel: e.target.value }})}>
                                                <option value="">-- Pilih --</option><option value="CUKUP">Cukup</option><option value="KURANG">Kurang</option>
                                            </select>
                                        </div>
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Voltage Accu (V)</label>
                                            <input disabled={!isWip} type="text" placeholder="12V" className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-black" value={report?.checklist.batteryVoltage || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), batteryVoltage: e.target.value }})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Filter size={14} className="text-slate-400"/> Filtrasi</p>
                                    <div className="space-y-3">
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Filter Udara</label>
                                            <select disabled={!isWip} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-bold" value={report?.checklist.airFilterStatus || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), airFilterStatus: e.target.value }})}>
                                                <option value="">-- Pilih --</option><option value="BERSIH">Bersih</option><option value="KOTOR">Kotor</option>
                                            </select>
                                        </div>
                                        <div><label className="text-[8px] font-black text-slate-400 uppercase">Filter Solar</label>
                                            <select disabled={!isWip} className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-bold" value={report?.checklist.fuelFilterStatus || ''} onChange={e => handleUpdateReportData(selectedTicket.id, { checklist: { ...(report?.checklist as any), fuelFilterStatus: e.target.value }})}>
                                                <option value="">-- Pilih --</option><option value="GANTI">Ganti</option><option value="TIDAK">Tidak Ganti</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Verifikasi Bukti Form</p>
                                    <div className="space-y-2">
                                        {Object.entries(report?.evidenceChecklist || {}).map(([key, val]) => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                                <input disabled={!isWip} type="checkbox" checked={val as boolean} onChange={e => handleUpdateReportData(selectedTicket.id, { evidenceChecklist: { ...(report?.evidenceChecklist as any), [key]: e.target.checked }})} className="w-3 h-3 rounded text-maxxi-primary" />
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">{key.replace('photo', '').replace(/([A-Z])/g, ' $1')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Camera size={16} className="text-maxxi-primary" /> Bukti Visual Lapangan (Maks. 5 Foto)
                                </h4>
                                {isWip && evidencePhotos.length < 5 && (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handlePhotoUpload} 
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-maxxi-primary text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-md hover:bg-red-700 transition-all flex items-center gap-2"
                                        >
                                            <Upload size={14} /> Unggah Bukti Baru
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => {
                                    const photo = evidencePhotos[i];
                                    return (
                                        <div key={i} className={`aspect-square rounded-2xl border-2 overflow-hidden relative group shadow-sm ${photo ? 'border-white' : 'border-dashed border-slate-200 bg-slate-50 flex items-center justify-center'}`}>
                                            {photo ? (
                                                <>
                                                    <img src={photo} alt={`Bukti ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    {isWip && (
                                                        <button 
                                                            onClick={() => removePhoto(i)}
                                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1.5 text-center">
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">BUKTI {i+1}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Camera size={24} className="mx-auto text-slate-200 mb-1" />
                                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Slot Kosong</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Package size={16} className="text-maxxi-primary" /> Sparepart yang diganti
                                </h4>
                                {isWip && (
                                    <button onClick={addSparepartRow} className="flex items-center gap-2 text-maxxi-primary font-black text-[10px] uppercase tracking-widest hover:underline">
                                        <Plus size={14} /> Tambah Item Part
                                    </button>
                                )}
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">No</th>
                                            <th className="px-6 py-4">Kode Sparepart</th>
                                            <th className="px-6 py-4">Nama Barang</th>
                                            <th className="px-6 py-4 text-center">Qty</th>
                                            <th className="px-6 py-4">Buatan / Origin</th>
                                            {isWip && <th className="px-6 py-4 text-right">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {report?.spareparts.length === 0 ? (
                                            <tr>
                                                <td colSpan={isWip ? 6 : 5} className="px-6 py-10 text-center text-slate-400 italic">Belum ada penggantian sparepart tercatat.</td>
                                            </tr>
                                        ) : (
                                            report?.spareparts.map((part, pIdx) => (
                                                <tr key={pIdx}>
                                                    <td className="px-6 py-3 text-center font-bold text-slate-400">{pIdx + 1}</td>
                                                    <td className="px-6 py-3">
                                                        <input disabled={!isWip} type="text" className="w-full p-2 border-none bg-transparent font-mono text-xs font-bold focus:ring-0" placeholder="02.12.097..." value={part.code} onChange={e => updateSparepartRow(pIdx, 'code', e.target.value)} />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input disabled={!isWip} type="text" className="w-full p-2 border-none bg-transparent font-bold text-xs focus:ring-0" placeholder="OIL FILTER HST..." value={part.name} onChange={e => updateSparepartRow(pIdx, 'name', e.target.value)} />
                                                    </td>
                                                    <td className="px-6 py-3 text-center">
                                                        <input disabled={!isWip} type="text" className="w-16 p-2 border-none bg-transparent text-center font-black text-xs focus:ring-0" placeholder="1 PCS" value={part.qty} onChange={e => updateSparepartRow(pIdx, 'qty', e.target.value)} />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <input disabled={!isWip} type="text" className="w-full p-2 border-none bg-transparent font-bold text-xs focus:ring-0" placeholder="LAMPUNG / IMPORT" value={part.origin} onChange={e => updateSparepartRow(pIdx, 'origin', e.target.value)} />
                                                    </td>
                                                    {isWip && (
                                                        <td className="px-6 py-3 text-right">
                                                            <button onClick={() => removeSparepartRow(pIdx)} className="p-2 text-slate-300 hover:text-red-500"><X size={14} /></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 border-t border-slate-100 flex justify-between items-center sticky bottom-0 bg-white">
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                             Lihat Histori Service Unit
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleDownloadPDF} 
                            disabled={isDownloading}
                            className="bg-slate-800 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:bg-black uppercase tracking-widest text-[11px] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                        >
                            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {isDownloading ? 'Mempersiapkan PDF (A5)...' : 'Download Digital Report (A5)'}
                        </button>
                        {isWip && (
                            <button 
                                onClick={() => handleUpdateTicketData(selectedTicket.id, { status: 'RESOLVED', completionDate: new Date().toISOString().split('T')[0] })}
                                className="bg-green-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 uppercase tracking-widest text-[11px] active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Check size={20} /> Selesaikan Pengerjaan
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media screen {
                    .pdf-only-header, .pdf-only-footer { display: none !important; }
                }
                @media print {
                    .pdf-only-header { display: flex !important; }
                    .pdf-only-footer { display: block !important; }
                }
            `}} />
        </div>
    );
  };

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-500">
        {['OPEN', 'READY_TO_PROCESS', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED'].map(status => {
            const statusTickets = filteredTickets.filter(t => t.status === status);
            const labels: any = { 'OPEN': 'BARU', 'READY_TO_PROCESS': 'ANTRIAN', 'IN_PROGRESS': 'DIKERJAKAN', 'WAITING_PARTS': 'PENDING PART', 'RESOLVED': 'SELESAI' };
            const colors: any = { 'OPEN': 'bg-red-50 border-red-200', 'READY_TO_PROCESS': 'bg-indigo-50 border-indigo-200', 'IN_PROGRESS': 'bg-blue-50 border-blue-200', 'WAITING_PARTS': 'bg-amber-50 border-amber-200', 'RESOLVED': 'bg-green-50 border-green-200' };

            return (
                <div 
                    key={status} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    className={`rounded-[2rem] p-4 border min-h-[550px] flex flex-col transition-all ${draggedTicketId ? 'border-dashed ring-2 ring-indigo-50 ring-offset-2' : ''} ${colors[status]}`}
                >
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="font-black text-slate-700 text-[11px] uppercase tracking-[0.15em]">{labels[status]}</h3>
                        <span className="bg-white/80 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">{statusTickets.length}</span>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                        {statusTickets.map(ticket => {
                            const sla = getSLAStatus(ticket.createdAt, ticket.status);
                            return (
                                <div 
                                    key={ticket.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                                    onClick={() => setSelectedTicket(ticket)} 
                                    className={`bg-white p-5 rounded-[1.8rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-maxxi-primary transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${draggedTicketId === ticket.id ? 'opacity-30 scale-95 border-maxxi-primary border-2' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-slate-400 tracking-tighter">{ticket.ticketNumber}</span>
                                        <div className="flex items-center gap-1">
                                            <GripVertical size={12} className="text-slate-200 group-hover:text-slate-400" />
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${ticket.priority === 'CRITICAL' ? 'bg-red-600 text-white border-red-700' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{ticket.priority}</span>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-sm leading-tight mb-3 line-clamp-2 group-hover:text-maxxi-primary transition-colors">{ticket.subject}</h4>
                                    <div className="bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                                        <p className="font-bold text-slate-700 text-xs truncate uppercase tracking-tighter">{ticket.productName}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">HM: <span className="text-slate-600 font-bold">{ticket.hmReading}</span></p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${sla.color} mb-3`}>
                                        {sla.icon && <sla.icon size={10} />} {sla.label}
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-50">
                                        <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(ticket.complaintDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                        <span className="truncate max-w-[80px]">{ticket.assignedTo || 'Unassigned'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
    </div>
  );

  const renderListView = () => {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-5">No. Tiket</th>
                            <th className="px-6 py-5">Tgl Komplain</th>
                            <th className="px-6 py-5">Pelanggan & Lokasi</th>
                            <th className="px-6 py-5">Produk & HM</th>
                            <th className="px-6 py-5">Keluhan Utama</th>
                            <th className="px-6 py-5">Status & PIC</th>
                            <th className="px-6 py-5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredTickets.map(ticket => {
                            const sla = getSLAStatus(ticket.createdAt, ticket.status);
                            return (
                                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                                                <Wrench size={18} className="group-hover:text-maxxi-primary" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800">{ticket.ticketNumber}</p>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{ticket.priority}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-bold text-slate-600">{new Date(ticket.complaintDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase mt-1 ${sla.color}`}>{sla.icon && <sla.icon size={12}/>} {sla.label}</div>
                                    </td>
                                    <td className="px-6 py-5"><p className="font-black text-slate-800 uppercase tracking-tighter">{ticket.customerName}</p><div className="flex items-center gap-1 text-xs text-slate-400 font-medium"><MapPin size={12} /> {ticket.city}, {ticket.province}</div></td>
                                    <td className="px-6 py-5"><p className="font-bold text-slate-700 text-xs uppercase">{ticket.productName}</p><p className="text-[10px] font-black text-maxxi-primary uppercase mt-1">{ticket.hmReading} Jam</p></td>
                                    <td className="px-6 py-5 max-w-xs"><p className="font-black text-slate-800 text-xs line-clamp-1 group-hover:text-maxxi-primary transition-colors">{ticket.subject}</p></td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            <span className={`w-fit px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{ticket.status.replace(/_/g, ' ')}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter"><User size={12} /> {ticket.assignedTo || 'Belum Ditugaskan'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right"><button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><ChevronRight size={20} /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderSummaryPanel = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-in fade-in duration-500">
        {[{l: 'Total Tiket', v: stats.total, c: 'slate', i: Wrench}, {l: 'Tiket Baru', v: stats.open, c: 'red', i: AlertCircle}, {l: 'Dikerjakan', v: stats.processing, c: 'blue', i: Timer}, {l: 'Pending Part', v: stats.waitingParts, c: 'amber', i: Package}, {l: 'Selesai', v: stats.resolved, c: 'green', i: CheckCircle}, {l: 'Kritis', v: stats.critical, v2: 'Alert', c: 'red', i: AlertTriangle, s: true}].map((s, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-3xl border border-${s.c}-100 shadow-sm flex flex-col justify-between group ${s.s ? 'bg-red-600 border-red-700 shadow-xl' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${s.s ? 'text-red-100' : `text-${s.c}-400`}`}>{s.l}</p>
                    <div className={`p-1.5 rounded-lg ${s.s ? 'bg-white/20 text-white' : `bg-${s.c}-50 text-${s.c}-400 group-hover:text-${s.c}-600`}`}><s.i size={14}/></div>
                </div>
                <p className={`text-2xl font-black ${s.s ? 'text-white' : `text-${s.c}-800`}`}>{s.v}</p>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
            <button onClick={() => setActiveTab('TICKETS')} className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'TICKETS' ? 'bg-maxxi-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Manajemen Tiket</button>
            <button onClick={() => setActiveTab('FLEET')} className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'FLEET' ? 'bg-maxxi-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Monitor Armada</button>
        </div>
        <button onClick={() => setIsTicketFormOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95"><Plus size={18} /> Registrasi Komplain</button>
      </div>

      {activeTab === 'TICKETS' && (
          <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full"><Search className="absolute left-4 top-3 text-slate-400" size={20} /><input type="text" placeholder="Cari Tiket, No Seri, atau Nama Pelanggan..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-maxxi-primary outline-none font-bold shadow-inner" value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} /></div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm flex-1 md:flex-none">
                            <button onClick={() => setViewMode('KANBAN')} className={`flex-1 md:px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'KANBAN' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid size={16} /> Kanban</button>
                            <button onClick={() => setViewMode('LIST')} className={`flex-1 md:px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'LIST' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}><List size={16} /> List</button>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><ArrowUpDown size={16} className="text-slate-400" /><select value={ticketSort} onChange={(e) => setTicketSort(e.target.value)} className="text-xs font-black uppercase text-slate-700 bg-transparent outline-none cursor-pointer tracking-widest"><option value="NEWEST">Terbaru</option><option value="PRIORITY">Prioritas</option></select></div>
                    </div>
                </div>
                <div className="h-px bg-slate-100 w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Globe size={10}/> Regional</label><select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-maxxi-primary transition-all" value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setSubRegionFilter('ALL'); }}><option value="ALL">Semua Regional</option>{REGIONAL_ZONES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MapPin size={10}/> Sub-Regional</label><select disabled={regionFilter === 'ALL'} className="w-full bg-slate-50 disabled:opacity-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-maxxi-primary transition-all" value={subRegionFilter} onChange={e => setSubRegionFilter(e.target.value)}><option value="ALL">Semua Sub-Reg</option>{selectedRegion?.subRegions?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><UserCheck size={10}/> Nama Pelapor</label><input type="text" placeholder="Cari pelapor..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-maxxi-primary transition-all" value={reporterFilter} onChange={e => setReporterFilter(e.target.value)} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Tractor size={10}/> Produk</label><select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-maxxi-primary transition-all" value={productFilter} onChange={e => setProductFilter(e.target.value)}><option value="ALL">Semua Produk</option>{MOCK_PRODUCTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><ShieldCheck size={10}/> PIC Mekanik</label><select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-maxxi-primary transition-all" value={picFilter} onChange={e => setPicFilter(e.target.value)}><option value="ALL">Semua PIC</option>{MOCK_MECHANICS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}<option value="Unassigned">Belum Ditugaskan</option></select></div>
                </div>
            </div>

            {renderSummaryPanel()}
            <div className="min-h-[500px]">
                {filteredTickets.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center animate-in zoom-in duration-300">
                        <Search size={64} className="mx-auto text-slate-200 mb-6 opacity-20" /><h2 className="text-xl font-black text-slate-400 uppercase tracking-tight">Tidak ada tiket ditemukan</h2>
                    </div>
                ) : (viewMode === 'KANBAN' ? renderKanbanView() : renderListView())}
            </div>
          </div>
      )}
      
      {renderTicketForm()}
      {renderTicketDetail()}
      {renderTransitionModal()}
    </div>
  );
};

export default AfterSalesService;
