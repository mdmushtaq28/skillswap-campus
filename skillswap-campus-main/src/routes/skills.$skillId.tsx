import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSkill, useMyOwnedSkills, useCreateRequest } from "@/hooks/api";

export const Route = createFileRoute("/skills/$skillId")({ component: () => <AuthGate><SkillDetail /></AuthGate> });

type Skill = {
  id: string; owner_id: string; title: string; description: string; category: string;
  tags: string[]; type: "paid"|"exchange"|"both"; price: number | null;
  profiles: { name: string; college: string | null; reputation: number; exchanges_completed: number } | null;
};

function SkillDetail() {
  const { skillId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<"pay"|"barter">("pay");
  const [offered, setOffered] = useState<string>("");
  const [msg, setMsg] = useState("");
  const { data: skillData } = useSkill(skillId);
  const { data: mySkillsData = [] } = useMyOwnedSkills(!!user);
  const skill = skillData as unknown as Skill | null;
  const mySkills = mySkillsData as { id: string; title: string }[];
  const createReqMut = useCreateRequest();

  const isOwner = user?.id === skill?.owner_id;

  const sendRequest = () => {
    if (!user || !skill) return;
    if (offer === "barter" && !offered) return toast.error("Pick a skill to offer.");
    createReqMut.mutate(
      {
        skill_id: skill.id,
        owner_id: skill.owner_id,
        message: msg.trim() || null,
        offer_type: offer,
        offered_skill_id: offer === "barter" ? offered : null,
      },
      {
        onSuccess: () => { toast.success("Request sent!"); navigate({ to: "/requests" }); },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (!skill) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <Card className="p-8 rounded-3xl border-border/60">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="secondary" className="rounded-full mb-3">{skill.category}</Badge>
            <h1 className="font-display text-3xl font-extrabold">{skill.title}</h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display font-bold">
              {skill.type === "exchange" ? "Barter" : `₹${skill.price ?? 0}`}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{skill.type === "both" ? "or skill swap" : skill.type}</div>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{skill.description}</p>
        {skill.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-4">
            {skill.tags.map(t => <Badge key={t} variant="outline" className="rounded-full">#{t}</Badge>)}
          </div>
        )}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/60">
          <Avatar><AvatarFallback className="bg-lavender text-lavender-foreground font-semibold">{skill.profiles?.name?.[0]}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="font-medium">{skill.profiles?.name}</div>
            <div className="text-xs text-muted-foreground">{skill.profiles?.college ?? "Student"}</div>
          </div>
          <div className="text-sm inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-peach text-peach" />
            <span className="font-semibold">{Number(skill.profiles?.reputation ?? 0).toFixed(1)}</span>
            <span className="text-muted-foreground">· {skill.profiles?.exchanges_completed} swaps</span>
          </div>
        </div>
      </Card>

      {!isOwner && (
        <Card className="p-6 rounded-3xl border-border/60">
          <h2 className="font-display text-xl font-bold mb-4">Send a request</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">How will you pay?</Label>
              <div className="flex gap-2">
                {skill.type !== "exchange" && (
                  <button type="button" onClick={() => setOffer("pay")} className={`flex-1 px-4 py-3 rounded-2xl border text-sm font-medium transition ${offer==="pay"?"bg-primary text-primary-foreground border-primary":"bg-card border-border hover:bg-muted/50"}`}>
                    💸 Pay ₹{skill.price ?? 0}
                  </button>
                )}
                {skill.type !== "paid" && (
                  <button type="button" onClick={() => setOffer("barter")} className={`flex-1 px-4 py-3 rounded-2xl border text-sm font-medium transition ${offer==="barter"?"bg-primary text-primary-foreground border-primary":"bg-card border-border hover:bg-muted/50"}`}>
                    🔄 Skill barter
                  </button>
                )}
              </div>
            </div>
            {offer === "barter" && (
              <div className="space-y-1.5">
                <Label>Skill you'll offer in exchange</Label>
                {mySkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You haven't posted any skills yet. <Link to="/skills/new" className="text-primary font-medium">Post one first.</Link></p>
                ) : (
                  <Select value={offered} onValueChange={setOffered}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{mySkills.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="msg">Message (optional)</Label>
              <Textarea id="msg" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Hi! I'd love to learn this because…" />
            </div>
            <Button onClick={sendRequest} disabled={createReqMut.isPending} className="rounded-full">{createReqMut.isPending ? "Sending…" : "Send request"}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
