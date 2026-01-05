import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Default Store
  const store = await prisma.store.upsert({
    where: { id: 'default-store' },
    update: { name: '本社', address: '本社住所...' },
    create: {
      id: 'default-store',
      name: '本社',
      address: '本社住所...',
    },
  })

  console.log({ store })

  // Create Users
  // 1. General Staff
  await prisma.user.upsert({
    where: { code: '9999' },
    update: { homeStoreId: 'default-store', role: 'STAFF' },
    create: {
      code: '9999',
      name: 'テスト太郎 (一般)',
      password: '1234',
      homeStoreId: 'default-store',
      role: 'STAFF'
    },
  })

  // 2. Headquarter Admin
  await prisma.user.upsert({
    where: { code: 'admin' },
    update: { homeStoreId: 'default-store', role: 'HEADQUARTERS' },
    create: {
      code: 'admin',
      name: '本社 管理者',
      password: 'admin',
      homeStoreId: 'default-store',
      role: 'HEADQUARTERS'
    },
  })

  // 3. Store Manager
  await prisma.user.upsert({
    where: { code: 'manager' },
    update: { homeStoreId: 'default-store', role: 'STORE_MANAGER' },
    create: {
      code: 'manager',
      name: '店舗 店長',
      password: 'manager',
      homeStoreId: 'default-store',
      role: 'STORE_MANAGER'
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
