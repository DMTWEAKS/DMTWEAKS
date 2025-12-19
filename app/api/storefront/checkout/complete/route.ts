
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'This endpoint is disabled. Key assignment is handled by PayNow webhooks only.' 
    },
    { status: 403 }
  )
}

