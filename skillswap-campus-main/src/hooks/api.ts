import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listSkills,
  getSkill,
  createSkill,
  deleteSkill,
  myOwnedSkills,
  listMyRequests,
  createRequest,
  updateRequestStatus,
  createReview,
  listReviewsFor,
  getMyProfile,
  updateMyProfile,
  getDashboardStats,
} from "@/lib/api.functions";
import { callAuth } from "@/lib/serverApi";

/* ============== SKILLS ============== */
export function useSkills(filters: { category?: string; q?: string }) {
  return useQuery({
    queryKey: ["skills", filters],
    queryFn: () => callAuth(listSkills as any, filters),
  });
}

export function useSkill(id: string | undefined) {
  return useQuery({
    queryKey: ["skill", id],
    queryFn: () => callAuth(getSkill as any, { id }),
    enabled: !!id,
  });
}

export function useMyOwnedSkills(enabled = true) {
  return useQuery({
    queryKey: ["my-skills"],
    queryFn: () => callAuth(myOwnedSkills as any),
    enabled,
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => callAuth(createSkill as any, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["my-skills"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => callAuth(deleteSkill as any, { id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["my-skills"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

/* ============== REQUESTS ============== */
export function useMyRequests() {
  return useQuery({
    queryKey: ["requests"],
    queryFn: () => callAuth(listMyRequests as any),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => callAuth(createRequest as any, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: "pending"|"accepted"|"rejected"|"completed" }) =>
      callAuth(updateRequestStatus as any, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

/* ============== REVIEWS ============== */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => callAuth(createReview as any, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useReviewsFor(userId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => callAuth(listReviewsFor as any, { userId }),
    enabled: !!userId,
  });
}

/* ============== PROFILE ============== */
export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => callAuth(getMyProfile as any),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => callAuth(updateMyProfile as any, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/* ============== DASHBOARD ============== */
export function useDashboardStats() {
  return useQuery<{ pending: number; completed: number; posted: number }>({
    queryKey: ["dashboard-stats"],
    queryFn: () => callAuth(getDashboardStats as any),
  });
}