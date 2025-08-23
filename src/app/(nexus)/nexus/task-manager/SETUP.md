# Task Manager Setup Guide

## 🚀 Quick Setup

The Task Manager is now fully functional and integrated into your Nexus dashboard! Here's what you need to do:

### 1. Database Setup (Required)

Run this complete SQL script in your Supabase SQL Editor:

```sql
-- Create tasks table for the Task Manager module
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
```

### 2. Real Supabase Integration Features

✅ **Full CRUD Operations**: Create, Read, Update, Delete tasks
✅ **Real-time Data**: All changes are immediately saved to Supabase
✅ **Error Handling**: Comprehensive error handling with console logging
✅ **Data Validation**: Proper data validation before saving
✅ **Row Level Security**: Secure access control for authenticated users
✅ **Automatic Timestamps**: Created and updated timestamps are managed automatically
✅ **Indexes**: Optimized database performance with proper indexes

### 3. Access the Task Manager

1. Go to your Nexus dashboard: `/nexus`
2. Click on the **"Task Planner"** module (now shows as "Active" instead of "Coming Soon")
3. Or use the quick action: **"Create New Task"** button

### 4. Features Available

✅ **Task Creation**: Create tasks with title, description, category, priority, due date, assignment, and tags
✅ **Recurring Tasks**: Set up daily, weekly, or monthly recurring tasks
✅ **Task Management**: Edit, complete, and delete tasks
✅ **Filtering & Search**: Filter by category, priority, and search terms
✅ **Task Tabs**: View All, Pending, Overdue, and Completed tasks
✅ **Statistics**: Real-time task statistics dashboard
✅ **Premium Design**: Modern, compact UI with lots of radius and glassmorphism

### 5. Sample Tasks Included

The system comes with 5 pre-configured sample tasks:
- Generate Monthly Rent Invoices (Monthly, High Priority)
- Record Daily Sales (Daily, High Priority)
- Inventory Count (Weekly, Medium Priority)
- Staff Meeting (Weekly, Medium Priority)
- Bank Reconciliation (Monthly, High Priority)

### 6. Task Categories

- **Daily**: Tasks that repeat every day
- **Weekly**: Tasks that repeat weekly
- **Monthly**: Tasks that repeat monthly
- **One-time**: Single occurrence tasks

### 7. Priority Levels

- **Low**: Green badge
- **Medium**: Yellow badge
- **High**: Orange badge
- **Urgent**: Red badge

### 8. Recurring Task Logic

The system automatically generates new instances of recurring tasks:
- **Daily**: Every X days from the last generated date
- **Weekly**: Every X weeks from the last generated date
- **Monthly**: Every X months from the last generated date

### 9. Premium Design Features

- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Rounded Corners**: Extensive use of rounded-3xl for premium feel
- **Gradients**: Purple gradient buttons and accents
- **Hover Effects**: Smooth scale and shadow transitions
- **Compact Layout**: Information-dense design for efficiency
- **Color-coded**: Different colors for different task states

### 10. Never Miss Tasks

The system ensures you never miss tasks through:
- **Overdue Indicators**: Red border and warning icons for overdue tasks
- **Due Date Formatting**: "Today", "Tomorrow", or date format
- **Priority Highlighting**: Color-coded priority badges
- **Statistics Dashboard**: Real-time overview of task status
- **Filtering**: Easy filtering to focus on urgent tasks

### 11. Database Schema

The tasks table includes:
- `id`: Unique identifier (UUID)
- `title`: Task title (required)
- `description`: Task description
- `category`: Task category (daily, weekly, monthly, one-time)
- `priority`: Task priority (low, medium, high, urgent)
- `due_date`: Due date (required)
- `completed`: Completion status (boolean)
- `completed_at`: Completion timestamp
- `assigned_to`: Assigned person
- `recurring`: Recurring configuration (JSONB)
- `tags`: Task tags (array)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### 12. Troubleshooting

If you encounter any issues:

1. **Database Connection**: Ensure Supabase is properly configured
2. **Authentication**: Make sure you're logged in
3. **RLS Policies**: Verify the SQL script ran successfully
4. **Console Errors**: Check browser console for any JavaScript errors
5. **Field Names**: Ensure all field names match the database schema

### 13. Customization

You can customize the Task Manager by:
- Adding more task categories in the types file
- Modifying the color scheme in the components
- Adding new priority levels
- Customizing the recurring task logic

### 14. Next Steps

After setup, you can:
1. Create your first task
2. Set up recurring tasks for your business operations
3. Assign tasks to team members
4. Use the filtering and search to manage tasks efficiently
5. Monitor task completion through the statistics dashboard

---

**🎉 Your Task Manager is now ready to help you never miss a task again with real Supabase integration!**
