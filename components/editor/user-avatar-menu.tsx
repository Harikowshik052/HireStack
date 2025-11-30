"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Shield, Edit } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserProfile {
  name: string | null
  email: string
  role: 'ADMIN' | 'RECRUITER'
}

interface UserAvatarMenuProps {
  user: UserProfile
}

export default function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent">
          <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className="bg-primary text-white font-semibold text-sm">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" disabled>
          <div className="flex items-center">
            {user.role === 'ADMIN' ? (
              <>
                <Shield className="mr-2 h-4 w-4 text-blue-500" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4 text-gray-500" />
                <span>Editor</span>
              </>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
