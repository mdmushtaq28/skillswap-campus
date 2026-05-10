import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { ListSkeleton } from "@/components/ui-ext/SkillCardSkeleton";
import { MessageSquare, Send, Search } from "lucide-react";
import { messagesService } from "@/services/messages.service";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/messages")({
  component: () => <AuthGate><MessagesPage /></AuthGate>,
});

type Thread = { peerId: string; peerName: string; last: string; unread: number; updatedAt: string };

function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [activePeer, setActivePeer] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!user) return;
    messagesService.listThreads(user.id).then(setThreads);
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with students before locking an exchange.</p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4 min-h-[500px]">
        {/* Thread list */}
        <Card className="rounded-3xl border-border/60 p-3 h-fit">
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search chats…" className="pl-9 rounded-full bg-card" />
          </div>
          {threads === null ? (
            <ListSkeleton rows={3} />
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No conversations yet.
              <p className="text-xs mt-1">Start one from a marketplace request.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {threads.map((t) => (
                <button
                  key={t.peerId}
                  onClick={() => setActivePeer(t)}
                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl transition ${
                    activePeer?.peerId === t.peerId ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-lavender text-lavender-foreground">
                      {t.peerName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{t.peerName}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.last}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Conversation */}
        <Card className="rounded-3xl border-border/60 flex flex-col min-h-[500px]">
          {!activePeer ? (
            <div className="flex-1 grid place-items-center p-8">
              <EmptyState
                icon={<MessageSquare className="h-5 w-5" />}
                title="Pick a conversation"
                description="Real-time chat ships in the next phase. The thread list and composer are ready to wire up."
              />
            </div>
          ) : (
            <>
              <div className="border-b border-border/60 p-4 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-lavender text-lavender-foreground">
                    {activePeer.peerName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold">{activePeer.peerName}</div>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto" />
              <form
                className="border-t border-border/60 p-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDraft("");
                }}
              >
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className="rounded-full" />
                <Button type="submit" size="icon" className="rounded-full" disabled={!draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-xs text-muted-foreground text-center"
      >
        Real-time messaging powered by Supabase Realtime — coming in Phase 2.
      </motion.p>
    </div>
  );
}