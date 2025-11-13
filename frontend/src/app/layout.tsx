import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import './globals.css'

export const metadata: Metadata = {
  title: 'FormBuilder',
  description: 'FormBuilder - Crie formulários modernos rapidamente',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Header />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
