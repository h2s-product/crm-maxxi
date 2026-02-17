import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_DEMO_SCHEDULES } from '../mockData';
import { scheduleDemo } from '../services/crmService';
import { Calendar, MapPin, CheckCircle, Loader2, Clock, List, Plus, Map, User, Sprout, Tractor, XCircle } from 'lucide-react';
import { DemoSchedule, Product, Customer } from '../types';

interface DemoSchedulerProps {
    initialParams?: any;
}

const DemoScheduler: React.FC<DemoSchedulerProps> = ({ initialParams }) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'FORM'>('LIST');
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    date: '',
    location: '',
    cropType: 'Padi'
  });
  
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  // Handle Initial Params (e.g. from Chat navigation)
  useEffect(() => {
      if (initialParams?.action === 'NEW_DEMO') {
          setActiveTab('FORM');
          if (initialParams.customerId) {
              setFormData(prev => ({
                  ...prev,
                  customerId: initialParams.customerId
              }));
          }
      }
  }, [initialParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    
    try {
      const result = await scheduleDemo(
        formData.customerId, 
        formData.productId, 
        formData.date, 
        formData.location
      );

      if (result.success) {
        setStatus('SUCCESS');
        setMessage(result.message);
      } else {
        setStatus('ERROR');
        setMessage(result.message);
      }
    } catch (err) {
      setStatus('ERROR');
      setMessage('Terjadi kesalahan jaringan.');
    }
  };

  const resetForm = () => {
      setStatus('IDLE');
      setFormData({...formData, date: ''});
      setActiveTab('LIST');
  }

  // Helpers for the List View
  const getCustomer = (id: string) => MOCK_CUSTOMERS.find(c => c.id === id);
  const getProduct = (id: string) => MOCK_PRODUCTS.find(p => p.id === id);

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'CONFIRMED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Terkonfirmasi</span>;
          case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Menunggu</span>;
          case 'COMPLETED': return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Selesai</span>;
          case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Dibatalkan</span>;
          default: return null;
      }
  }

  const renderForm = () => {
    if (status === 'SUCCESS') {
        return (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-green-200 text-center mt-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Permintaan Dikonfirmasi!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <button 
              onClick={resetForm}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800"
            >
              Kembali ke Daftar Jadwal
            </button>
          </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right duration-300">
            <div className="bg-maxxi-primary p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-maxxi-secondary" />
                        Jadwalkan Demo Lapangan
                    </h2>
                    <p className="text-blue-200 text-sm mt-1">Jadwalkan demonstrasi unit secara langsung.</p>
                </div>
                <button onClick={() => setActiveTab('LIST')} className="text-white hover:bg-white/10 p-2 rounded">
                    Batal
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pelanggan / Gapoktan</label>
                        <select 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none"
                            value={formData.customerId}
                            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                        >
                            <option value="">Pilih Pelanggan</option>
                            {MOCK_CUSTOMERS.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Demo</label>
                        <select 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none"
                            value={formData.productId}
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                        >
                            <option value="">Pilih Model Unit</option>
                            {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Tanaman (Konteks)</label>
                        <div className="flex gap-4">
                            {['Padi', 'Jagung', 'Tebu'].map(crop => (
                                <label key={crop} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="crop" 
                                        value={crop}
                                        checked={formData.cropType === crop}
                                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                                        className="text-maxxi-primary focus:ring-maxxi-primary"
                                    />
                                    <span className="text-sm text-slate-700">{crop}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Permintaan</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                        <p className="text-xs text-slate-500 mt-1">Catatan: Tim Demo tidak tersedia pada akhir pekan.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi Lahan (Link Google Maps)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="url" 
                                required
                                placeholder="https://maps.google.com/..."
                                className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-maxxi-primary outline-none"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end items-center gap-4">
                    {status === 'ERROR' && (
                        <span className="text-red-600 text-sm font-medium">{message}</span>
                    )}
                    <button 
                        type="submit"
                        disabled={status === 'SUBMITTING'}
                        className="bg-maxxi-primary hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'SUBMITTING' && <Loader2 className="animate-spin" size={20} />}
                        Konfirmasi Jadwal
                    </button>
                </div>

            </form>
        </div>
    );
  };

  const renderList = () => {
      // Sort by status priority then date
      const sortedSchedules = [...MOCK_DEMO_SCHEDULES].sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });

      return (
          <div className="space-y-4">
              {sortedSchedules.map(schedule => {
                  const product = getProduct(schedule.productId);
                  const customer = getCustomer(schedule.customerId);
                  const date = new Date(schedule.scheduledDate);
                  
                  return (
                      <div key={schedule.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group">
                           {/* Status Stripe */}
                           <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                               schedule.status === 'CONFIRMED' ? 'bg-green-500' : 
                               schedule.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'
                           }`}></div>

                           {/* Date Box */}
                           <div className="flex-shrink-0 w-16 h-16 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-800">
                               <span className="text-xs font-bold uppercase tracking-wider">{date.toLocaleString('id-ID', { month: 'short' })}</span>
                               <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                           </div>

                           {/* Main Details */}
                           <div className="flex-1">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Tractor size={18} className="text-maxxi-primary" />
                                        {product?.name}
                                    </h3>
                                    {getStatusBadge(schedule.status)}
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User size={14} className="text-slate-400" />
                                        <span className="font-medium">{customer?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Sprout size={14} className="text-slate-400" />
                                        <span>Tanaman: <span className="font-medium text-slate-800">{schedule.cropType || 'N/A'}</span></span>
                                    </div>
                                    <a 
                                        href={schedule.locationLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline hover:text-blue-700 truncate"
                                    >
                                        <MapPin size={14} />
                                        Lihat Lokasi
                                    </a>
                               </div>
                               
                               {schedule.notes && (
                                   <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded italic border border-slate-100">
                                       "{schedule.notes}"
                                   </div>
                               )}
                           </div>
                      </div>
                  )
              })}
          </div>
      )
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Jadwal Demo Lapangan</h1>
            <p className="text-slate-500">Kelola dan lacak demonstrasi produk.</p>
          </div>
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
                onClick={() => setActiveTab('LIST')}
                className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${
                    activeTab === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
             >
                <List size={16} /> Daftar Jadwal
             </button>
             <button 
                onClick={() => setActiveTab('FORM')}
                className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${
                    activeTab === 'FORM' ? 'bg-maxxi-primary text-white shadow' : 'text-slate-500 hover:text-slate-800'
                }`}
             >
                <Plus size={16} /> Ajukan Demo Baru
             </button>
          </div>
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'LIST' ? renderList() : renderForm()}
      </div>
    </div>
  );
};

export default DemoScheduler;