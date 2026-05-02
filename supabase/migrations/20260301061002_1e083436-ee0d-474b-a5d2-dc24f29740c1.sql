
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'hr_manager', 'employee');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  tasks_in_progress INTEGER DEFAULT 0,
  external_work INTEGER DEFAULT 50,
  internal_work INTEGER DEFAULT 70,
  learning_progress INTEGER DEFAULT 50,
  avg_work_time NUMERIC DEFAULT 7.5,
  date_of_birth TEXT,
  nationality TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  join_date TEXT,
  employee_id TEXT,
  status TEXT DEFAULT 'active',
  avatar TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  bank_account_encrypted TEXT,
  certifications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Attendance records
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present',
  location TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Leave requests
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'vacation',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id),
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Announcements
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
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Projects
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
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Company settings (singleton)
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Flux Technologies Inc.',
  industry TEXT DEFAULT 'Technology',
  timezone TEXT DEFAULT 'UTC-5 (Eastern)',
  fiscal_year TEXT DEFAULT 'January - December',
  work_hours_start TEXT DEFAULT '09:00',
  work_hours_end TEXT DEFAULT '18:00',
  gps_tracking BOOLEAN DEFAULT true,
  auto_punch_out BOOLEAN DEFAULT true,
  remote_checkin BOOLEAN DEFAULT true,
  overtime_approval BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'On Track',
  quarter TEXT,
  key_results TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  -- Default role: employee
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Profiles: users see all, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anon can view profiles" ON public.profiles FOR SELECT TO anon USING (true);

-- User roles: viewable by authenticated, managed by admins
CREATE POLICY "Authenticated view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view roles" ON public.user_roles FOR SELECT TO anon USING (true);

-- Departments: viewable by all, managed by admins
CREATE POLICY "View departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view departments" ON public.departments FOR SELECT TO anon USING (true);

-- Employees: viewable by all authenticated, managed by admins/hr
CREATE POLICY "View employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins update employees" ON public.employees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins delete employees" ON public.employees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view employees" ON public.employees FOR SELECT TO anon USING (true);

-- Attendance: viewable by all, insert/update own or admin
CREATE POLICY "View attendance" ON public.attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Anon view attendance" ON public.attendance_records FOR SELECT TO anon USING (true);

-- Leave requests
CREATE POLICY "View leave requests" ON public.leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert leave requests" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update leave requests" ON public.leave_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anon view leave requests" ON public.leave_requests FOR SELECT TO anon USING (true);

-- Announcements
CREATE POLICY "View announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Update announcements" ON public.announcements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view announcements" ON public.announcements FOR SELECT TO anon USING (true);

-- Projects
CREATE POLICY "View projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view projects" ON public.projects FOR SELECT TO anon USING (true);

-- Company settings
CREATE POLICY "View company settings" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Update company settings" ON public.company_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view company settings" ON public.company_settings FOR SELECT TO anon USING (true);

-- Goals
CREATE POLICY "View goals" ON public.goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert goals" ON public.goals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update goals" ON public.goals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete goals" ON public.goals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon view goals" ON public.goals FOR SELECT TO anon USING (true);

-- Insert default company settings
INSERT INTO public.company_settings (company_name) VALUES ('Flux Technologies Inc.');

-- Insert default departments
INSERT INTO public.departments (name) VALUES ('Managers'), ('Designers'), ('Testers'), ('Developers'), ('Marketing'), ('Sales'), ('HR'), ('Operations');

-- Insert seed employees
INSERT INTO public.employees (first_name, last_name, email, phone, role, department, level, manager, city, salary, bonus, performance_score, vacation_days, tasks_in_progress, external_work, internal_work, learning_progress, avg_work_time, date_of_birth, nationality, address, emergency_contact, emergency_phone, join_date, employee_id, status, skills)
VALUES
('Henry', 'Carter', 'carter@gmail.com', '(718) 302-1546', 'UX/UI Designer', 'Designers', 'Senior', 'Ava Collins', 'New York', 4500, 750, 72, 18, 6, 58, 82, 52, 7.2, '1992-03-15', 'American', '742 Evergreen Terrace, NY', 'Laura Carter', '(718) 555-0199', '2021-06-01', 'EMP-001', 'active', '{"Figma","Sketch","React","CSS","Prototyping"}'),
('Ava', 'Collins', 'ava.c@gmail.com', '(212) 555-0147', 'Mobile Designer', 'Designers', 'Lead', 'Sarah Kim', 'San Francisco', 5200, 900, 85, 14, 4, 45, 90, 68, 7.8, '1990-07-22', 'American', '123 Mission St, SF', 'Mark Collins', '(212) 555-0188', '2020-01-15', 'EMP-002', 'active', '{"Figma","React Native","Swift","Design Systems"}'),
('Ethan', 'Brooks', 'ethan.b@gmail.com', '(415) 555-0198', 'UX/UI Designer', 'Designers', 'Mid', 'Ava Collins', 'Austin', 3800, 500, 68, 20, 8, 62, 75, 45, 7.0, '1995-11-08', 'American', '456 Congress Ave, Austin', 'Lisa Brooks', '(415) 555-0177', '2022-03-10', 'EMP-003', 'active', '{"Figma","Illustrator","Prototyping"}'),
('Emma', 'Harper', 'emma.h@gmail.com', '(323) 555-0156', 'Graphic Designer', 'Designers', 'Junior', 'Ava Collins', 'Los Angeles', 3200, 400, 74, 22, 3, 70, 65, 78, 6.5, '1997-05-30', 'Canadian', '789 Sunset Blvd, LA', 'John Harper', '(323) 555-0166', '2023-01-20', 'EMP-004', 'on-leave', '{"Photoshop","Illustrator","InDesign"}'),
('Lucas', 'Parker', 'lucas.p@gmail.com', '(646) 555-0123', 'UX/UI Designer', 'Designers', 'Senior', 'Ava Collins', 'Chicago', 4800, 650, 79, 16, 5, 55, 88, 60, 7.5, '1991-09-12', 'American', '321 Michigan Ave, Chicago', 'Nancy Parker', '(646) 555-0133', '2021-09-05', 'EMP-005', 'active', '{"Figma","Sketch","User Research"}'),
('Esther', 'Howard', 'esther.h@gmail.com', '(917) 555-0134', 'UX/UI Designer', 'Designers', 'Mid', 'Ava Collins', 'Seattle', 4100, 550, 71, 19, 7, 48, 80, 55, 7.1, '1993-12-25', 'American', '654 Pine St, Seattle', 'David Howard', '(917) 555-0144', '2022-07-01', 'EMP-006', 'active', '{"Figma","CSS","HTML","Accessibility"}'),
('Oliver', 'Reed', 'oliver.r@gmail.com', '(312) 555-0167', 'Manual Tester', 'Testers', 'Senior', 'Sarah Kim', 'Boston', 3900, 500, 76, 15, 9, 40, 85, 42, 7.4, '1994-01-18', 'British', '987 Beacon St, Boston', 'Sophie Reed', '(312) 555-0177', '2020-11-15', 'EMP-007', 'active', '{"Selenium","JIRA","TestRail","Manual Testing"}'),
('James', 'Sullivan', 'james.s@gmail.com', '(202) 555-0189', 'API Tester', 'Testers', 'Mid', 'Sarah Kim', 'Denver', 3600, 450, 69, 21, 4, 52, 78, 65, 6.8, '1996-04-05', 'Irish', '147 Broadway, Denver', 'Kate Sullivan', '(202) 555-0199', '2023-05-01', 'EMP-008', 'inactive', '{"Postman","REST","GraphQL","Python"}');
