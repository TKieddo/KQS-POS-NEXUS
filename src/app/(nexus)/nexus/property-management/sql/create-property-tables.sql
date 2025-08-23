-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Buildings Table
create table if not exists public.buildings (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  total_units int not null,
  property_type text not null check (property_type in ('apartment', 'house', 'commercial', 'mixed')),
  year_built int check (year_built >= 1800 and year_built <= extract(year from current_date)),
  amenities text[],
  manager_id uuid references auth.users(id),
  total_rent numeric(10,2) default 0,
  collected_rent numeric(10,2) default 0,
  branch_id uuid references public.branches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tenants Table
create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  building_id uuid references public.buildings(id) not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  unit_number text not null,
  lease_start_date date not null,
  lease_end_date date not null check (lease_end_date > lease_start_date),
  monthly_rent numeric(10,2) not null check (monthly_rent >= 0),
  security_deposit numeric(10,2) not null check (security_deposit >= 0),
  emergency_contact_name text,
  emergency_contact_phone text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'overdue')),
  notes text,
  branch_id uuid references public.branches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments Table
create table if not exists public.property_payments (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) not null,
  building_id uuid references public.buildings(id) not null,
  amount numeric(10,2) not null check (amount > 0),
  payment_date date not null,
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'mobile_money', 'check', 'other')),
  payment_type text not null check (payment_type in ('rent', 'deposit', 'late_fee', 'utility', 'other')),
  receipt_sent boolean default false,
  receipt_sent_method text check (receipt_sent_method in ('email', 'printed', 'both', null)),
  notes text,
  branch_id uuid references public.branches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents Table
create table if not exists public.property_documents (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  building_id uuid references public.buildings(id),
  document_type text not null check (document_type in ('contract', 'receipt', 'invoice', 'notice', 'other')),
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  uploaded_by uuid references auth.users(id) not null,
  branch_id uuid references public.branches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_buildings_branch on public.buildings(branch_id);
create index if not exists idx_tenants_building on public.tenants(building_id);
create index if not exists idx_tenants_branch on public.tenants(branch_id);
create index if not exists idx_payments_tenant on public.property_payments(tenant_id);
create index if not exists idx_payments_building on public.property_payments(building_id);
create index if not exists idx_payments_branch on public.property_payments(branch_id);
create index if not exists idx_payments_date on public.property_payments(payment_date);
create index if not exists idx_documents_tenant on public.property_documents(tenant_id);
create index if not exists idx_documents_building on public.property_documents(building_id);
create index if not exists idx_documents_branch on public.property_documents(branch_id);

-- Add triggers to update buildings total_rent and collected_rent
create or replace function update_building_rent_totals()
returns trigger as $$
begin
  -- Update total_rent when a tenant is added/updated/deleted
  if tg_op = 'INSERT' then
    update public.buildings
    set total_rent = total_rent + new.monthly_rent
    where id = new.building_id;
  elsif tg_op = 'UPDATE' and old.monthly_rent != new.monthly_rent then
    update public.buildings
    set total_rent = total_rent - old.monthly_rent + new.monthly_rent
    where id = new.building_id;
  elsif tg_op = 'DELETE' then
    update public.buildings
    set total_rent = total_rent - old.monthly_rent
    where id = old.building_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger update_building_rent_totals
after insert or update or delete on public.tenants
for each row execute function update_building_rent_totals();

-- Add trigger to update collected_rent when payments are made
create or replace function update_building_collected_rent()
returns trigger as $$
begin
  if tg_op = 'INSERT' and new.payment_type = 'rent' then
    update public.buildings
    set collected_rent = collected_rent + new.amount
    where id = new.building_id;
  elsif tg_op = 'DELETE' and old.payment_type = 'rent' then
    update public.buildings
    set collected_rent = collected_rent - old.amount
    where id = old.building_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger update_building_collected_rent
after insert or delete on public.property_payments
for each row execute function update_building_collected_rent();

-- Add trigger to update tenant payment_status
create or replace function update_tenant_payment_status()
returns trigger as $$
declare
  last_payment_date date;
  rent_due numeric;
  rent_paid numeric;
begin
  -- Get the last payment date for this tenant
  select max(payment_date)
  into last_payment_date
  from public.property_payments
  where tenant_id = new.tenant_id and payment_type = 'rent';

  -- Calculate total rent due and paid
  select monthly_rent
  into rent_due
  from public.tenants
  where id = new.tenant_id;

  select coalesce(sum(amount), 0)
  into rent_paid
  from public.property_payments
  where tenant_id = new.tenant_id 
    and payment_type = 'rent'
    and payment_date >= date_trunc('month', current_date);

  -- Update tenant status
  update public.tenants
  set payment_status = case
    when rent_paid >= rent_due then 'paid'
    when current_date > coalesce(last_payment_date, lease_start_date) + interval '5 days' then 'overdue'
    else 'pending'
  end
  where id = new.tenant_id;

  return new;
end;
$$ language plpgsql;

create trigger update_tenant_payment_status
after insert or update or delete on public.property_payments
for each row execute function update_tenant_payment_status();

-- RLS Policies
alter table public.buildings enable row level security;
alter table public.tenants enable row level security;
alter table public.property_payments enable row level security;
alter table public.property_documents enable row level security;

-- Buildings policies
create policy "Users can view buildings in their branch"
  on public.buildings for select
  using (auth.uid() in (
    select user_id from user_branches where branch_id = buildings.branch_id
  ));

create policy "Users can insert buildings in their branch"
  on public.buildings for insert
  with check (auth.uid() in (
    select user_id from user_branches where branch_id = buildings.branch_id
  ));

create policy "Users can update buildings in their branch"
  on public.buildings for update
  using (auth.uid() in (
    select user_id from user_branches where branch_id = buildings.branch_id
  ));

-- Similar policies for tenants
create policy "Users can view tenants in their branch"
  on public.tenants for select
  using (auth.uid() in (
    select user_id from user_branches where branch_id = tenants.branch_id
  ));

create policy "Users can insert tenants in their branch"
  on public.tenants for insert
  with check (auth.uid() in (
    select user_id from user_branches where branch_id = tenants.branch_id
  ));

create policy "Users can update tenants in their branch"
  on public.tenants for update
  using (auth.uid() in (
    select user_id from user_branches where branch_id = tenants.branch_id
  ));

-- Similar policies for payments
create policy "Users can view payments in their branch"
  on public.property_payments for select
  using (auth.uid() in (
    select user_id from user_branches where branch_id = property_payments.branch_id
  ));

create policy "Users can insert payments in their branch"
  on public.property_payments for insert
  with check (auth.uid() in (
    select user_id from user_branches where branch_id = property_payments.branch_id
  ));

-- Similar policies for documents
create policy "Users can view documents in their branch"
  on public.property_documents for select
  using (auth.uid() in (
    select user_id from user_branches where branch_id = property_documents.branch_id
  ));

create policy "Users can insert documents in their branch"
  on public.property_documents for insert
  with check (auth.uid() in (
    select user_id from user_branches where branch_id = property_documents.branch_id
  ));
