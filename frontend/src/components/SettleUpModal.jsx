import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { settlementsApi } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettleUpModal({ groupId, members = [], currentUserId, onClose, onSettled }) {
    const activeMembers = useMemo(
        () => members.filter((m) => m.is_active),
        [members]
    )

    const [payerId, setPayerId] = useState(currentUserId || activeMembers[0]?.user_id || '')
    const [payeeId, setPayeeId] = useState(
        activeMembers.find((m) => m.user_id !== (currentUserId || activeMembers[0]?.user_id))?.user_id || ''
    )
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!payerId) { setError('Select who paid'); return }
        if (!payeeId) { setError('Select who received'); return }
        if (payerId === payeeId) { setError('Payer and payee must differ'); return }
        if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }

        setLoading(true)
        try {
            await settlementsApi.create(groupId, {
                payer_id: payerId,
                payee_id: payeeId,
                amount: Number(amount),
                note: note.trim() || null,
            })
            onSettled()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to record settlement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-base font-semibold">Settle up</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    {/* Payer */}
                    <div className="space-y-1.5">
                        <Label htmlFor="payer">Who paid</Label>
                        <select
                            id="payer"
                            value={payerId}
                            onChange={(e) => setPayerId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Select member</option>
                            {activeMembers.map((m) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payee */}
                    <div className="space-y-1.5">
                        <Label htmlFor="payee">Who received</Label>
                        <select
                            id="payee"
                            value={payeeId}
                            onChange={(e) => setPayeeId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Select member</option>
                            {activeMembers
                                .filter((m) => m.user_id !== payerId)
                                .map((m) => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label htmlFor="settle-amount">Amount</Label>
                        <Input
                            id="settle-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                        <Label htmlFor="settle-note">
                            Note <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="settle-note"
                            placeholder="e.g. UPI, cash, bank transfer"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? 'Saving…' : 'Record payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}