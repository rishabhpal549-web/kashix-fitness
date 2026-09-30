-- ==============================================================================
-- KASHIX FITNESS — SUPABASE DATABASE SCHEMA
-- Table: kashix_enquiries
-- Description: Stores website tour bookings, WhatsApp enquiries, and PT requests
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.kashix_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    whatsapp_number TEXT,
    fitness_goal TEXT,
    visit_date DATE,
    training_time TEXT,
    service TEXT DEFAULT 'Gym Membership',
    message TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'tour_scheduled', 'converted', 'closed'))
);

-- 2. Add table comments
COMMENT ON TABLE public.kashix_enquiries IS 'Enquiries and Free Gym Tour Bookings from KashiX Fitness Website';

-- 3. Enable Row Level Security (RLS) for data protection
ALTER TABLE public.kashix_enquiries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policy: Anyone (anon) can submit an enquiry from website
CREATE POLICY "Allow anonymous visitors to insert enquiries" 
ON public.kashix_enquiries 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 5. Create RLS Policy: Only authenticated admin/staff can read or update enquiries
CREATE POLICY "Allow authenticated staff to read enquiries" 
ON public.kashix_enquiries 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated staff to update enquiries" 
ON public.kashix_enquiries 
FOR UPDATE 
TO authenticated 
USING (true);

-- 6. Indexes for fast dashboard sorting
CREATE INDEX IF NOT EXISTS idx_kashix_enquiries_created_at ON public.kashix_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kashix_enquiries_status ON public.kashix_enquiries (status);
