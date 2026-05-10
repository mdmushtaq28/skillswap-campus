import { supabase } from "@/integrations/supabase/client";

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
};

/**
 * Messaging service stub — wire up to a `messages` table when backend
 * is added. Returns empty arrays today so the UI renders cleanly.
 */
export const messagesService = {
  async listThreads(_userId: string): Promise<Array<{ peerId: string; peerName: string; last: string; unread: number; updatedAt: string }>> {
    return [];
  },
  async listMessages(_threadKey: string): Promise<Message[]> {
    return [];
  },
  async send(_payload: { receiverId: string; body: string }): Promise<Message | null> {
    return null;
  },
};

// Reference unused imports so the supabase client stays in scope for when
// real implementations are added.
void supabase;