import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../mockData';
import { Product, ProductCategory } from '../types';
import { Check, Plus, Package, Printer, Download, ArrowLeft, FileText, Building2 } from 'lucide-react';
import { checkStockAvailability } from '../services/crmService';

const QuoteBuilder: React.FC = () => {
  const [view, setView] = useState<'BUILDER' | 'RESULT'>('BUILDER');
  
  // Builder State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockStatus, setStockStatus] = useState<string>('');
  const [loadingStock, setLoadingStock] = useState(false);
  
  // Quote Configuration State
  const [config, setConfig] = useState({
    customerName: '',
    quantity: 1,
    addOns: [] as string[],
    notes: ''
  });

  // Generated Quote Data (for Result View)
  const [generatedQuote, setGeneratedQuote] = useState<any>(null);

  const filteredProducts = selectedCategory === 'ALL' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product);
    setLoadingStock(true);
    // Reset config, keep customer name if typed
    setConfig(prev => ({ ...prev, quantity: 1, addOns: [], notes: '' }));
    
    // Check simulated live stock
    const status = await checkStockAvailability(product.id);
    setStockStatus(status);
    setLoadingStock(false);
  };

  const toggleAddon = (addon: string) => {
    setConfig(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addon) 
        ? prev.addOns.filter(a => a !== addon)
        : [...prev.addOns, addon]
    }));
  };

  const addonPrices: Record<string, number> = {
      'Battery Pack': 5000000,
      'Training Session': 2000000,
      'Extended Warranty': selectedProduct ? selectedProduct.price * 0.05 : 0
  };

  const addonTranslation: Record<string, string> = {
      'Battery Pack': 'Paket Baterai Cadangan',
      'Training Session': 'Sesi Pelatihan Operasional',
      'Extended Warranty': 'Garansi Tambahan (1 Tahun)'
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    let total = selectedProduct.price * config.quantity;
    
    config.addOns.forEach(addon => {
        total += addonPrices[addon] || 0;
    });
    
    return total;
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleCreateQuote = () => {
      if (!selectedProduct) return;
      if (!config.customerName.trim()) {
          alert("Mohon isi nama pelanggan/instansi.");
          return;
      }

      const subtotal = calculateTotal();
      const tax = subtotal * 0.11; // PPN 11%
      const grandTotal = subtotal + tax;

      const quoteData = {
          quoteNumber: `QT/MX/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          customerName: config.customerName,
          product: selectedProduct,
          quantity: config.quantity,
          addOns: config.addOns,
          subtotal: subtotal,
          tax: tax,
          grandTotal: grandTotal,
          notes: config.notes
      };

      setGeneratedQuote(quoteData);
      setView('RESULT');
  };

  const handleReset = () => {
      setView('BUILDER');
      setSelectedProduct(null);
      setGeneratedQuote(null);
      setConfig({
        customerName: '',
        quantity: 1,
        addOns: [],
        notes: ''
      });
  };

  // --- RENDER VIEWS ---

  const renderResultView = () => {
      if (!generatedQuote) return null;

      return (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <button 
                    onClick={() => setView('BUILDER')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
                  >
                      <ArrowLeft size={20} /> Kembali / Edit
                  </button>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                      >
                          <Printer size={18} /> Cetak
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium shadow-sm">
                          <Download size={18} /> Unduh PDF
                      </button>
                      <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-maxxi-primary text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                      >
                          <Plus size={18} /> Buat Baru
                      </button>
                  </div>
              </div>

              {/* A4 Paper Simulation */}
              <div className="flex-1 overflow-y-auto bg-slate-100 p-4 flex justify-center">
                  <div className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-xl text-slate-900 relative">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                          <Building2 size={400} />
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                          <div>
                              <h1 className="text-3xl font-bold text-maxxi-primary flex items-center gap-2">
                                  <div className="w-4 h-4 bg-maxxi-primary rounded-full"></div>
                                  PT. MAXXI
                              </h1>
                              <p className="text-sm font-bold text-slate-700 mt-1">Corin Mulia Gemilang</p>
                              <p className="text-xs text-slate-500 max-w-[250px] mt-2">
                                  Jl. Raya Surabaya-Mojokerto KM 19, Jawa Timur, Indonesia.
                              </p>
                          </div>
                          <div className="text-right">
                              <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Penawaran</h2>
                              <p className="text-sm font-bold text-slate-800 mt-1">{generatedQuote.quoteNumber}</p>
                              <p className="text-xs text-slate-500">{generatedQuote.date}</p>
                          </div>
                      </div>

                      {/* Recipient */}
                      <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Kepada Yth:</p>
                          <h3 className="text-lg font-bold text-slate-800">{generatedQuote.customerName}</h3>
                      </div>

                      {/* Items Table */}
                      <table className="w-full mb-8">
                          <thead className="bg-slate-100 border-b border-slate-200">
                              <tr>
                                  <th className="py-3 px-4 text-left text-xs font-bold text-slate-600 uppercase">Deskripsi Produk</th>
                                  <th className="py-3 px-4 text-center text-xs font-bold text-slate-600 uppercase">Qty</th>
                                  <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 uppercase">Harga Satuan</th>
                                  <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 uppercase">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {/* Main Unit */}
                              <tr>
                                  <td className="py-4 px-4">
                                      <p className="font-bold text-slate-800">{generatedQuote.product.name}</p>
                                      <p className="text-xs text-slate-500 font-mono">{generatedQuote.product.sku}</p>
                                  </td>
                                  <td className="py-4 px-4 text-center font-medium">{generatedQuote.quantity}</td>
                                  <td className="py-4 px-4 text-right text-slate-600">{formatRupiah(generatedQuote.product.price)}</td>
                                  <td className="py-4 px-4 text-right font-bold text-slate-800">
                                      {formatRupiah(generatedQuote.product.price * generatedQuote.quantity)}
                                  </td>
                              </tr>
                              
                              {/* Add-ons */}
                              {generatedQuote.addOns.map((addon: string, idx: number) => {
                                  const price = addonPrices[addon] || 0;
                                  return (
                                      <tr key={idx}>
                                          <td className="py-3 px-4 pl-8">
                                              <p className="text-sm text-slate-700 flex items-center gap-2">
                                                  <Plus size={10} className="text-slate-400" />
                                                  {addonTranslation[addon] || addon}
                                              </p>
                                          </td>
                                          <td className="py-3 px-4 text-center text-sm text-slate-500">1</td>
                                          <td className="py-3 px-4 text-right text-sm text-slate-500">{formatRupiah(price)}</td>
                                          <td className="py-3 px-4 text-right text-sm font-medium text-slate-700">{formatRupiah(price)}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>

                      {/* Financials */}
                      <div className="flex justify-end mb-12">
                          <div className="w-80 space-y-2">
                              <div className="flex justify-between text-sm text-slate-600">
                                  <span>Subtotal</span>
                                  <span className="font-medium">{formatRupiah(generatedQuote.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-slate-600">
                                  <span>PPN (11%)</span>
                                  <span className="font-medium">{formatRupiah(generatedQuote.tax)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-800 pt-2 mt-2">
                                  <span>Total</span>
                                  <span className="text-maxxi-primary">{formatRupiah(generatedQuote.grandTotal)}</span>
                              </div>
                          </div>
                      </div>

                      {/* Notes & Footer */}
                      <div className="grid grid-cols-2 gap-12 mt-auto">
                          <div>
                              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Catatan:</p>
                              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100 min-h-[80px]">
                                  {generatedQuote.notes || '-'}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-4">
                                  * Harga dapat berubah sewaktu-waktu tanpa pemberitahuan.<br/>
                                  * Penawaran ini berlaku selama 14 hari sejak tanggal diterbitkan.
                              </p>
                          </div>
                          <div className="text-center">
                              <p className="text-xs text-slate-500 mb-16">Hormat Kami,</p>
                              <div className="border-b border-slate-300 w-2/3 mx-auto mb-2"></div>
                              <p className="font-bold text-slate-800">Sales Department</p>
                              <p className="text-xs text-slate-500">PT. MAXXI</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderBuilderView = () => (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in slide-in-from-left duration-300">
      {/* Product Selection Panel */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">1. Pilih Model Produk</h2>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Added explicit cast for mapped enum values to fix inference issue */}
            {(['ALL', ...Object.values(ProductCategory)] as string[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-maxxi-primary text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {/* Added cast to string for replace method */}
                {(cat as string).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedProduct?.id === product.id ? 'border-maxxi-secondary ring-1 ring-maxxi-secondary bg-orange-50' : 'border-slate-200'
              }`}
            >
              <div className="aspect-video bg-slate-200 rounded-md mb-3 overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                      product.stockStatus === 'READY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                      {product.stockStatus}
                  </span>
              </div>
              <p className="mt-2 text-maxxi-primary font-bold">{formatRupiah(product.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">2. Konfigurasi</h2>
        </div>

        {selectedProduct ? (
          <div className="p-6 flex-1 flex flex-col overflow-y-auto">
            {/* Customer Input */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Pelanggan / Instansi</label>
                <input 
                    type="text"
                    required
                    placeholder="Masukkan nama tujuan..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-maxxi-primary outline-none"
                    value={config.customerName}
                    onChange={(e) => setConfig({...config, customerName: e.target.value})}
                />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedProduct.name}</h3>
            
            <div className="flex items-center gap-2 mb-6">
                 {loadingStock ? (
                     <span className="text-xs text-slate-400">Mengecek gudang...</span>
                 ) : (
                     <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                         stockStatus === 'READY' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                     }`}>
                         <Package size={12} />
                         {stockStatus === 'READY' ? 'Tersedia di Gudang Utama' : 'Indent (2-4 Minggu)'}
                     </span>
                 )}
            </div>

            {/* Specifications */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm">
                <h4 className="font-bold text-slate-700 mb-2">Spesifikasi Teknis</h4>
                <div className="space-y-1">
                    {Object.entries(selectedProduct.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                            <span className="text-slate-500">{key}</span>
                            {/* Cast value to ReactNode to fix unknown type error */}
                            <span className="font-medium text-slate-800">{(value as React.ReactNode)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add-ons */}
            <div className="mb-6">
                <h4 className="font-bold text-slate-700 mb-3">Tambahan Opsional</h4>
                <div className="space-y-2">
                    {Object.keys(addonPrices).map(addon => (
                        <div 
                            key={addon} 
                            onClick={() => toggleAddon(addon)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                config.addOns.includes(addon) ? 'border-maxxi-primary bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                config.addOns.includes(addon) ? 'bg-maxxi-primary border-maxxi-primary' : 'border-slate-300'
                            }`}>
                                {config.addOns.includes(addon) && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm font-medium text-slate-700">{addonTranslation[addon] || addon}</span>
                                <span className="block text-xs text-slate-500">+{formatRupiah(addonPrices[addon])}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mb-4">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
                 <textarea 
                    rows={2}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-maxxi-primary outline-none resize-none"
                    placeholder="Contoh: Pengiriman via ekspedisi laut..."
                    value={config.notes}
                    onChange={(e) => setConfig({...config, notes: e.target.value})}
                 ></textarea>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500">Estimasi Total</span>
                    <span className="text-2xl font-bold text-maxxi-primary">{formatRupiah(calculateTotal())}</span>
                </div>
                <button 
                    onClick={handleCreateQuote}
                    className="w-full bg-maxxi-secondary hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <FileText size={18} />
                    Buat Penawaran Resmi
                </button>
            </div>
          </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Plus size={32} />
                </div>
                <p>Pilih model produk di sebelah kiri untuk memulai konfigurasi</p>
            </div>
        )}
      </div>
    </div>
  );

  return view === 'BUILDER' ? renderBuilderView() : renderResultView();
};

export default QuoteBuilder;