import { useState } from 'react'
import { X } from 'lucide-react'
import { groupsApi } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddMemberModal({ groupId, onClose, onAdded }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('Email is required')
            return
        }

        setLoading(true)
        try {
            await groupsApi.addMember(groupId, { email: email.trim() })
            onAdded()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-base font-semibold">Add member</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="member-email">Email</Label>
                        <Input
                            id="member-email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? 'Adding…' : 'Add member'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}