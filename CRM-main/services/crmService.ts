
import { DemoSchedule, Product, ServiceTicket } from '../types';
import { MOCK_PRODUCTS } from '../mockData';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const scheduleDemo = async (
  customerId: string,
  productId: string,
  date: string,
  location: string
): Promise<{ success: boolean; message: string; schedule?: DemoSchedule }> => {
  await delay(1500); // Simulate server latency

  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return { success: false, message: 'Produk tidak valid.' };
  }

  // Simulate Logic: Check if unit is available for demo
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { success: false, message: 'Tim Demo tidak tersedia pada akhir pekan (Sabtu/Minggu).' };
  }

  const newSchedule: DemoSchedule = {
    id: `demo-${Date.now()}`,
    customerId,
    productId,
    scheduledDate: date,
    locationLink: location,
    status: 'PENDING'
  };

  return { 
    success: true, 
    message: `Permintaan demo untuk ${product.name} berhasil dibuat. Tim Sales akan segera menghubungi Anda.`,
    schedule: newSchedule
  };
};

export const createServiceTicket = async (
  ticketData: Partial<ServiceTicket>
): Promise<{ success: boolean; message: string; ticket?: ServiceTicket }> => {
  await delay(2000); // Simulate network latency

  if (!ticketData.subject || !ticketData.customerName) {
    return { success: false, message: 'Subyek dan Nama Pelanggan wajib diisi.' };
  }

  const newTicket: ServiceTicket = {
    ...ticketData as ServiceTicket,
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 899)}`,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    message: `Tiket ${newTicket.ticketNumber} berhasil didaftarkan. Tim After-Sales akan segera merespon.`,
    ticket: newTicket
  };
};

export const checkStockAvailability = async (productId: string): Promise<string> => {
    await delay(500);
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    return product ? product.stockStatus : 'UNKNOWN';
}
