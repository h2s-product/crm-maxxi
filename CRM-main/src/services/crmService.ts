// MOCK CRM SERVICE
// No API required

// GET LEADS
export const getLeads = async () => {
  return [];
};

// CREATE LEAD
export const createLead = async (lead: any) => {
  return {
    success: true,
    id: "LEAD-" + Date.now(),
  };
};

// UPDATE LEAD
export const updateLead = async (leadId: string, data: any) => {
  return {
    success: true,
  };
};

// GET DEMOS
export const getDemos = async () => {
  return [];
};

// CREATE DEMO
export const createDemo = async (demo: any) => {
  return {
    success: true,
    id: "DEMO-" + Date.now(),
  };
};

// SCHEDULE DEMO (FIX ERROR)
export const scheduleDemo = async (demoData: any) => {
  console.log("Scheduling demo:", demoData);

  return {
    success: true,
    id: "DEMO-" + Date.now(),
  };
};

// CHECK STOCK (FIX ERROR SEBELUMNYA)
export const checkStockAvailability = async (productId: string) => {
  return {
    available: true,
    quantity: 10,
    warehouse: "Main Warehouse",
  };
};
