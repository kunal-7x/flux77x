
-- New tables for enterprise modules
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'Full-time',
  description TEXT,
  requirements TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  status TEXT DEFAULT 'Draft',
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Applied',
  stage TEXT DEFAULT 'Screening',
  rating INTEGER DEFAULT 0,
  notes TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  interviewer TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  interview_type TEXT DEFAULT 'Video',
  feedback TEXT,
  rating INTEGER,
  decision TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  status TEXT DEFAULT 'To Do',
  priority TEXT DEFAULT 'Medium',
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.document_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables (authenticated + anon read, role-based write)
CREATE POLICY "View jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Manage jobs" ON public.jobs FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Manage candidates" ON public.candidates FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View interviews" ON public.interviews FOR SELECT USING (true);
CREATE POLICY "Manage interviews" ON public.interviews FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View onboarding_tasks" ON public.onboarding_tasks FOR SELECT USING (true);
CREATE POLICY "Manage onboarding_tasks" ON public.onboarding_tasks FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "View project_tasks" ON public.project_tasks FOR SELECT USING (true);
CREATE POLICY "Insert project_tasks" ON public.project_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Update project_tasks" ON public.project_tasks FOR UPDATE USING (true);
CREATE POLICY "Delete project_tasks" ON public.project_tasks FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "View document_assets" ON public.document_assets FOR SELECT USING (true);
CREATE POLICY "Insert document_assets" ON public.document_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete document_assets" ON public.document_assets FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for announcements and projects
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage policies
CREATE POLICY "Anyone can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Authenticated upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND (SELECT has_role(auth.uid(), 'admin')));
