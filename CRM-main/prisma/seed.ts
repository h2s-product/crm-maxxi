import { PrismaClient, ProductCategory, ProductType, CustomerType, DealStage, UnitStatus, ServiceType, TicketStatus, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean existing data (Optional: be careful in production)
  // await prisma.serviceTicket.deleteMany();
  // await prisma.serviceRecord.deleteMany();
  // await prisma.machineUnit.deleteMany();
  // await prisma.deal.deleteMany();
  // await prisma.farm.deleteMany();
  // await prisma.customer.deleteMany();
  // await prisma.product.deleteMany();

  // 2. Seed Products (Alsintan Knowledge Base)
  const products = await Promise.all([
    // Land Processing
    prisma.product.create({
      data: {
        sku: 'TR-4W-MAX',
        name: 'Traktor Maxxi 4WD',
        category: ProductCategory.LAND_PREP,
        type: ProductType.UNIT,
        price: 350000000,
        specs: { horsepower: '50 HP', drive: '4WD', transmission: '8F + 8R', weight: '2100 KG' },
        stockStatus: 'READY',
        warehouseLocation: 'WH-SUB-A1',
        imageUrl: 'https://picsum.photos/400/300?grayscale',
      },
    }),
    // Drones (Smart Farming)
    prisma.product.create({
      data: {
        sku: 'XAG-P60',
        name: 'XAG P60 Agricultural Drone',
        category: ProductCategory.DRONE,
        type: ProductType.UNIT,
        price: 250000000,
        specs: { tankCapacity: '20 Liters', maxFlowRate: '10L/min', radar: 'Dynamic', ipRating: 'IP67' },
        stockStatus: 'READY',
        warehouseLocation: 'WH-JKT-D2',
        imageUrl: 'https://picsum.photos/401/300?grayscale',
      },
    }),
    prisma.product.create({
      data: {
        sku: 'ANTASENA-01',
        name: 'Antasena Sprayer Drone',
        category: ProductCategory.DRONE,
        type: ProductType.UNIT,
        price: 180000000,
        specs: { tank: '10 Liters', flightTime: '15 Mins', coverage: '2 Ha/Hour' },
        stockStatus: 'READY',
        warehouseLocation: 'WH-JKT-D3',
        imageUrl: 'https://picsum.photos/404/300?grayscale',
      },
    }),
    // Robotics
    prisma.product.create({
      data: {
        sku: 'XAG-R100',
        name: 'XAG R100 Agricultural Rover',
        category: ProductCategory.ROBOTICS,
        type: ProductType.UNIT,
        price: 300000000,
        specs: { payload: '150L', operationMode: 'Autonomous', battery: 'Smart Battery B13960S' },
        stockStatus: 'INDENT',
        warehouseLocation: 'FACTORY-CHN',
        imageUrl: 'https://picsum.photos/402/300?grayscale',
      },
    }),
    // Harvesting
    prisma.product.create({
      data: {
        sku: 'BIMO-110X',
        name: 'Bimo 110X SS Combine Harvester',
        category: ProductCategory.HARVESTER,
        type: ProductType.UNIT,
        price: 450000000,
        specs: { crop: 'Corn/Maize', engine: '110 HP', grainTank: '1.5 Ton', trackSize: '500x90x51' },
        stockStatus: 'INDENT',
        warehouseLocation: 'WH-SBY-H1',
        imageUrl: 'https://picsum.photos/403/300?grayscale',
      },
    }),
    // Spareparts
    prisma.product.create({
      data: {
        sku: 'BATT-B13960S',
        name: 'Smart Battery B13960S (XAG)',
        category: ProductCategory.DRONE,
        type: ProductType.SPAREPART,
        price: 8500000,
        specs: { capacity: '962 Wh', voltage: '44.4V', weight: '2.5 KG' },
        stockStatus: 'LOW_STOCK',
        warehouseLocation: 'WH-JKT-SP1',
      },
    }),
  ]);

  // 3. Seed Customers & Farms
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Gapoktan Tani Makmur',
      type: CustomerType.GAPOKTAN,
      contactInfo: 'Pak Budi - 08123456789',
      address: 'Jl. Raya Ngawi No. 45, Jawa Timur',
      email: 'gapoktan.makmur@example.com',
      farms: {
        create: {
          location: 'Ngawi, Jawa Timur',
          landAreaHectares: 150,
          primaryCrop: 'PADI',
          plantingSeasonStart: new Date('2023-11-01'),
          latitude: -7.4043,
          longitude: 111.4423,
        },
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Dinas Pertanian Kab. Bojonegoro',
      type: CustomerType.GOVERNMENT,
      contactInfo: 'Sekretariat - 0353-12345',
      address: 'Bojonegoro, Jawa Timur',
    },
  });

  // 4. Seed Deals (Sales Pipeline)
  await prisma.deal.create({
    data: {
      title: 'Pengadaan 3 Unit XAG P60',
      customerId: customer2.id,
      productId: products[1].id, // XAG P60
      stage: DealStage.DEMO_UNIT,
      value: 750000000, // 3 * 250jt
      probability: 60,
      notes: 'Waiting for scheduling demo with Kepala Dinas',
      demoSchedule: {
        create: {
          customerId: customer2.id,
          productId: products[1].id,
          scheduledDate: new Date('2024-06-15'),
          locationLink: 'https://maps.google.com/?q=-7.150975,111.881828',
          status: 'PENDING',
        }
      }
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Pembelian Harvester Bimo 110X',
      customerId: customer1.id,
      productId: products[4].id, // Bimo 110X
      stage: DealStage.LEASING_KUR,
      value: 450000000,
      probability: 80,
      notes: 'Submitted to Bank Jatim for KUR analysis',
    },
  });

  // 5. Seed Sold Units & Service History
  const unit1 = await prisma.machineUnit.create({
    data: {
      serialNumber: 'XAG-P60-2023-001',
      productId: products[1].id,
      customerId: customer1.id,
      purchaseDate: new Date('2023-01-15'),
      hourMeter: 195,
      lastServiceHM: 100,
      lastServiceDate: new Date('2023-06-01'),
      status: UnitStatus.ACTIVE,
      serviceRecords: {
        create: {
          type: ServiceType.ROUTINE,
          description: '100H Inspection & Propeller Balance',
          technicianName: 'Agus Mekanik',
          hourMeterAtService: 100,
          cost: 1500000,
          date: new Date('2023-06-01'),
        }
      }
    },
  });

  // Create an active ticket for unit1
  await prisma.serviceTicket.create({
    data: {
      ticketNumber: 'TKT-2024-001',
      unitId: unit1.id,
      customerId: customer1.id,
      subject: 'GPS Signal Intermittent',
      description: 'RTK Module loses connection during autonomous flight planning.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    (process as any).exit(1);
  });
