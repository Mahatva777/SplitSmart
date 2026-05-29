import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { groupsApi, activityApi } from '@/api/client'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, Users, ArrowRight, Receipt, Handshake } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import CreateGroupModal from '@/components/CreateGroupModal'

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    Promise.all([groupsApi.list(), activityApi.dashboard()])
      .then(([gRes, aRes]) => {
        setGroups(gRes.data)
        setActivity(aRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  function onGroupCreated(group) {
    setGroups((prev) => [group, ...prev])
    setShowCreate(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-card border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 text-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your groups and recent activity
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Plus size={16} /> New group
          </Button>
        </div>

        <section>
          <h2 className="text-base font-medium mb-3 text-foreground">Your groups</h2>

          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-card p-10 text-center shadow-card">
              <Users size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No groups yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create a group to start splitting expenses
              </p>
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create your first group
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <Card className="hover:shadow-card transition-shadow cursor-pointer rounded-xl border border-white/10 bg-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight size={16} className="text-muted-foreground mt-0.5" />
                      </div>

                      <div className="flex items-center gap-1.5 mt-3">
                        <Users size={13} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {group.members.filter((m) => m.is_active).length} members
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {activity.length > 0 && (
          <section>
            <h2 className="text-base font-medium mb-3 text-foreground">Recent activity</h2>
            <Card className="rounded-xl border border-white/10 bg-card">
              <CardContent className="p-0">
                {activity.slice(0, 10).map((item, i) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                        {item.type === 'expense' ? (
                          <Receipt size={14} className="text-primary" />
                        ) : (
                          <Handshake size={14} className="text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.group_name} · {formatDate(item.created_at)}
                        </p>
                      </div>

                      <span
                        className={`text-sm font-medium shrink-0 ${item.type === 'settlement' ? 'text-primary' : 'text-foreground'
                          }`}
                      >
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {i < Math.min(activity.length, 10) - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={onGroupCreated}
        />
      )}
    </Layout>
  )
}