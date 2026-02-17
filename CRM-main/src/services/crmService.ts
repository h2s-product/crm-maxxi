/**
 * FULL MOCK CRM SERVICE
 * Netlify-safe, no backend required
 */

////////////////////////////
// HELPERS
////////////////////////////

const simulateDelay = (ms = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;


////////////////////////////
// AUTH
////////////////////////////

export const login = async (username: string, password: string) => {

  await simulateDelay();

  return {
    success: true,
    user: {
      id: generateId("USER"),
      name: username,
      email: `${username}@crm.local`,
      role: "ADMIN"
    }
  };

};


////////////////////////////
// DASHBOARD
////////////////////////////

export const getDashboardStats = async () => {

  await simulateDelay();

  return {
    leads: 120,
    deals: 45,
    revenue: 850000000,
    pendingDemo: 6,
    serviceTickets: 4
  };

};


////////////////////////////
// LEADS
////////////////////////////

export const getLeads = async () => {

  await simulateDelay();

  return [];

};

export const createLead = async (lead: any) => {

  await simulateDelay();

  return {
    success: true,
    id: generateId("LEAD")
  };

};


////////////////////////////
// DEMO
////////////////////////////

export const scheduleDemo = async (data: any) => {

  await simulateDelay();

  return {
    success: true,
    id: generateId("DEMO"),
    status: "SCHEDULED"
  };

};

export const getDemoSchedules = async () => {

  await simulateDelay();

  return [];

};


////////////////////////////
// QUOTES
////////////////////////////

export const createQuote = async (data: any) => {

  await simulateDelay();

  return {
    success: true,
    id: generateId("QUOTE")
  };

};

export const checkStockAvailability = async (productId?: string) => {

  await simulateDelay();

  return {
    available: true,
    quantity: 15,
    warehouse: "Jakarta"
  };

};


////////////////////////////
// SERVICE
////////////////////////////

export const createServiceTicket = async (ticket: any) => {

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


////////////////////////////
// INVENTORY
////////////////////////////

export const getInventory = async () => {

  await simulateDelay();

  return [];

};


////////////////////////////
// CUSTOMER
////////////////////////////

export const getCustomers = async () => {

  await simulateDelay();

  return [];

};


////////////////////////////
// USER
////////////////////////////

export const getUsers = async () => {

  await simulateDelay();

  return [];

};

export const createUser = async (user: any) => {

  await simulateDelay();

  return {
    success: true,
    userId: generateId("USER")
  };

};


////////////////////////////
// CAMPAIGN
////////////////////////////

export const getCampaigns = async () => {

  await simulateDelay();

  return [];

};


////////////////////////////
// REPORT
////////////////////////////

export const getReports = async () => {

  await simulateDelay();

  return [];

};


////////////////////////////
// TARGET
////////////////////////////

export const setSalesTarget = async () => {

  await simulateDelay();

  return {
    success: true
  };

};
