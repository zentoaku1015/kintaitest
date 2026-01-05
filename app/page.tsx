import { getStores } from './actions'
import { LoginForm } from '@/components/login-form'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const stores = await getStores()

  return (
    <main>
      <LoginForm stores={stores} />
    </main>
  )
}
