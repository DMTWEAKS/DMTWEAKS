
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    return !!session && !!session.value
  } catch {
    return false
  }
}

export async function requireAdminAuth(): Promise<NextResponse | null> {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please login.' },
      { status: 401 }
    )
  }
  return null
}

