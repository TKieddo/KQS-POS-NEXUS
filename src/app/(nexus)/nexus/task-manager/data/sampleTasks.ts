import type { CreateTaskData } from '../types'

export const sampleTasks: CreateTaskData[] = [
  {
    title: 'Generate Monthly Rent Invoices',
    description: 'Create and send rent invoices to all tenants for the current month',
    category: 'monthly',
    priority: 'high',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    assignedTo: 'Admin',
    tags: ['rent', 'invoices', 'monthly'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    title: 'Record Daily Sales',
    description: 'Enter all sales transactions from the previous day into the system',
    category: 'daily',
    priority: 'high',
    dueDate: new Date().toISOString(),
    assignedTo: 'Cashier',
    tags: ['sales', 'daily', 'transactions'],
    recurring: {
      type: 'daily',
      interval: 1
    }
  },
  {
    title: 'Inventory Count',
    description: 'Perform weekly inventory count to ensure stock levels are accurate',
    category: 'weekly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['inventory', 'stock', 'weekly'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Customer Payment Follow-up',
    description: 'Contact customers with overdue payments and send payment reminders',
    category: 'weekly',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Admin',
    tags: ['payments', 'follow-up', 'customers'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Staff Meeting',
    description: 'Weekly staff meeting to discuss operations, issues, and upcoming tasks',
    category: 'weekly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['meeting', 'staff', 'weekly'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Bank Reconciliation',
    description: 'Reconcile bank statements with internal records for the previous month',
    category: 'monthly',
    priority: 'high',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
    assignedTo: 'Admin',
    tags: ['banking', 'reconciliation', 'monthly'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    title: 'Equipment Maintenance',
    description: 'Schedule and perform routine maintenance on POS systems and equipment',
    category: 'monthly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Technician',
    tags: ['maintenance', 'equipment', 'POS'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    title: 'Update Product Prices',
    description: 'Review and update product prices based on supplier changes and market conditions',
    category: 'weekly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['pricing', 'products', 'updates'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Security System Check',
    description: 'Test and verify all security systems including cameras and alarms',
    category: 'weekly',
    priority: 'low',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Security',
    tags: ['security', 'cameras', 'alarms'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Customer Feedback Review',
    description: 'Review customer feedback and complaints from the previous week',
    category: 'weekly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['feedback', 'customers', 'review'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Tax Preparation',
    description: 'Prepare monthly tax reports and ensure all tax obligations are met',
    category: 'monthly',
    priority: 'urgent',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
    assignedTo: 'Admin',
    tags: ['tax', 'reports', 'monthly'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    title: 'Staff Training Session',
    description: 'Conduct training session for new staff members on POS system and procedures',
    category: 'one-time',
    priority: 'high',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['training', 'staff', 'POS']
  },
  {
    title: 'Backup System Test',
    description: 'Test backup systems to ensure data is properly backed up and can be restored',
    category: 'weekly',
    priority: 'high',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'IT',
    tags: ['backup', 'data', 'system'],
    recurring: {
      type: 'weekly',
      interval: 1
    }
  },
  {
    title: 'Supplier Meeting',
    description: 'Meet with key suppliers to discuss pricing, delivery schedules, and product quality',
    category: 'monthly',
    priority: 'medium',
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['suppliers', 'meeting', 'pricing'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    title: 'Emergency Response Drill',
    description: 'Conduct emergency response drill with all staff members',
    category: 'monthly',
    priority: 'low',
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Manager',
    tags: ['emergency', 'drill', 'safety'],
    recurring: {
      type: 'monthly',
      interval: 1
    }
  }
]
