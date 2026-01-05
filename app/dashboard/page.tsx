import { redirect } from 'next/navigation'
import { getUserSession } from './actions'
import { DashboardClient } from './dashboard-client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardPage() {
    const session = await getUserSession()

    if (!session) {
        redirect('/')
    }

    // Fetch store name to be sure (or use session data if trusted)
    const store = await prisma.store.findUnique({
        where: { id: session.storeId },
        select: { name: true }
    })

    return (
        <DashboardClient
            session={session}
            storeName={store?.name || '不明な店舗'}
        />
    )
}
