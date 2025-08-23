'-- Create tasks table for the Task Manager module
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'one-time')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  assigned_to TEXT,
  recurring JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated users to update tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated users to delete tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample tasks for testing
INSERT INTO tasks (title, description, category, priority, due_date, assigned_to, tags, recurring) VALUES
(
  'Generate Monthly Rent Invoices',
  'Create and send rent invoices to all tenants for the current month',
  'monthly',
  'high',
  CURRENT_DATE,
  'Admin',
  ARRAY['rent', 'invoices', 'monthly'],
  '{"type": "monthly", "interval": 1}'::jsonb
),
(
  'Record Daily Sales',
  'Enter all sales transactions from the previous day into the system',
  'daily',
  'high',
  CURRENT_DATE,
  'Cashier',
  ARRAY['sales', 'daily', 'transactions'],
  '{"type": "daily", "interval": 1}'::jsonb
),
(
  'Inventory Count',
  'Perform weekly inventory count to ensure stock levels are accurate',
  'weekly',
  'medium',
  CURRENT_DATE + INTERVAL '7 days',
  'Manager',
  ARRAY['inventory', 'stock', 'weekly'],
  '{"type": "weekly", "interval": 1}'::jsonb
),
(
  'Staff Meeting',
  'Weekly staff meeting to discuss operations, issues, and upcoming tasks',
  'weekly',
  'medium',
  CURRENT_DATE + INTERVAL '2 days',
  'Manager',
  ARRAY['meeting', 'staff', 'weekly'],
  '{"type": "weekly", "interval": 1}'::jsonb
),
(
  'Bank Reconciliation',
  'Reconcile bank statements with internal records for the previous month',
  'monthly',
  'high',
  CURRENT_DATE + INTERVAL '5 days',
  'Admin',
  ARRAY['banking', 'reconciliation', 'monthly'],
  '{"type": "monthly", "interval": 1}'::jsonb
)
ON CONFLICT DO NOTHING;
'