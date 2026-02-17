
import { Product, ProductCategory, Customer, CustomerType, MachineUnit, Lead, LeadSource, LeadStatus, Deal, DealStage, ProductType, ServiceTicket, DemoSchedule, Showroom, Mechanic, User, UserRole, FormFieldConfig, FormType, FieldType, DashboardWidgetConfig, RegionalZone } from './types';

export const REGIONAL_ZONES: RegionalZone[] = [
    { 
        id: 'REG-001', 
        name: 'JATIM', 
        province: 'Jawa Timur',
        provinceIds: ['35'],
        lastYearRevenue: 12000000000,
        subRegions: [
            { 
                id: 'sub-001', 
                name: 'Mataraman', 
                cities: ['Kab. Kediri', 'Kab. Nganjuk', 'Kab. Madiun', 'Kab. Tulungagung'],
                lastYearRevenue: 5000000000 
            },
            { 
                id: 'sub-002', 
                name: 'Pantura Jatim', 
                cities: ['Kab. Tuban', 'Kab Lamongan', 'Kab. Bojonegoro'],
                lastYearRevenue: 7000000000
            }
        ]
    },
    { id: 'REG-002', name: 'JATENG', province: 'Jawa Tengah, DI Yogyakarta', provinceIds: ['33', '34'] },
    { id: 'REG-003', name: 'JABAR', province: 'Jawa Barat, DKI Jakarta, Banten', provinceIds: ['32', '31', '36'] },
    { id: 'REG-004', name: 'SULSEL', province: 'Sulawesi Selatan', provinceIds: ['73'] },
    { id: 'REG-005', name: 'KALSEL', province: 'Kalimantan Selatan', provinceIds: ['63'] },
    { id: 'REG-006', name: 'KALTENG', province: 'Kalimantan Tengah', provinceIds: ['62'] },
    { id: 'REG-007', name: 'SUMBAGSEL', province: 'Sumatera Selatan, Lampung', provinceIds: ['16', '18'] },
    { id: 'REG-008', name: 'SUMBAGUT', province: 'Aceh, Sumatera Utara, Sumatera Barat, Riau', provinceIds: ['11', '12', '13', '14'] },
];

