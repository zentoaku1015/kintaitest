import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const where: any = {}

    if (start || end) {
        where.timestamp = {}
        if (start) where.timestamp.gte = new Date(start)
        if (end) where.timestamp.lte = new Date(new Date(end).setHours(23, 59, 59, 999))
    }

    const logs = await prisma.attendance.findMany({
        where,
        include: {
            user: true,
            store: true,
        },
        orderBy: {
            timestamp: 'desc',
        },
    })

    // Generate CSV
    const header = ['ID', '日時', '店舗', '氏名', '種別', '従業員コード']
    const rows = logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.store.name,
        log.user.name,
        log.type,
        log.user.code
    ])

    const csvContent = [
        header.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    // Add BOM for Excel compatibility if needed, or just UTF-8
    const bom = '\uFEFF'

    return new NextResponse(bom + csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="attendance_logs.csv"',
        },
    })
}
