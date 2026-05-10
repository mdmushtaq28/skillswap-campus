
-- Enums
CREATE TYPE public.skill_type AS ENUM ('paid', 'exchange', 'both');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE public.offer_type AS ENUM ('pay', 'barter');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  college TEXT,
  bio TEXT,
  avatar_url TEXT,
  reputation NUMERIC NOT NULL DEFAULT 0,
  exchanges_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  type public.skill_type NOT NULL DEFAULT 'both',
  price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users insert own skill" ON public.skills FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users update own skill" ON public.skills FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users delete own skill" ON public.skills FOR DELETE USING (auth.uid() = owner_id);
CREATE INDEX skills_category_idx ON public.skills(category);
CREATE INDEX skills_owner_idx ON public.skills(owner_id);

-- Requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  offer_type public.offer_type NOT NULL,
  offered_skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view requests" ON public.requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Requester creates request" ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants update request" ON public.requests FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, reviewer_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer inserts own review" ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id
        AND r.status = 'completed'
        AND (auth.uid() = r.requester_id OR auth.uid() = r.owner_id)
        AND reviewee_id = CASE WHEN auth.uid() = r.requester_id THEN r.owner_id ELSE r.requester_id END
    )
  );

-- Trigger: update reputation after review insert
CREATE OR REPLACE FUNCTION public.update_reputation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles p
  SET reputation = sub.avg_rating
  FROM (
    SELECT AVG(rating)::numeric(3,2) AS avg_rating
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  ) sub
  WHERE p.id = NEW.reviewee_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_update_reputation
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_reputation();

-- Trigger: increment exchanges_completed when request becomes completed
CREATE OR REPLACE FUNCTION public.bump_exchanges()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    UPDATE public.profiles SET exchanges_completed = exchanges_completed + 1
    WHERE id IN (NEW.requester_id, NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_bump_exchanges
AFTER UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.bump_exchanges();

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, college)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'college'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
