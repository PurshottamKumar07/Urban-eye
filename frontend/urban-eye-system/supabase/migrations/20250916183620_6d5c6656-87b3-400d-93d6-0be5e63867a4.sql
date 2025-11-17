-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('citizen', 'admin', 'employee');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'citizen' NOT NULL,
  department TEXT, -- for employees/admins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create issue categories enum
CREATE TYPE public.issue_category AS ENUM (
  'infrastructure', 
  'sanitation', 
  'traffic', 
  'environment', 
  'utilities', 
  'safety', 
  'other'
);

-- Create issue status enum
CREATE TYPE public.issue_status AS ENUM (
  'pending', 
  'in_progress', 
  'resolved', 
  'rejected', 
  'escalated'
);

-- Create issue priority enum
CREATE TYPE public.issue_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create civic issues table
CREATE TABLE public.civic_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category issue_category NOT NULL,
  priority issue_priority DEFAULT 'medium' NOT NULL,
  status issue_status DEFAULT 'pending' NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  image_urls TEXT[],
  assigned_to UUID REFERENCES public.profiles(user_id),
  department TEXT,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create issue votes table (for crowdsourced validation)
CREATE TABLE public.issue_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(issue_id, voter_id)
);

-- Create issue comments table
CREATE TABLE public.issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE NOT NULL,
  commenter_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  is_official BOOLEAN DEFAULT false, -- true for admin/employee comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create issue status history table
CREATE TABLE public.issue_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.civic_issues(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  old_status issue_status,
  new_status issue_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_status_history ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'citizen'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_issues_updated_at
  BEFORE UPDATE ON public.civic_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for civic_issues
CREATE POLICY "Anyone can view civic issues" ON public.civic_issues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON public.civic_issues
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own issues" ON public.civic_issues
  FOR UPDATE USING (
    auth.uid() = reporter_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'employee')
  );

CREATE POLICY "Admins and employees can delete issues" ON public.civic_issues
  FOR DELETE USING (public.get_user_role(auth.uid()) IN ('admin', 'employee'));

-- RLS Policies for issue_votes
CREATE POLICY "Anyone can view votes" ON public.issue_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.issue_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their own votes" ON public.issue_votes
  FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" ON public.issue_votes
  FOR DELETE USING (auth.uid() = voter_id);

-- RLS Policies for issue_comments
CREATE POLICY "Anyone can view comments" ON public.issue_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.issue_comments
  FOR INSERT WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can update their own comments" ON public.issue_comments
  FOR UPDATE USING (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments or admins can delete any" ON public.issue_comments
  FOR DELETE USING (
    auth.uid() = commenter_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'employee')
  );

-- RLS Policies for issue_status_history
CREATE POLICY "Anyone can view status history" ON public.issue_status_history
  FOR SELECT USING (true);

CREATE POLICY "Admins and employees can create status history" ON public.issue_status_history
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'employee'));

-- Create storage bucket for issue images
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-images', 'issue-images', true);

-- Create storage policies
CREATE POLICY "Anyone can view issue images" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-images');

CREATE POLICY "Authenticated users can upload issue images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'issue-images' AND 
    auth.uid() IS NOT NULL
  );

-- Create indexes for better performance
CREATE INDEX idx_civic_issues_status ON public.civic_issues(status);
CREATE INDEX idx_civic_issues_category ON public.civic_issues(category);
CREATE INDEX idx_civic_issues_priority ON public.civic_issues(priority);
CREATE INDEX idx_civic_issues_location ON public.civic_issues(latitude, longitude);
CREATE INDEX idx_civic_issues_created_at ON public.civic_issues(created_at DESC);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_issue_votes_issue_id ON public.issue_votes(issue_id);
CREATE INDEX idx_issue_comments_issue_id ON public.issue_comments(issue_id);