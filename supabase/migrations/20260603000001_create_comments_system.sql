-- ═══════════════════════════════════════════════
-- نظام التعليقات — سواليفهم
-- ═══════════════════════════════════════════════

-- جدول التعليقات الرئيسي
CREATE TABLE IF NOT EXISTS public.story_comments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id      UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES public.story_comments(id) ON DELETE CASCADE,

  -- بيانات المعلّق (بدون تسجيل حساب)
  commenter_name  TEXT NOT NULL CHECK (char_length(commenter_name) BETWEEN 2 AND 60),
  commenter_city  TEXT,
  content         TEXT NOT NULL CHECK (char_length(content) BETWEEN 3 AND 1000),

  -- الإشراف
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note    TEXT,

  -- الإعجاب
  likes_count   INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),

  -- الوقت
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الإعجابات (لمنع التكرار من نفس الجهاز)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id  UUID NOT NULL REFERENCES public.story_comments(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,  -- browser fingerprint بسيط
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, fingerprint)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_story      ON public.story_comments(story_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent     ON public.story_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status     ON public.story_comments(status);
CREATE INDEX IF NOT EXISTS idx_comment_likes_cid   ON public.comment_likes(comment_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_comment_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_comment_updated ON public.story_comments;
CREATE TRIGGER trg_comment_updated
  BEFORE UPDATE ON public.story_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_timestamp();

-- RLS
ALTER TABLE public.story_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes   ENABLE ROW LEVEL SECURITY;

-- التعليقات: العامة تقرأ المعتمدة فقط
CREATE POLICY "public_read_approved_comments" ON public.story_comments
  FOR SELECT USING (status = 'approved');

-- إضافة تعليق: مسموح للجميع
CREATE POLICY "public_insert_comments" ON public.story_comments
  FOR INSERT WITH CHECK (status = 'pending');

-- الإعجاب: للجميع قراءةً وكتابةً
CREATE POLICY "public_read_likes"   ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "public_insert_likes" ON public.comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_likes" ON public.comment_likes FOR DELETE USING (true);

-- الأدمن: كل الصلاحيات (Supabase service_role يتجاوز RLS تلقائياً)
-- نضيف policy للمستخدم المصادق لإدارة لوحة الإدارة
CREATE POLICY "admin_all_comments" ON public.story_comments
  FOR ALL USING (auth.role() = 'authenticated');

-- دالة: حساب عدد التعليقات المعتمدة لكل قصة
CREATE OR REPLACE FUNCTION public.get_story_comment_count(p_story_id UUID)
RETURNS INTEGER LANGUAGE SQL STABLE AS $$
  SELECT COUNT(*)::INTEGER FROM public.story_comments
  WHERE story_id = p_story_id AND status = 'approved';
$$;

-- دالة: تحديث likes_count بأمان
CREATE OR REPLACE FUNCTION public.toggle_comment_like(
  p_comment_id  UUID,
  p_fingerprint TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_liked BOOLEAN := FALSE;
  v_new_count INTEGER;
BEGIN
  -- حاول الإدراج
  BEGIN
    INSERT INTO public.comment_likes(comment_id, fingerprint)
    VALUES (p_comment_id, p_fingerprint);
    v_liked := TRUE;
  EXCEPTION WHEN unique_violation THEN
    -- إذا موجود → احذف
    DELETE FROM public.comment_likes
    WHERE comment_id = p_comment_id AND fingerprint = p_fingerprint;
    v_liked := FALSE;
  END;

  -- احسب الجديد
  SELECT COUNT(*) INTO v_new_count
  FROM public.comment_likes WHERE comment_id = p_comment_id;

  -- حدّث العداد
  UPDATE public.story_comments
  SET likes_count = v_new_count
  WHERE id = p_comment_id;

  RETURN jsonb_build_object('liked', v_liked, 'count', v_new_count);
END;
$$;
