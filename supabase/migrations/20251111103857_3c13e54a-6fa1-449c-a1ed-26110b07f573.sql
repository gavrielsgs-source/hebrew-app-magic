-- שלב 1.1: עדכון טבלת cars - הוספת שדות רכישה
ALTER TABLE cars 
  ADD COLUMN IF NOT EXISTS purchase_cost numeric,
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS supplier_name text;

-- שלב 1.2: יצירת טבלה חדשה car_expenses
CREATE TABLE car_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  expense_type text NOT NULL CHECK (expense_type IN ('repair', 'cleaning', 'paint', 'parts', 'transport', 'other')),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  include_vat boolean NOT NULL DEFAULT true,
  vat_rate numeric DEFAULT 17,
  document_url text,
  invoice_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- אינדקסים לביצועים
CREATE INDEX idx_car_expenses_car_id ON car_expenses(car_id);
CREATE INDEX idx_car_expenses_user_id ON car_expenses(user_id);

-- שלב 1.3: RLS Policies
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their car expenses"
  ON car_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- שלב 1.4: Trigger לעדכון updated_at
CREATE TRIGGER update_car_expenses_updated_at
  BEFORE UPDATE ON car_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- שלב 1.5: הוספת שדה לפרופיל - מייל רואה חשבון
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS accountant_email text;