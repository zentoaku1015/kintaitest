import { getStoresList, createStore, deleteStore } from '../actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

export default async function StoresPage() {
    const stores = await getStoresList()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">店舗管理</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>新規店舗登録</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createStore} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">店舗名</Label>
                                <Input id="name" name="name" placeholder="例: 新宿店" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">住所 (任意)</Label>
                                <Input id="address" name="address" placeholder="東京都新宿区..." />
                            </div>
                            <Button type="submit">登録する</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>登録済み店舗一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {stores.map((store) => (
                                <li key={store.id} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                                    <div>
                                        <p className="font-semibold">{store.name}</p>
                                        <p className="text-sm text-muted-foreground">{store.address}</p>
                                    </div>
                                    <form action={async () => {
                                        'use server'
                                        await deleteStore(store.id)
                                    }}>
                                        <Button variant="destructive" size="sm">削除</Button>
                                    </form>
                                </li>
                            ))}
                            {stores.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">店舗が登録されていません</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
