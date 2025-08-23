-- Employee Management Database Schema
-- This schema creates all necessary tables for the KQS Employee Management module

-- Create divisions table
CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    id_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    division_id UUID REFERENCES public.divisions(id),
    position VARCHAR(100),
    employment_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    hire_date DATE,
    termination_date DATE,
    salary DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'ZAR',
    payment_method VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_branch_code VARCHAR(20),
    tax_number VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_contacts table (for multiple emergency contacts per employee)
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_documents table
CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date DATE,
    is_required BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_division_id ON public.employees(division_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON public.employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_is_active ON public.divisions(is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee_id ON public.emergency_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON public.employee_documents(employee_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON public.divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON public.employee_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for divisions
CREATE POLICY "Enable read access for authenticated users" ON public.divisions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.divisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.divisions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.divisions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for employees
CREATE POLICY "Enable read access for authenticated users" ON public.employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.employees
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.employees
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for emergency_contacts
CREATE POLICY "Enable read access for authenticated users" ON public.emergency_contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.emergency_contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.emergency_contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.emergency_contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for employee_documents
CREATE POLICY "Enable read access for authenticated users" ON public.employee_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.employee_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.employee_documents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.employee_documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample divisions
INSERT INTO public.divisions (name, code, description, location) VALUES
('Construction', 'CONS', 'Construction and building services division', 'Johannesburg'),
('Footwear', 'FOOT', 'Footwear and shoe manufacturing division', 'Cape Town'),
('Property', 'PROP', 'Property management and real estate division', 'Durban'),
('Transport', 'TRANS', 'Transportation and logistics division', 'Pretoria'),
('Security', 'SEC', 'Security services division', 'Bloemfontein')
ON CONFLICT (code) DO NOTHING;

-- Insert sample employees
INSERT INTO public.employees (employee_id, first_name, last_name, email, phone, division_id, position, employment_type, status, hire_date, salary) 
SELECT 
    'EMP001',
    'John',
    'Doe',
    'john.doe@kqs.com',
    '+27123456789',
    d.id,
    'Site Manager',
    'full_time',
    'active',
    '2023-01-15',
    45000.00
FROM public.divisions d WHERE d.code = 'CONS'
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO public.employees (employee_id, first_name, last_name, email, phone, division_id, position, employment_type, status, hire_date, salary)
SELECT 
    'EMP002',
    'Jane',
    'Smith',
    'jane.smith@kqs.com',
    '+27123456790',
    d.id,
    'Designer',
    'full_time',
    'active',
    '2023-02-20',
    38000.00
FROM public.divisions d WHERE d.code = 'FOOT'
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample emergency contacts
INSERT INTO public.emergency_contacts (employee_id, name, phone, relationship, is_primary)
SELECT 
    e.id,
    'Mary Doe',
    '+27123456791',
    'Spouse',
    true
FROM public.employees e WHERE e.employee_id = 'EMP001'
ON CONFLICT DO NOTHING;

INSERT INTO public.emergency_contacts (employee_id, name, phone, relationship, is_primary)
SELECT 
    e.id,
    'Robert Smith',
    '+27123456792',
    'Father',
    true
FROM public.employees e WHERE e.employee_id = 'EMP002'
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.divisions TO authenticated;
GRANT ALL ON public.employees TO authenticated;
GRANT ALL ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.employee_documents TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
