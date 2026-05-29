import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { expensesApi } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CATEGORIES = [
    'Food',
    'Transport',
    'Rent',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Shared Asset',
    'Miscellaneous',
]

export default function AddExpenseModal({ groupId, members = [], onClose, onCreated }) {
    const activeMembers = useMemo(
        () => members.filter((member) => member.is_active),
        [members]
    )

    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('Food')
    const [notes, setNotes] = useState('')
    const [isSharedAsset, setIsSharedAsset] = useState(false)

    const [assetName, setAssetName] = useState('')
    const [deliveryFee, setDeliveryFee] = useState('')
    const [setupFee, setSetupFee] = useState('')
    const [expectedResaleValue, setExpectedResaleValue] = useState('')

    const [selectedMemberIds, setSelectedMemberIds] = useState(
        activeMembers.map((member) => member.user_id)
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function toggleMember(userId) {
        setSelectedMemberIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!title.trim()) {
            setError('Title is required')
            return
        }

        if (!amount || Number(amount) <= 0) {
            setError('Amount must be greater than 0')
            return
        }

        if (selectedMemberIds.length === 0) {
            setError('Select at least one member')
            return
        }

        if (isSharedAsset && !assetName.trim()) {
            setError('Asset name is required')
            return
        }

        const payload = {
            title: title.trim(),
            amount: Number(amount),
            category: isSharedAsset ? 'Shared Asset' : category,
            notes: notes.trim() || null,
            member_ids: selectedMemberIds,
            is_shared_asset: isSharedAsset,
            shared_asset: isSharedAsset
                ? {
                    asset_name: assetName.trim(),
                    purchase_cost: Number(amount),
                    delivery_fee: Number(deliveryFee || 0),
                    setup_fee: Number(setupFee || 0),
                    expected_resale_value: Number(expectedResaleValue || 0),
                }
                : null,
        }

        setLoading(true)
        try {
            const res = await expensesApi.create(groupId, payload)
            onCreated(res.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create expense')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-lg border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">Add expense</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Dinner, Uber, Sofa"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="amount">
                                {isSharedAsset ? 'Purchase cost' : 'Amount'}
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={isSharedAsset ? 'Shared Asset' : category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isSharedAsset}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {CATEGORIES.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional"
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="rounded-md border p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shared-asset-toggle" className="cursor-pointer">
                                Shared Asset
                            </Label>
                            <input
                                id="shared-asset-toggle"
                                type="checkbox"
                                checked={isSharedAsset}
                                onChange={(e) => setIsSharedAsset(e.target.checked)}
                            />
                        </div>

                        {isSharedAsset && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label htmlFor="asset-name">Asset name</Label>
                                    <Input
                                        id="asset-name"
                                        value={assetName}
                                        onChange={(e) => setAssetName(e.target.value)}
                                        placeholder="e.g. Sofa, Washing Machine"
                                        required={isSharedAsset}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="delivery-fee">Delivery fee</Label>
                                    <Input
                                        id="delivery-fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={deliveryFee}
                                        onChange={(e) => setDeliveryFee(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="setup-fee">Setup fee</Label>
                                    <Input
                                        id="setup-fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={setupFee}
                                        onChange={(e) => setSetupFee(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="expected-resale-value">Expected resale value</Label>
                                    <Input
                                        id="expected-resale-value"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={expectedResaleValue}
                                        onChange={(e) => setExpectedResaleValue(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Split among</Label>
                        <div className="rounded-md border p-3 space-y-2 max-h-44 overflow-y-auto">
                            {activeMembers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active members found.</p>
                            ) : (
                                activeMembers.map((member) => (
                                    <label
                                        key={member.user_id}
                                        className="flex items-center gap-3 text-sm cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMemberIds.includes(member.user_id)}
                                            onChange={() => toggleMember(member.user_id)}
                                        />
                                        <span>{member.name}</span>
                                        <span className="text-muted-foreground">{member.email}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? 'Creating…' : 'Create expense'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}