import { NextRequest, NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await initDatabase()

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username}, ${hashedPassword})
        ON CONFLICT (username) DO UPDATE SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      `

      return NextResponse.json({
        success: true,
        message: 'Admin user created/updated successfully',
      })
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create admin user' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to setup admin user' },
      { status: 500 }
    )
  }
}