export const INDONESIAN_PROVINCES = [
    { id: "11", name: "Aceh" }, { id: "12", name: "Sumatera Utara" }, { id: "13", name: "Sumatera Barat" }, { id: "14", name: "Riau" }, { id: "15", name: "Jambi" }, { id: "16", name: "Sumatera Selatan" }, { id: "17", name: "Bengkulu" }, { id: "18", name: "Lampung" }, { id: "19", name: "Kepulauan Bangka Belitung" }, { id: "21", name: "Kepulauan Riau" }, { id: "31", name: "DKI Jakarta" }, { id: "32", name: "Jawa Barat" }, { id: "33", name: "Jawa Tengah" }, { id: "34", name: "DI Yogyakarta" }, { id: "35", name: "Jawa Timur" }, { id: "36", name: "Banten" }, { id: "51", name: "Bali" }, { id: "52", name: "Nusa Tenggara Barat" }, { id: "53", name: "Nusa Tenggara Timur" }, { id: "61", name: "Kalimantan Barat" }, { id: "62", name: "Kalimantan Tengah" }, { id: "63", name: "Kalimantan Selatan" }, { id: "64", name: "Kalimantan Timur" }, { id: "65", name: "Kalimantan Utara" }, { id: "71", name: "Sulawesi Utara" }, { id: "72", name: "Sulawesi Tengah" }, { id: "73", name: "Sulawesi Selatan" }, { id: "74", name: "Sulawesi Tenggara" }, { id: "75", name: "Gorontalo" }, { id: "76", name: "Sulawesi Barat" }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        sku: 'TR-4W-MAX',
        name: 'Traktor Maxxi 4WD',
        type: ProductType.UNIT,
        category: ProductCategory.LAND_PREP,
        price: 350000000,
        specs: { horsepower: '50 HP', drive: '4WD', transmission: '8F + 8R' },
        stockStatus: 'READY',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=400',
        warehouseLocation: 'WH-SUB-A1'
    },
    {
        id: 'p2',
        sku: 'XAG-P60',
        name: 'XAG P60 Agricultural Drone',
        type: ProductType.UNIT,
        category: ProductCategory.DRONE,
        price: 250000000,
        specs: { tank: '20L', radar: 'Dynamic', rating: 'IP67' },
        stockStatus: 'READY',
        imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400',
        warehouseLocation: 'WH-JKT-D2'
    },
    {
        id: 'p3',
        sku: 'BIMO-110X',
        name: 'Bimo 110X SS Combine Harvester',
        type: ProductType.UNIT,
        category: ProductCategory.HARVESTER,
        price: 450000000,
        specs: { engine: '110 HP', grainTank: '1.5 Ton' },
        stockStatus: 'INDENT',
        imageUrl: 'https://images.unsplash.com/photo-1594488310344-93457581335d?w=400',
        warehouseLocation: 'WH-SBY-H1'
    }
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'c-01-1',
        code: 'CUS-2025-0001',
        name: 'Gapoktan Tani Makmur',
        type: CustomerType.GAPOKTAN,
        regionId: 'REG-001',
        subRegionId: 'sub-001',
        contactInfo: 'Pak Budi - 08123456789',
        mobile: '08123456789',
        province: 'Jawa Timur',
        city: 'Kab. Ngawi',
        address: 'Jl. Raya Ngawi No. 45',
        lat: -7.4043,
        lng: 111.4423,
        farms: [{ id: 'f1', location: 'Ngawi, Jatim', landAreaHectares: 150, primaryCrop: 'PADI', plantingSeasonStart: '2023-11-01', lat: -7.4043, lng: 111.4423 }]
    },
    {
        id: 'c-bps-01',
        code: 'CUS-2026-0088',
        name: 'Bpk. Tri Wahyudi',
        type: CustomerType.INDIVIDUAL,
        regionId: 'REG-007',
        contactInfo: '0812-7788-9900',
        mobile: '0812-7788-9900',
        province: 'Lampung',
        city: 'Lampung Tengah',
        district: 'Trimurjo',
        village: 'Ds. Liman Benawi',
        address: 'Liman Benawi, Trimurjo, Lampung Tengah',
        lat: -5.045,
        lng: 105.187,
        farms: []
    }
];

export const MOCK_UNITS: MachineUnit[] = [
    {
        id: 'u-bimo-110x-01',
        serialNumber: 'WDH250096X0452',
        productId: 'p3',
        customerId: 'c-bps-01',
        showroomId: 'ss3',
        purchaseDate: '2024-05-10',
        hourMeter: 310,
        lastServiceHM: 302,
        status: 'ACTIVE',
        lat: -5.045,
        lng: 105.187
    }
];

