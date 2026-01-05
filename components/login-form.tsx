'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login } from '@/app/actions'
import { getPersonalHistory } from '@/app/history-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, MapPin, History, X } from 'lucide-react'

type Store = {
    id: string
    name: string
}

type AttendanceLog = {
    id: string
    type: string
    timestamp: Date
    store: { name: string }
}

export function LoginForm({ stores }: { stores: Store[] }) {
    const [defaultStoreId, setDefaultStoreId] = useState<string>('')
    const [selectedStoreId, setSelectedStoreId] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // History Modal State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [historyLogs, setHistoryLogs] = useState<AttendanceLog[]>([])
    const [historyUser, setHistoryUser] = useState('')
    const [historyError, setHistoryError] = useState('')

    // Load default store from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('phantom_eagle_default_store')
        if (stored) {
            setDefaultStoreId(stored)
            setSelectedStoreId(stored)
        } else if (stores.length > 0) {
            setSelectedStoreId(stores[0].id)
        }
    }, [stores])

    const handleSetDefault = () => {
        localStorage.setItem('phantom_eagle_default_store', selectedStoreId)
        setDefaultStoreId(selectedStoreId)
        setIsSettingsOpen(false)
        alert(`この端末のデフォルト店舗を「${stores.find(s => s.id === selectedStoreId)?.name}」に設定しました`)
    }

    async function handleSubmit(formData: FormData) {
        const res = await login(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    async function handleCheckHistory(formData: FormData) {
        setHistoryError('')
        const res = await getPersonalHistory(formData)
        if (res.error) {
            setHistoryError(res.error)
        } else if (res.success && res.logs) {
            setHistoryLogs(res.logs)
            setHistoryUser(res.userName || '')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="shadow-2xl border-t-4 border-t-primary/80">
                    <CardHeader className="text-center space-y-1">
                        <CardTitle className="text-3xl font-bold tracking-tight">勤怠管理</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            従業員コードとPINを入力してください
                        </CardDescription>
                    </CardHeader>
                    <form action={handleSubmit}>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="store" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> 勤務店舗
                                </Label>
                                <Select
                                    name="storeId"
                                    id="store"
                                    value={selectedStoreId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStoreId(e.target.value)}
                                    className="bg-accent/30"
                                >
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </Select>
                                {/* Default Store Indicator */}
                                {defaultStoreId === selectedStoreId && (
                                    <p className="text-xs text-muted-foreground ml-1">※ この端末のデフォルト店舗です</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">従業員コード</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="例: 9999"
                                        required
                                        autoComplete="username"
                                        className="text-center tracking-widest text-xl font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">PIN (パスワード)</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="PIN"
                                        required
                                        className="text-center tracking-widest text-xl"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" size="lg">
                                ログイン
                            </Button>


                            {/* Settings Trigger */}
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    <Settings className="w-3 h-3" />
                                    <span>端末設定</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setIsHistoryOpen(true); setHistoryLogs([]); setHistoryError(''); }}
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                >
                                    <History className="w-3 h-3" />
                                    <span>勤怠実績を確認</span>
                                </button>
                            </div>

                            {/* Collapsible Settings Area */}
                            {isSettingsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="w-full pt-4 border-t text-center"
                                >
                                    <p className="text-xs text-muted-foreground mb-2">
                                        以下ボタンを押すと、現在選択中の店舗<br />(<strong>{stores.find(s => s.id === selectedStoreId)?.name}</strong>) を<br />この端末のデフォルトにします。
                                    </p>
                                    <Button type="button" variant="outline" size="sm" onClick={handleSetDefault}>
                                        デフォルト店舗として保存
                                    </Button>
                                </motion.div>
                            )}
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>

            {/* History Modal */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                    >
                        <Card className="w-full max-w-lg shadow-xl relative max-h-[90vh] flex flex-col">
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <CardHeader>
                                <CardTitle>勤怠実績確認</CardTitle>
                                <CardDescription>
                                    {historyUser ? `${historyUser} さんの履歴` : '本人確認のため、コードとPINを入力してください'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                {!historyUser ? (
                                    <form action={handleCheckHistory} className="space-y-4">
                                        {historyError && (
                                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                                                {historyError}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="history-code">従業員コード</Label>
                                            <Input id="history-code" name="code" placeholder="9999" required className="text-center tracking-widest" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="history-pass">PIN</Label>
                                            <Input id="history-pass" name="password" type="password" placeholder="PIN" required className="text-center tracking-widest" />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            確認する
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <ul className="divide-y text-sm">
                                            {historyLogs.map(log => (
                                                <li key={log.id} className="py-3 flex justify-between items-center">
                                                    <div>
                                                        <div className="font-mono font-medium">
                                                            {new Date(log.timestamp).toLocaleString('ja-JP')}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            @{log.store.name}
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'CLOCK_IN' ? 'bg-blue-100 text-blue-800' :
                                                            log.type === 'CLOCK_OUT' ? 'bg-slate-100 text-slate-800' : 'bg-zinc-100'
                                                        }`}>
                                                        {log.type === 'CLOCK_IN' ? '出勤' :
                                                            log.type === 'CLOCK_OUT' ? '退勤' : log.type}
                                                    </div>
                                                </li>
                                            ))}
                                            {historyLogs.length === 0 && (
                                                <p className="text-center py-4 text-muted-foreground">履歴がありません</p>
                                            )}
                                        </ul>
                                        <Button variant="outline" className="w-full" onClick={() => { setHistoryUser(''); setHistoryLogs([]); }}>
                                            別のユーザーを確認
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 text-xs text-muted-foreground/50">
                © Phantom Eagle Attendance System
            </div>
        </div>
    )
}
