import { getSession } from '../actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await getSession()

    if (!session) {
        redirect('/')
    }

    if (session.role === 'HEADQUARTERS') {
        redirect('/admin/hq')
    } else if (session.role === 'STORE_MANAGER') {
        redirect('/admin/store')
    } else {
        // Staff trying to access admin
        return (
            <div className="p-8 text-center text-destructive">
                <h1 className="text-2xl font-bold">アクセス権限がありません</h1>
                <p>管理者アカウントでログインしてください。</p>
            </div>
        )
    }
}