export const MOCK_SERVICE_TICKETS: ServiceTicket[] = [
    {
        id: 'tkt-bimo-110x-001',
        ticketNumber: 'TKT-2026-001',
        unitId: 'u-bimo-110x-01',
        customerId: 'c-bps-01',
        complaintDate: '2026-01-06',
        reporterName: 'Bpk. Tri Wahyudi',
        customerName: 'Tri Wahyudi',
        customerPhone: '0812-7788-9900',
        province: 'Lampung',
        city: 'Lampung Tengah',
        district: 'Trimurjo',
        village: 'Liman Benawi',
        address: 'Liman Benawi, Trimurjo, Lampung Tengah',
        subject: 'Servis Berkala 300 Jam',
        description: 'Unit sudah memasuki waktu servis 300 jam operasi.',
        productName: 'Bimo 110X SS Combine Harvester',
        chassisNumber: 'WDH250096X0452',
        engineNumber: 'C52733732A',
        hmReading: '310',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        createdAt: '2026-01-06T08:19:00Z',
        responseDate: '2026-01-06',
        assignedTo: 'Andi Sales (Teknisi Lampung)',
        correctiveAction: 'Ganti Oli mesin\nGanti oli hidrolik\nGanti Oli girbox\nGanti filter HST\nGanti filter mesin',
        report: {
            isWarranty: true,
            startTime: '08:50',
            finishTime: '12:05',
            chronologyDiagnosis: 'Pemeriksaan rutin jam operasi 300. Ditemukan filter HST dan filter mesin perlu diganti. Oli mesin, hidrolik, dan gearbox dilakukan penggantian sesuai standar.',
            technicalInspectionResult: 'Oli dan Filter sudah diganti. Unit sudah beroperasi kembali dengan normal.',
            spareparts: [
                { code: '02.12.097.43.005', name: 'OIL FILTER HST W2.5M-05M-18-01X', qty: '3 PCS', origin: 'LAMPUNG' },
                { code: '02.12.097.00.029', name: 'OIL FILTER (CHANGCAI)', qty: '1 PCS', origin: 'LAMPUNG' }
            ],
            checklist: {
                oilPressureBefore: '0,4',
                oilPressureAfter: '0,4',
                tempValue: '40',
                smokeStatus: 'NORMAL',
                intakeStatus: 'NORMAL',
                noiseStatus: 'NORMAL',
                batteryVoltage: '12V',
                radiatorLevel: 'CUKUP',
                airFilterStatus: 'BERSIH',
                fuelFilterStatus: 'GANTI'
            },
            evidenceChecklist: {
                photoOwnerId: true,
                photoUnit: true,
                photoPlate: true,
                photoEngineHours: true,
                photoOldParts: true,
                photoNewParts: true
            }
        }
    },
    {
        id: 'tkt1',
        ticketNumber: 'TKT-2025-001',
        unitId: 'u1',
        customerId: 'c-01-1',
        complaintDate: '2025-05-20',
        reporterName: 'Pak Budi',
        customerName: 'Gapoktan Tani Makmur',
        customerPhone: '08123456789',
        province: 'Jawa Timur',
        city: 'Kab. Ngawi',
        district: 'Kec. Ngawi',
        village: 'Ds. Ngawi',
        address: 'Jl. Raya Ngawi No. 45',
        subject: 'GPS Signal Intermittent',
        description: 'RTK Module loses connection during flight.',
        productName: 'XAG P60 Agricultural Drone',
        chassisNumber: 'CH-XAG-001',
        engineNumber: 'EN-XAG-001',
        hmReading: '195',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: '2025-05-20T10:00:00Z'
    }
];

export const MOCK_LEADS: Lead[] = [
    {
        id: 'l1',
        name: 'H. Samsul',
        source: LeadSource.MAXXI_TANI_APP,
        status: LeadStatus.NEW,
        phone: '081299887766',
        interest: 'Drone Sprayer P60',
        location: 'Kediri',
        regionId: 'REG-001',
        createdAt: '2025-05-20',
        lat: -7.8480,
        lng: 112.0178
    }
];

export const MOCK_DEALS: Deal[] = [
    {
        id: 'd1',
        title: 'Pengadaan 3 Unit XAG P60',
        customerName: 'Dinas Pertanian Bojonegoro',
        productName: 'XAG P60 Agricultural Drone',
        value: 750000000,
        stage: DealStage.DEMO_UNIT,
        stockStatus: 'READY',
        probability: 60,
        lastActivity: 'Scheduling demo'
    }
];

export const MOCK_DEMO_SCHEDULES: DemoSchedule[] = [
    {
        id: 'demo1',
        customerId: 'c-01-2',
        productId: 'p2',
        scheduledDate: '2025-06-15',
        locationLink: 'https://maps.google.com/?q=-7.150975,111.881828',
        status: 'PENDING',
        notes: 'Demo for Gapoktan group'
    }
];

