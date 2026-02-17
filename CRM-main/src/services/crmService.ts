// Mock CRM Service
// No API required

// Local storage keys
const KEYS = {
  LEADS: "crm_leads",
  DEMOS: "crm_demos",
};

// Helper load
const load = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper save
const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Generate ID
const generateId = () => {
  return Date.now().toString();
};

export const crmService = {

  // LEADS
  async getLeads() {
    return load(KEYS.LEADS);
  },

  async createLead(lead: any) {
    const leads = load(KEYS.LEADS);

    const newLead = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...lead,
    };

    leads.push(newLead);
    save(KEYS.LEADS, leads);

    return newLead;
  },

  async updateLead(id: string, update: any) {
    const leads = load(KEYS.LEADS);

    const index = leads.findIndex((l: any) => l.id === id);

    if (index !== -1) {
      leads[index] = { ...leads[index], ...update };
      save(KEYS.LEADS, leads);
      return leads[index];
    }

    return null;
  },

  // DEMOS
  async getDemos() {
    return load(KEYS.DEMOS);
  },

  async createDemo(demo: any) {
    const demos = load(KEYS.DEMOS);

    const newDemo = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...demo,
    };

    demos.push(newDemo);
    save(KEYS.DEMOS, demos);

    return newDemo;
  },

};

export default crmService;

// MOCK STOCK CHECK
export const checkStockAvailability = async (productId: string) => {

  // mock data stok
  const mockStock = {
    available: true,
    quantity: Math.floor(Math.random() * 10) + 1,
    warehouse: "Main Warehouse",
    estimatedRestock: null,
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStock);
    }, 300);
  });

};
