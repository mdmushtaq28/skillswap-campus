import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Inbox, Compass, Plus } from "lucide-react";
import { AuthGate } from "@/components/app/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/api";

export const Route = createFileRoute("/dashboard")({ component: () => <AuthGate><DashboardPage /></AuthGate> });

function DashboardPage() {
  const { profile } = useAuth();
  const { data: stats } = useDashboardStats();
  const s = stats ?? { pending: 0, completed: 0, posted: 0 };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-mint via-card to-lavender p-8 border border-border/60 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1">{profile?.name ?? "Friend"} 👋</h1>
            <p className="text-muted-foreground mt-2">{profile?.college ?? "Add your college in your profile."}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/marketplace"><Button variant="outline" className="rounded-full"><Compass className="h-4 w-4 mr-1" />Browse</Button></Link>
            <Link to="/skills/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-1" />Post a skill</Button></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Reputation" value={profile?.reputation ? Number(profile.reputation).toFixed(1) : "—"} icon={<Star className="h-4 w-4" />} accent="bg-peach" />
        <StatCard label="Exchanges" value={profile?.exchanges_completed ?? 0} icon={<Sparkles className="h-4 w-4" />} accent="bg-mint" />
        <StatCard label="Pending" value={s.pending} icon={<Inbox className="h-4 w-4" />} accent="bg-lavender" />
        <StatCard label="Skills posted" value={s.posted} icon={<Compass className="h-4 w-4" />} accent="bg-secondary" />
      </div>

      <Card className="p-6 rounded-3xl border-border/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Quick actions</h2>
          <Badge variant="secondary" className="rounded-full">v1</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/marketplace" className="rounded-2xl border border-border/60 p-4 hover:bg-muted/50 transition">
            <div className="font-medium">Find a skill</div>
            <div className="text-sm text-muted-foreground">Browse what other students offer.</div>
          </Link>
          <Link to="/requests" className="rounded-2xl border border-border/60 p-4 hover:bg-muted/50 transition">
            <div className="font-medium">Manage requests</div>
            <div className="text-sm text-muted-foreground">Accept, reject, or complete.</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <Card className="p-5 rounded-3xl border-border/60">
      <div className={`h-9 w-9 rounded-2xl ${accent} grid place-items-center mb-3`}>{icon}</div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
    </Card>
  );
}
