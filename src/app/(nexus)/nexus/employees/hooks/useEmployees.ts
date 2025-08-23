import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  Employee, 
  Division, 
  EmployeeFormData, 
  DivisionFormData,
  EmergencyContact,
  EmployeeDocument 
} from '../types/employee'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load divisions first
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('divisions')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (divisionsError) throw divisionsError

      // Load employees with division info
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          divisions (
            id,
            name,
            code,
            location
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (employeesError) throw employeesError

      // Transform data to match our types
      const transformedEmployees: Employee[] = (employeesData || []).map(emp => ({
        id: emp.id,
        employeeId: emp.employee_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        middleName: emp.middle_name,
        email: emp.email,
        phone: emp.phone,
        alternativePhone: emp.alternative_phone,
        dateOfBirth: emp.date_of_birth,
        gender: emp.gender,
        nationality: emp.nationality,
        idNumber: emp.id_number,
        passportNumber: emp.passport_number,
        address: emp.address,
        divisionId: emp.division_id,
        position: emp.position,
        employmentType: emp.employment_type,
        status: emp.status,
        hireDate: emp.hire_date,
        terminationDate: emp.termination_date,
        probationEndDate: emp.probation_end_date,
        salary: emp.salary,
        currency: emp.currency,
        paymentMethod: emp.payment_method,
        bankDetails: emp.bank_details,
        emergencyContacts: emp.emergency_contacts || [],
        documents: emp.documents || [],
        skills: emp.skills || [],
        languages: emp.languages || [],
        education: emp.education || [],
        workExperience: emp.work_experience || [],
        isActive: emp.is_active,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      }))

      const transformedDivisions: Division[] = (divisionsData || []).map(div => ({
        id: div.id,
        name: div.name,
        code: div.code,
        description: div.description,
        managerId: div.manager_id,
        location: div.location,
        isActive: div.is_active,
        createdAt: div.created_at,
        updatedAt: div.updated_at
      }))

      setEmployees(transformedEmployees)
      setDivisions(transformedDivisions)
    } catch (err: any) {
      setError(err.message || 'Failed to load employee data')
      console.error('Error loading employee data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadData()
  }

  // Employee CRUD operations
  const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          employee_id: employeeData.employeeId,
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          middle_name: employeeData.middleName,
          email: employeeData.email,
          phone: employeeData.phone,
          alternative_phone: employeeData.alternativePhone,
          date_of_birth: employeeData.dateOfBirth,
          gender: employeeData.gender,
          nationality: employeeData.nationality,
          id_number: employeeData.idNumber,
          passport_number: employeeData.passportNumber,
          address: employeeData.address,
          division_id: employeeData.divisionId,
          position: employeeData.position,
          employment_type: employeeData.employmentType,
          status: employeeData.status,
          hire_date: employeeData.hireDate,
          termination_date: employeeData.terminationDate,
          probation_end_date: employeeData.probationEndDate,
          salary: employeeData.salary,
          currency: employeeData.currency,
          payment_method: employeeData.paymentMethod,
          bank_details: employeeData.bankDetails,
          emergency_contacts: employeeData.emergencyContacts,
          documents: employeeData.documents,
          skills: employeeData.skills,
          languages: employeeData.languages,
          education: employeeData.education,
          work_experience: employeeData.workExperience,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Refresh data
      await loadData()
      return data
    } catch (err: any) {
      console.error('Error creating employee:', err)
      throw err
    }
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Map the updates to database column names
      if (updates.employeeId) updateData.employee_id = updates.employeeId
      if (updates.firstName) updateData.first_name = updates.firstName
      if (updates.lastName) updateData.last_name = updates.lastName
      if (updates.middleName !== undefined) updateData.middle_name = updates.middleName
      if (updates.email) updateData.email = updates.email
      if (updates.phone) updateData.phone = updates.phone
      if (updates.alternativePhone !== undefined) updateData.alternative_phone = updates.alternativePhone
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth
      if (updates.gender) updateData.gender = updates.gender
      if (updates.nationality) updateData.nationality = updates.nationality
      if (updates.idNumber) updateData.id_number = updates.idNumber
      if (updates.passportNumber !== undefined) updateData.passport_number = updates.passportNumber
      if (updates.address) updateData.address = updates.address
      if (updates.divisionId) updateData.division_id = updates.divisionId
      if (updates.position) updateData.position = updates.position
      if (updates.employmentType) updateData.employment_type = updates.employmentType
      if (updates.status) updateData.status = updates.status
      if (updates.hireDate) updateData.hire_date = updates.hireDate
      if (updates.terminationDate !== undefined) updateData.termination_date = updates.terminationDate
      if (updates.probationEndDate !== undefined) updateData.probation_end_date = updates.probationEndDate
      if (updates.salary !== undefined) updateData.salary = updates.salary
      if (updates.currency) updateData.currency = updates.currency
      if (updates.paymentMethod) updateData.payment_method = updates.paymentMethod
      if (updates.bankDetails !== undefined) updateData.bank_details = updates.bankDetails
      if (updates.emergencyContacts) updateData.emergency_contacts = updates.emergencyContacts
      if (updates.documents) updateData.documents = updates.documents
      if (updates.skills) updateData.skills = updates.skills
      if (updates.languages) updateData.languages = updates.languages
      if (updates.education) updateData.education = updates.education
      if (updates.workExperience) updateData.work_experience = updates.workExperience
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Refresh data
      await loadData()
      return data
    } catch (err: any) {
      console.error('Error updating employee:', err)
      throw err
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Refresh data
      await loadData()
    } catch (err: any) {
      console.error('Error deleting employee:', err)
      throw err
    }
  }

  // Division CRUD operations
  const createDivision = async (divisionData: Omit<Division, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .insert({
          name: divisionData.name,
          code: divisionData.code,
          description: divisionData.description,
          manager_id: divisionData.managerId,
          location: divisionData.location,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Refresh data
      await loadData()
      return data
    } catch (err: any) {
      console.error('Error creating division:', err)
      throw err
    }
  }

  const updateDivision = async (id: string, updates: Partial<Division>) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.name) updateData.name = updates.name
      if (updates.code) updateData.code = updates.code
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.managerId !== undefined) updateData.manager_id = updates.managerId
      if (updates.location) updateData.location = updates.location
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await supabase
        .from('divisions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Refresh data
      await loadData()
      return data
    } catch (err: any) {
      console.error('Error updating division:', err)
      throw err
    }
  }

  const deleteDivision = async (id: string) => {
    try {
      const { error } = await supabase
        .from('divisions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Refresh data
      await loadData()
    } catch (err: any) {
      console.error('Error deleting division:', err)
      throw err
    }
  }

  return {
    employees,
    divisions,
    loading,
    error,
    refreshData,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createDivision,
    updateDivision,
    deleteDivision
  }
}

// Separate hook for divisions only (if needed)
export function useDivisions() {
  const { divisions, loading, error, createDivision, updateDivision, deleteDivision } = useEmployees()
  
  return {
    divisions,
    loading,
    error,
    createDivision,
    updateDivision,
    deleteDivision
  }
}
