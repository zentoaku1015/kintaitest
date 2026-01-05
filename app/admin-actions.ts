'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- Dashboard History ---
export async function getMonthlyAttendance(userId: string, date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

    const logs = await prisma.attendance.findMany({
        where: {
            userId,
            timestamp: {
                gte: start,
                lte: end
            }
        },
        orderBy: { timestamp: 'asc' },
        include: { store: true }
    })

    return logs
}

// --- Admin Correction ---
export async function updateAttendanceLog(logId: string, newTimestamp: string, modifierId: string) {
    const log = await prisma.attendance.findUnique({ where: { id: logId } })
    if (!log) return { error: '記録が見つかりません' }

    await prisma.attendance.update({
        where: { id: logId },
        data: {
            timestamp: new Date(newTimestamp),
            isModified: true,
            modifiedAt: new Date(),
            modifiedBy: modifierId,
            originalTimestamp: log.originalTimestamp || log.timestamp // Keep original if already modified
        }
    })
    revalidatePath('/admin')
    return { success: true }
}

// --- Admin Export with Date Range ---
// Note: This logic might be in the route handler, but generic fetcher here logic if needed.
