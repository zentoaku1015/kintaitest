import { getUsersList, createUser, deleteUser, getStoresList } from '../actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await getUsersList()
    const stores = await getStoresList()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">従業員管理</h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>新規従業員登録</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            'use server'
                            await createUser(formData)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">氏名</Label>
                                <Input id="name" name="name" placeholder="例: 山田 花子" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">従業員コード (ログインID)</Label>
                                <Input id="code" name="code" placeholder="例: 9999" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">PIN (パスワード)</Label>
                                <Input id="password" name="password" type="text" placeholder="例: 1234" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="homeStoreId">所属店舗</Label>
                                <Select name="homeStoreId" required className="bg-background">
                                    <option value="" disabled selected>選択してください</option>
                                    {stores.map(store => (
                                        <option key={store.id} value={store.id}>{store.name}</option>
                                    ))}
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">登録する</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>従業員一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3">コード</th>
                                        <th className="px-4 py-3">氏名</th>
                                        <th className="px-4 py-3">所属店舗</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr key={user.id} className="bg-background">
                                            <td className="px-4 py-3 font-mono">{user.code}</td>
                                            <td className="px-4 py-3">{user.name}</td>
                                            <td className="px-4 py-3">{user.homeStore.name}</td>
                                            <td className="px-4 py-3 text-right">
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteUser(user.id)
                                                }} className="inline-block">
                                                    <Button variant="destructive" size="sm">削除</Button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                従業員が登録されていません
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
