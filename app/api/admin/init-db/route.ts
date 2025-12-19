
import { NextRequest, NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authError = await requireAdminAuth()
    if (authError) return authError
  }
  return handleInit()
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authError = await requireAdminAuth()
    if (authError) return authError
  }
  return handleInit()
}

async function handleInit() {
  try {
    await initDatabase()
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize database',
      },
      { status: 500 }
    )
  }
}

