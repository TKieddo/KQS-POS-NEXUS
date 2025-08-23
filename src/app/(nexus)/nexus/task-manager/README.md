# Task Manager Module

A comprehensive task management system for the KQS POS Nexus platform, designed to handle both one-time and recurring tasks for retail operations.

## Features

### Core Functionality
- **Task Creation & Management**: Create, edit, complete, and delete tasks
- **Recurring Tasks**: Automatically generate recurring tasks (daily, weekly, monthly)
- **Task Categories**: Daily, Weekly, Monthly, and One-time tasks
- **Priority Levels**: Low, Medium, High, and Urgent priorities
- **Task Assignment**: Assign tasks to specific team members
- **Tags System**: Organize tasks with custom tags
- **Due Date Management**: Set and track task due dates

### Task Types
1. **Daily Tasks**: Tasks that need to be completed every day
   - Record daily sales
   - Check inventory levels
   - Review daily reports

2. **Weekly Tasks**: Tasks that repeat weekly
   - Staff meetings
   - Inventory counts
   - Customer payment follow-ups
   - Security system checks

3. **Monthly Tasks**: Tasks that repeat monthly
   - Generate rent invoices
   - Bank reconciliation
   - Tax preparation
   - Equipment maintenance

4. **One-time Tasks**: Single occurrence tasks
   - Staff training sessions
   - Special projects
   - Equipment repairs

### Dashboard Features
- **Statistics Overview**: View task completion rates and pending tasks
- **Filtering & Search**: Filter tasks by category, priority, status, and search terms
- **Task Tabs**: Separate views for All, Pending, Overdue, and Completed tasks
- **Real-time Updates**: Live updates when tasks are modified

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
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
```

## Components

### Main Components
- `TaskManagerPage`: Main dashboard page
- `TaskList`: Displays tasks in a list format
- `TaskStats`: Shows task statistics
- `CreateTaskModal`: Modal for creating new tasks
- `EditTaskModal`: Modal for editing existing tasks
- `DeleteTaskDialog`: Confirmation dialog for task deletion

### Hooks
- `useTaskManager`: Main hook for task management operations

### Utilities
- `taskUtils`: Helper functions for task operations

## Usage

### Creating a Task
```typescript
const { createTask } = useTaskManager()

const newTask = {
  title: 'Daily Sales Recording',
  description: 'Record all sales from previous day',
  category: 'daily',
  priority: 'high',
  dueDate: new Date().toISOString(),
  assignedTo: 'Cashier',
  tags: ['sales', 'daily'],
  recurring: {
    type: 'daily',
    interval: 1
  }
}

await createTask(newTask)
```

### Completing a Task
```typescript
const { completeTask } = useTaskManager()

await completeTask(taskId, true) // Mark as completed
await completeTask(taskId, false) // Mark as incomplete
```

### Filtering Tasks
```typescript
const filteredTasks = taskUtils.filterTasks(tasks, {
  search: 'sales',
  category: 'daily',
  priority: 'high',
  status: 'pending'
})
```

## Recurring Task Logic

The system automatically generates recurring tasks based on the following rules:

1. **Daily Tasks**: Generated every X days from the last generated date
2. **Weekly Tasks**: Generated every X weeks from the last generated date
3. **Monthly Tasks**: Generated every X months from the last generated date

### Recurring Task Configuration
```typescript
const recurringConfig = {
  type: 'daily' | 'weekly' | 'monthly',
  interval: number, // Every X days/weeks/months
  endDate?: string, // Optional end date
  lastGenerated?: string // Last generation date
}
```

## Sample Tasks

The module includes pre-configured sample tasks for common retail operations:

- Monthly rent invoice generation
- Daily sales recording
- Weekly inventory counts
- Customer payment follow-ups
- Staff meetings
- Bank reconciliation
- Equipment maintenance
- Security system checks

## Integration

### Supabase Integration
The task manager integrates with Supabase for:
- Real-time data synchronization
- Row-level security
- Automatic backups
- User authentication

### PWA Features
- Offline task viewing
- Local task caching
- Sync when online

## Future Enhancements

1. **Task Templates**: Pre-defined task templates for common operations
2. **Task Dependencies**: Link tasks that depend on other tasks
3. **Time Tracking**: Track time spent on tasks
4. **Notifications**: Push notifications for due tasks
5. **Task Comments**: Add comments and notes to tasks
6. **File Attachments**: Attach files to tasks
7. **Task Export**: Export tasks to PDF/Excel
8. **Calendar Integration**: Sync with external calendars
9. **Mobile App**: Dedicated mobile application
10. **API Integration**: REST API for external integrations

## Security

- Row-level security enabled on all tables
- User authentication required for all operations
- Task assignment validation
- Audit trail for task modifications

## Performance

- Optimized database queries
- Efficient task filtering and sorting
- Lazy loading for large task lists
- Caching for frequently accessed data
