
import { sql } from '@/lib/db'

export async function assignKeysToOrder(
  product_id: string,
  quantity: number,
  order_id: string,
  customer_email: string
) {
  if (!product_id || !quantity || !order_id || !customer_email) {
    return {
      success: false,
      error: 'Missing required fields',
    }
  }

  if (typeof customer_email !== 'string') {
    return {
      success: false,
      error: 'Invalid email format',
    }
  }

  product_id = String(product_id).trim().substring(0, 255)
  order_id = String(order_id).trim().substring(0, 255)
  customer_email = String(customer_email).trim().toLowerCase().substring(0, 255)

  if (!customer_email || customer_email.length === 0) {
    return {
      success: false,
      error: 'Email is required',
    }
  }

  quantity = Math.max(1, Math.min(1000, parseInt(String(quantity), 10) || 1))

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(customer_email)) {
    return {
      success: false,
      error: 'Invalid email format',
    }
  }

  const existingKeys = await sql`
    SELECT key_value 
    FROM product_keys 
    WHERE order_id = ${order_id} 
      AND product_id = ${product_id}
      AND is_used = TRUE
    LIMIT 1
  `

  const existingKeysArray = Array.isArray(existingKeys) ? existingKeys : []
  if (existingKeysArray.length > 0) {
    return {
      success: false,
      error: 'Keys have already been assigned to this order. Duplicate processing prevented.',
    }
  }

  const unlimitedKey = await sql`
    SELECT id, key_value 
    FROM product_keys 
    WHERE product_id = ${product_id} 
      AND unlimited = TRUE
    LIMIT 1
  `

  const unlimitedKeyArray = Array.isArray(unlimitedKey) ? unlimitedKey : []
  
  if (unlimitedKeyArray.length > 0 && unlimitedKeyArray[0]) {
    const firstKey = unlimitedKeyArray[0] as { key_value: string }
    const unlimitedKeyValue = firstKey.key_value
    const keyValues = Array(quantity).fill(unlimitedKeyValue)
    
    return {
      success: true,
      data: {
        keys: keyValues,
        count: keyValues.length,
      },
    }
  }

  const availableKeys = await sql`
    SELECT id, key_value 
    FROM product_keys 
    WHERE product_id = ${product_id} 
      AND is_used = FALSE 
      AND (unlimited = FALSE OR unlimited IS NULL)
    LIMIT ${quantity}
  `

  const availableKeysArray = Array.isArray(availableKeys) ? availableKeys : []

  if (availableKeysArray.length < quantity) {
    return {
      success: false,
      error: `Insufficient stock. Available: ${availableKeysArray.length}, Requested: ${quantity}`,
    }
  }

  const keyIds = availableKeysArray.map((k: any) => k.id)
  const keyValues = availableKeysArray.map((k: any) => k.key_value)

  if (keyIds.length === 0) {
    return {
      success: false,
      error: 'No keys available to assign',
    }
  }

  for (const keyId of keyIds) {
    await sql`
      UPDATE product_keys 
      SET is_used = TRUE,
          order_id = ${order_id},
          customer_email = ${customer_email},
          used_at = CURRENT_TIMESTAMP
      WHERE id = ${keyId}
    `
  }

  return {
    success: true,
    data: {
      keys: keyValues,
      count: keyValues.length,
    },
  }
}

