import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { groupsApi, expensesApi, balancesApi, activityApi } from '@/api/client'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Receipt, Handshake, Users, Plus } from 'lucide-react'
import AddExpenseModal from '@/components/AddExpenseModal'
import AddMemberModal from '@/components/AddMemberModal'
import SettleUpModal from '@/components/SettleUpModal'
import { useAuth } from '@/context/AuthContext'

export default function GroupDetail() {
    const { id } = useParams()
    const { user } = useAuth()

    const [group, setGroup] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [balances, setBalances] = useState({ net_balances: [], pairwise: [] })
    const [activity, setActivity] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [showAddMember, setShowAddMember] = useState(false)
    const [showSettleUp, setShowSettleUp] = useState(false)

    function loadGroupData() {
        if (!id) return Promise.resolve()

        setError('')

        return Promise.all([
            groupsApi.get(id),
            expensesApi.list(id),
            balancesApi.get(id),
            activityApi.group(id),
        ])
            .then(([groupRes, expensesRes, balancesRes, activityRes]) => {
                setGroup(groupRes.data)
                setExpenses(expensesRes.data)
                setBalances(balancesRes.data)
                setActivity(activityRes.data)
            })
            .catch((err) => {
                setError(err.response?.data?.detail || 'Failed to load group')
            })
    }

    useEffect(() => {
        setLoading(true)
        loadGroupData().finally(() => setLoading(false))
    }, [id])

    function handleExpenseCreated() {
        setShowAddExpense(false)
        loadGroupData()
    }

    function handleMemberAdded() {
        setShowAddMember(false)
        loadGroupData()
    }

    function handleSettled() {
        setShowSettleUp(false)
        loadGroupData()
    }

    if (loading) {
        return (
            <Layout>
                <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
                    <div className="h-8 w-40 rounded bg-muted animate-pulse" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 h-80 rounded-lg bg-muted animate-pulse" />
                        <div className="h-80 rounded-lg bg-muted animate-pulse" />
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                <div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">{group?.name}</h1>
                            {group?.description && (
                                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {group?.members?.filter((m) => m.is_active).length || 0} members
                            </Badge>
                            <Button variant="outline" onClick={() => setShowAddMember(true)}>
                                Add member
                            </Button>
                            <Button onClick={() => setShowAddExpense(true)} className="gap-2">
                                <Plus size={16} />
                                Add expense
                            </Button>
                            <Button variant="outline" onClick={() => setShowSettleUp(true)}>
                                Settle up
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Expenses</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {expenses.length === 0 ? (
                                    <div className="p-6 text-sm text-muted-foreground">
                                        No expenses added yet.
                                    </div>
                                ) : (
                                    expenses.map((expense, index) => (
                                        <div key={expense.id}>
                                            <div className="px-6 py-4 flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium truncate">{expense.title}</p>
                                                        {expense.is_shared_asset && <Badge>Shared Asset</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {expense.category} · {formatDate(expense.created_at)}
                                                    </p>
                                                    {expense.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>
                                                    )}
                                                    {expense.is_shared_asset && expense.shared_asset && (
                                                        <div className="mt-3 rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
                                                            <p><span className="font-medium text-foreground">Asset:</span> {expense.shared_asset.asset_name}</p>
                                                            <p><span className="font-medium text-foreground">Total cost:</span> {formatCurrency(expense.shared_asset.total_cost)}</p>
                                                            <p><span className="font-medium text-foreground">Projected resale:</span> {formatCurrency(expense.shared_asset.expected_resale_value)}</p>
                                                            <p><span className="font-medium text-foreground">Estimated per person:</span> {formatCurrency(expense.shared_asset.per_person_estimate)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium shrink-0">
                                                    {formatCurrency(expense.amount)}
                                                </div>
                                            </div>
                                            {index < expenses.length - 1 && <Separator />}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {activity.length === 0 ? (
                                    <div className="p-6 text-sm text-muted-foreground">
                                        No activity yet.
                                    </div>
                                ) : (
                                    activity.map((item, index) => (
                                        <div key={`${item.type}-${item.id}`}>
                                            <div className="flex items-center gap-4 px-6 py-4">
                                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                                    {item.type === 'expense' ? (
                                                        <Receipt size={14} className="text-accent-foreground" />
                                                    ) : (
                                                        <Handshake size={14} className="text-accent-foreground" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{item.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                </div>

                                                <div className="text-sm font-medium shrink-0">
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            </div>
                                            {index < activity.length - 1 && <Separator />}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {group?.members?.length ? (
                                    group.members
                                        .filter((member) => member.is_active)
                                        .map((member) => (
                                            <div key={member.user_id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-muted-foreground" />
                                                    <span>{member.name}</span>
                                                </div>
                                                <span className="text-muted-foreground">{member.email}</span>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No members found.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Net balances</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {balances.net_balances?.length ? (
                                    balances.net_balances.map((item) => (
                                        <div key={item.user_id} className="flex items-center justify-between text-sm">
                                            <span>{item.name}</span>
                                            <span
                                                className={
                                                    item.net > 0
                                                        ? 'text-green-600 font-medium'
                                                        : item.net < 0
                                                            ? 'text-red-600 font-medium'
                                                            : 'text-muted-foreground'
                                                }
                                            >
                                                {item.net > 0 ? '+' : ''}
                                                {formatCurrency(item.net)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No balances yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pairwise balances</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {balances.pairwise?.length ? (
                                    balances.pairwise.map((item, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-medium">{item.from_name}</span>
                                            <span className="text-muted-foreground"> owes </span>
                                            <span className="font-medium">{item.to_name}</span>
                                            <span className="text-muted-foreground"> · </span>
                                            <span>{formatCurrency(item.amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Everyone is settled up.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {showAddExpense && (
                <AddExpenseModal
                    groupId={id}
                    members={group?.members || []}
                    onClose={() => setShowAddExpense(false)}
                    onCreated={handleExpenseCreated}
                />
            )}

            {showAddMember && (
                <AddMemberModal
                    groupId={id}
                    onClose={() => setShowAddMember(false)}
                    onAdded={handleMemberAdded}
                />
            )}
            {showSettleUp && (
                <SettleUpModal
                    groupId={id}
                    members={group?.members || []}
                    currentUse
                    rId={user?.id}
                    onClose={() => setShowSettleUp(false)}
                    onSettled={handleSettled}
                />
            )}
        </Layout>
    )
}