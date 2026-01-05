'use server'

import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

type Session = {
    userId: string
    name: string
    storeId: string
    homeStoreId: string
}

async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie) return null
    try {
        return JSON.parse(sessionCookie.value)
    } catch {
        return null
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/')
}

export async function stampAttendance(type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END') {
    const session = await getSession()
    if (!session) {
        return { error: 'セッションが切れました。再度ログインしてください。' }
    }

    try {
        const attendance = await prisma.attendance.create({
            data: {
                userId: session.userId,
                storeId: session.storeId,
                type,
                timestamp: new Date(),
            },
        })

        // Auto logout is handled by the client redirecting or us calling logout() here?
        // Requirement says: "Show message, then auto logout after 3-5 seconds".
        // So the Server Action should just return success, and Client handles the delay and redirect.
        // Or we clear cookie here immediately? No, we might need it for the success page? 
        // Usually, we return success, Client shows UI, then Client pushes router to / or hits a logout endpoint.
        // I'll return the result and let client handle the UX.

        return { success: true, data: attendance }
    } catch (e) {
        console.error(e)
        return { error: '打刻に失敗しました。' }
    }
}

export async function getUserSession() {
    return await getSession()
}

export async function getMonthlyAttendance(date: Date) {
    const session = await getSession()
    if (!session?.userId) return []

    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

    return await prisma.attendance.findMany({
        where: {
            userId: session.userId,
            timestamp: { gte: start, lte: end }
        },
        orderBy: { timestamp: 'asc' },
        include: { store: true }
    })
}
