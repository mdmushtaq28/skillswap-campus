import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", college: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name: form.name, college: form.college },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to SkillSwap!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-8 rounded-3xl border-border/60 shadow-xl">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary to-lavender grid place-items-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">SkillSwap OS</span>
        </Link>
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">Join the campus skill economy.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="college">College</Label>
            <Input id="college" name="college" placeholder="e.g. IIT Bombay" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          </div>
          <Button className="w-full rounded-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
