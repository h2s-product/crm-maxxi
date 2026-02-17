
import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { FileBarChart, Download, Calendar, Filter, TrendingUp, TrendingDown, Target, Award, PieChart as PieIcon, Activity, Wrench, Package, Briefcase, ChevronRight, FileText, Printer, Search, Globe, Users, Loader2 } from 'lucide-react';
import { REGIONAL_ZONES, MOCK_DEALS, MOCK_SERVICE_TICKETS, MOCK_PRODUCTS } from '../mockData';
import { MaxxiLogo } from './Layout';

const ReportCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'SALES' | 'PIPELINE' | 'SERVICE' | 'INVENTORY'>('SALES');
    const [dateRange, setDateRange] = useState('THIS_MONTH');
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const COLORS = ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

    // Mock Data for Reports
    const salesPerformanceData = [
        { month: 'Jan', revenue: 4200000000, target: 4000000000 },
        { month: 'Feb', revenue: 3800000000, target: 4000000000 },
        { month: 'Mar', revenue: 5100000000, target: 4500000000 },
        { month: 'Apr', revenue: 4900000000, target: 4500000000 },
        { month: 'May', revenue: 6200000000, target: 5000000000 },
    ];

    const conversionData = [
        { name: 'Win', value: 65, color: '#10b981' },
        { name: 'Lost', value: 20, color: '#dc2626' },
        { name: 'No-Response', value: 15, color: '#94a3b8' },
    ];

    const serviceSLAData = [
        { category: 'Engine', sla: 92, count: 45 },
        { category: 'GPS/RTK', sla: 85, count: 32 },
        { category: 'Hydraulic', sla: 78, count: 18 },
        { category: 'Electrical', sla: 88, count: 24 },
        { category: 'Body', sla: 95, count: 12 },
    ];

    const inventoryFlowData = [
        { name: 'XAG P60', stock: 15, sold: 12 },
        { name: 'Bimo 110X', stock: 8, sold: 10 },
        { name: 'Traktor 4WD', stock: 22, sold: 18 },
        { name: 'Antasena', stock: 12, sold: 5 },
        { name: 'XAG R100', stock: 5, sold: 2 },
    ];

    const formatCurrency = (val: number) => `Rp ${(val / 1000000000).toFixed(1)}M`;

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `MAXXI_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        try {
            // @ts-ignore
            await html2pdf().set(opt).from(reportRef.current).save();
        } catch (error) {
            console.error("Export failed", error);
            alert("Gagal mengunduh laporan. Silakan coba lagi.");
        } finally {
            setIsExporting(false);
        }
    };

    const renderSalesReports = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tren Pendapatan Nasional</h3>
                            <p className="text-xs text-slate-500 font-bold">Realisasi vs Target Bulanan 2025</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-maxxi-primary"></div><span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-[10px] font-black text-slate-400 uppercase">Target</span></div>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesPerformanceData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000000000}M`} />
                                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={150} /></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">KPI Pencapaian</p>
                        <div className="space-y-8">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Revenue (YTD)</p>
                                <h4 className="text-4xl font-black text-maxxi-primary tracking-tighter">Rp 24.2M</h4>
                                <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs mt-2">
                                    <TrendingUp size={14} /> +12.5% YoY
                                </div>
                            </div>
                            <div className="h-px bg-white/10 w-full"></div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Pencapaian Target Nasional</p>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="text-4xl font-black tracking-tighter">92.5%</h4>
                                    <p className="text-xs text-slate-500 font-bold uppercase">GAP: 7.5%</p>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-maxxi-primary h-full" style={{width: '92.5%'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <Globe size={20} className="text-blue-500" /> Matriks Performa Regional
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Regional</th>
                                <th className="px-6 py-5 text-right">Revenue (IDR)</th>
                                <th className="px-6 py-5 text-right">Target (IDR)</th>
                                <th className="px-6 py-5 text-center">Achievement</th>
                                <th className="px-6 py-5 text-center">Growth</th>
                                <th className="px-8 py-5 text-right">Unit Terjual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                            {REGIONAL_ZONES.map((reg, idx) => (
                                <tr key={reg.id} className="hover:bg-slate-50 transition-all cursor-pointer group">
                                    <td className="px-8 py-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">{reg.name.charAt(0)}</div>
                                        {reg.name}
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">{(3.2 - (idx * 0.3)).toFixed(1)}M</td>
                                    <td className="px-6 py-5 text-right text-slate-400">{(3.5 - (idx * 0.2)).toFixed(1)}M</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3 px-4">
                                            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-maxxi-primary h-full" style={{width: `${95 - (idx * 5)}%`}}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 w-8">{95 - (idx * 5)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${idx % 3 === 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                            {idx % 3 === 0 ? `+${idx + 2}%` : `-${idx + 1}%`}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-slate-800">{15 - idx} <span className="text-[10px] text-slate-400 ml-1">Unit</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderPipelineReports = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Analisis Konversi Deal</h3>
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="h-64 w-full md:w-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={conversionData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {conversionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Overall</span>
                            <span className="text-2xl font-black text-slate-800">65%</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        {conversionData.map(item => (
                            <div key={item.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-800">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Kecepatan Siklus Deal (Hari)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { stage: 'Inquiry', days: 2 },
                            { stage: 'Demo', days: 12 },
                            { stage: 'Leasing', days: 14 },
                            { stage: 'DP Received', days: 5 },
                            { stage: 'Delivery', days: 7 },
                            { stage: 'Handover', days: 2 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                            <Tooltip />
                            <Bar dataKey="days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Briefcase size={20}/></div>
                    <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Rata-rata Waktu Closing</p>
                        <p className="text-lg font-black text-blue-900">42 Hari <span className="text-xs text-blue-400 font-bold ml-1 uppercase">Sangat Efisien</span></p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderServiceReports = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Compliance</p>
                    <p className="text-3xl font-black text-green-600">88.5%</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Time Avg</p>
                    <p className="text-3xl font-black text-blue-600">3.2j</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolution Time Avg</p>
                    <p className="text-3xl font-black text-amber-600">42.5j</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Repeat Issues Rate</p>
                    <p className="text-3xl font-black text-red-600">4.2%</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Audit Kategori Masalah Teknis</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceSLAData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="category" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} />
                            <Bar dataKey="count" name="Jumlah Kasus" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="sla" name="% SLA On-Time" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderInventoryReports = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Status Alokasi Inventaris (Supply vs Demand)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryFlowData} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                            <Tooltip />
                            <Legend align="right" verticalAlign="top" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                            <Bar dataKey="stock" name="Stok Tersedia" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sold" name="Unit Terjual" fill="#dc2626" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Unit Paling Laris (Top Velocity)</h3>
                    <div className="space-y-4">
                        {inventoryFlowData.sort((a,b) => b.sold - a.sold).map((item, idx) => (
                            <div key={item.name} className="flex items-center gap-4 group">
                                <span className="w-6 text-sm font-black text-slate-300">{idx + 1}</span>
                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-maxxi-primary transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.name}</span>
                                        <span className="text-sm font-black text-maxxi-primary">{item.sold} Unit</span>
                                    </div>
                                    <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-maxxi-primary h-full" style={{width: `${(item.sold / 20) * 100}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Report Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
                    <button 
                        onClick={() => setActiveTab('SALES')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SALES' ? 'bg-[#D32F2F] text-white shadow-lg' : 'text-slate-500 hover:text-[#D32F2F] hover:bg-red-50' }`}
                    >
                        <TrendingUp size={16} /> Penjualan
                    </button>
                    <button 
                        onClick={() => setActiveTab('PIPELINE')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'PIPELINE' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Briefcase size={16} /> Pipeline
                    </button>
                    <button 
                        onClick={() => setActiveTab('SERVICE')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SERVICE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Wrench size={16} /> Layanan
                    </button>
                    <button 
                        onClick={() => setActiveTab('INVENTORY')} 
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Package size={16} /> Inventaris
                    </button>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <Calendar size={14} className="text-slate-400" />
                        <select 
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="THIS_MONTH">Bulan Ini</option>
                            <option value="LAST_3_MONTHS">3 Bulan Terakhir</option>
                            <option value="YTD">Year to Date (2025)</option>
                            <option value="FULL_2024">Tahun 2024</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        {isExporting ? 'Generating...' : 'Cetak Laporan'}
                    </button>
                </div>
            </div>

            {/* TAB CONTENT WRAPPER FOR PDF EXPORT */}
            <div className="min-h-[500px]" ref={reportRef}>
                {/* Print Header (Visible only in PDF) */}
                <div className="hidden print-only-header mb-8 p-6 bg-slate-50 border-b-4 border-maxxi-primary rounded-t-3xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MaxxiLogo variant="primary" className="h-10" />
                        <div className="h-10 w-px bg-slate-300"></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Official Intelligence Report</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori: {activeTab} • Periode: {dateRange}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Printed by: System Intelligence</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Timestamp: {new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {/* Actual Tab Content */}
                <div className="p-1">
                    {activeTab === 'SALES' && renderSalesReports()}
                    {activeTab === 'PIPELINE' && renderPipelineReports()}
                    {activeTab === 'SERVICE' && renderServiceReports()}
                    {activeTab === 'INVENTORY' && renderInventoryReports()}
                </div>

                {/* Print Footer (Visible only in PDF) */}
                <div className="hidden print-only-header mt-12 pt-6 border-t border-slate-200 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">PT. CORIN MULIA GEMILANG - CONFIDENTIAL DOCUMENT</p>
                </div>
            </div>

            {/* Print Styles for html2pdf compatibility */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .print-only-header { display: flex !important; }
                }
                /* Additional styling to force print visibility during conversion */
                #root .print-only-header { display: none; }
            `}} />
        </div>
    );
};

export default ReportCenter;
