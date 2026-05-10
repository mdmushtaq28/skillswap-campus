import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star, Compass } from "lucide-react";
import { AuthGate } from "@/components/app/AuthGate";
import { SkillCardSkeletonGrid } from "@/components/ui-ext/SkillCardSkeleton";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { useSkills } from "@/hooks/api";

export const Route = createFileRoute("/marketplace")({ component: () => <AuthGate><Marketplace /></AuthGate> });

const CATEGORIES = ["All", "Coding", "Design", "Tutoring", "Writing", "Music", "Video", "Other"];

type Skill = {
  id: string; title: string; description: string; category: string; tags: string[];
  type: "paid" | "exchange" | "both"; price: number | null; owner_id: string;
  profiles: { name: string; college: string | null; reputation: number } | null;
};

function Marketplace() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const { data: skills = [], isLoading, isError, error, refetch } = useSkills({ category: cat, q });
  const filtered = skills as unknown as Skill[];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">Skill marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover what students offer on your campus.</p>
        </div>
        <Link to="/skills/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-1" />Post a skill</Button></Link>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills…" className="pl-9 rounded-full bg-card" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                cat === c ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkillCardSkeletonGrid count={6} />
      ) : isError ? (
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title="Couldn't load skills"
          description={(error as Error)?.message ?? "Something went wrong."}
          action={<Button onClick={() => refetch()} className="rounded-full">Try again</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title="No skills match your search"
          description="Try a different category, clear your search, or post the first skill in this corner of campus."
          action={<Link to="/skills/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-1" />Post a skill</Button></Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Link key={s.id} to="/skills/$skillId" params={{ skillId: s.id }}>
              <Card className="p-5 rounded-3xl border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="rounded-full">{s.category}</Badge>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-peach text-peach" />
                    {Number(s.profiles?.reputation ?? 0).toFixed(1)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg leading-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 flex-1">{s.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                  <div className="text-xs text-muted-foreground truncate">{s.profiles?.name}</div>
                  <div className="text-sm font-semibold">
                    {s.type === "exchange" ? <span className="text-lavender-foreground">Barter</span> :
                      s.type === "paid" ? `₹${s.price ?? 0}` :
                      <span>₹{s.price ?? 0} <span className="text-muted-foreground font-normal">/ swap</span></span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
