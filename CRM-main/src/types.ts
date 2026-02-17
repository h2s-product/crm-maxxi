
export enum ProductCategory {
  LAND_PREP = 'LAND_PREP',
  DRONE = 'DRONE',
  HARVESTER = 'HARVESTER',
  ROBOTICS = 'ROBOTICS',
  PLANTING = 'PLANTING'
}

export enum ProductType {
  UNIT = 'UNIT',
  SPAREPART = 'SPAREPART'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  price: number;
  specs: Record<string, any>;
  stockStatus: string;
  imageUrl?: string;
  warehouseLocation?: string;
}

export enum CustomerType {
  GAPOKTAN = 'GAPOKTAN',
  GOVERNMENT = 'GOVERNMENT',
  DEALER = 'DEALER',
  INDIVIDUAL = 'INDIVIDUAL'
}

export interface Farm {
  id: string;
  location: string;
  landAreaHectares: number;
  primaryCrop: string;
  plantingSeasonStart: string;
  lat?: number;
  lng?: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: CustomerType;
  regionId?: string;
  subRegionId?: string;
  contactInfo: string;
  mobile?: string;
  phone?: string;
  email?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  address: string;
  lat?: number;
  lng?: number;
  farms: Farm[];
  nik?: string;
  npwp?: string;
  customFields?: Record<string, any>;
}

export interface MachineUnit {
  id: string;
  serialNumber: string;
  productId: string;
  customerId: string;
  showroomId: string;
  purchaseDate: string;
  hourMeter: number;
  lastServiceHM: number;
  status: string;
  lat?: number;
  lng?: number;
}

export enum LeadSource {
  MAXXI_TANI_APP = 'MAXXI_TANI_APP',
  WEB = 'WEB',
  DIRECT = 'DIRECT'
}

