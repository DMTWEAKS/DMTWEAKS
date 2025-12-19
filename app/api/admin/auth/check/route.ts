import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session || !session.value) {
      return NextResponse.json({
        success: true,
        authenticated: false,
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: error.message || 'Failed to check authentication' },
      { status: 500 }
    )
  }
}

