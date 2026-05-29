import { useAuth } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function Profile() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User size={18} className="text-accent-foreground" />
              </div>
              {user?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span>{user?.created_at ? formatDate(user.created_at) : '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
