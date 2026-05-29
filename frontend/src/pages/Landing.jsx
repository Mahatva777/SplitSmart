import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, SplitSquareHorizontal, Bot } from 'lucide-react'

const features = [
  { icon: Users,                   title: 'Group Expenses',    desc: 'Create groups for trips, households, or any shared context.' },
  { icon: SplitSquareHorizontal,   title: 'Equal Splits',      desc: 'Add an expense and SplitSmart divides it instantly.' },
  { icon: Bot,                     title: 'AI Insights',       desc: 'Ask questions about your spending — answered from real data.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold">SplitSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Split expenses without the headache
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Track shared costs, see who owes what, and settle up — with an AI assistant
          that answers from your actual data.
        </p>
        <Link to="/signup">
          <Button size="lg" className="gap-2">
            Start for free <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border bg-card p-6">
              <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center mb-4">
                <Icon size={18} className="text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
