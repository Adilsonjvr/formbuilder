'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/api'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show header on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const handleLogout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-18 items-center justify-between px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" prefetch={false} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold">FormBuilder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-base">
            <Link
              href="/dashboard"
              prefetch={false}
              className={`transition-colors hover:text-foreground/80 ${
                pathname === '/dashboard'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Formulários
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <User className="h-5 w-5" />
                <span className="sr-only">Menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
