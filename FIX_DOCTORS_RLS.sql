-- ============================================
-- QUICK FIX: Allow Patients to View Doctors
-- ============================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This will fix the "No doctors available" issue

-- Step 1: Drop the policy if it already exists
DROP POLICY IF EXISTS "Patients can view all doctors for appointment booking" ON public.doctors;

-- Step 2: Create the policy to allow authenticated users to view all doctors
CREATE POLICY "Patients can view all doctors for appointment booking"
  ON public.doctors
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Step 3: Verify the policy was created
-- You can check this in: Supabase Dashboard → Authentication → Policies → doctors table

-- ============================================
-- TEST QUERY (Optional - to verify it works)
-- ============================================
-- After running the above, test with this query (as a patient user):
-- SELECT user_id, first_name, last_name, specialty FROM public.doctors;


