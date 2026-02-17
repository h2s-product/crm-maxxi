/**
 * CRM SERVICE - FULL MOCK VERSION
 * Safe for Netlify deployment
 * No backend required
 * Replace later with real API
 */

///////////////////////////////
// GENERIC HELPERS
///////////////////////////////

const simulateDelay = (ms = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;


///////////////////////////////
// AUTH
///////////////////////////////

export const login = async (username: string, password: string) => {

  await simulateDelay();

  return {
    success: true,
    user: {
      id: "USER-001",
      name: username,
      role: "ADMIN",
      email: `${username}@crm.local`
    }
  };

};


///////////////////////////////
// DASHBOARD
///////////////////////////////

export const getDashboardStats = async () => {

  await simulateDelay();

  return {
    totalLeads: 124,
    totalDeals: 32,
    totalRevenue: 820000000,
    conversionRate: 26,
    activeServiceTickets: 8,
    pendingDemo: 5
  };

};


///////////////////////////////
// LEADS
///////////////////////////////

export const getLeads = async () => {

  await simulateDelay();

  return [];

};

export const createLead = async (leadData: any) => {

  await simulateDelay();

  return {
    success: true,
    id: generateId("LEAD")
  };

};

export const updateLead = async (leadData: any) => {

  await simulateDelay();

  return {
    success: true
  };

};

export const deleteLead = async () => {

  await simulateDelay();

  return {
    success: true
  };

};


///////////////////////////////
// DEMO SCHEDULER
///////////////////////////////

export const getDemoSchedules = async () => {

  await simulateDelay();

  return [];

};

export const scheduleDemo = async (demoData: any) => {

  await simulateDelay();

  return {
    success: true,
    id: generateId("DEMO"),
    status: "SCHEDULED"
  };

};

export const updateDemoStatus = async () => {

  await simulateDelay();

  return {
    success: true
  };

};


///////////////////////////////
// QUOTE BUILDER
///////////////////////////////

export const createQuote = async (quoteData: any) => {

  await simulateDelay();

  return {
    success: true,
    quoteId: generateId("QUOTE")
  };

};

export const getQuotes = async () => {

  await simulateDelay();

  return [];

};

export const convertQuoteToDeal = async () => {

  await simulateDelay();

  return {
    success: true,
    dealId: generateId("DEAL")
  };

};


///////////////////////////////
// INVENTORY
///////////////////////////////

export const getInventory = async () => {

  await simulateDelay();

  return [];

};

export const checkStockAvailability = async (productId?: string) => {

  await simulateDelay();

  return {
    available: true,
    quantity: 12,
    warehouse: "Jakarta"
  };

};

export const updateStock = async () => {

  await simulateDelay();

  return {
    success: true
  };

};


///////////////////////////////
// SERVICE TICKETS
///////////////////////////////

export const createServiceTicket = async (ticketData: any) => {

  await simulateDelay();

  return {
    success: true,
    ticketId: generateId("TICKET"),
    status: "OPEN"
  };

};

export const getServiceTickets = async () => {

  await simulateDelay();

  return [];

};

export const updateServiceTicket = async () => {

  await simulateDelay();

  return {
    success: true
  };

};

export const closeServiceTicket = async () => {

  await simulateDelay();

  return {
    success: true
  };

};


///////////////////////////////
// CUSTOMERS
///////////////////////////////

export const getCustomers = async () => {

  await simulateDelay();

  return [];

};

export const createCustomer = async (customer: any) => {

  await simulateDelay();

  return {
    success: true,
    customerId: generateId("CUST")
  };

};


///////////////////////////////
// SHOWROOM
///////////////////////////////

export const getShowrooms = async () => {

  await simulateDelay();

  return [];

};


///////////////////////////////
// CAMPAIGNS
///////////////////////////////

export const getCampaigns = async () => {

  await simulateDelay();

  return [];

};

export const createCampaign = async (campaign: any) => {

  await simulateDelay();

  return {
    success: true,
    campaignId: generateId("CMP")
  };

};


///////////////////////////////
// USERS
///////////////////////////////

export const getUsers = async () => {

  await simulateDelay();

  return [];

};

export const createUser = async (user:
