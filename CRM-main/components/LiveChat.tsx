
import React, { useState, useMemo } from 'react';
import { 
    Send, Paperclip, Search, Phone, MoreVertical, Check, CheckCheck, 
    Smile, User, Tractor, MapPin, Tag, MessageCircle, Clock, 
    Smartphone, Globe, MessageSquare, ChevronRight, Zap, 
    // Fixed: Added missing 'Building2' import from lucide-react
    ShieldCheck, AlertCircle, Filter, Calendar, LayoutDashboard,
    Share2, FileText, X, Plus, Wrench, BarChart3, Building2
} from 'lucide-react';
import { MOCK_CUSTOMERS, MOCK_UNITS, MOCK_PRODUCTS, REGIONAL_ZONES, MOCK_SERVICE_TICKETS } from '../mockData';
import { Customer, MachineUnit } from '../types';

interface Message {
    id: string;
    sender: 'ME' | 'THEM';
    text: string;
    timestamp: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
    type: 'TEXT' | 'IMAGE' | 'HSM'; // HSM = Template
}

interface ChatContact {
    id: string;
    customerId: string;
    name: string;
    avatarInitials: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'ONLINE' | 'OFFLINE' | 'TYPING';
    channel: 'WHATSAPP' | 'WEB' | 'APP';
    assignedAgent?: string;
    tag?: string;
    messages: Message[];
}

const WHATSAPP_TEMPLATES = [
    { id: 't1', name: 'Jadwal Demo', text: 'Halo {name}, tim kami siap melakukan demo unit {product} di lokasi Anda pada tanggal {date}. Apakah waktu tersebut sesuai?' },
    { id: 't2', name: 'Konfirmasi Servis', text: 'Yth. {name}, tiket perbaikan #{ticket} Anda telah kami terima. Teknisi akan tiba dalam 2 jam.' },
    { id: 't3', name: 'Promo Sparepart', text: 'Kabar gembira {name}! Dapatkan diskon 15% untuk pembelian oli & filter Traktor Maxxi minggu ini.' }
];

// Corrected Mock Chats using valid customer IDs from mockData.ts
const MOCK_CHATS: ChatContact[] = [
    {
        id: 'chat-1',
        customerId: 'c-01-1', // Gapoktan Tani Makmur
        name: 'Pak Budi (Tani Makmur)',
        avatarInitials: 'TB',
        lastMessage: 'Apakah sparepart nozzle XAG ready stok?',
        lastMessageTime: '10:30',
        unreadCount: 2,
        status: 'ONLINE',
        channel: 'WHATSAPP',
        assignedAgent: 'Siti Aminah',
        tag: 'Sparepart',
        messages: [
            { id: 'm1', sender: 'THEM', text: 'Selamat pagi Mas, mau tanya.', timestamp: '10:28', status: 'READ', type: 'TEXT' },
            { id: 'm2', sender: 'ME', text: 'Selamat pagi Pak Budi, ada yang bisa dibantu?', timestamp: '10:29', status: 'READ', type: 'TEXT' },
            { id: 'm3', sender: 'THEM', text: 'Apakah sparepart nozzle XAG ready stok?', timestamp: '10:30', status: 'DELIVERED', type: 'TEXT' }
        ]
    },
    {
        id: 'chat-2',
        customerId: 'c-07-1', // Gapoktan Banyuasin
        name: 'Pak Jaka (Banyuasin)',
        avatarInitials: 'PJ',
        lastMessage: 'Terima kasih informasinya.',
        lastMessageTime: 'Kemarin',
        unreadCount: 0,
        status: 'OFFLINE',
        channel: 'WHATSAPP',
        assignedAgent: 'Andi Sales',
        messages: [
            { id: 'm1', sender: 'ME', text: 'Pak Jaka, unit Bimo 110X pesanan sudah dikirim ya.', timestamp: 'Yesterday', status: 'READ', type: 'TEXT' },
            { id: 'm2', sender: 'THEM', text: 'Oke siap mas, estimasi sampai kapan?', timestamp: 'Yesterday', status: 'READ', type: 'TEXT' },
            { id: 'm3', sender: 'ME', text: 'Besok sore kemungkinan sampai.', timestamp: 'Yesterday', status: 'READ', type: 'TEXT' },
            { id: 'm4', sender: 'THEM', text: 'Terima kasih informasinya.', timestamp: 'Yesterday', status: 'READ', type: 'TEXT' }
        ]
    },
    {
        id: 'chat-3',
        customerId: 'c-01-2', // Dinas Pertanian Bojonegoro
        name: 'Sekretariat Dinas Bojonegoro',
        avatarInitials: 'SB',
        lastMessage: 'Kapan bisa dijadwalkan demo ulang?',
        lastMessageTime: '08:00',
        unreadCount: 0,
        status: 'ONLINE',
        channel: 'WEB',
        assignedAgent: 'Hendra IT',
        tag: 'Potensial',
        messages: [
            { id: 'm1', sender: 'THEM', text: 'Mas, unit drone yang kemarin sukses demonya.', timestamp: '07:50', status: 'READ', type: 'TEXT' },
            { id: 'm2', sender: 'THEM', text: 'Kapan bisa dijadwalkan demo ulang untuk kelompok tani lain?', timestamp: '08:00', status: 'READ', type: 'TEXT' }
        ]
    }
];