export const MOCK_MECHANICS: Mechanic[] = [
    { id: 'm1', name: 'Agus Mekanik', specialization: 'Drone Specialist', status: 'AVAILABLE', phone: '081222333444' },
    { id: 'm2', name: 'Budi Service', specialization: 'Harvester Expert', status: 'ON_DUTY', phone: '081222333555' },
    { id: 'm7', name: 'Andi Sales (Teknisi Lampung)', specialization: 'Combine Harvester Expert', status: 'AVAILABLE', phone: '0811-222-333' }
];

export const MOCK_SHOWROOMS: Showroom[] = [
    {
        id: 'ss3',
        name: 'Palembang Service Station',
        phone: '0711-443322',
        address: 'Jl. Basuki Rahmat No. 10',
        province: 'Sumatera Selatan',
        marketingRegion: { id: 'REG-007', name: 'SUMBAGSEL' },
        hours: ['08:00 - 17:00'],
        lat: -2.97,
        lng: 104.75,
        mechanics: [MOCK_MECHANICS[2]],
        lastYearRevenue: 2000000000
    },
    {
        id: 'ss4',
        name: 'Kediri Branch Office',
        phone: '0354-123456',
        address: 'Jl. Pemuda No. 88, Kediri',
        province: 'Jawa Timur',
        marketingRegion: { id: 'REG-001', name: 'JATIM' },
        subRegionId: 'sub-001',
        hours: ['08:00 - 16:00'],
        lat: -7.81,
        lng: 112.01,
        annualTarget: 1500000000,
        achievedRevenue: 0,
        lastYearRevenue: 3000000000
    },
    {
        id: 'ss5',
        name: 'Madiun Sales Center',
        phone: '0351-776655',
        address: 'Jl. Pahlawan No. 12, Madiun',
        province: 'Jawa Timur',
        marketingRegion: { id: 'REG-001', name: 'JATIM' },
        subRegionId: 'sub-001',
        hours: ['08:00 - 16:00'],
        lat: -7.63,
        lng: 111.52,
        annualTarget: 1200000000,
        achievedRevenue: 0,
        lastYearRevenue: 2000000000
    }
];

export const MOCK_USERS: User[] = [
    {
        id: 'u-1',
        name: 'Hendra IT',
        email: 'hendra.it@maxxi.co.id',
        phone: '081234567890',
        role: UserRole.SUPER_ADMIN,
        status: 'ACTIVE',
        lastLogin: '2025-05-22T08:00:00Z',
        permissions: []
    }
];

export const MOCK_FORM_CONFIG: FormFieldConfig[] = [
    { id: 'f-1', formType: FormType.LEAD, label: 'Lahan (Ha)', key: 'land_area', type: FieldType.NUMBER, required: true, isActive: true }
];

export const MOCK_DASHBOARD_CONFIG: DashboardWidgetConfig[] = [
    { id: 'w-metrics', label: 'Ringkasan Metrik Nasional', description: 'Kartu metrik utama: Pendapatan, Unit, SLA, dan Customer Active.', isVisible: true, type: 'CHART' },
    { id: 'w-revenue-chart', label: 'Grafik Performa Pendapatan', description: 'Perbandingan Realisasi Revenue vs Target Bulanan.', isVisible: true, type: 'CHART' },
    { id: 'w-yoy-chart', label: 'Analisis Pertumbuhan YoY', description: 'Komparasi performa tahun 2026 vs 2025.', isVisible: true, type: 'CHART' },
    { id: 'w-performance-table', label: 'Matriks Performa Berjenjang', description: 'Tabel performa detail per Regional, Sub-Reg, dan Showroom.', isVisible: true, type: 'CHART' },
    { id: 'w-leaderboard', label: 'Leaderboard Sales Achievement', description: 'Peringkat pencapaian target oleh personel Sales Area.', isVisible: true, type: 'CHART' },
    { id: 'w-contribution-donut', label: 'Donut Kontribusi Regional', description: 'Proporsi pendapatan berdasarkan wilayah regional.', isVisible: true, type: 'CHART' },
    { id: 'w-service-monitor', label: 'After-Sales SLA Monitor', description: 'Status antrian servis dan pencapaian target SLA.', isVisible: true, type: 'CHART' }
];