export enum LeadStatus {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export interface Lead {
  id: string;
  name: string;
  source: LeadSource;
  status: LeadStatus;
  phone: string;
  interest: string;
  location: string;
  regionId: string;
  createdAt: string;
  lat?: number;
  lng?: number;
}

export interface Deal {
  id: string;
  title: string;
  customerName: string;
  productName: string;
  value: number;
  stage: DealStage;
  stockStatus: string;
  probability: number;
  lastActivity: string;
  stageData?: Record<string, any>;
}

export enum DealStage {
  INQUIRY = 'INQUIRY',
  DEMO_UNIT = 'DEMO_UNIT',
  LEASING_KUR = 'LEASING_KUR',
  DOWN_PAYMENT = 'DOWN_PAYMENT',
  DELIVERY = 'DELIVERY',
  HANDOVER_TRAINING = 'HANDOVER_TRAINING'
}

export interface ServiceReportSparepart {
  code: string;
  name: string;
  qty: string;
  origin: string;
}

export interface ServiceReport {
  isWarranty: boolean;
  startTime: string;
  finishTime: string;
  chronologyDiagnosis: string;
  technicalInspectionResult: string;
  spareparts: ServiceReportSparepart[];
  checklist: {
    oilPressureBefore: string;
    oilPressureAfter: string;
    tempValue: string;
    smokeStatus: 'NORMAL' | 'ABNORMAL' | '';
    intakeStatus: 'NORMAL' | 'ABNORMAL' | '';
    noiseStatus: 'NORMAL' | 'ABNORMAL' | '';
    batteryVoltage: string;
    radiatorLevel: 'CUKUP' | 'KURANG' | '';
    airFilterStatus: 'BERSIH' | 'KOTOR' | '';
    fuelFilterStatus: 'GANTI' | 'TIDAK' | '';
  };
  evidenceChecklist: {
    photoOwnerId: boolean;
    photoUnit: boolean;
    photoPlate: boolean;
    photoEngineHours: boolean;
    photoOldParts: boolean;
    photoNewParts: boolean;
  };
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  unitId?: string;
  customerId?: string;
  complaintDate: string;
  reporterName: string;
  customerName: string;
  customerPhone: string;
  province: string;
  city: string;
  district?: string;
  village?: string;
  address: string;
  subject: string;
  description: string;
  productName: string;
  chassisNumber: string;
  engineNumber: string;
  hmReading: string;
  status: string;
  priority: string;
  createdAt: string;
  responseDate?: string;
  resolution?: string;
  completionDate?: string;
  assignedTo?: string;
  correctiveAction?: string;
  notes?: string;
  evidenceUrls?: string[];
  report?: ServiceReport;
}

export interface DemoSchedule {
  id: string;
  customerId: string;
  productId: string;
  scheduledDate: string;
  locationLink: string;
  status: string;
  notes?: string;
  cropType?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  specialization: string;
  status: string;
  phone: string;
}

export interface Showroom {
  id: string;
  name: string;
  phone: string;
  address: string;
  province: string;
  marketingRegion?: {
    id: string;
    name: string;
  };
  subRegionId?: string;
  hours: string[];
  lat?: number;
  lng?: number;
  annualTarget?: number;
  achievedRevenue?: number;
  lastYearRevenue?: number;
  mechanics?: Mechanic[];
  customFields?: Record<string, any>;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_CRM = 'ADMIN_CRM',
  SALES_AREA = 'SALES_AREA',
  DIRECTOR = 'DIRECTOR',
  BUSINESS_DEVELOPMENT = 'BUSINESS_DEVELOPMENT',
  MANAGEMENT_REPRESENTATIVE = 'MANAGEMENT_REPRESENTATIVE',
  QMS_DOCUMENT_CONTROL = 'QMS_DOCUMENT_CONTROL',
  FINANCE_ACCOUNTING = 'FINANCE_ACCOUNTING',
  QA_MANAGER = 'QA_MANAGER',
  QA_SUPERVISOR = 'QA_SUPERVISOR',
  QA_WORKER = 'QA_WORKER',
  RD_ADMIN_PP = 'RD_ADMIN_PP',
  RISET_SUPERVISOR = 'RISET_SUPERVISOR',
  DESIGN_SUPERVISOR = 'DESIGN_SUPERVISOR',
  DESIGN_CREATIVE_SUPERVISOR = 'DESIGN_CREATIVE_SUPERVISOR',
  HR_MANAGER = 'HR_MANAGER',
  PERSONALIA = 'PERSONALIA',
  LEGAL = 'LEGAL',
  LOGISTIC_PURCHASING_MANAGER = 'LOGISTIC_PURCHASING_MANAGER',
  PURCHASING_SUPERVISOR = 'PURCHASING_SUPERVISOR',
  LOGISTIC_SUPPORT = 'LOGISTIC_SUPPORT',
  MARKETING_MANAGER = 'MARKETING_MANAGER',
  MARKETING_BRANCH_HEAD = 'MARKETING_BRANCH_HEAD',
  BRANCH_HEAD = 'BRANCH_HEAD',
  COLLECTION_STAFF = 'COLLECTION_STAFF',
  MARKETING_STAFF = 'MARKETING_STAFF',
  TRAINING_MARKETING_ADMIN = 'TRAINING_MARKETING_ADMIN',
  SALES_PART_SUPERVISOR = 'SALES_PART_SUPERVISOR',
  SALES_PART_STAFF = 'SALES_PART_STAFF',
  PART_WAREHOUSE_SUPERVISOR = 'PART_WAREHOUSE_SUPERVISOR',
  STOCK_WAREHOUSE_WORKER = 'STOCK_WAREHOUSE_WORKER',
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER',
  FABRICATION = 'FABRICATION',
  FABRICATION_WORKER = 'FABRICATION_WORKER',
  ASSEMBLY = 'ASSEMBLY',
  ASSEMBLY_SUPPORT = 'ASSEMBLY_SUPPORT',
  PAINTING_SUPERVISOR = 'PAINTING_SUPERVISOR',
  PAINTING_WORKER = 'PAINTING_WORKER',
  MATERIAL_WAREHOUSE_SUPERVISOR = 'MATERIAL_WAREHOUSE_SUPERVISOR',
  STOCK_KEEPER = 'STOCK_KEEPER',
  MAINTENANCE_SUPERVISOR = 'MAINTENANCE_SUPERVISOR',
  MAINTENANCE_WORKER = 'MAINTENANCE_WORKER',
  AFTER_SALES_SERVICE = 'AFTER_SALES_SERVICE',
  SERVICE_CENTER = 'SERVICE_CENTER',
  SAHABAT_MAXXI = 'SAHABAT_MAXXI',
  SERVICE_MECHANIC = 'SERVICE_MECHANIC',
  SERVICE_SUPPORT = 'SERVICE_SUPPORT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  permissions?: string[];
  regionId?: string;
  subRegionId?: string;
  showroomId?: string;
  annualTarget?: number;
  achievedRevenue?: number;
  avatarUrl?: string;
}

export enum FormType {
  LEAD = 'LEAD',
  CUSTOMER = 'CUSTOMER',
  TICKET = 'TICKET',
  SHOWROOM = 'SHOWROOM',
  SERVICE_STATION = 'SERVICE_STATION',
  USER = 'USER'
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  FILE = 'FILE'
}

export interface FormFieldConfig {
  id: string;
  formType: FormType;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  isActive: boolean;
  options?: string[];
}

export interface DashboardWidgetConfig {
  id: string;
  label: string;
  description: string;
  isVisible: boolean;
  type: 'CHART' | 'MAP';
}

export interface SubRegional {
  id: string;
  name: string;
  cities: string[];
  annualTarget?: number;
  lastYearRevenue?: number;
}

export interface RegionalZone {
  id: string;
  name: string;
  province: string;
  provinceIds?: string[];
  subRegions?: SubRegional[];
  annualTarget?: number;
  lastYearRevenue?: number;
}