interface LiveChatProps {
    onNavigate?: (page: string, params?: any) => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ onNavigate }) => {
    const [selectedChatId, setSelectedChatId] = useState<string>(MOCK_CHATS[0].id);
    const [inputText, setInputText] = useState('');
    const [chats, setChats] = useState<ChatContact[]>(MOCK_CHATS);
    const [showTemplates, setShowTemplates] = useState(false);
    const [filterChannel, setFilterChannel] = useState<'ALL' | 'WHATSAPP'>('ALL');

    const activeChat = chats.find(c => c.id === selectedChatId);
    const activeCustomer = activeChat ? MOCK_CUSTOMERS.find(c => c.id === activeChat.customerId) : null;
    const activeUnits = activeCustomer ? MOCK_UNITS.filter(u => u.customerId === activeCustomer.id) : [];
    const activeTickets = activeCustomer ? MOCK_SERVICE_TICKETS.filter(t => t.customerId === activeCustomer.id).slice(0, 2) : [];
    const activeRegion = activeCustomer ? REGIONAL_ZONES.find(r => r.id === activeCustomer.regionId) : null;

    const filteredContacts = chats.filter(c => 
        filterChannel === 'ALL' || c.channel === filterChannel
    );

    const handleSendMessage = (text: string, type: 'TEXT' | 'HSM' = 'TEXT') => {
        if (!text.trim() || !selectedChatId) return;

        const newMessage: Message = {
            id: `new-${Date.now()}`,
            sender: 'ME',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'SENT',
            type: type
        };

        setChats(prev => prev.map(chat => 
            chat.id === selectedChatId 
                ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: text, lastMessageTime: 'Baru saja' } 
                : chat
        ));
        setInputText('');
        setShowTemplates(false);

        setTimeout(() => {
            setChats(prev => prev.map(chat => ({
                ...chat,
                messages: chat.messages.map(m => m.id === newMessage.id ? { ...m, status: 'DELIVERED' } : m)
            })));
        }, 1500);
    };

    const handleTemplateClick = (template: typeof WHATSAPP_TEMPLATES[0]) => {
        let text = template.text
            .replace('{name}', activeCustomer?.name || 'Bapak/Ibu')
            .replace('{product}', 'XAG P60')
            .replace('{date}', 'Kamis, 25 Mei')
            .replace('{ticket}', 'TKT-2025-009');
        
        handleSendMessage(text, 'HSM');
    };

    const handleCreateTicket = () => {
        if (onNavigate && activeCustomer) {
            onNavigate('service', { action: 'CREATE_TICKET', customerId: activeCustomer.id });
        }
    };

    const handleScheduleDemo = () => {
        if (onNavigate && activeCustomer) {
            onNavigate('demos', { action: 'NEW_DEMO', customerId: activeCustomer.id });
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-slate-100 rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
            {/* COLUMN 1: Sidebar Contacts */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 italic">
                            <Zap className="text-maxxi-primary fill-maxxi-primary" size={20} />
                            OMNI-HUB
                        </h2>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setFilterChannel('ALL')}
                                className={`p-1.5 rounded-lg transition-all ${filterChannel === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <LayoutDashboard size={16} />
                            </button>
                            <button 
                                onClick={() => setFilterChannel('WHATSAPP')}
                                className={`p-1.5 rounded-lg transition-all ${filterChannel === 'WHATSAPP' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari percakapan..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-maxxi-primary transition-all"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredContacts.map(chat => (
                        <div 
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative ${
                                selectedChatId === chat.id ? 'bg-blue-50/50 border-l-4 border-l-maxxi-primary' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                            <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner">
                                        {chat.avatarInitials}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center shadow-sm ${
                                        chat.channel === 'WHATSAPP' ? 'bg-green-500' : 'bg-blue-500'
                                    }`}>
                                        {chat.channel === 'WHATSAPP' ? <Smartphone size={10} className="text-white" /> : <Globe size={10} className="text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{chat.name}</h4>
                                        <span className="text-[10px] text-slate-400 font-medium">{chat.lastMessageTime}</span>
                                    </div>
                                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                        {chat.status === 'TYPING' ? <span className="text-green-600 italic">sedang mengetik...</span> : chat.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMN 2: Chat Canvas */}
            <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-slate-900 relative">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>

                {activeChat ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 shadow-sm">
                                    {activeChat.avatarInitials}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-slate-800">{activeChat.name}</h3>
                                        {activeChat.channel === 'WHATSAPP' && <span title="Verified"><ShieldCheck size={14} className="text-blue-500" /></span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className={`w-2 h-2 rounded-full ${activeChat.status === 'ONLINE' || activeChat.status === 'TYPING' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                        <span className="text-slate-500 font-medium uppercase tracking-widest">{activeChat.status} via {activeChat.channel}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"><Phone size={18} /></button>
                                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar">
                            {activeChat.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-md relative ${
                                        msg.sender === 'ME' ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <div className="text-right mt-1">
                                            <span className="text-[9px] font-bold text-slate-400">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showTemplates && (
                            <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 animate-in slide-in-from-bottom-4 overflow-hidden">
                                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-500" /> WhatsApp Templates</span>
                                    <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                                </div>
                                <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {WHATSAPP_TEMPLATES.map(t => (
                                        <button key={t.id} onClick={() => handleTemplateClick(t)} className="text-left p-3 rounded-xl border border-slate-100 hover:border-maxxi-primary hover:bg-red-50 transition-all">
                                            <p className="text-xs font-bold text-slate-700 mb-1">{t.name}</p>
                                            <p className="text-[10px] text-slate-400 line-clamp-2">{t.text}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-white border-t border-slate-200 z-10">
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setShowTemplates(!showTemplates)} className={`p-2.5 rounded-xl transition-all ${showTemplates ? 'bg-maxxi-primary text-white shadow-lg rotate-45' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Plus size={20} /></button>
                                <input 
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                                    placeholder="Ketik balasan..."
                                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-maxxi-primary outline-none transition-all"
                                />
                                <button onClick={() => handleSendMessage(inputText)} disabled={!inputText.trim()} className="p-3.5 bg-maxxi-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-lg active:scale-95 transition-all"><Send size={20} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 z-10">
                        <MessageSquare size={48} className="mb-4 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-xs">Pilih percakapan untuk memulai</p>
                    </div>
                )}
            </div>

            {/* COLUMN 3: CRM Context - POPULATED SECTION */}
            <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto hidden lg:flex shadow-2xl">
                {activeCustomer ? (
                    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5"><Building2 size={80} /></div>
                            <div className="w-20 h-20 bg-white rounded-[1.5rem] mx-auto flex items-center justify-center text-2xl font-black text-slate-400 mb-4 shadow-xl border-4 border-white relative z-10">
                                {activeChat?.avatarInitials}
                            </div>
                            <h3 className="font-black text-slate-800 text-base leading-tight mb-2 relative z-10">{activeCustomer.name}</h3>
                            <div className="flex flex-col gap-1.5 items-center relative z-10">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-maxxi-primary text-white border border-red-700">
                                    {activeCustomer.type}
                                </span>
                                {activeRegion && (
                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                                        <Globe size={10}/> REGIONAL {activeRegion.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Informasi Kontak <ChevronRight size={10} />
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Phone size={14} className="text-slate-400" />
                                        <span className="font-bold">{activeCustomer.contactInfo}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                        <span className="font-medium leading-relaxed">{activeCustomer.farms[0]?.location || 'Lokasi tidak terdaftar'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Ticket Context */}
                            {activeTickets.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Tiket Servis Aktif <Wrench size={12} className="text-maxxi-primary" />
                                    </h4>
                                    <div className="space-y-2">
                                        {activeTickets.map(ticket => (
                                            <div key={ticket.id} className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 group cursor-pointer hover:bg-red-50 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[9px] font-black text-red-600">{ticket.ticketNumber}</span>
                                                    <span className="text-[8px] bg-red-100 text-red-700 px-1.5 rounded-full font-bold uppercase">{ticket.status}</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{ticket.subject}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Assets Units */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                    Aset Alsintan ({activeUnits.length}) <Tractor size={12} />
                                </h4>
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                    {activeUnits.map(unit => {
                                        const product = MOCK_PRODUCTS.find(p => p.id === unit.productId);
                                        return (
                                            <div key={unit.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-maxxi-primary transition-all group">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <p className="font-black text-slate-700 text-[11px] leading-tight group-hover:text-maxxi-primary transition-colors">{product?.name}</p>
                                                    <span className={`w-2 h-2 rounded-full ${unit.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-300'}`}></span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[9px] text-slate-400 font-mono font-bold">{unit.serialNumber}</p>
                                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-600 border border-slate-200">
                                                        {unit.hourMeter} HM
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {activeUnits.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-2">Belum ada unit terdaftar.</p>}
                                </div>
                            </div>

                            {/* CRM Actions */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handleCreateTicket}
                                        className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-md active:scale-95"
                                    >
                                        <Wrench size={16} />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Tiket Baru</span>
                                    </button>
                                    <button 
                                        onClick={handleScheduleDemo}
                                        className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                    >
                                        <Calendar size={16} className="text-maxxi-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Jadwal Demo</span>
                                    </button>
                                </div>
                                <button className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-100 hover:bg-blue-100 transition-all">
                                    <Share2 size={12} /> Share Katalog Digital
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-100">
                            <BarChart3 size={32} className="opacity-10" />
                        </div>
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                            Pilih kontak percakapan untuk sinkronisasi data konteks CRM pelanggan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChat;
