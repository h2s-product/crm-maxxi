
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line } from 'recharts';
import { MapPin, Signal, Battery, Wrench, AlertTriangle, Tractor, DollarSign, Activity, TrendingUp, Globe, ChevronDown, ChevronUp, Store, Trophy, User, Users, Target, Briefcase, ChevronRight, CheckCircle, AlertCircle, Timer, BarChart3, ArrowUpRight, ArrowDownRight, Medal, Percent } from 'lucide-react';
import { MOCK_UNITS, MOCK_SHOWROOMS, MOCK_USERS, MOCK_SERVICE_TICKETS, MOCK_DEALS, REGIONAL_ZONES } from '../mockData';
import { UserRole, DashboardWidgetConfig, DealStage, RegionalZone, SubRegional, Showroom } from '../types';
import React, { useState } from 'react';

interface DashboardProps {
  onNavigate?: (page: string, params?: any) => void;
  widgetConfigs: DashboardWidgetConfig[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, widgetConfigs }) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [expandedSubRegion, setExpandedSubRegion] = useState<string | null>(null);

  const isVisible = (id: string) => widgetConfigs.find(w => w.id === id)?.isVisible ?? true;

  // Mock Data untuk Performa 2026 (Pendapatan vs Target)
  const performance2026Data = [
    { month: 'Jan', revenue: 4200, target: 4000 },
    { month: 'Feb', revenue: 4800, target: 4200 },
    { month: 'Mar', revenue: 5100, target: 4500 },
    { month: 'Apr', revenue: 5900, target: 5000 },
    { month: 'May', revenue: 6200, target: 5500 },
    { month: 'Jun', revenue: 7100, target: 6000 },
  ];

  // Mock Data untuk Perbandingan YoY (2026 vs 2025)
  const yoyComparisonData = [
    { month: 'Jan', year2025: 3500, year2026: 4200 },
    { month: 'Feb', year2025: 3800, year2026: 4800 },
    { month: 'Mar', year2025: 4100, year2026: 5100 },
    { month: 'Apr', year2025: 4400, year2026: 5900 },
    { month: 'May', year2025: 4800, year2026: 6200 },
    { month: 'Jun', year2025: 5200, year2026: 7100 },
  ];

  const regionalData = REGIONAL_ZONES.map(region => {
    const regionShowrooms = MOCK_SHOWROOMS.filter(s => s.marketingRegion?.id === region.id);
    const revenue = regionShowrooms.reduce((sum, s) => sum + (s.achievedRevenue || (s.lastYearRevenue ? s.lastYearRevenue * 0.8 : 500000000)), 0);
    const target = region.annualTarget || (region.lastYearRevenue ? region.lastYearRevenue * 1.1 : 5000000000);
    const units = Math.floor(revenue / 300000000);
    
    return {
        ...region,
        revenue,
        target,
        units,
        subRegions: region.subRegions?.map(sub => {
            const subShowrooms = MOCK_SHOWROOMS.filter(s => s.subRegionId === sub.id);
            const subRevenue = subShowrooms.reduce((sum, s) => sum + (subShowrooms.length * 250000000), 0);
            const subTarget = sub.annualTarget || 1000000000;
            const subUnits = Math.floor(subRevenue / 300000000);
            return { ...sub, revenue: subRevenue, target: subTarget, units: subUnits };
        })
    };
  });

  const topSalesPerformers = [
    { id: 1, name: 'Andi Saputra', region: 'JATIM', achievement: 104, revenue: 1200000000 },
    { id: 2, name: 'Budi Raharjo', region: 'JATENG', achievement: 98, revenue: 1150000000 },
    { id: 3, name: 'Siti Aminah', region: 'SULSEL', achievement: 95, revenue: 980000000 },
    { id: 4, name: 'Joko Widodo', region: 'JATIM', achievement: 92, revenue: 950000000 },
    { id: 5, name: 'Rina Kartika', region: 'SUMBAGSEL', achievement: 89, revenue: 820000000 },
  ];

  const serviceStats = {
    total: MOCK_SERVICE_TICKETS.length,
    resolved: MOCK_SERVICE_TICKETS.filter(t => t.status === 'RESOLVED').length,
    critical: MOCK_SERVICE_TICKETS.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length,
    slaRate: 89.4,
    avgResponse: '1.2h'
  };

  const totalRevenue = regionalData.reduce((acc, curr) => acc + curr.revenue, 0);
  const COLORS = ['#D32F2F', '#1A1A1A', '#2E7D32', '#F9A825', '#0288D1', '#7B1FA2', '#455A64', '#FF7043'];

  const formatRupiahShort = (value: number) => `Rp ${(value / 1000000000).toFixed(1)}M`;

  const toggleRegion = (id: string) => {
      setExpandedRegion(expandedRegion === id ? null : id);
      setExpandedSubRegion(null);
  };
  
  const toggleSubRegion = (id: string) => setExpandedSubRegion(expandedSubRegion === id ? null : id);

  return (
    <div className="space-y-6">
      {/* Metric Grid Utama */}
      {isVisible('w-metrics') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-subtle hover:shadow-card transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 rounded-2xl text-maxxi-primary"><DollarSign size={24} /></div>
                <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} /> +15.2%
                </div>
              </div>
              <p className="text-sm font-black text-maxxi-text-secondary uppercase tracking-widest">Pendapatan 2026</p>
              <h3 className="text-3xl font-black text-maxxi-text-primary mt-1">Rp 42.5M</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-subtle hover:shadow-card transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Tractor size={24} /></div>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">YTD 2026</span>
              </div>
              <p className="text-sm font-black text-maxxi-text-secondary uppercase tracking-widest">Unit Terjual</p>
              <h3 className="text-3xl font-black text-maxxi-text-primary mt-1">458 Unit</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-subtle hover:shadow-card transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-maxxi-success"><Wrench size={24} /></div>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-tighter">On-Target</span>
              </div>
              <p className="text-sm font-black text-maxxi-text-secondary uppercase tracking-widest">SLA Compliance</p>
              <h3 className="text-3xl font-black text-maxxi-text-primary mt-1">{serviceStats.slaRate}%</h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-subtle hover:shadow-card transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-maxxi-warning"><Users size={24} /></div>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <Activity size={12} /> Live
                </div>
              </div>
              <p className="text-sm font-black text-maxxi-text-secondary uppercase tracking-widest">Customer Active</p>
              <h3 className="text-3xl font-black text-maxxi-text-primary mt-1">1,240</h3>
            </div>
        </div>
      )}

      {/* Bar Charts Section: Pendapatan vs Target & YoY */}
      {(isVisible('w-revenue-chart') || isVisible('w-yoy-chart')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1: Bar Chart Pendapatan vs Target 2026 */}
          {isVisible('w-revenue-chart') && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="font-black text-maxxi-text-primary uppercase tracking-tight flex items-center gap-2">
                      <Target size={20} className="text-maxxi-primary" /> Performa Pendapatan vs Target (2026)
                    </h4>
                    <p className="text-xs text-maxxi-text-secondary font-bold">Perbandingan Realisasi Revenue vs Kuota Bulanan</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-maxxi-primary"></div><span className="text-[9px] font-black text-slate-400 uppercase">Revenue</span></div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-[9px] font-black text-slate-400 uppercase">Target</span></div>
                  </div>
               </div>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={performance2026Data} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#6B7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(v) => `${v/1000}M`} />
                        <Tooltip 
                          cursor={{fill: '#F8FAFC'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                        />
                        <Bar name="Revenue" dataKey="revenue" fill="#D32F2F" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar name="Target" dataKey="target" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={24} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Graph 2: Bar Chart Perbandingan YoY 2026 vs 2025 */}
          {isVisible('w-yoy-chart') && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="font-black text-maxxi-text-primary uppercase tracking-tight flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-600" /> Analisis Pertumbuhan YoY (2026 vs 2025)
                    </h4>
                    <p className="text-xs text-maxxi-text-secondary font-bold">Komparasi Performa Bulanan Berbasis Volume Tahunan</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-[9px] font-black text-slate-400 uppercase">2026</span></div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-[9px] font-black text-slate-400 uppercase">2025</span></div>
                  </div>
               </div>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={yoyComparisonData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#6B7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(v) => `${v/1000}M`} />
                        <Tooltip 
                          cursor={{fill: '#F8FAFC'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                        />
                        <Bar name="2026" dataKey="year2026" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar name="2025" dataKey="year2025" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={24} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Table: Performa Berjenjang */}
          {isVisible('w-performance-table') && (
            <div className="bg-white rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle overflow-hidden">
              <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center bg-white">
                <h4 className="font-black text-maxxi-text-primary flex items-center gap-2 uppercase tracking-tight text-sm">
                  <Globe size={18} className="text-maxxi-primary" />
                  Matriks Performa Berjenjang (Nasional)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-maxxi-text-secondary uppercase tracking-widest border-b border-[#E0E0E0]">
                    <tr>
                      <th className="px-6 py-4 w-10"></th>
                      <th className="px-6 py-4">Wilayah / Outlet</th>
                      <th className="px-6 py-4 text-center">Unit</th>
                      <th className="px-6 py-4 text-right">Pendapatan</th>
                      <th className="px-6 py-4 text-right">Target</th>
                      <th className="px-6 py-4 text-center">Pencapaian (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regionalData.map((region) => {
                      const regionPercent = Math.round((region.revenue / region.target) * 100);
                      const isRegionExpanded = expandedRegion === region.id;
                      
                      return (
                        <React.Fragment key={region.id}>
                          {/* LEVEL 1: REGIONAL */}
                          <tr 
                            className={`hover:bg-gray-50 transition-colors cursor-pointer group ${isRegionExpanded ? 'bg-red-50/30' : ''}`} 
                            onClick={() => toggleRegion(region.id)}
                          >
                            <td className="px-6 py-4 text-gray-400">
                              {isRegionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-black text-maxxi-text-primary uppercase tracking-tight group-hover:text-maxxi-primary transition-colors">{region.name}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-black text-xs">{region.units}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-maxxi-text-primary">{formatRupiahShort(region.revenue)}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-400">{formatRupiahShort(region.target)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16 overflow-hidden">
                                  <div className={`h-full rounded-full ${regionPercent >= 100 ? 'bg-maxxi-success' : 'bg-maxxi-primary'}`} style={{ width: `${Math.min(regionPercent, 100)}%` }}></div>
                                </div>
                                <span className={`text-[10px] font-black w-8 text-right ${regionPercent >= 100 ? 'text-maxxi-success' : 'text-maxxi-primary'}`}>{regionPercent}%</span>
                              </div>
                            </td>
                          </tr>

                          {/* LEVEL 2: SUB-REGIONAL */}
                          {isRegionExpanded && region.subRegions?.map(sub => {
                            const isSubExpanded = expandedSubRegion === sub.id;
                            const subPercent = Math.round((sub.revenue / sub.target) * 100);
                            return (
                              <React.Fragment key={sub.id}>
                                <tr 
                                  className={`bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-maxxi-primary/20 ${isSubExpanded ? 'bg-gray-100' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); toggleSubRegion(sub.id); }}
                                >
                                  <td className="px-6 py-3 pl-12 text-blue-400">
                                    {isSubExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2 font-bold text-gray-600 text-xs uppercase tracking-tighter">
                                      <MapPin size={12} className="text-blue-500" />
                                      {sub.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 text-center text-xs font-bold text-gray-500">{sub.units}</td>
                                  <td className="px-6 py-3 text-right font-bold text-gray-600 text-xs">{formatRupiahShort(sub.revenue)}</td>
                                  <td className="px-6 py-3 text-right font-medium text-gray-400 text-[10px]">{formatRupiahShort(sub.target)}</td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center justify-center gap-2 opacity-80 scale-90">
                                      <div className="flex-1 bg-white rounded-full h-1 w-12 overflow-hidden border border-gray-200">
                                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(subPercent, 100)}%` }}></div>
                                      </div>
                                      <span className="text-[9px] font-black text-blue-600">{subPercent}%</span>
                                    </div>
                                  </td>
                                </tr>

                                {/* LEVEL 3: SHOWROOMS */}
                                {isSubExpanded && MOCK_SHOWROOMS.filter(s => s.subRegionId === sub.id).map(showroom => {
                                  const showroomRevenue = showroom.achievedRevenue || 250000000;
                                  const showroomTarget = showroom.annualTarget || 300000000;
                                  const showroomPercent = Math.round((showroomRevenue / showroomTarget) * 100);
                                  
                                  return (
                                    <tr key={showroom.id} className="bg-white hover:bg-gray-50 transition-colors border-l-4 border-blue-500/10">
                                      <td className="px-6 py-2 pl-20"></td>
                                      <td className="px-6 py-2">
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                                          <Store size={10} className="text-amber-500" />
                                          {showroom.name}
                                        </div>
                                      </td>
                                      <td className="px-6 py-2 text-center text-[10px] text-gray-400">{Math.floor(showroomRevenue / 300000000)}</td>
                                      <td className="px-6 py-2 text-right text-[11px] font-bold text-gray-600">{formatRupiahShort(showroomRevenue)}</td>
                                      <td className="px-6 py-2 text-right text-[10px] text-gray-300">{formatRupiahShort(showroomTarget)}</td>
                                      <td className="px-6 py-2">
                                        <div className="flex justify-center">
                                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${showroomPercent >= 100 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                            {showroomPercent}%
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </React.Fragment>
                            )
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales Leaderboard Section */}
          {isVisible('w-leaderboard') && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle">
              <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-maxxi-text-primary uppercase tracking-tight flex items-center gap-2 text-sm">
                      <Trophy size={18} className="text-amber-500" /> Sales Achievement Leaderboard
                  </h4>
                  <button className="text-[10px] font-black text-maxxi-primary uppercase hover:underline">Full Rankings</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topSalesPerformers.map((sales, idx) => (
                      <div key={sales.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-maxxi-primary transition-all">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                                  idx === 0 ? 'bg-amber-100 text-amber-700' : 
                                  idx === 1 ? 'bg-slate-200 text-slate-700' : 
                                  idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-400'
                              }`}>
                                  {idx < 3 ? <Medal size={18} /> : `#${idx + 1}`}
                              </div>
                              <div className="min-w-0">
                                  <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter">{sales.name}</p>
                                  <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 uppercase">{sales.region}</span>
                                      <span className="text-[9px] font-bold text-slate-400">{formatRupiahShort(sales.revenue)}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className={`text-sm font-black ${sales.achievement >= 100 ? 'text-maxxi-success' : 'text-maxxi-primary'}`}>{sales.achievement}%</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Achieved</p>
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
            {/* Regional Contribution (%) Donut Chart */}
            {isVisible('w-contribution-donut') && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle">
                  <div className="mb-6">
                      <h4 className="font-black text-maxxi-text-primary uppercase tracking-tight flex items-center gap-2 text-sm">
                          <Percent size={18} className="text-maxxi-primary" /> Kontribusi Regional (%)
                      </h4>
                      <p className="text-[10px] text-maxxi-text-secondary font-bold uppercase mt-1">Distribusi Revenue Nasional</p>
                  </div>
                  <div className="h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                  data={regionalData.slice(0, 8)} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={60} 
                                  outerRadius={85} 
                                  paddingAngle={4} 
                                  dataKey="revenue"
                                  stroke="none"
                              >
                                  {regionalData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                              </Pie>
                              <Tooltip 
                                  formatter={(value: number) => [formatRupiahShort(value), 'Revenue']}
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total</span>
                              <p className="font-black text-maxxi-text-primary text-sm">Rp 42.5M</p>
                          </div>
                      </div>
                  </div>
                  <div className="space-y-2 mt-6 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                      {regionalData.map((reg, idx) => {
                          const contributionPercent = Math.round((reg.revenue / totalRevenue) * 100);
                          return (
                              <div key={reg.id} className="flex justify-between items-center text-[10px] font-black group">
                                  <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                      <span className="uppercase text-slate-600 group-hover:text-maxxi-primary transition-colors">{reg.name}</span>
                                  </div>
                                  <span className="text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{contributionPercent}%</span>
                              </div>
                          );
                      })}
                  </div>
              </div>
            )}

            {/* Executive After-Sales Summary */}
            {isVisible('w-service-monitor') && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-[#E0E0E0] shadow-subtle flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                      <h4 className="font-black text-maxxi-text-primary flex items-center gap-2 text-sm uppercase tracking-tight">
                          <Wrench className="text-maxxi-primary" size={18} /> After-Sales SLA Monitor
                      </h4>
                      {serviceStats.critical > 0 && (
                          <span className="animate-pulse bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full border border-red-700 uppercase tracking-widest flex items-center gap-1">
                              <AlertCircle size={10} /> {serviceStats.critical} CRITICAL
                          </span>
                      )}
                  </div>
                  
                  <div className="space-y-6 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Response</p>
                              <p className="text-xl font-black text-maxxi-text-primary">{serviceStats.avgResponse}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Achievement</p>
                              <p className="text-xl font-black text-maxxi-success">{serviceStats.slaRate}%</p>
                          </div>
                      </div>

                      <div className="h-px bg-slate-100 w-full"></div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase">Penyelesaian Tiket Servis</p>
                              <span className="text-[10px] font-black text-maxxi-primary">{serviceStats.resolved} / {serviceStats.total}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                              <div className="bg-maxxi-success h-full transition-all duration-1000" style={{width: `${(serviceStats.resolved / serviceStats.total) * 100}%`}}></div>
                          </div>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 mt-4">
                          <h5 className="text-[9px] font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Timer size={10} /> Antrian Live
                          </h5>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-600">Tiket Baru</span>
                                <span className="bg-white px-2 py-0.5 rounded font-black text-maxxi-primary border border-red-100">{MOCK_SERVICE_TICKETS.filter(t => t.status === 'OPEN').length}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-600">Sedang Dikerjakan</span>
                                <span className="bg-white px-2 py-0.5 rounded font-black text-blue-600 border border-blue-100">8</span>
                             </div>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => onNavigate?.('service')} 
                    className="w-full mt-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                      Service Center Console <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
