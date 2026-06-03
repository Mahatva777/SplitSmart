import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Minus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { aiApi } from '@/api/client'
import { Button } from '@/components/ui/button'

export default function FloatingAIChat() {
    const { id: groupId } = useParams()
    const [minimized, setMinimized] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [position, setPosition] = useState({
        x: window.innerWidth - 424,
        y: window.innerHeight - 544,
    })

    const bottomRef = useRef(null)
    const draggingRef = useRef(false)
    const offsetRef = useRef({ x: 0, y: 0 })

    function scrollToBottom() {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
    }

    async function sendMessage() {
        const text = input.trim()
        if (!text || loading) return

        const userMessage = { role: 'user', content: text }
        const conversationHistory = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }))

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setLoading(true)
        scrollToBottom()

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

    function handleMouseDown(e) {
        draggingRef.current = true
        offsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        }
    }

    useEffect(() => {
        setMessages([])
    }, [groupId])

    useEffect(() => {
        function handleMouseMove(e) {
            if (!draggingRef.current) return
            setPosition({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y,
            })
        }

        function handleMouseUp() {
            draggingRef.current = false
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    if (minimized) {
        return (
            <div
                className="fixed z-50"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onDoubleClick={() => setMinimized(false)}
                    className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-floating flex items-center justify-center cursor-move select-none border border-primary/20"
                    aria-label="Open AI assistant"
                    title="Drag to move, double-click to open"
                >
                    <Bot size={22} />
                </button>
            </div>
        )
    }

    return (
        <div
            className="fixed z-50"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className="w-[400px] rounded-xl border border-white/10 bg-card shadow-floating overflow-hidden">
                <div
                    onMouseDown={handleMouseDown}
                    className="flex items-center justify-between border-b border-white/10 px-4 py-3 cursor-move select-none bg-card"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center">
                            <Bot size={16} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">AI Insights</p>
                            <p className="text-xs text-muted-foreground">
                                Spending, balances, categories, shared assets
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMinimized(true)}
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Minimize AI assistant"
                    >
                        <Minus size={16} />
                    </button>
                </div>

                <div className="h-80 overflow-y-auto px-4 py-4 space-y-3 bg-card">
                    {messages.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            Try asking:
                            <ul className="mt-2 space-y-1 list-disc pl-5">
                                <li>Summarize my spending.</li>
                                <li>Explain my current balances.</li>
                                <li>Which category is highest?</li>
                                <li>How are shared assets affecting totals?</li>
                            </ul>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap border ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground border-primary/20'
                                        : 'bg-black text-foreground border-white/10'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-black text-muted-foreground border border-white/10">
                                Thinking…
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                <div className="border-t border-white/10 px-4 py-4 bg-card">
                    <div className="flex gap-2">
                        <textarea
                            rows={2}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question..."
                            disabled={loading}
                            className="flex-1 resize-none rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-foreground
                         placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <Button
                            type="button"
                            size="icon"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="self-end rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}