import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Moon, Bell, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: () => <AuthGate><SettingsPage /></AuthGate>,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, preferences, and theme.</p>
      </div>

      <Card className="rounded-3xl border-border/60 p-6 space-y-5">
        <div>
          <h2 className="font-display font-bold text-lg">Account</h2>
          <p className="text-sm text-muted-foreground">Signed in as {profile?.name ?? "—"}.</p>
        </div>
        <Separator />
        <Row icon={<Moon className="h-4 w-4" />} title="Dark mode" desc="Switch between light and dark themes.">
          <Switch checked={theme === "dark"} onCheckedChange={toggle} aria-label="Toggle dark mode" />
        </Row>
        <Row icon={<Bell className="h-4 w-4" />} title="Email notifications" desc="Get an email for new requests and messages.">
          <Switch defaultChecked aria-label="Email notifications" onCheckedChange={() => toast.success("Preference saved")} />
        </Row>
        <Row icon={<ShieldCheck className="h-4 w-4" />} title="Public profile" desc="Allow anyone on campus to view your profile.">
          <Switch defaultChecked aria-label="Public profile" onCheckedChange={() => toast.success("Preference saved")} />
        </Row>
      </Card>

      <Card className="rounded-3xl border-border/60 p-6 space-y-4">
        <div>
          <h2 className="font-display font-bold text-lg">Session</h2>
          <p className="text-sm text-muted-foreground">Sign out of this device.</p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </Card>

      <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <div>
          <h2 className="font-display font-bold text-lg text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground">Permanent actions that can't be undone.</p>
        </div>
        <Button
          variant="outline"
          className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => toast.error("Account deletion is disabled in the demo.")}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete account
        </Button>
      </Card>
    </div>
  );
}

function Row({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <Label className="font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
}