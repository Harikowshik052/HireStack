"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, Shield, Edit } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'RECRUITER'
}

interface UserManagementDialogProps {
  companySlug: string
  currentUserRole: 'ADMIN' | 'RECRUITER'
  trigger?: React.ReactNode
}

export default function UserManagementDialog({ companySlug, currentUserRole, trigger }: UserManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'RECRUITER'>('RECRUITER')

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/companies/${companySlug}/users`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || "Failed to fetch users")
      }
    } catch (err) {
      setError("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/companies/${companySlug}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
          password: newUserPassword,
          role: newUserRole
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user')
      }

      setSuccess(`User ${newUserEmail} added successfully!`)
      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      setNewUserRole('RECRUITER')
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user's access?")) return

    try {
      const response = await fetch(`/api/companies/${companySlug}/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      setSuccess("User removed successfully")
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'RECRUITER') => {
    try {
      const response = await fetch(`/api/companies/${companySlug}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      setSuccess(`Role updated to ${newRole}`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Only admins can manage users
  if (currentUserRole !== 'ADMIN') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Manage Access
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User Access</DialogTitle>
          <DialogDescription>
            Add team members and manage their permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New User Form */}
          <form onSubmit={handleAddUser} className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-sm">Add New User</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'ADMIN' | 'RECRUITER')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="RECRUITER">Editor (Can edit content)</option>
                  <option value="ADMIN">Admin (Full access)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </form>

          {/* Messages */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          {/* Existing Users List */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Current Users</h3>
            {isLoading ? (
              <div className="text-sm text-muted-foreground p-4 text-center">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name || user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as 'ADMIN' | 'RECRUITER')}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="RECRUITER">Editor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      
                      {user.role === 'ADMIN' && (
                        <span title="Admin">
                          <Shield className="h-4 w-4 text-blue-500" />
                        </span>
                      )}
                      {user.role === 'RECRUITER' && (
                        <span title="Editor">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </span>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="bg-muted p-3 rounded-md text-xs space-y-2">
            <p className="font-medium">Role Permissions:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Admin:</strong> Full access - manage users, edit all content, publish/unpublish</li>
              <li><strong>Editor:</strong> Can edit content and jobs, but cannot manage users or delete company</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
