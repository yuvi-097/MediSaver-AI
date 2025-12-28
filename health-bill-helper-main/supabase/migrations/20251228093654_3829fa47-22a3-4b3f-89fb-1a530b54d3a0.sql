-- Create storage bucket for bill uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', false);

-- Allow anyone to upload bills (no auth required for MVP)
CREATE POLICY "Anyone can upload bills"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bills');

-- Allow anyone to read their uploaded bills
CREATE POLICY "Anyone can read bills"
ON storage.objects FOR SELECT
USING (bucket_id = 'bills');

-- Reference pricing table for common medical procedures
CREATE TABLE public.reference_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpt_code TEXT NOT NULL UNIQUE,
  procedure_name TEXT NOT NULL,
  category TEXT NOT NULL,
  medicare_rate DECIMAL(10,2) NOT NULL,
  typical_range_low DECIMAL(10,2) NOT NULL,
  typical_range_high DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access
ALTER TABLE public.reference_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reference pricing"
ON public.reference_pricing FOR SELECT
USING (true);

-- Insert common medical procedure reference prices (Medicare rates)
INSERT INTO public.reference_pricing (cpt_code, procedure_name, category, medicare_rate, typical_range_low, typical_range_high) VALUES
('99213', 'Office Visit - Established Patient (15 min)', 'Office Visit', 76.15, 60.00, 150.00),
('99214', 'Office Visit - Established Patient (25 min)', 'Office Visit', 111.96, 90.00, 220.00),
('99215', 'Office Visit - Established Patient (40 min)', 'Office Visit', 150.83, 120.00, 300.00),
('99203', 'Office Visit - New Patient (30 min)', 'Office Visit', 110.43, 90.00, 220.00),
('99204', 'Office Visit - New Patient (45 min)', 'Office Visit', 167.75, 130.00, 330.00),
('99205', 'Office Visit - New Patient (60 min)', 'Office Visit', 211.11, 170.00, 420.00),
('99281', 'Emergency Department Visit - Level 1', 'Emergency', 22.53, 150.00, 500.00),
('99282', 'Emergency Department Visit - Level 2', 'Emergency', 51.30, 250.00, 800.00),
('99283', 'Emergency Department Visit - Level 3', 'Emergency', 92.48, 400.00, 1200.00),
('99284', 'Emergency Department Visit - Level 4', 'Emergency', 155.61, 600.00, 2000.00),
('99285', 'Emergency Department Visit - Level 5', 'Emergency', 237.34, 1000.00, 3500.00),
('71046', 'Chest X-Ray (2 views)', 'Imaging', 26.96, 50.00, 400.00),
('71250', 'CT Chest without Contrast', 'Imaging', 122.34, 200.00, 1500.00),
('71260', 'CT Chest with Contrast', 'Imaging', 148.23, 300.00, 2000.00),
('72148', 'MRI Lumbar Spine without Contrast', 'Imaging', 240.76, 400.00, 3000.00),
('73721', 'MRI Lower Extremity Joint', 'Imaging', 240.76, 400.00, 2500.00),
('70553', 'MRI Brain with/without Contrast', 'Imaging', 326.45, 500.00, 4000.00),
('80053', 'Comprehensive Metabolic Panel', 'Laboratory', 10.56, 15.00, 150.00),
('85025', 'Complete Blood Count (CBC)', 'Laboratory', 7.77, 10.00, 100.00),
('84443', 'Thyroid Stimulating Hormone (TSH)', 'Laboratory', 20.22, 25.00, 200.00),
('80061', 'Lipid Panel', 'Laboratory', 13.39, 20.00, 150.00),
('36415', 'Venipuncture (Blood Draw)', 'Laboratory', 3.00, 5.00, 50.00),
('81001', 'Urinalysis with Microscopy', 'Laboratory', 3.50, 5.00, 75.00),
('29881', 'Knee Arthroscopy with Meniscectomy', 'Surgery', 577.14, 2000.00, 15000.00),
('27447', 'Total Knee Replacement', 'Surgery', 1576.45, 15000.00, 70000.00),
('27130', 'Total Hip Replacement', 'Surgery', 1576.45, 15000.00, 70000.00),
('43239', 'Upper GI Endoscopy with Biopsy', 'Surgery', 316.23, 1000.00, 5000.00),
('45380', 'Colonoscopy with Biopsy', 'Surgery', 398.12, 1500.00, 6000.00),
('47562', 'Laparoscopic Cholecystectomy', 'Surgery', 634.89, 5000.00, 25000.00),
('59400', 'Routine Obstetric Care (Vaginal)', 'Obstetrics', 2176.00, 5000.00, 20000.00),
('59510', 'Cesarean Delivery', 'Obstetrics', 2533.00, 10000.00, 35000.00),
('90834', 'Psychotherapy (45 min)', 'Mental Health', 102.16, 100.00, 250.00),
('90837', 'Psychotherapy (60 min)', 'Mental Health', 136.64, 150.00, 350.00),
('90791', 'Psychiatric Diagnostic Evaluation', 'Mental Health', 155.22, 200.00, 500.00),
('97110', 'Physical Therapy - Therapeutic Exercise', 'Therapy', 32.12, 50.00, 200.00),
('97140', 'Manual Therapy Techniques', 'Therapy', 31.56, 50.00, 200.00),
('97530', 'Therapeutic Activities', 'Therapy', 36.89, 50.00, 200.00),
('92928', 'Coronary Stent Placement', 'Cardiology', 6234.56, 15000.00, 50000.00),
('93000', 'Electrocardiogram (ECG/EKG)', 'Cardiology', 16.94, 25.00, 300.00),
('93306', 'Echocardiogram Complete', 'Cardiology', 188.45, 300.00, 2000.00),
('93015', 'Cardiovascular Stress Test', 'Cardiology', 108.67, 200.00, 1500.00),
('99221', 'Initial Hospital Care - Level 1', 'Hospital', 96.23, 200.00, 800.00),
('99222', 'Initial Hospital Care - Level 2', 'Hospital', 131.56, 300.00, 1200.00),
('99223', 'Initial Hospital Care - Level 3', 'Hospital', 188.34, 400.00, 1800.00),
('99231', 'Subsequent Hospital Care - Level 1', 'Hospital', 40.12, 100.00, 400.00),
('99232', 'Subsequent Hospital Care - Level 2', 'Hospital', 71.45, 150.00, 600.00),
('99233', 'Subsequent Hospital Care - Level 3', 'Hospital', 102.34, 200.00, 800.00),
('96372', 'Therapeutic Injection', 'Procedures', 25.67, 30.00, 200.00),
('20610', 'Joint Injection/Aspiration - Major', 'Procedures', 62.34, 100.00, 500.00);