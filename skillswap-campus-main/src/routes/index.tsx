import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight, Sparkles, Users, Repeat, Star, Search, MessageSquare,
  ShieldCheck, Zap, Code2, Palette, BookOpen, Music, Video, PenTool, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({ component: Landing });

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <MarketplacePreview />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary to-lavender grid place-items-center shadow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">SkillSwap OS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#preview" className="hover:text-foreground transition">Marketplace</a>
          <a href="#testimonials" className="hover:text-foreground transition">Stories</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/signup"><Button size="sm" className="rounded-full">Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-28 pb-24">
      <motion.div
        initial="hidden" animate="show" variants={fadeUp}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Built for students. Powered by reputation.
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Trade your skills.
          <span className="block bg-gradient-to-r from-primary via-lavender to-peach bg-clip-text text-transparent">
            Build your campus rep.
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Teach Python for a poster design. Tutor calculus for video editing. Or just get paid.
          SkillSwap OS is the marketplace where students help students — money optional.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link to="/signup">
            <Button size="lg" className="rounded-full px-6">
              Join your campus <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button size="lg" variant="outline" className="rounded-full px-6">Explore skills</Button>
          </Link>
        </div>
      </motion.div>

      {/* Floating product preview */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-16 mx-auto max-w-4xl"
      >
        <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 via-lavender/30 to-peach/20 blur-3xl rounded-[3rem]" />
        <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl p-5 md:p-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { cat: "Coding", title: "Build your portfolio site", price: "₹499", icon: Code2, color: "bg-mint" },
              { cat: "Design", title: "Logo + brand kit", price: "Barter", icon: Palette, color: "bg-lavender" },
              { cat: "Tutoring", title: "Calculus II crash course", price: "₹299", icon: BookOpen, color: "bg-peach" },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-border/60 bg-background/60 p-4 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="rounded-full">{c.cat}</Badge>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-peach text-peach" />4.9
                  </span>
                </div>
                <div className={`h-10 w-10 rounded-xl ${c.color} grid place-items-center mb-3`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold leading-tight">{c.title}</h3>
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aarav · IIT-D</span>
                  <span className="font-semibold">{c.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TrustedBy() {
  const colleges = ["IIT Delhi", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad", "VIT Vellore", "Manipal"];
  return (
    <section className="border-y border-border/40 bg-card/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Trusted by students across
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
          {colleges.map((c) => (
            <span key={c} className="font-display font-semibold text-muted-foreground/70 text-sm md:text-base">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Users, title: "Real students only", desc: "Campus-verified accounts. No bots, no randoms — just your people." },
    { icon: Repeat, title: "Money or barter", desc: "Pay cash, or swap a skill of equal value. You choose how to trade." },
    { icon: Star, title: "Reputation that follows", desc: "Every exchange leaves a rating. Build a trust score that opens doors." },
    { icon: Zap, title: "Instant requests", desc: "Send a request in two taps. Get matched and start in minutes." },
    { icon: ShieldCheck, title: "Safe by default", desc: "Row-level security, private messages, and review-gated payouts." },
    { icon: MessageSquare, title: "Negotiate inline", desc: "Chat before you commit. Lock the deal once both sides agree." },
  ];
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <SectionHead eyebrow="Features" title="Everything a student micro-economy needs" />
      <div className="grid md:grid-cols-3 gap-4 mt-12">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-mint to-lavender grid place-items-center mb-4">
              <f.icon className="h-5 w-5 text-foreground/80" />
            </div>
            <h3 className="font-display font-bold text-lg">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: PenTool, title: "Post what you offer", desc: "List a skill in 30 seconds. Set a price, allow barter, or both." },
    { n: "02", icon: Search, title: "Browse the marketplace", desc: "Filter by category, price, or campus. See ratings before you commit." },
    { n: "03", icon: Repeat, title: "Request & exchange", desc: "Pay or trade a skill back. Both sides confirm when it's done." },
    { n: "04", icon: Star, title: "Rate and grow", desc: "Leave a review. Build a reputation that compounds across campuses." },
  ];
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 py-24">
      <SectionHead eyebrow="How it works" title="From idea to exchange in four steps" />
      <div className="grid md:grid-cols-4 gap-4 mt-12 relative">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur p-6 relative"
          >
            <div className="text-xs font-mono text-muted-foreground">{s.n}</div>
            <div className="h-10 w-10 rounded-2xl bg-mint grid place-items-center mt-3 mb-3">
              <s.icon className="h-5 w-5 text-mint-foreground" />
            </div>
            <h3 className="font-display font-bold">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MarketplacePreview() {
  const cards = [
    { cat: "Music", title: "Mix & master your single", icon: Music, color: "bg-peach", price: "₹799", user: "Riya" },
    { cat: "Video", title: "Edit a 60s reel", icon: Video, color: "bg-lavender", price: "Barter", user: "Kabir" },
    { cat: "Coding", title: "Debug your React app", icon: Code2, color: "bg-mint", price: "₹399", user: "Tanvi" },
    { cat: "Design", title: "Pitch deck makeover", icon: Palette, color: "bg-secondary", price: "₹599", user: "Ishaan" },
  ];
  return (
    <section id="preview" className="max-w-6xl mx-auto px-6 py-24">
      <SectionHead eyebrow="Marketplace" title="A live look at what students are trading" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="rounded-full">{c.cat}</Badge>
              <Star className="h-4 w-4 fill-peach text-peach" />
            </div>
            <div className={`h-12 w-12 rounded-2xl ${c.color} grid place-items-center mb-3`}>
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold leading-tight">{c.title}</h3>
            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{c.user}</span>
              <span className="font-semibold">{c.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/marketplace">
          <Button variant="outline" className="rounded-full">
            See the full marketplace <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { name: "Ananya R.", college: "IIT Delhi · CSE'26", text: "I traded 4 hours of Python tutoring for a logo for my startup. Both of us walked away winning." },
    { name: "Devansh K.", college: "BITS Pilani · ECE'25", text: "Made ₹6k in my first week editing reels. The reputation system actually means something here." },
    { name: "Meher S.", college: "NID Ahmedabad", text: "Finally a place where design isn't undervalued. Barter mode is genius." },
  ];
  return (
    <section id="testimonials" className="max-w-6xl mx-auto px-6 py-24">
      <SectionHead eyebrow="Stories" title="Students are already trading" />
      <div className="grid md:grid-cols-3 gap-4 mt-12">
        {quotes.map((q, i) => (
          <motion.div
            key={q.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur p-6"
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, n) => <Star key={n} className="h-4 w-4 fill-peach text-peach" />)}
            </div>
            <p className="text-foreground/90 leading-relaxed">"{q.text}"</p>
            <div className="mt-5 pt-5 border-t border-border/60">
              <div className="font-semibold text-sm">{q.name}</div>
              <div className="text-xs text-muted-foreground">{q.college}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-mint via-card to-lavender p-10 md:p-16 text-center"
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-peach/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Your next exchange is one signup away.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Free forever for students. Start trading skills with your campus today.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-8">
                Join free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="rounded-full px-6">Browse first</Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Setup in 30s</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Cancel anytime</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-lavender grid place-items-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">SkillSwap OS</span>
          <span className="text-xs text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <Link to="/login" className="hover:text-foreground">Log in</Link>
          <Link to="/signup" className="hover:text-foreground">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl mx-auto"
    >
      <div className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{title}</h2>
    </motion.div>
  );
}
