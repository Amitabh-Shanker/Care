-- Allow patients to view all doctors for appointment booking
-- This policy enables patients to see doctor information when booking appointments

-- Drop policy if it exists (in case of re-running)
DROP POLICY IF EXISTS "Patients can view all doctors for appointment booking" ON public.doctors;

-- Create policy to allow authenticated users (patients) to view all doctors
CREATE POLICY "Patients can view all doctors for appointment booking"
  ON public.doctors
  FOR SELECT
  USING (
    -- Allow if user is authenticated (logged in)
    auth.uid() IS NOT NULL
  );

