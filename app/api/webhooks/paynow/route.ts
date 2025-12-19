
import { NextRequest, NextResponse } from 'next/server'
import { sendKeysEmail } from '@/lib/email'
import { assignKeysToOrder } from '@/lib/keys'
import { logger } from '@/lib/logger'

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

async function getProductVersions(productId: string): Promise<string[]> {
  try {
    if (!STORE_ID) {
      return []
    }

    const response = await fetch(`${API_BASE_URL}/v1/store/products/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.versions && Array.isArray(data.versions)) {
        return data.versions.map((v: any) => v.id).filter(Boolean)
      }
      if (data.product_versions && Array.isArray(data.product_versions)) {
        return data.product_versions.map((v: any) => v.id).filter(Boolean)
      }
    }
  } catch (error) {
    logger.error(`Failed to fetch product versions for ${productId}:`, error)
  }
  
  return []
}

async function getDiscordActions(productVersionId: string): Promise<any[]> {
  try {
    if (!STORE_ID) {
      return []
    }

    const response = await fetch(
      `${API_BASE_URL}/v1/stores/${STORE_ID}/product_versions/discord_actions?product_version_id=${encodeURIComponent(productVersionId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-paynow-store-id': STORE_ID,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : (data.actions || data.discord_actions || [])
    }
  } catch (error) {
    logger.error(`Failed to fetch Discord actions for product version ${productVersionId}:`, error)
  }
  
  return []
}

async function executeDiscordActions(
  discordActions: any[],
  customerDiscordId?: string
): Promise<{ success: boolean; executed: number; errors: string[] }> {
  const errors: string[] = []
  let executed = 0

  if (!discordActions || discordActions.length === 0) {
    return { success: true, executed: 0, errors: [] }
  }
  
  for (const action of discordActions) {
    try {
      logger.log(`[Discord Action] Product version has Discord action:`, {
        action_type: action.type || action.action_type,
        role_id: action.role_id || action.roleId,
        customer_discord_id: customerDiscordId,
      })

      executed++
    } catch (error: any) {
      errors.push(`Failed to execute Discord action: ${error.message}`)
      logger.error(`[Discord Action Error]:`, error)
    }
  }

  return {
    success: errors.length === 0,
    executed,
    errors,
  }
}

export async function POST(request: NextRequest) {
  try {
    
    const payload = await request.json()
    const body = payload.body || payload
    
    let order_id = body.id || body.order_id || payload.id || payload.order_id || body.checkout_id || body.payment_id || body.checkout?.id || body.order?.id
    let customer_email = body.billing_email || body.customer_email || body.email || body.customer?.email || body.checkout?.customer_email || body.checkout?.customer?.email || body.order?.customer_email || body.order?.customer?.email || payload.billing_email || payload.customer_email
    const customer = body.customer || body.checkout?.customer || body.order?.customer || payload.customer
    const customer_discord_id = customer?.platform_id || customer?.discord_id || body.discord_id || body.customer_discord_id || payload.discord_id
    const lines = body.lines || body.items || body.products || body.checkout?.lines || body.order?.lines || payload.lines || []
    const status = body.status || body.state || body.payment_status || body.checkout?.status || body.order?.status || payload.status

    logger.log('[Webhook] Received PayNow webhook', {
      order_id: order_id || 'missing',
      customer_email: customer_email ? customer_email.substring(0, 3) + '***' : 'missing',
      status,
      lines_count: Array.isArray(lines) ? lines.length : 0,
      timestamp: new Date().toISOString(),
    })

    if (order_id) order_id = String(order_id).trim().substring(0, 255);
    if (customer_email) {
      if (typeof customer_email !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
      customer_email = String(customer_email).trim().toLowerCase().substring(0, 255);
      if (!customer_email || customer_email.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Email is required' },
          { status: 400 }
        )
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer_email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    if (status && status !== 'completed' && status !== 'success' && status !== 'paid') {
      logger.log('[Webhook] Payment not completed, skipping', { order_id, status })
      return NextResponse.json({ success: true, message: 'Payment not completed, skipping' })
    }

    if (!status) {
      logger.warn('[Webhook] Missing payment status, skipping for security', { order_id })
      return NextResponse.json({ 
        success: false, 
        error: 'Payment status is required for security verification' 
      }, { status: 400 })
    }

    if (!order_id || !customer_email || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const allKeys: { product_id: string; product_name: string; keys: string[] }[] = []
    const discordActionsProcessed: { product_id: string; actions_executed: number }[] = []

    for (const line of lines) {
      const product_id = line.product_id || line.id || line.product?.id
      const product_version_id = line.product_version_id || line.product_version?.id || line.version_id
      const quantity = line.quantity || line.qty || 1

      if (!product_id) {
        continue
      }

      let productName = line.product_name || line.name || line.product?.name
      if (!productName) {
        productName = await getProductName(product_id)
      }

      const assignResult = await assignKeysToOrder(product_id, quantity, order_id, customer_email)

      if (assignResult.success && assignResult.data?.keys && assignResult.data.keys.length > 0) {
        allKeys.push({
          product_id,
          product_name: productName,
          keys: assignResult.data.keys,
        })
        logger.log('[Webhook] Keys assigned', {
          order_id,
          product_id,
          quantity: assignResult.data.keys.length,
          customer_email: customer_email.substring(0, 3) + '***',
        })
      } else if (assignResult.error) {
        logger.warn('[Webhook] Key assignment failed', {
          order_id,
          product_id,
          error: assignResult.error,
        })
      }

      try {
        let versionIds: string[] = []
        
        if (product_version_id) {
          versionIds = [product_version_id]
        } else {
          versionIds = await getProductVersions(product_id)
        }

        for (const versionId of versionIds) {
          const discordActions = await getDiscordActions(versionId)
          
          if (discordActions.length > 0) {
            const result = await executeDiscordActions(discordActions, customer_discord_id)
            discordActionsProcessed.push({
              product_id,
              actions_executed: result.executed,
            })
            
            if (result.errors.length > 0) {
              logger.error(`[Discord Actions] Errors for product ${product_id}:`, result.errors)
            }
          }
        }
      } catch (error: any) {
        logger.error(`[Discord Actions] Failed to process Discord actions for product ${product_id}:`, error)
      }
    }

    if (allKeys.length > 0) {
      const allKeysFlat = allKeys.flatMap((k) => k.keys)
      const emailProductName = allKeys.length === 1 
        ? allKeys[0].product_name 
        : 'Your Purchase'
      
      const emailResult = await sendKeysEmail(customer_email, emailProductName, allKeysFlat)
      
      if (!emailResult.success) {
        logger.error('[Webhook] Email sending failed', {
          order_id,
          customer_email: customer_email.substring(0, 3) + '***',
          error: emailResult.error,
        })
        return NextResponse.json(
          { 
            success: false, 
            error: `Keys assigned but email failed: ${emailResult.error}`,
          },
          { status: 500 }
        )
      }

      logger.log('[Webhook] Keys email sent successfully', {
        order_id,
        customer_email: customer_email.substring(0, 3) + '***',
        keys_count: allKeysFlat.length,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'No keys to assign for this order',
        data: {
          keys_assigned: 0,
          total_keys: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        keys_assigned: allKeys.length,
        total_keys: allKeys.reduce((sum, item) => sum + item.keys.length, 0),
        discord_actions_processed: discordActionsProcessed.length,
        discord_actions_executed: discordActionsProcessed.reduce((sum, item) => sum + item.actions_executed, 0),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process webhook',
      },
      { status: 500 }
    )
  }
}

