import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
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
                    <div className="h-8 w-40 rounded-xl bg-card border border-white/10 animate-pulse" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 h-80 rounded-xl bg-card border border-white/10 animate-pulse" />
                        <div className="h-80 rounded-xl bg-card border border-white/10 animate-pulse" />
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>

                    <Card className="rounded-xl border border-white/10 bg-card">
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
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 text-foreground">
                <div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{group?.name}</h1>
                            {group?.description && (
                                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-white/5 text-foreground border border-white/10 hover:bg-white/5">
                                {group?.members?.filter((m) => m.is_active).length || 0} members
                            </Badge>

                            <Button
                                variant="outline"
                                onClick={() => setShowAddMember(true)}
                                className="rounded-xl border-white/10 bg-card hover:bg-white/5"
                            >
                                Add member
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setShowSettleUp(true)}
                                className="rounded-xl border-white/10 bg-card hover:bg-white/5"
                            >
                                Settle up
                            </Button>

                            <Button
                                onClick={() => setShowAddExpense(true)}
                                className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus size={16} />
                                Add expense
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-xl border border-white/10 bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Expenses</CardTitle>
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
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium truncate text-foreground">{expense.title}</p>
                                                        {expense.is_shared_asset && (
                                                            <Badge className="bg-primary/12 text-primary border border-primary/20 hover:bg-primary/12">
                                                                Shared Asset
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {expense.category} · {formatDate(expense.created_at)}
                                                    </p>

                                                    {expense.is_shared_asset && expense.shared_asset && (
                                                        <p className="text-sm text-foreground mt-2">
                                                            <span className="font-medium">Asset:</span>{' '}
                                                            {expense.shared_asset.asset_name}
                                                        </p>
                                                    )}

                                                    {expense.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>
                                                    )}

                                                    {expense.is_shared_asset && expense.shared_asset && (
                                                        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
                                                            <p className="text-sm font-medium mb-3 text-foreground">
                                                                Ownership summary
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                                                <div className="flex justify-between gap-3">
                                                                    <span className="text-muted-foreground">Purchase cost</span>
                                                                    <span className="text-foreground">
                                                                        {formatCurrency(expense.shared_asset.purchase_cost)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between gap-3">
                                                                    <span className="text-muted-foreground">Delivery fee</span>
                                                                    <span className="text-foreground">
                                                                        {formatCurrency(expense.shared_asset.delivery_fee)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between gap-3">
                                                                    <span className="text-muted-foreground">Setup fee</span>
                                                                    <span className="text-foreground">
                                                                        {formatCurrency(expense.shared_asset.setup_fee)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between gap-3">
                                                                    <span className="text-muted-foreground">Expected resale</span>
                                                                    <span className="text-foreground">
                                                                        {formatCurrency(expense.shared_asset.expected_resale_value)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between gap-3 sm:col-span-2">
                                                                    <span className="text-muted-foreground">
                                                                        Projected net ownership cost
                                                                    </span>
                                                                    <span className="font-medium text-foreground">
                                                                        {formatCurrency(expense.shared_asset.net_ownership_cost)}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between gap-3 sm:col-span-2">
                                                                    <span className="text-muted-foreground">
                                                                        Per-person ownership estimate
                                                                    </span>
                                                                    <span className="font-medium text-foreground">
                                                                        {formatCurrency(expense.shared_asset.per_person_estimate)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-sm font-medium shrink-0 text-foreground">
                                                    {formatCurrency(expense.amount)}
                                                </div>
                                            </div>

                                            {index < expenses.length - 1 && <Separator />}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-white/10 bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Recent activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {activity.length === 0 ? (
                                    <div className="p-6 text-sm text-muted-foreground">No activity yet.</div>
                                ) : (
                                    activity.map((item, index) => (
                                        <div key={`${item.type}-${item.id}`}>
                                            <div className="flex items-center gap-4 px-6 py-4">
                                                <div className="w-8 h-8 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                                                    {item.type === 'expense' ? (
                                                        <Receipt size={14} className="text-primary" />
                                                    ) : (
                                                        <Handshake size={14} className="text-primary" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                </div>

                                                <div className="text-sm font-medium shrink-0 text-foreground">
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
                        <Card className="rounded-xl border border-white/10 bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Members</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {group?.members?.length ? (
                                    group.members
                                        .filter((member) => member.is_active)
                                        .map((member) => (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-muted-foreground" />
                                                    <span className="text-foreground">{member.name}</span>
                                                </div>
                                                <span className="text-muted-foreground">{member.email}</span>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No members found.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-white/10 bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Net balances</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {balances.net_balances?.length ? (
                                    balances.net_balances.map((item) => (
                                        <div
                                            key={item.user_id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-foreground">{item.name}</span>
                                            <span
                                                className={
                                                    item.net > 0
                                                        ? 'text-primary font-medium'
                                                        : item.net < 0
                                                            ? 'text-red-400 font-medium'
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

                        <Card className="rounded-xl border border-white/10 bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Pairwise balances</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {balances.pairwise?.length ? (
                                    balances.pairwise.map((item, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-medium text-foreground">{item.from_name}</span>
                                            <span className="text-muted-foreground"> owes </span>
                                            <span className="font-medium text-foreground">{item.to_name}</span>
                                            <span className="text-muted-foreground"> · </span>
                                            <span className="text-foreground">{formatCurrency(item.amount)}</span>
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
                    currentUserId={user?.id}
                    onClose={() => setShowSettleUp(false)}
                    onSettled={handleSettled}
                />
            )}
        </Layout>
    )
}