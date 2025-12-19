import { NextRequest, NextResponse } from 'next/server'
import { sendKeysEmail } from '@/lib/email'
import { requireAdminAuth } from '@/lib/admin-auth'
import { assignKeysToOrder } from '@/lib/keys'

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYNOW_API_BASE_URL || process.env.PAYNOW_API_BASE_URL || 'https://api.paynow.gg'
const STORE_ID = process.env.PAYNOW_STORE_ID

async function getProductName(productId: string): Promise<string> {
  try {
    if (!STORE_ID) {
      return `Product ${productId}`
    }

    const response = await fetch(`${API_BASE_URL}/v1/store/products/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.name || `Product ${productId}`
    }
  } catch (error) {
  }
  
  return `Product ${productId}`
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  
  try {
    const body = await request.json()
    let { product_id, quantity, customer_email, order_id } = body

    if (!product_id || !quantity || !customer_email) {
      return NextResponse.json(
        { success: false, error: 'product_id, quantity, and customer_email are required' },
        { status: 400 }
      )
    }

    if (typeof customer_email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    product_id = String(product_id).trim().substring(0, 255);
    customer_email = String(customer_email).trim().toLowerCase().substring(0, 255);
    
    if (!customer_email || customer_email.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    quantity = Math.max(1, Math.min(1000, parseInt(String(quantity), 10) || 1));
    order_id = order_id ? String(order_id).trim().substring(0, 255) : `manual-${Date.now()}`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const productName = await getProductName(product_id)

    const assignResult = await assignKeysToOrder(
      product_id,
      quantity,
      order_id || `manual-${Date.now()}`,
      customer_email
    )

    if (!assignResult.success) {
      return NextResponse.json(
        { success: false, error: assignResult.error || 'Failed to assign keys' },
        { status: 400 }
      )
    }

    if (!assignResult.data || assignResult.data.keys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No keys available for this product' },
        { status: 400 }
      )
    }

    const emailResult = await sendKeysEmail(
      customer_email,
      productName,
      assignResult.data.keys
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Keys assigned but email failed: ${emailResult.error || 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        keys_assigned: assignResult.data.keys,
        email_sent: true,
      },
      message: 'Keys assigned and email sent successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign keys and send email' },
      { status: 500 }
    )
  }
}

