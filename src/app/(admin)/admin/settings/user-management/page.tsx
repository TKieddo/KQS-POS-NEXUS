'use client'

import React, { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, Eye, EyeOff, Building, Shield, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  getAllUsers, 
  getRoles, 
  getBranches, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserActive,
  updateUserBranches,
  type UnifiedUser,
  type UserRole,
  type CreateUserData
} from '@/lib/unified-user-management-service'
import { toast } from 'sonner'

export default function UserManagementPage() {
  const [users, setUsers] = useState<UnifiedUser[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null)
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    full_name: '',
    password: '',
    role_name: 'cashier',
    pos_pin: '',
    branch_ids: []
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersData, rolesData, branchesData] = await Promise.all([
        getAllUsers(),
        getRoles(),
        getBranches()
      ])
      
      setUsers(usersData)
      setRoles(rolesData)
      setBranches(branchesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (newUser.branch_ids.length === 0) {
      toast.error('Please select at least one branch')
      return
    }

    try {
      const result = await createUser(newUser)
      
      if (result.success) {
        toast.success('User created successfully')
        setShowCreateModal(false)
        setNewUser({
          email: '',
          full_name: '',
          password: '',
          role_name: 'cashier',
          pos_pin: '',
          branch_ids: []
        })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      const result = await updateUser(userId, updateData)
      
      if (result.success) {
        toast.success('User updated successfully')
        setShowEditModal(false)
        setSelectedUser(null)
        loadData()
      } else {
        toast.error(result.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteUser(userId)
      
      if (result.success) {
        toast.success('User deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const result = await toggleUserActive(userId, isActive)
      
      if (result.success) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
        loadData()
      } else {
        toast.error(result.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleUpdateBranches = async (userId: string, branchIds: string[]) => {
    try {
      const result = await updateUserBranches(userId, branchIds)
      
      if (result.success) {
        toast.success('Branch assignments updated successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to update branch assignments')
      }
    } catch (error) {
      console.error('Error updating branch assignments:', error)
      toast.error('Failed to update branch assignments')
    }
  }

  const getRoleDisplayName = (roleName: string) => {
    const role = roles.find(r => r.name === roleName)
    return role?.display_name || roleName
  }

  const getAccessBadge = (user: UnifiedUser) => {
    if (user.role.can_access_admin && user.role.can_access_pos) {
      return <Badge variant="default" className="bg-black text-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">Admin + POS</Badge>
    } else if (user.role.can_access_admin) {
      return <Badge variant="default" className="bg-gray-900 text-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">Admin Only</Badge>
    } else if (user.role.can_access_pos) {
      return <Badge variant="default" className="bg-gray-800 text-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">POS Only</Badge>
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">No Access</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#E5FF29] flex items-center justify-center">
            <Users className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-semibold">User Management</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage your team members and their access</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">POS Users</p>
              <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.pos_pin).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role.can_access_admin).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-black shadow-lg bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-2">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                       {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                     </div>
                     <div className="flex-1">
                       <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{user.full_name}</CardTitle>
                       <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                     </div>
                   </div>
                                     <div className="flex items-center gap-2 flex-wrap">
                     {getAccessBadge(user)}
                     <Badge 
                       variant={user.is_active ? "default" : "secondary"}
                       className={`text-xs font-medium px-3 py-1 rounded-full ${user.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                     >
                       {user.is_active ? "Active" : "Inactive"}
                     </Badge>
                   </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4 bg-white">
              {/* Role */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Role</p>
                  <p className="text-sm font-semibold text-gray-900">{getRoleDisplayName(user.role.name)}</p>
                </div>
              </div>

              {/* POS Access */}
              {user.pos_pin && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">POS Access</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-black text-white px-3 py-1 rounded-xl border font-semibold">
                        {user.pos_pin}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Branches */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Assigned Branches</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.branches?.map((branch) => (
                        <Badge 
                          key={branch.id} 
                          variant="outline" 
                          className={`text-xs font-medium px-3 py-1 rounded-full ${branch.is_primary ? 'bg-black text-white border border-gray-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                        >
                          {branch.name}
                          {branch.is_primary && <span className="ml-1 text-white">★</span>}
                        </Badge>
                      )) || <span className="text-xs text-gray-500 italic">No branches assigned</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user)
                    setShowEditModal(true)
                  }}
                  className="flex-1 h-10 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(user.id, !user.is_active)}
                  className="h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  title={user.is_active ? "Deactivate" : "Activate"}
                >
                  {user.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="h-10 w-10 p-0 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                  <p className="text-sm text-gray-600">Add a new team member to your system</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role *</label>
                <select
                  value={newUser.role_name}
                  onChange={(e) => setNewUser({ ...newUser, role_name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">POS PIN (Optional)</label>
                <Input
                  type="password"
                  value={newUser.pos_pin || ''}
                  onChange={(e) => setNewUser({ ...newUser, pos_pin: e.target.value })}
                  className="mt-1"
                  placeholder="4-digit PIN for POS access"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Assign Branches *</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {branches.map((branch) => (
                    <label key={branch.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newUser.branch_ids.includes(branch.id)}
                        onChange={(e) => {
                          const updatedIds = e.target.checked
                            ? [...newUser.branch_ids, branch.id]
                            : newUser.branch_ids.filter(id => id !== branch.id)
                          setNewUser({ ...newUser, branch_ids: updatedIds })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{branch.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={selectedUser.full_name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={selectedUser.role.name}
                  onChange={(e) => {
                    const role = roles.find(r => r.name === e.target.value)
                    if (role) {
                      setSelectedUser({ 
                        ...selectedUser, 
                        role: { ...selectedUser.role, id: role.id, name: role.name }
                      })
                    }
                  }}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={selectedUser.is_active}
                    onChange={(e) => setSelectedUser({ ...selectedUser, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">Active</label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">POS PIN (Optional)</label>
                <Input
                  type="password"
                  value={selectedUser.pos_pin || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, pos_pin: e.target.value })}
                  className="mt-1"
                  placeholder="4-digit PIN for POS access"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Assign Branches</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {branches.map((branch) => {
                    const isAssigned = selectedUser.branches?.some(b => b.id === branch.id)
                    return (
                      <label key={branch.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            const currentBranches = selectedUser.branches || []
                            const updatedBranches = e.target.checked
                              ? [...currentBranches, { id: branch.id, name: branch.name, is_primary: false }]
                              : currentBranches.filter(b => b.id !== branch.id)
                            setSelectedUser({ ...selectedUser, branches: updatedBranches })
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{branch.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedUser) {
                      handleUpdateUser(selectedUser.id, {
                        full_name: selectedUser.full_name,
                        role_name: selectedUser.role.name,
                        is_active: selectedUser.is_active,
                        pos_pin: selectedUser.pos_pin,
                        branch_ids: selectedUser.branches?.map(b => b.id) || []
                      })
                    }
                  }}
                  className="bg-black hover:bg-gray-800"
                >
                  Update User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


