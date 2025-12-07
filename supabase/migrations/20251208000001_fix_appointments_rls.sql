-- Migration: Fix appointments RLS policy for patient cancellation
-- Issue: Patients getting 403 Forbidden when trying to cancel appointments

-- Drop the existing policy that doesn't work correctly
DROP POLICY IF EXISTS "Patients can cancel their appointments" ON public.appointments;

-- Create a new policy with proper USING and WITH CHECK clauses
-- USING: Controls which rows can be selected for update (row visibility)
-- WITH CHECK: Controls what values can be written (validates the new row)
CREATE POLICY "Patients can update their own appointments"
  ON public.appointments 
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Also add a policy to allow patients to update patient_questionnaire (for edit functionality)
DROP POLICY IF EXISTS "Patients can update their questionnaire" ON public.patient_questionnaire;

CREATE POLICY "Patients can update their questionnaire"
  ON public.patient_questionnaire
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);
