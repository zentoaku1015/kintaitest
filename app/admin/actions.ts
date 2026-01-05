'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- Store Actions ---

export async function getStoresList() {
    return await prisma.store.findMany({ orderBy: { name: 'asc' } })
}

export async function createStore(formData: FormData) {
    const name = formData.get('name') as string
    const address = formData.get('address') as string

    await prisma.store.create({
        data: { name, address }
    })
    revalidatePath('/admin/stores')
}

export async function updateStore(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const address = formData.get('address') as string

    await prisma.store.update({
        where: { id },
        data: { name, address }
    })
    revalidatePath('/admin/stores')
}

export async function deleteStore(id: string) {
    // Check for dependencies? For now, simple delete (might fail if foreign keys exist)
    try {
        await prisma.store.delete({ where: { id } })
        revalidatePath('/admin/stores')
        return { success: true }
    } catch (e) {
        return { error: '削除できませんでした。関連データが存在する可能性があります。' }
    }
}

// --- User Actions ---

export async function getUsersList() {
    return await prisma.user.findMany({
        include: { homeStore: true },
        orderBy: { code: 'asc' }
    })
}

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string
    const code = formData.get('code') as string
    const password = formData.get('password') as string
    const homeStoreId = formData.get('homeStoreId') as string

    try {
        await prisma.user.create({
            data: { name, code, password, homeStoreId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (e) {
        return { error: '登録に失敗しました（コードが重複している可能性があります）' }
    }
}

export async function updateUser(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const code = formData.get('code') as string
    const password = formData.get('password') as string
    const homeStoreId = formData.get('homeStoreId') as string

    try {
        await prisma.user.update({
            where: { id },
            data: { name, code, password, homeStoreId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (e) {
        return { error: '更新失敗' }
    }
}

export async function deleteUser(id: string) {
    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/users')
}
