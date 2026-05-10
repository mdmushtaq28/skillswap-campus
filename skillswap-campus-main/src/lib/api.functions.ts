import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Schemas ----------
const SkillTypeEnum = z.enum(["paid", "exchange", "both"]);
const OfferTypeEnum = z.enum(["pay", "barter"]);
const StatusEnum = z.enum(["pending", "accepted", "rejected", "completed"]);

// ---------- SKILLS ----------
export const listSkills = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category?: string; q?: string } | undefined) =>
    z.object({ category: z.string().optional(), q: z.string().optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("skills")
      .select("*, profiles(name, college, reputation)")
      .order("created_at", { ascending: false });
    if (data.category && data.category !== "All") q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    if (!data.q) return list;
    const needle = data.q.toLowerCase();
    return list.filter(
      (s: any) =>
        s.title.toLowerCase().includes(needle) ||
        s.description.toLowerCase().includes(needle),
    );
  });

export const getSkill = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: skill, error } = await context.supabase
      .from("skills")
      .select("*, profiles(name, college, reputation, exchanges_completed)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return skill;
  });

export const createSkill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().min(3).max(120),
        description: z.string().min(10).max(2000),
        category: z.string().min(1).max(60),
        type: SkillTypeEnum,
        price: z.number().min(0).max(1_000_000).nullable(),
        tags: z.array(z.string().min(1).max(40)).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = { ...data, owner_id: context.userId };
    const { data: row, error } = await context.supabase
      .from("skills")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteSkill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("skills").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myOwnedSkills = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("skills")
      .select("id, title, category, type, price")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- REQUESTS ----------
export const listMyRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("requests")
      .select(
        "*, skills:skill_id(title, price), offered:offered_skill_id(title), requester:requester_id(name), owner:owner_id(name)",
      )
      .or(`requester_id.eq.${context.userId},owner_id.eq.${context.userId}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        skill_id: z.string().uuid(),
        owner_id: z.string().uuid(),
        message: z.string().max(1000).optional().nullable(),
        offer_type: OfferTypeEnum,
        offered_skill_id: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("requests").insert({
      ...data,
      requester_id: context.userId,
      message: data.message ?? null,
      offered_skill_id: data.offered_skill_id ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), status: StatusEnum }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("requests")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- REVIEWS ----------
export const createReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        request_id: z.string().uuid(),
        reviewee_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reviews").insert({
      request_id: data.request_id,
      reviewer_id: context.userId,
      reviewee_id: data.reviewee_id,
      rating: data.rating,
      comment: data.comment ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReviewsFor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer:reviewer_id(name)")
      .eq("reviewee_id", data.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- PROFILE ----------
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1).max(80),
        college: z.string().max(120).nullable().optional(),
        bio: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        name: data.name,
        college: data.college ?? null,
        bio: data.bio ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- DASHBOARD STATS ----------
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [pending, completed, posted] = await Promise.all([
      context.supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${uid},owner_id.eq.${uid}`)
        .eq("status", "pending"),
      context.supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${uid},owner_id.eq.${uid}`)
        .eq("status", "completed"),
      context.supabase
        .from("skills")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", uid),
    ]);
    return {
      pending: pending.count ?? 0,
      completed: completed.count ?? 0,
      posted: posted.count ?? 0,
    };
  });