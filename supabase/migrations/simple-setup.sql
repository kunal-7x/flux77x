-- Step 1: Create departments table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 2: Create employees table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Employee',
  department TEXT DEFAULT 'General',
  level TEXT DEFAULT 'Mid',
  manager TEXT,
  city TEXT,
  salary NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  performance_score INTEGER DEFAULT 70,
  vacation_days INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Create attendance_records table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present',
  location TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 4: Create leave_requests table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT DEFAULT 'vacation',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id),
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 5: Create announcements table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_initials TEXT,
  category TEXT DEFAULT 'Company',
  pinned BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 6: Create projects table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planning',
  progress INTEGER DEFAULT 0,
  team TEXT[] DEFAULT '{}',
  deadline TEXT,
  tasks_total INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  budget NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 7: Create company_settings table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Flux HR',
  industry TEXT DEFAULT 'Technology',
  timezone TEXT DEFAULT 'UTC',
  work_hours_start TEXT DEFAULT '09:00',
  work_hours_end TEXT DEFAULT '18:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 8: Create goals table
-- Copy this to Supabase SQL Editor and click Run

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'On Track',
  quarter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 9: Insert default data
-- Copy this to Supabase SQL Editor and click Run

INSERT INTO public.departments (name) VALUES 
('Managers'), ('Designers'), ('Developers'), ('HR'), ('Operations'), ('Sales'), ('Marketing');

INSERT INTO public.company_settings (company_name) VALUES ('Flux HR');