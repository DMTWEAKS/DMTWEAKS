import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    redirect('/admin-login')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}

