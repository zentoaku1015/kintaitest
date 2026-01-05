
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Create Default Store
        const store = await prisma.store.upsert({
            where: { id: 'default-store' },
            update: { name: '本社', address: '本社住所...' },
            create: {
                id: 'default-store',
                name: '本社',
                address: '本社住所...',
            },
        });

        // 2. Headquarter Admin
        const admin = await prisma.user.upsert({
            where: { code: 'admin' },
            update: { homeStoreId: 'default-store', role: 'HEADQUARTERS' },
            create: {
                code: 'admin',
                name: '本社 管理者',
                password: 'admin',
                homeStoreId: 'default-store',
                role: 'HEADQUARTERS',
            },
        });

        // 3. Store Manager
        const manager = await prisma.user.upsert({
            where: { code: 'manager' },
            update: { homeStoreId: 'default-store', role: 'STORE_MANAGER' },
            create: {
                code: 'manager',
                name: '店舗 店長',
                password: 'manager',
                homeStoreId: 'default-store',
                role: 'STORE_MANAGER',
            },
        });

        // 4. General Staff
        const staff = await prisma.user.upsert({
            where: { code: '9999' },
            update: { homeStoreId: 'default-store', role: 'STAFF' },
            create: {
                code: '9999',
                name: 'テスト太郎 (一般)',
                password: '1234',
                homeStoreId: 'default-store',
                role: 'STAFF',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Initial data setup completed',
            data: { store, admin: admin.name, manager: manager.name, staff: staff.name }
        });

    } catch (error) {
        console.error('Setup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to setup initial data' },
            { status: 500 }
        );
    }
}
