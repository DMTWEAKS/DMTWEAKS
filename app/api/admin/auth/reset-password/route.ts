import { NextRequest, NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { requireAdminAuth } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    let { currentPassword, newPassword, username = 'admin' } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passwords must be strings' },
        { status: 400 }
      )
    }

    currentPassword = String(currentPassword).trim()
    newPassword = String(newPassword).trim()
    username = String(username).trim()

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    await initDatabase()

    let adminRecord
    try {
      adminRecord = await sql`
        SELECT password_hash FROM admin_users WHERE username = ${username} LIMIT 1
      `
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        await initDatabase()
        adminRecord = await sql`
          SELECT password_hash FROM admin_users WHERE username = ${username} LIMIT 1
        `
      } else {
        throw error
      }
    }

    const adminRecordArray = Array.isArray(adminRecord) ? adminRecord : []
    const firstRecord = adminRecordArray.length > 0 ? adminRecordArray[0] : null
    const isAdminRecordValid = firstRecord !== null && 
      typeof firstRecord === 'object' && 
      'password_hash' in firstRecord

    if (!isAdminRecordValid) {
      const fallbackPassword = process.env.ADMIN_PASSWORD
      if (!fallbackPassword || currentPassword !== fallbackPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid current password' },
          { status: 401 }
        )
      }
    } else {
      const passwordHash = (firstRecord as { password_hash: string }).password_hash
      const passwordMatch = await bcrypt.compare(currentPassword, passwordHash)

      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid current password' },
          { status: 401 }
        )
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    try {
      await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username}, ${hashedNewPassword})
        ON CONFLICT (username) DO UPDATE SET password_hash = ${hashedNewPassword}, updated_at = CURRENT_TIMESTAMP
      `

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      })
    } catch (error: any) {
      logger.error('Failed to reset password:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to reset password' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    logger.error('Failed to reset password:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    )
  }
}

