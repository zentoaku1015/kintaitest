import { PrismaClient } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getSession } from '@/app/actions'
import { redirect } from 'next/navigation'
import { EditAttendanceButton } from '@/components/admin/edit-attendance-button'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function StoreAdminPage() {
    const session = await getSession()
    if (!session || session.role !== 'STORE_MANAGER') {
        redirect('/') // Double check security
    }

    const logs = await prisma.attendance.findMany({
        where: { storeId: session.homeStoreId },
        take: 100,
        orderBy: { timestamp: 'desc' },
        include: { user: true }
    })

    // Get Store Name
    const store = await prisma.store.findUnique({ where: { id: session.homeStoreId }, select: { name: true } })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">店舗管理画面</h2>
                    <p className="text-muted-foreground">{store?.name || '担当店舗'}の勤怠状況</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>最新の打刻履歴</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">日時</th>
                                    <th className="px-4 py-3">氏名</th>
                                    <th className="px-4 py-3">種別</th>
                                    <th className="px-4 py-3">状態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="bg-background">
                                        <td className="px-4 py-3 font-mono">
                                            {log.timestamp.toLocaleString('ja-JP')}
                                            {log.isModified && <span className="text-xs text-muted-foreground ml-2">(修正済)</span>}
                                        </td>
                                        <td className="px-4 py-3">{log.user.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${log.type === 'CLOCK_IN' ? 'bg-blue-100 text-blue-800' :
                                                log.type === 'CLOCK_OUT' ? 'bg-slate-100 text-slate-800' :
                                                    'bg-zinc-100'
                                                }`}>
                                                {log.type === 'CLOCK_IN' ? '出勤' :
                                                    log.type === 'CLOCK_OUT' ? '退勤' : log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            {log.isModified ? <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">修正済</span> : <span className="text-muted-foreground text-xs">-</span>}
                                            <EditAttendanceButton
                                                logId={log.id}
                                                currentTimestamp={log.timestamp}
                                                modifierId={session.userId}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
