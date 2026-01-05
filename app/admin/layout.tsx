import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Store, LogOut } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r p-6 flex flex-col gap-6 fixed h-full">
                <div>
                    <h1 className="text-xl font-bold tracking-tight px-2">管理画面</h1>
                    <p className="text-xs text-muted-foreground px-2">Phantom Eagle Admin</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start gap-2">
                        <Link href="/admin">
                            <LayoutDashboard className="w-4 h-4" /> 勤怠ログ
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start gap-2">
                        <Link href="/admin/stores">
                            <Store className="w-4 h-4" /> 店舗管理
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start gap-2">
                        <Link href="/admin/users">
                            <Users className="w-4 h-4" /> 従業員管理
                        </Link>
                    </Button>
                </nav>

                <Button asChild variant="outline" className="w-full justify-start gap-2 text-muted-foreground">
                    <Link href="/">
                        <LogOut className="w-4 h-4" /> アプリへ戻る
                    </Link>
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
