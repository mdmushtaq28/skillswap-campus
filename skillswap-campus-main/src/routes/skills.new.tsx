import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCreateSkill } from "@/hooks/api";

export const Route = createFileRoute("/skills/new")({ component: () => <AuthGate><NewSkill /></AuthGate> });

const CATS = ["Coding", "Design", "Tutoring", "Writing", "Music", "Video", "Other"];

function NewSkill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ title: "", description: "", category: "Coding", type: "both" as "paid"|"exchange"|"both", price: "", tags: "", customCategory: "" });
  const createMut = useCreateSkill();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalCategory = f.category === "Other" && f.customCategory.trim()
      ? f.customCategory.trim()
      : f.category;
    createMut.mutate(
      {
        title: f.title.trim(),
        description: f.description.trim(),
        category: finalCategory,
        type: f.type,
        price: f.type === "exchange" ? null : (f.price ? Number(f.price) : null),
        tags: f.tags.split(",").map(t => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => { toast.success("Skill posted!"); navigate({ to: "/marketplace" }); },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold mb-1">Post a skill</h1>
      <p className="text-muted-foreground mb-6">Tell the campus what you can offer.</p>
      <Card className="p-6 rounded-3xl border-border/60">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required placeholder="e.g. I'll teach you Python in 1 week" value={f.title} onChange={(e) => setF({...f, title: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required rows={4} placeholder="What you offer, your experience, what students can expect…" value={f.description} onChange={(e) => setF({...f, description: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={f.category} onValueChange={(v) => setF({...f, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {f.category === "Other" && (
                <Input
                  placeholder="Custom category (optional)"
                  value={f.customCategory}
                  onChange={(e) => setF({...f, customCategory: e.target.value})}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Exchange type</Label>
              <Select value={f.type} onValueChange={(v: "paid"|"exchange"|"both") => setF({...f, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid only</SelectItem>
                  <SelectItem value="exchange">Skill barter only</SelectItem>
                  <SelectItem value="both">Either</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {f.type !== "exchange" && (
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" min="0" value={f.price} onChange={(e) => setF({...f, price: e.target.value})} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" placeholder="python, beginner, fast" value={f.tags} onChange={(e) => setF({...f, tags: e.target.value})} />
          </div>
          <Button type="submit" className="rounded-full" disabled={createMut.isPending}>{createMut.isPending ? "Posting…" : "Post skill"}</Button>
        </form>
      </Card>
    </div>
  );
}
