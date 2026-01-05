'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPersonalHistory(formData: FormData) {
    const code = formData.get('code') as string
    const password = formData.get('password') as string

    if (!code || !password) {
        return { error: '従業員コードとPINを入力してください' }
    }

    const user = await prisma.user.findUnique({
        where: { code },
    })

    // Auth check
    if (!user || user.password !== password) {
        return { error: '認証に失敗しました' }
    }

    // Fetch recent logs (last 30 days or so, let's say last 20 entries)
    const logs = await prisma.attendance.findMany({
        where: { userId: user.id },
        include: { store: true },
        orderBy: { timestamp: 'desc' },
        take: 20
    })

    return { success: true, logs, userName: user.name }
}
