import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, SplitSquareHorizontal, Bot } from 'lucide-react'

const features = [
  { icon: Users, title: 'Group Expenses', desc: 'Create groups for trips, households, or any shared context.' },
  { icon: SplitSquareHorizontal, title: 'Equal Splits', desc: 'Add an expense and SplitSmart divides it instantly.' },
  { icon: Bot, title: 'AI Insights', desc: 'Ask questions about your spending — answered from real data.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,179,164,0.25)]">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold tracking-tight">SplitSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-white/5">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs text-primary mb-6">
          Shared expenses, clearer settlements
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Split expenses without the headache
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Track shared costs, see who owes what, and settle up — with an AI assistant
          that answers from your actual data.
        </p>

        <Link to="/signup">
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(0,179,164,0.18)]">
            Start for free <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-card p-6 shadow-card">
              <div className="w-9 h-9 rounded-lg bg-primary/12 flex items-center justify-center mb-4 border border-primary/20">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}