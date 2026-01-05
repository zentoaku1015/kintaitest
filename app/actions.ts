'use server'

import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

// TODO: Use a singleton for PrismaClient in production to avoid hydration issues in dev

export async function getStores() {
    const stores = await prisma.store.findMany({
        select: { id: true, name: true }
    })
    return stores
}

export type Session = {
    userId: string
    name: string
    storeId: string
    homeStoreId: string
    role: string // HEADQUARTERS, STORE_MANAGER, STAFF
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie) return null
    try {
        return JSON.parse(sessionCookie.value)
    } catch {
        return null
    }
}

export async function login(formData: FormData) {
    const code = formData.get('code') as string
    const password = formData.get('password') as string
    const storeId = formData.get('storeId') as string // Selected working store

    if (!code || !password || !storeId) {
        return { error: '全ての項目を入力してください' }
    }

    const user = await prisma.user.findUnique({
        where: { code },
    })

    if (!user || user.password !== password) { // Simple comparison for prototype
        return { error: '従業員コードまたはパスワードが間違っています' }
    }

    // Session management: In a shared terminal, strictly speaking strict sessions aren't needed 
    // if we just verify and redirect, passing the user identity to the dashboard via a signed cookie or short-lived token.
    // For this prototype, we'll set a simple cookie with UserID + WorkingStoreID.

    const sessionData = JSON.stringify({ userId: user.id, name: user.name, storeId, homeStoreId: user.homeStoreId, role: user.role })

    const cookieStore = await cookies()
    cookieStore.set('session', sessionData, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 12, // 12 hours
    })

    redirect('/dashboard')
}
