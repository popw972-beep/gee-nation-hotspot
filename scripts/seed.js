const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const users = await prisma.user.createMany({
    data: [
      {
        username: 'john_doe',
        ipAddress: '192.168.88.2',
        macAddress: '00:11:22:33:44:55',
        plan: '1 Day',
        status: 'Active',
        dataUsed: '512 MB',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        username: 'mary_wanjiku',
        ipAddress: '192.168.88.3',
        macAddress: '00:11:22:33:44:56',
        plan: '3 Hours',
        status: 'Active',
        dataUsed: '256 MB',
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      },
      {
        username: 'peter_kari',
        ipAddress: '192.168.88.4',
        macAddress: '00:11:22:33:44:57',
        plan: '1 Week',
        status: 'Active',
        dataUsed: '2.1 GB',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${users.count} sample users`);

  // Create sample vouchers
  const vouchers = await prisma.voucher.createMany({
    data: [
      { code: 'GNS-1H00-TEST', plan: '1 Hour', isUsed: false },
      { code: 'GNS-3H00-TEST', plan: '3 Hours', isUsed: false },
      { code: 'GNS-1D00-TEST', plan: '1 Day', isUsed: true },
      { code: 'GNS-1W00-TEST', plan: '1 Week', isUsed: false },
      { code: 'GNS-7D00-TEST', plan: '7 Days', isUsed: false },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${vouchers.count} sample vouchers`);

  // Create sample transactions
  const transactions = await prisma.transaction.createMany({
    data: [
      {
        merchantRequestId: 'MR-001',
        checkoutRequestId: 'ws_CO_001',
        phoneNumber: '254712345678',
        amount: 100,
        status: 'Completed',
        mpesaReceipt: 'MEB123456',
      },
      {
        merchantRequestId: 'MR-002',
        checkoutRequestId: 'ws_CO_002',
        phoneNumber: '254798765432',
        amount: 50,
        status: 'Completed',
        mpesaReceipt: 'MEB123457',
      },
      {
        merchantRequestId: 'MR-003',
        checkoutRequestId: 'ws_CO_003',
        phoneNumber: '254722222222',
        amount: 20,
        status: 'Pending',
        mpesaReceipt: null,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${transactions.count} sample transactions`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
