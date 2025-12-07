-- Add diagnosis storage for symptom analysis results
-- This table stores AI-generated diagnoses from symptom analysis

CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  diseases JSONB NOT NULL, -- Array of {name, score} objects
  severity TEXT NOT NULL CHECK (severity IN ('emergency', 'urgent', 'moderate', 'mild')),
  recommendations TEXT[] NOT NULL,
  care_tips TEXT[],
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('text', 'voice', 'image', 'combined')),
  input_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view their own diagnoses"
  ON public.patient_diagnoses
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own diagnoses"
  ON public.patient_diagnoses
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Doctors can view diagnoses for their patients
CREATE POLICY "Doctors can view patient diagnoses"
  ON public.patient_diagnoses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patient_diagnoses.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Add RLS policy for doctors to view patient_questionnaire
CREATE POLICY "Doctors can view patient questionnaire for appointments"
  ON public.patient_questionnaire
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patient_questionnaire.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Trigger for timestamp updates
CREATE TRIGGER update_patient_diagnoses_updated_at
  BEFORE UPDATE ON public.patient_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX idx_patient_diagnoses_created_at ON public.patient_diagnoses(created_at DESC);

