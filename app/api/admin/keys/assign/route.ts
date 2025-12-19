import { NextRequest, NextResponse } from 'next/server'
import { assignKeysToOrder } from '@/lib/keys'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { product_id, quantity, order_id, customer_email } = body

    const result = await assignKeysToOrder(product_id, quantity, order_id, customer_email)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign keys' },
      { status: 500 }
    )
  }
}

