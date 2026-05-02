
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Mark own as read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins insert notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon view notifications" ON public.notifications FOR SELECT TO anon USING (true);

-- Onboarding templates table
CREATE TABLE public.onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View templates" ON public.onboarding_templates FOR SELECT USING (true);
CREATE POLICY "Manage templates" ON public.onboarding_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Add columns to onboarding_tasks
ALTER TABLE public.onboarding_tasks ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.onboarding_tasks ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE public.onboarding_tasks ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add columns to document_assets
ALTER TABLE public.document_assets ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.document_assets ADD COLUMN IF NOT EXISTS folder text DEFAULT 'General';

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
