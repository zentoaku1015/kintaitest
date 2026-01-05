import { PrismaClient } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSession } from '@/app/actions'
import { redirect } from 'next/navigation'
import { EditAttendanceButton } from '@/components/admin/edit-attendance-button'

const prisma = new PrismaClient()

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HQPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const session = await getSession()
    if (!session || session.role !== 'HEADQUARTERS') redirect('/')

    // Search Logic (Simple filters)
    const codeFilter = typeof searchParams.code === 'string' ? searchParams.code : undefined

    const where: any = {}
    if (codeFilter) {
        where.user = { code: { contains: codeFilter } }
    }

    const logs = await prisma.attendance.findMany({
        where,
        take: 100,
        orderBy: { timestamp: 'desc' },
        include: { user: true, store: true }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">本社管理画面</h2>
                    <p className="text-muted-foreground">全店舗の勤怠状況を確認・管理できます</p>
                </div>
                <div className="flex gap-4 items-end">
                    {/* Date Range Export Form */}
                    <form action="/api/export" method="get" className="flex items-end gap-2 bg-card p-2 rounded-lg border shadow-sm">
                        <div>
                            <Label htmlFor="start" className="text-xs">開始日</Label>
                            <Input type="date" id="start" name="start" className="h-8 w-32" />
                        </div>
                        <div>
                            <Label htmlFor="end" className="text-xs">終了日</Label>
                            <Input type="date" id="end" name="end" className="h-8 w-32" />
                        </div>
                        <Button type="submit" size="sm">期間指定CSV出力</Button>
                    </form>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>勤怠ログ一覧 (最新100件)</CardTitle>
                    <div className="flex gap-2 pt-2">
                        <form className="flex gap-2">
                            <Input name="code" placeholder="従業員コードで検索" defaultValue={codeFilter} className="w-48" />
                            <Button type="submit" variant="secondary">検索</Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">日時</th>
                                    <th className="px-4 py-3">氏名 (コード)</th>
                                    <th className="px-4 py-3">勤務店舗</th>
                                    <th className="px-4 py-3">種別</th>
                                    <th className="px-4 py-3">状態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="bg-background hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-mono">
                                            {log.timestamp.toLocaleString('ja-JP')}
                                            {log.isModified && (
                                                <div className="text-xs text-muted-foreground">
                                                    (元: {log.originalTimestamp ? new Date(log.originalTimestamp).toLocaleString('ja-JP') : '-'})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{log.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{log.user.code}</div>
                                        </td>
                                        <td className="px-4 py-3">{log.store.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${log.type === 'CLOCK_IN' ? 'bg-blue-100 text-blue-800' :
                                                log.type === 'CLOCK_OUT' ? 'bg-slate-100 text-slate-800' :
                                                    'bg-zinc-100'
                                                }`}>
                                                {log.type === 'CLOCK_IN' ? '出勤' :
                                                    log.type === 'CLOCK_OUT' ? '退勤' : log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.isModified ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    修正済
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                            {/* 修正ボタンはここに追加予定 (UI Modal) */}
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
