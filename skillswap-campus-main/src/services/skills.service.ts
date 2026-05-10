import { supabase } from "@/integrations/supabase/client";

export type SkillType = "paid" | "exchange" | "both";

export type Skill = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  type: SkillType;
  price: number | null;
  owner_id: string;
  created_at: string;
  profiles?: { name: string; college: string | null; reputation: number } | null;
};

export const skillsService = {
  async list(filters?: { category?: string }) {
    let q = supabase
      .from("skills")
      .select("*, profiles(name, college, reputation)")
      .order("created_at", { ascending: false });
    if (filters?.category && filters.category !== "All") q = q.eq("category", filters.category);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Skill[];
  },

  async byOwner(ownerId: string) {
    const { data, error } = await supabase
      .from("skills")
      .select("id, title, category, type, price")
      .eq("owner_id", ownerId);
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: Omit<Skill, "id" | "created_at" | "profiles">) {
    const { data, error } = await supabase.from("skills").insert(payload).select().single();
    if (error) throw error;
    return data;
  },
};