
import React, { useState, useRef } from 'react';
import { MOCK_CUSTOMERS } from '../mockData';
import { CustomerType } from '../types';
import { 
    Megaphone, Calendar, Clock, Send, Users, MessageSquare, 
    CheckCircle, AlertCircle, Search, Filter, Plus, FileText, Smartphone, Image as ImageIcon, Upload, X, Trash2, Link as LinkIcon, ExternalLink, File
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    type: 'PROMO' | 'INFO' | 'REMINDER';
    audience: string;
    status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
    scheduledDate?: string;
    sentCount: number;
    totalAudience: number;
    createdAt: string;
    bannerUrl?: string;
    pdfUrl?: string;
    pdfName?: string;
    ctaLink?: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'cp-1',
        name: 'Promo Merdeka - Traktor 4WD',
        type: 'PROMO',
        audience: 'All Gapoktan',
        status: 'SENT',
        sentCount: 145,
        totalAudience: 150,
        createdAt: '2025-05-01',
        ctaLink: 'https://maxxi.co.id/promo-merdeka'
    },
    {
        id: 'cp-2',
        name: 'Reminder Tagihan Kredit Mei',
        type: 'REMINDER',
        audience: 'Credit Customers (Due < 7 days)',
        status: 'SCHEDULED',
        scheduledDate: '2025-06-25T09:00',
        sentCount: 0,
        totalAudience: 12,
        createdAt: '2025-05-20'
    }
];

const CampaignManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    
    // Form State
    const [form, setForm] = useState({
        name: '',
        targetAudience: 'ALL',
        messageType: 'PROMO',
        message: '',
        ctaLink: '',
        scheduleType: 'NOW', // NOW | LATER
        scheduleDate: '',
        scheduleTime: '',
        bannerUrl: null as string | null,
        pdfUrl: null as string | null,
        pdfName: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Audience Calculation
    const getEstimatedAudience = (audienceType: string) => {
        switch(audienceType) {
            case 'ALL': return MOCK_CUSTOMERS.length + 142; // Simulated total
            case 'GAPOKTAN': return MOCK_CUSTOMERS.filter(c => c.type === CustomerType.GAPOKTAN).length + 45;
            case 'DEALER': return MOCK_CUSTOMERS.filter(c => c.type === CustomerType.DEALER).length + 10;
            case 'CREDIT_DUE': return 8; // Mock calculated credit customers
            default: return 0;
        }
    };

    const templates = {
        'PROMO': "Halo {name}, Dapatkan diskon spesial 10% untuk pembelian Traktor Maxxi bulan ini! Klik link di bawah atau lihat katalog PDF terlampir.",
        'INFO': "Info Terbaru: Kini tersedia XAG P100 Pro di gudang kami. Spesifikasi teknis lengkap ada pada lampiran PDF di bawah ini.",
        'REMINDER': "Yth. {name}, mengingatkan bahwa tagihan cicilan unit {unit_name} Anda akan jatuh tempo. Invoice resmi terlampir dalam format PDF."
    };

    const handleTemplateSelect = (type: string) => {
        setForm(prev => ({
            ...prev,
            messageType: type,
            message: templates[type as keyof typeof templates]
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setForm(prev => ({ ...prev, bannerUrl: url }));
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            setForm(prev => ({ ...prev, pdfUrl: url, pdfName: file.name }));
        } else if (file) {
            alert("Hanya file PDF yang diperbolehkan.");
        }
    };

    const removeBanner = () => {
        if (form.bannerUrl) URL.revokeObjectURL(form.bannerUrl);
        setForm(prev => ({ ...prev, bannerUrl: null }));
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removePdf = () => {
        if (form.pdfUrl) URL.revokeObjectURL(form.pdfUrl);
        setForm(prev => ({ ...prev, pdfUrl: null, pdfName: '' }));
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API Call
        setTimeout(() => {
            const newCampaign: Campaign = {
                id: `cp-${Date.now()}`,
                name: form.name,
                type: form.messageType as any,
                audience: form.targetAudience,
                status: form.scheduleType === 'NOW' ? 'SENT' : 'SCHEDULED',
                sentCount: form.scheduleType === 'NOW' ? getEstimatedAudience(form.targetAudience) : 0,
                totalAudience: getEstimatedAudience(form.targetAudience),
                scheduledDate: form.scheduleType === 'LATER' ? `${form.scheduleDate}T${form.scheduleTime}` : undefined,
                createdAt: new Date().toISOString(),
                bannerUrl: form.bannerUrl || undefined,
                pdfUrl: form.pdfUrl || undefined,
                pdfName: form.pdfName || undefined,
                ctaLink: form.ctaLink || undefined
            };

            setCampaigns([newCampaign, ...campaigns]);
            setIsSubmitting(false);
            setActiveTab('LIST');
            
            // Reset Form
            setForm({
                name: '',
                targetAudience: 'ALL',
                messageType: 'PROMO',
                message: '',
                ctaLink: '',
                scheduleType: 'NOW',
                scheduleDate: '',
                scheduleTime: '',
                bannerUrl: null,
                pdfUrl: null,
                pdfName: ''
            });
        }, 1500);
    };

    const renderCreateForm = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="text-maxxi-primary" /> Buat Kampanye Baru
                </h3>
                <button onClick={() => setActiveTab('LIST')} className="text-sm text-slate-500 hover:text-slate-800 font-bold uppercase tracking-widest">
                    Batal
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nama Kampanye</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Contoh: Promo Akhir Tahun 2025"
                            className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none transition-all font-bold text-slate-700"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                            <select 
                                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none bg-white font-bold text-slate-700"
                                value={form.targetAudience}
                                onChange={e => setForm({...form, targetAudience: e.target.value})}
                            >
                                <option value="ALL">Semua Kontak</option>
                                <option value="GAPOKTAN">Hanya Gapoktan</option>
                                <option value="DEALER">Hanya Dealer</option>
                                <option value="CREDIT_DUE">Pelanggan Kredit (Jatuh Tempo)</option>
                            </select>
                            <div className="mt-2 text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                                <Users size={12} /> Estimasi Penerima: <span className="text-maxxi-primary font-black">{getEstimatedAudience(form.targetAudience)} Kontak</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Media & Lampiran</label>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Image Upload */}
                                <div className="flex flex-col gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all group ${form.bannerUrl ? 'border-maxxi-primary bg-red-50' : 'border-slate-200'}`}
                                    >
                                        {form.bannerUrl ? <ImageIcon size={18} className="text-maxxi-primary" /> : <Upload size={18} className="text-slate-400 group-hover:text-maxxi-primary" />}
                                        <span className={`text-[9px] font-black uppercase ${form.bannerUrl ? 'text-maxxi-primary' : 'text-slate-400'}`}>{form.bannerUrl ? 'Ganti Banner' : 'Upload Banner'}</span>
                                    </button>
                                    {form.bannerUrl && (
                                        <button type="button" onClick={removeBanner} className="text-[8px] text-red-500 font-black uppercase hover:underline">Hapus Gambar</button>
                                    )}
                                </div>
                                
                                {/* PDF Upload */}
                                <div className="flex flex-col gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => pdfInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all group ${form.pdfUrl ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
                                    >
                                        {form.pdfUrl ? <FileText size={18} className="text-blue-600" /> : <File size={18} className="text-slate-400 group-hover:text-blue-600" />}
                                        <span className={`text-[9px] font-black uppercase ${form.pdfUrl ? 'text-blue-600' : 'text-slate-400'}`}>{form.pdfUrl ? 'Ganti PDF' : 'Upload PDF'}</span>
                                    </button>
                                    {form.pdfUrl && (
                                        <button type="button" onClick={removePdf} className="text-[8px] text-red-500 font-black uppercase hover:underline">Hapus Dokumen</button>
                                    )}
                                </div>

                                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link Tautan / URL (CTA)</label>
                        <div className="relative">
                            <LinkIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                            <input 
                                type="url" 
                                placeholder="https://maxxi.co.id/produk/traktor-4wd"
                                className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 focus:border-maxxi-primary outline-none transition-all font-mono text-xs text-blue-600 font-bold"
                                value={form.ctaLink}
                                onChange={e => setForm({...form, ctaLink: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Isi Pesan Siaran</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => handleTemplateSelect('PROMO')} className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 uppercase tracking-tight">Promo</button>
                                <button type="button" onClick={() => handleTemplateSelect('INFO')} className="text-[9px] font-black bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100 hover:bg-slate-100 uppercase tracking-tight">Info Produk</button>
                                <button type="button" onClick={() => handleTemplateSelect('REMINDER')} className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 hover:bg-amber-100 uppercase tracking-tight">Tagihan</button>
                            </div>
                        </div>
                        <textarea 
                            required
                            rows={6}
                            placeholder="Tulis pesan broadcast Anda di sini..."
                            className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-maxxi-primary outline-none resize-none font-sans text-sm text-slate-700 leading-relaxed"
                            value={form.message}
                            onChange={e => setForm({...form, message: e.target.value})}
                        ></textarea>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Gunakan variabel <b>{`{name}`}</b> untuk personalisasi.</p>
                    </div>
                </div>

                {/* Right Column: Scheduling & Preview */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Waktu Pengiriman</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-maxxi-primary transition-all">
                                <input 
                                    type="radio" 
                                    name="schedule" 
                                    checked={form.scheduleType === 'NOW'}
                                    onChange={() => setForm({...form, scheduleType: 'NOW'})}
                                    className="text-maxxi-primary focus:ring-maxxi-primary w-5 h-5"
                                />
                                <div className="flex-1">
                                    <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">Kirim Sekarang</span>
                                </div>
                                <Send size={16} className="text-slate-300" />
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-maxxi-primary transition-all">
                                <input 
                                    type="radio" 
                                    name="schedule" 
                                    checked={form.scheduleType === 'LATER'}
                                    onChange={() => setForm({...form, scheduleType: 'LATER'})}
                                    className="text-maxxi-primary focus:ring-maxxi-primary w-5 h-5"
                                />
                                <div className="flex-1">
                                    <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">Jadwalkan</span>
                                </div>
                                <Calendar size={16} className="text-slate-300" />
                            </label>

                            {form.scheduleType === 'LATER' && (
                                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                                    <input type="date" required className="border-2 border-slate-100 rounded-lg px-2 py-2 text-xs outline-none focus:border-maxxi-primary font-bold" value={form.scheduleDate} onChange={e => setForm({...form, scheduleDate: e.target.value})} />
                                    <input type="time" required className="border-2 border-slate-100 rounded-lg px-2 py-2 text-xs outline-none focus:border-maxxi-primary font-bold" value={form.scheduleTime} onChange={e => setForm({...form, scheduleTime: e.target.value})} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* WHATSAPP PREVIEW */}
                    <div className="bg-[#e5ddd5] dark:bg-slate-800 p-4 rounded-3xl border border-slate-200/50 relative overflow-hidden min-h-[300px]">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10"><Smartphone size={14} /> WhatsApp Preview</h4>

                        <div className="bg-white rounded-2xl shadow-md p-2 max-w-[95%] relative z-10 animate-in zoom-in duration-300 space-y-2">
                            {form.bannerUrl && (
                                <div className="rounded-xl overflow-hidden aspect-video border border-slate-50">
                                    <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                </div>
                            )}
                            
                            {form.pdfUrl && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-left-2">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-800 truncate">{form.pdfName || 'Dokumen.pdf'}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">PDF • 1.2 MB</p>
                                    </div>
                                </div>
                            )}

                            <div className="px-2 py-1">
                                <div className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                                    {form.message || <span className="text-slate-300 italic">Isi pesan akan tampil di sini...</span>}
                                    {form.ctaLink && (
                                        <div className="mt-2 pt-2 border-t border-slate-100">
                                            <span className="text-blue-600 font-medium break-all flex items-center gap-1"><ExternalLink size={12} /> {form.ctaLink}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right mt-1.5 flex justify-end items-center gap-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">09:00</span>
                                    <CheckCircle size={12} className="text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || !form.message || !form.name}
                        className="w-full bg-maxxi-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 uppercase tracking-[0.1em] text-sm"
                    >
                        {isSubmitting ? 'Memproses Blast...' : (form.scheduleType === 'NOW' ? 'Kirim Siaran Sekarang' : 'Simpan Jadwal Siaran')}
                        {!isSubmitting && <Send size={20} />}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderList = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-maxxi-primary transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Send size={24} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Terkirim</p>
                            <p className="text-3xl font-black text-slate-800">2,450</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-maxxi-primary transition-all">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Antrian Jadwal</p>
                            <p className="text-3xl font-black text-slate-800">{campaigns.filter(c => c.status === 'SCHEDULED').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-maxxi-primary transition-all">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform"><MessageSquare size={24} /></div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Response Rate</p>
                            <p className="text-3xl font-black text-green-600">12.5%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter">Arsip Kampanye & Broadcast</h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input type="text" placeholder="Cari arsip..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-maxxi-primary bg-white font-medium" />
                            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-maxxi-primary shadow-sm"><Filter size={18} /></button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-[10px] text-slate-400 font-black border-b border-slate-100 uppercase tracking-[0.15em]">
                            <tr>
                                <th className="px-8 py-4">Informasi Kampanye</th>
                                <th className="px-6 py-4">Target Audience</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Media/Link</th>
                                <th className="px-6 py-4 text-center">Performa</th>
                                <th className="px-8 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                                {campaign.bannerUrl ? (
                                                    <img src={campaign.bannerUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-300" /></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm leading-tight mb-1">{campaign.name}</div>
                                                <div className="flex items-center gap-1.5">
                                                    {campaign.type === 'PROMO' && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">PROMO</span>}
                                                    {campaign.type === 'REMINDER' && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase">REMINDER</span>}
                                                    {campaign.type === 'INFO' && <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase">INFO</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{campaign.audience.replace('_', ' ')}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{campaign.totalAudience} Kontak</div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {campaign.status === 'SENT' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black bg-green-50 text-green-700 border border-green-200 uppercase">
                                                <CheckCircle size={10} /> Terkirim
                                            </span>
                                        )}
                                        {campaign.status === 'SCHEDULED' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                                                <Clock size={10} /> Terjadwal
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-2">
                                            {campaign.ctaLink && <span title="Link CTA" className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100"><LinkIcon size={12}/></span>}
                                            {campaign.pdfUrl && <span title="Lampiran PDF" className="p-1.5 bg-red-50 text-red-600 rounded border border-red-100"><FileText size={12}/></span>}
                                            {!campaign.ctaLink && !campaign.pdfUrl && <span className="text-[10px] text-slate-300 uppercase font-black">Plain</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {campaign.status === 'SENT' ? (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[9px] font-black text-slate-400">
                                                    <span>DELIVERED</span>
                                                    <span>{Math.round((campaign.sentCount / campaign.totalAudience) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(campaign.sentCount / campaign.totalAudience) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase"><Calendar size={12}/> {new Date(campaign.createdAt).toLocaleDateString('id-ID')}</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-maxxi-primary hover:bg-red-50 rounded-lg transition-all"><FileText size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Broadcast & Kampanye Pesan</h1>
                    <p className="text-slate-500 text-sm font-medium">Kirim promosi, update produk, dan dokumen purna jual secara massal.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('LIST')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                        Riwayat
                    </button>
                    <button 
                        onClick={() => setActiveTab('CREATE')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CREATE' ? 'bg-maxxi-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                        Buat Baru
                    </button>
                </div>
            </div>

            {activeTab === 'LIST' ? renderList() : renderCreateForm()}
        </div>
    );
};

export default CampaignManager;
