-- Fresh Attendance and Leave Management Database Schema
-- This script drops existing tables and recreates them with the correct schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Employees table with correct branch_id column
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick_leave', 'annual_leave', 'unpaid_leave')),
    deduction_type VARCHAR(20) CHECK (deduction_type IN ('leave_days', 'salary', 'none')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'unpaid', 'maternity', 'paternity', 'bereavement')),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    deduction_type VARCHAR(20) NOT NULL CHECK (deduction_type IN ('leave_days', 'salary', 'none')),
    number_of_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    total_leave_days INTEGER NOT NULL DEFAULT 12,
    used_leave_days INTEGER NOT NULL DEFAULT 0,
    remaining_leave_days INTEGER NOT NULL DEFAULT 12,
    carried_over_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_date_range ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_division ON employees(division);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Employees are viewable by authenticated users" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Employees are insertable by authenticated users" ON employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Employees are updatable by authenticated users" ON employees
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Employees are deletable by authenticated users" ON employees
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for attendance_records
CREATE POLICY "Attendance records are viewable by authenticated users" ON attendance_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Attendance records are insertable by authenticated users" ON attendance_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Attendance records are updatable by authenticated users" ON attendance_records
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Attendance records are deletable by authenticated users" ON attendance_records
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for leave_requests
CREATE POLICY "Leave requests are viewable by authenticated users" ON leave_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leave requests are insertable by authenticated users" ON leave_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Leave requests are updatable by authenticated users" ON leave_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Leave requests are deletable by authenticated users" ON leave_requests
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for leave_balances
CREATE POLICY "Leave balances are viewable by authenticated users" ON leave_balances
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leave balances are insertable by authenticated users" ON leave_balances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Leave balances are updatable by authenticated users" ON leave_balances
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Leave balances are deletable by authenticated users" ON leave_balances
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO employees (name, division, position, branch_id, is_active) VALUES
    ('John Smith', 'Sales', 'Sales Representative', '00000000-0000-0000-0000-000000000001', true),
    ('Sarah Johnson', 'Marketing', 'Marketing Manager', '00000000-0000-0000-0000-000000000001', true),
    ('Michael Brown', 'IT', 'Software Developer', '00000000-0000-0000-0000-000000000001', true),
    ('Lisa Davis', 'HR', 'HR Specialist', '00000000-0000-0000-0000-000000000001', true),
    ('David Wilson', 'Finance', 'Accountant', '00000000-0000-0000-0000-000000000001', true),
    ('Emma Taylor', 'Sales', 'Sales Manager', '00000000-0000-0000-0000-000000000001', true),
    ('James Anderson', 'IT', 'System Administrator', '00000000-0000-0000-0000-000000000001', true),
    ('Maria Garcia', 'Marketing', 'Content Creator', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;

-- Insert sample leave balances for 2024
INSERT INTO leave_balances (employee_id, employee_name, year, total_leave_days, used_leave_days, remaining_leave_days, carried_over_days) 
SELECT 
    e.id,
    e.name,
    2024,
    12,
    0,
    12,
    0
FROM employees e
ON CONFLICT DO NOTHING;
