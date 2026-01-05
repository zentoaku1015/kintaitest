'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stampAttendance, logout } from './actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogOut, Sun, Moon, Clock, Coffee, Calendar, History, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMonthlyAttendance } from './actions'

type AttendanceLog = {
    id: string
    type: string
    timestamp: Date
    store: { name: string }
}

type Session = {
    userId: string
    name: string
    storeId: string
    homeStoreId: string
    storeName?: string // Passed from server or just ID
}

export function DashboardClient({ session, storeName }: { session: Session, storeName: string }) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [historyDate, setHistoryDate] = useState(new Date())
    const [historyLogs, setHistoryLogs] = useState<AttendanceLog[]>([])

    // Load history when modal opens or date changes
    useEffect(() => {
        if (isHistoryOpen) {
            getMonthlyAttendance(historyDate).then(setHistoryLogs)
        }
    }, [isHistoryOpen, historyDate])

    const getDailyLogs = (day: number) => {
        return historyLogs.filter(log => new Date(log.timestamp).getDate() === day)
    }

    const daysInMonth = new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 0).getDate()

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Auto Logout Countdown
    useEffect(() => {
        if (countdown === null) return
        if (countdown <= 0) {
            handleLogout()
            return
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const handleLogout = async () => {
        await logout()
    }

    const handleStamp = async (type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END', label: string) => {
        setIsProcessing(true)
        const res = await stampAttendance(type)
        setIsProcessing(false)

        if (res.error) {
            alert(res.error) // Simple alert for error
            return
        }

        // Success UI
        let msg = `お疲れ様です！\n${label}しました。`
        if (type === 'CLOCK_IN') msg = `おはようございます！\n${label}しました。`

        setStatusMessage(msg)
        setCountdown(3) // 3 seconds to logout
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">勤怠管理システム</h1>
                    <p className="text-sm text-muted-foreground">
                        勤務店舗: <span className="font-semibold text-primary">{storeName}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{session.name} さん</p>
                        <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString('ja-JP')} (金)</p>
                        {/* Note: Day of week is hardcoded logic needed if we want proper day */}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

                {/* Clock Display */}
                <div className="text-center z-10">
                    <p className="text-2xl font-light text-muted-foreground tracking-widest mb-2">CURRENT TIME</p>
                    <div className="text-7xl sm:text-9xl font-bold tabular-nums tracking-tighter text-primary">
                        {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-xl mt-2 text-muted-foreground/80">
                        {currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 w-full max-w-4xl z-10">
                    <Button
                        variant="default"
                        size="xl" // Custom size
                        className="flex-col gap-4 h-48 sm:h-64 text-2xl sm:text-3xl bg-blue-600 hover:bg-blue-700 shadow-blue-900/20 md:transform md:transition-transform md:hover:scale-105"
                        onClick={() => handleStamp('CLOCK_IN', '出勤')}
                        disabled={isProcessing}
                    >
                        <Sun className="w-12 h-12 sm:w-16 sm:h-16 mb-2" />
                        出 勤
                    </Button>

                    <Button
                        variant="default"
                        size="xl"
                        className="flex-col gap-4 h-48 sm:h-64 text-2xl sm:text-3xl bg-slate-800 hover:bg-slate-900 shadow-slate-900/20 md:transform md:transition-transform md:hover:scale-105"
                        onClick={() => handleStamp('CLOCK_OUT', '退勤')}
                        disabled={isProcessing}
                    >
                        <Moon className="w-12 h-12 sm:w-16 sm:h-16 mb-2" />
                        退 勤
                    </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-4 z-10">
                    <Button variant="outline" size="lg" className="w-40" disabled>
                        <Coffee className="mr-2 w-4 h-4" /> 休憩
                    </Button>
                    <Button variant="outline" size="lg" className="w-40" disabled>
                        <Calendar className="mr-2 w-4 h-4" /> 休暇申請
                    </Button>
                </div>

                <div className="z-10 mt-8">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2" onClick={() => setIsHistoryOpen(true)}>
                        <History className="w-5 h-5" />
                        勤怠履歴を確認
                    </Button>
                </div>
            </main>

            {/* History Modal */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                    >
                        <Card className="w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <History className="w-5 h-5" /> 勤怠履歴
                                    </h2>
                                    <div className="flex items-center gap-2 bg-background rounded-md border px-2 py-1">
                                        <button onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() - 1, 1))} className="p-1 hover:bg-accent rounded">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="font-mono font-medium min-w-[100px] text-center">
                                            {historyDate.getFullYear()}年 {historyDate.getMonth() + 1}月
                                        </span>
                                        <button onClick={() => setHistoryDate(new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 1))} className="p-1 hover:bg-accent rounded">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const start = new Date(historyDate.getFullYear(), historyDate.getMonth(), 1).toISOString()
                                            const end = new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 0).toISOString()
                                            window.open(`/api/export-sheet?start=${start}&end=${end}`, '_blank')
                                        }}
                                    >
                                        Excel出力
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-0">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-muted text-muted-foreground sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-left w-20">日付</th>
                                            <th className="px-4 py-3 font-medium text-left">勤務状況 (出勤 - 退勤)</th>
                                            <th className="px-4 py-3 font-medium text-left w-32">店舗</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1
                                            const logs = getDailyLogs(day)
                                            const date = new Date(historyDate.getFullYear(), historyDate.getMonth(), day)
                                            const isToday = new Date().toDateString() === date.toDateString()

                                            // Simple logic to pair IN/OUT. 
                                            // Improve: Sort by time, then map pairs.
                                            const clockIns = logs.filter(l => l.type === 'CLOCK_IN')
                                            const clockOuts = logs.filter(l => l.type === 'CLOCK_OUT')
                                            const maxPairs = Math.max(clockIns.length, clockOuts.length, 1)

                                            return (
                                                <tr key={day} className={cn("hover:bg-accent/30 transition-colors", isToday && "bg-blue-50/50 dark:bg-blue-900/10")}>
                                                    <td className="px-4 py-3 font-mono border-r">
                                                        <span className={cn(
                                                            "inline-block w-6 text-right",
                                                            [0, 6].includes(date.getDay()) && "text-red-500"
                                                        )}>{day}</span>
                                                        <span className="text-muted-foreground ml-1 text-xs">
                                                            ({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {logs.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {/* Just visual listing for now, pairing perfectly is complex if data is messy */}
                                                                {clockIns.map((ins, idx) => {
                                                                    const out = clockOuts[idx]
                                                                    return (
                                                                        <div key={ins.id} className="flex flex-col gap-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-mono">
                                                                                    {new Date(ins.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                                <span className="text-muted-foreground">→</span>
                                                                                {out ? (
                                                                                    <>
                                                                                        <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                                                                                            {new Date(out.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                        </span>
                                                                                        {/* Duration Calc */}
                                                                                        {(() => {
                                                                                            const diff = new Date(out.timestamp).getTime() - new Date(ins.timestamp).getTime()
                                                                                            const minutes = Math.floor(diff / 60000)
                                                                                            const workMinutes = Math.max(0, minutes - 60) // Deduct 1 hour (60 mins)
                                                                                            const h = Math.floor(workMinutes / 60)
                                                                                            const m = workMinutes % 60
                                                                                            return (
                                                                                                <span className="text-xs font-medium text-muted-foreground ml-2">
                                                                                                    (実働: {h}時間{m}分)
                                                                                                </span>
                                                                                            )
                                                                                        })()}
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="text-muted-foreground text-xs italic">勤務中...</span>
                                                                                )}
                                                                            </div>
                                                                            {/* Note Display (using any of the logs for the day/pair?) */}
                                                                            {(ins as any).note && <div className="text-xs text-muted-foreground">備考: {(ins as any).note}</div>}
                                                                            {out && (out as any).note && <div className="text-xs text-muted-foreground">備考: {(out as any).note}</div>}
                                                                        </div>
                                                                    )
                                                                })}
                                                                {/* Show orphan outs? */}
                                                                {clockOuts.length > clockIns.length && (
                                                                    <div className="text-destructive text-xs">
                                                                        ※ 退勤のみの記録があります
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/30 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {logs[0]?.store?.name}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal / Overlay */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
                    >
                        <div className="text-center space-y-6 p-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                            >
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-4xl font-bold whitespace-pre-line leading-relaxed">
                                    {statusMessage}
                                </h2>
                                <p className="text-muted-foreground mt-4 text-xl">
                                    {countdown}秒後にログアウトします...
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
