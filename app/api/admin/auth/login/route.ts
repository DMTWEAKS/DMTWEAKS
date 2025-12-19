import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql, initDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { password, username = 'admin' } = body

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password must be a string' },
        { status: 400 }
      )
    }

    password = String(password).trim()
    username = String(username).trim()

    try {
      await initDatabase()
    } catch (error) {
    }

    let adminRecord
    try {
      adminRecord = await sql`
        SELECT password_hash FROM admin_users WHERE username = ${username} LIMIT 1
      `
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        try {
          await initDatabase()
          adminRecord = await sql`
            SELECT password_hash FROM admin_users WHERE username = ${username} LIMIT 1
          `
        } catch (retryError: any) {
          return NextResponse.json(
            { success: false, error: 'Database not initialized. Please contact administrator.' },
            { status: 500 }
          )
        }
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
      if (fallbackPassword && password === fallbackPassword) {
        const hashedPassword = await bcrypt.hash(password, 10)
        try {
          await sql`
            INSERT INTO admin_users (username, password_hash)
            VALUES (${username}, ${hashedPassword})
            ON CONFLICT (username) DO UPDATE SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
          `
        } catch (error) {
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        )
      }
    } else {
      const passwordHash = (firstRecord as { password_hash: string }).password_hash
      const passwordMatch = await bcrypt.compare(password, passwordHash)

      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        )
      }
    }

    const cookieStore = await cookies()
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to login' },
      { status: 500 }
    )
  }
}

