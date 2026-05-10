import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/app/AuthGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { ListSkeleton } from "@/components/ui-ext/SkillCardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useMyRequests, useUpdateRequestStatus, useCreateReview } from "@/hooks/api";

export const Route = createFileRoute("/requests")({ component: () => <AuthGate><RequestsPage /></AuthGate> });

type Req = {
  id: string;
  status: "pending"|"accepted"|"rejected"|"completed";
  message: string | null;
  offer_type: "pay"|"barter";
  requester_id: string;
  owner_id: string;
  created_at: string;
  skills: { title: string; price: number | null } | null;
  offered: { title: string } | null;
  requester: { name: string } | null;
  owner: { name: string } | null;
};

function RequestsPage() {
  const { user } = useAuth();
  const [reviewFor, setReviewFor] = useState<Req | null>(null);
  const { data, isLoading } = useMyRequests();
  const reqs = (data as unknown as Req[]) ?? [];
  const updateMut = useUpdateRequestStatus();

  const update = (id: string, status: Req["status"]) => {
    updateMut.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Request ${status}.`),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">Requests</h1>
          <p className="text-muted-foreground mt-1">Manage incoming and outgoing skill exchanges.</p>
        </div>
        <ListSkeleton rows={3} />
      </div>
    );
  }

  const incoming = reqs.filter(r => r.owner_id === user!.id);
  const outgoing = reqs.filter(r => r.requester_id === user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Requests</h1>
        <p className="text-muted-foreground mt-1">Manage incoming and outgoing skill exchanges.</p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="rounded-full">
          <TabsTrigger value="incoming" className="rounded-full">Incoming ({incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-full">Outgoing ({outgoing.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="space-y-3 mt-4">
          {incoming.length === 0 ? <Empty msg="No incoming requests yet." /> :
            incoming.map(r => <RequestCard key={r.id} r={r} mine={false} onAction={update} onReview={() => setReviewFor(r)} />)}
        </TabsContent>
        <TabsContent value="outgoing" className="space-y-3 mt-4">
          {outgoing.length === 0 ? <Empty msg="You haven't requested any skills yet." /> :
            outgoing.map(r => <RequestCard key={r.id} r={r} mine={true} onAction={update} onReview={() => setReviewFor(r)} />)}
        </TabsContent>
      </Tabs>

      <ReviewDialog req={reviewFor} onClose={() => setReviewFor(null)} />
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <Card className="p-12 text-center rounded-3xl border-dashed text-muted-foreground">{msg}</Card>;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-peach text-foreground",
  accepted: "bg-mint text-mint-foreground",
  rejected: "bg-destructive/15 text-destructive",
  completed: "bg-lavender text-lavender-foreground",
};

function RequestCard({ r, mine, onAction, onReview }: { r: Req; mine: boolean; onAction: (id: string, s: Req["status"]) => void; onReview: () => void }) {
  return (
    <Card className="p-5 rounded-3xl border-border/60">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className={`rounded-full capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</Badge>
            <Badge variant="outline" className="rounded-full">{r.offer_type === "pay" ? `Pay ₹${r.skills?.price ?? 0}` : "Barter"}</Badge>
          </div>
          <h3 className="font-display font-bold text-lg">{r.skills?.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {mine ? `To ${r.owner?.name}` : `From ${r.requester?.name}`}
            {r.offered && <> · offers <span className="text-foreground">{r.offered.title}</span></>}
          </p>
          {r.message && <p className="text-sm mt-2 p-3 rounded-xl bg-muted/50">{r.message}</p>}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {!mine && r.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onAction(r.id, "rejected")}>Reject</Button>
              <Button size="sm" onClick={() => onAction(r.id, "accepted")}>Accept</Button>
            </div>
          )}
          {r.status === "accepted" && (
            <Button size="sm" onClick={() => onAction(r.id, "completed")}>Mark complete</Button>
          )}
          {r.status === "completed" && (
            <Button size="sm" variant="outline" onClick={onReview}><Star className="h-3.5 w-3.5 mr-1" />Leave review</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ReviewDialog({ req, onClose }: { req: Req | null; onClose: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const reviewMut = useCreateReview();

  const submit = () => {
    if (!user || !req) return;
    const reviewee_id = user.id === req.requester_id ? req.owner_id : req.requester_id;
    reviewMut.mutate(
      { request_id: req.id, reviewee_id, rating, comment: comment.trim() || null },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setRating(5);
          setComment("");
          onClose();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Dialog open={!!req} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>Rate this exchange</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} type="button">
                  <Star className={`h-7 w-7 ${n <= rating ? "fill-peach text-peach" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={reviewMut.isPending} className="rounded-full w-full">{reviewMut.isPending ? "Submitting…" : "Submit review"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
