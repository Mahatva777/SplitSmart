import { useRef, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { aiApi } from '@/api/client'
import { Button } from '@/components/ui/button'

export default function AIChat({
    groupId = null,
    title = 'AI Insights',
    description = 'Ask about spending, balances, categories, or shared assets.',
}) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    function scrollToBottom() {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
    }

    async function sendMessage() {
        const text = input.trim()
        if (!text || loading) return

        const userMessage = { role: 'user', content: text }
        const nextMessages = [...messages, userMessage]

        setMessages(nextMessages)
        setInput('')
        setLoading(true)
        scrollToBottom()

        const conversationHistory = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }))

        try {
            const res = groupId
                ? await aiApi.groupChat(groupId, {
                    message: text,
                    conversation_history: conversationHistory,
                })
                : await aiApi.globalChat({
                    message: text,
                    conversation_history: conversationHistory,
                })

            setMessages((prev) => [
                ...prev,
                { role: 'model', content: res.data.reply },
            ])
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'model',
                    content: err.response?.data?.detail || 'AI assistant is unavailable right now.',
                },
            ])
        } finally {
            setLoading(false)
            scrollToBottom()
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot size={16} className="text-accent-foreground" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>

            <div className="h-80 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        Try asking:
                        <ul className="mt-2 space-y-1 list-disc pl-5">
                            <li>What am I spending the most on?</li>
                            <li>Explain my current balance.</li>
                            <li>Summarize this group’s expenses.</li>
                            <li>How do shared asset costs compare?</li>
                        </ul>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">
                            Thinking…
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="border-t px-4 py-4">
                <div className="flex gap-2">
                    <textarea
                        rows={2}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        disabled={loading}
                        className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button
                        type="button"
                        size="icon"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="self-end"
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}