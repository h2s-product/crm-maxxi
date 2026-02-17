
import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../mockData';
import { ProductCategory, ProductType, Product } from '../types';
import { Search, Filter, Tractor, Settings, Package, Info, ChevronDown, ChevronUp, RefreshCw, Database, LayoutGrid, List } from 'lucide-react';

const InventoryCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'ALL'>('ALL');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    const matchesType = typeFilter === 'ALL' || product.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const getStockColor = (status: string) => {
    switch(status) {
      case 'READY': return 'bg-green-100 text-green-700 border-green-200';
      case 'INDENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'LOW_STOCK': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSyncERP = () => {
    setIsSyncing(true);
    // Simulate API Call delay
    setTimeout(() => {
        setIsSyncing(false);
        alert("Sinkronisasi data dengan ERP berhasil! Data stok dan harga telah diperbarui.");
    }, 2000);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all">
            {/* Header / Image Area */}
            <div className={`relative ${product.type === ProductType.UNIT ? 'h-48' : 'h-32'} bg-slate-100 border-b border-slate-100`}>
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border shadow-sm ${
                    product.type === ProductType.UNIT ? 'bg-maxxi-primary text-white border-blue-900' : 'bg-slate-700 text-white border-slate-800'
                 }`}>
                   {product.type === ProductType.UNIT ? <Tractor size={10} className="inline mr-1" /> : <Settings size={10} className="inline mr-1" />}
                   {product.type}
                 </span>
                 <span className="px-2 py-1 bg-white/90 backdrop-blur text-slate-700 rounded text-[10px] font-bold border border-slate-200">
                    {product.category.replace('_', ' ')}
                 </span>
              </div>
              
              {/* Warehouse Location Tag */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm flex items-center gap-1">
                 <Package size={10} /> {product.warehouseLocation || 'Gudang Utama'}
              </div>

              {product.imageUrl ? (
                 <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Tractor size={48} />
                 </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{product.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.sku}</p>
                  </div>
               </div>

               <div className="mt-4 flex items-center justify-between">
                  <div className="text-maxxi-primary font-bold text-lg">
                     {formatRupiah(product.price)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStockColor(product.stockStatus)}`}>
                     {product.stockStatus.replace('_', ' ')}
                  </span>
               </div>

               {/* Specs Expandable Section */}
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    className="w-full flex items-center justify-between text-sm text-slate-500 hover:text-maxxi-primary transition-colors"
                  >
                     <span className="flex items-center gap-1"><Info size={14} /> Spesifikasi Teknis</span>
                     {expandedProduct === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedProduct === product.id && (
                     <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {Object.entries(product.specs).map(([key, value]) => (
                           <div key={key} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                              <span className="text-slate-500">{key}</span>
                              {/* Cast value to ReactNode to fix unknown type error */}
                              <span className="font-medium text-slate-800">{(value as React.ReactNode)}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
          </div>
        ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-xs uppercase tracking-wide">
                <tr>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4">Kategori & Tipe</th>
                    <th className="px-6 py-4">Lokasi Gudang</th>
                    <th className="px-6 py-4 text-right">Harga Satuan</th>
                    <th className="px-6 py-4 text-center">Status Stok</th>
                    <th className="px-6 py-4 text-center w-10">Detail</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => (
                    <React.Fragment key={product.id}>
                        <tr 
                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedProduct === product.id ? 'bg-slate-50' : ''}`}
                        >
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-slate-200 border border-slate-200 overflow-hidden flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400"><Tractor size={20} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-3">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {product.category.replace('_', ' ')}
                                    </span>
                                    <span className={`text-[10px] flex items-center gap-1 ${product.type === ProductType.UNIT ? 'text-maxxi-primary' : 'text-slate-500'}`}>
                                        {product.type === ProductType.UNIT ? <Tractor size={10} /> : <Settings size={10} />}
                                        {product.type}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                    <Package size={14} className="text-slate-400"/>
                                    {product.warehouseLocation || '-'}
                                </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <span className="font-bold text-slate-800">{formatRupiah(product.price)}</span>
                            </td>
                            <td className="px-6 py-3 text-center">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border inline-block min-w-[80px] ${getStockColor(product.stockStatus)}`}>
                                    {product.stockStatus.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                                {expandedProduct === product.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </td>
                        </tr>
                        {expandedProduct === product.id && (
                            <tr className="bg-slate-50 animate-in slide-in-from-top-1 duration-200">
                                <td colSpan={6} className="px-6 py-4 border-b border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 max-w-4xl ml-16">
                                        <h4 className="col-span-full font-bold text-slate-700 text-xs uppercase mb-2 flex items-center gap-2">
                                            <Info size={14} /> Spesifikasi Teknis
                                        </h4>
                                        {Object.entries(product.specs).map(([key, value]) => (
                                            <div key={key} className="flex justify-between border-b border-slate-200 pb-1 text-sm">
                                                <span className="text-slate-500">{key}</span>
                                                {/* Cast value to ReactNode to fix unknown type error */}
                                                <span className="font-medium text-slate-800">{(value as React.ReactNode)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari Nama Produk atau SKU..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-maxxi-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-shrink-0">
                <button 
                    onClick={() => setViewMode('GRID')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                    title="Tampilan Grid"
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white text-maxxi-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                    title="Tampilan List"
                >
                    <List size={18} />
                </button>
            </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 items-center">
          {/* Sync ERP Button */}
          <button
            onClick={handleSyncERP}
            disabled={isSyncing}
            className={`px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 focus:ring-2 focus:ring-maxxi-primary transition-all flex items-center gap-2 whitespace-nowrap ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
            title="Sinkronisasi data stok & harga dengan ERP Pusat"
          >
             <RefreshCw size={16} className={`text-slate-500 ${isSyncing ? 'animate-spin text-maxxi-primary' : ''}`} />
             {isSyncing ? 'Syncing...' : 'Sync ERP'}
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          <select 
            className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-maxxi-primary outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="ALL">Semua Tipe</option>
            <option value={ProductType.UNIT}>Unit Utama (Alsintan)</option>
            <option value={ProductType.SPAREPART}>Suku Cadang</option>
          </select>

          <select 
             className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-maxxi-primary outline-none"
             value={categoryFilter}
             onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="ALL">Semua Kategori</option>
            {/* Cast Object.values to string array to fix unknown type error in replace method */}
            {(Object.values(ProductCategory) as string[]).map(cat => (
              <option key={cat} value={cat}>{(cat as string).replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Content */}
      {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>Produk tidak ditemukan sesuai kriteria.</p>
            </div>
      ) : (
          viewMode === 'GRID' ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default InventoryCatalog;
