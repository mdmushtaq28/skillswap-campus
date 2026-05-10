import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  useMyOwnedSkills,
  useReviewsFor,
  useUpdateProfile,
  useDeleteSkill,
} from "@/hooks/api";

export const Route = createFileRoute("/profile")({ component: () => <AuthGate><ProfilePage /></AuthGate> });

type MySkill = { id: string; title: string; category: string };
type Review = { id: string; rating: number; comment: string | null; created_at: string; reviewer: { name: string } | null };

function ProfilePage() {
  const { profile, refreshProfile, user } = useAuth();
  const [f, setF] = useState({ name: "", college: "", bio: "" });
  const { data: skillsData = [] } = useMyOwnedSkills(!!user);
  const { data: reviewsData = [] } = useReviewsFor(user?.id);
  const skills = skillsData as MySkill[];
  const reviews = reviewsData as Review[];
  const updateMut = useUpdateProfile();
  const deleteMut = useDeleteSkill();

  useEffect(() => {
    if (profile) setF({ name: profile.name, college: profile.college ?? "", bio: profile.bio ?? "" });
  }, [profile]);

  const save = () => {
    if (!user) return;
    updateMut.mutate(
      { name: f.name.trim(), college: f.college.trim() || null, bio: f.bio.trim() || null },
      {
        onSuccess: () => { toast.success("Profile updated."); refreshProfile(); },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const deleteSkill = (id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("Skill removed."),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-gradient-to-br from-primary to-lavender text-2xl font-display font-bold text-primary-foreground">
            {profile?.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-3xl font-extrabold">{profile?.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-peach text-peach" />{Number(profile?.reputation ?? 0).toFixed(1)}</span>
            <span>·</span>
            <span>{profile?.exchanges_completed} exchanges</span>
          </div>
        </div>
      </div>

      <Card className="p-6 rounded-3xl border-border/60">
        <h2 className="font-display text-xl font-bold mb-4">Edit profile</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={f.name} onChange={(e) => setF({...f, name: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="college">College</Label>
            <Input id="college" value={f.college} onChange={(e) => setF({...f, college: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={f.bio} onChange={(e) => setF({...f, bio: e.target.value})} placeholder="Tell others a bit about you…" />
          </div>
          <Button onClick={save} disabled={updateMut.isPending} className="rounded-full">{updateMut.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
      </Card>

      <Card className="p-6 rounded-3xl border-border/60">
        <h2 className="font-display text-xl font-bold mb-4">Your skills</h2>
        {skills.length === 0 ? <p className="text-muted-foreground text-sm">No skills posted yet.</p> :
          <div className="space-y-2">
            {skills.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl border border-border/60">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <Badge variant="secondary" className="rounded-full mt-1 text-xs">{s.category}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSkill(s.id)}>Delete</Button>
              </div>
            ))}
          </div>}
      </Card>

      <Card className="p-6 rounded-3xl border-border/60">
        <h2 className="font-display text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="text-muted-foreground text-sm">No reviews yet.</p> :
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{r.reviewer?.name}</div>
                  <div className="flex">{Array.from({length: r.rating}).map((_,i) => <Star key={i} className="h-3.5 w-3.5 fill-peach text-peach" />)}</div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground mt-1.5">{r.comment}</p>}
              </div>
            ))}
          </div>}
      </Card>
    </div>
  );
}
