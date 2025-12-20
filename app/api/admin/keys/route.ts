import { NextRequest, NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    let keys
    if (productId) {
      keys = await sql`
        SELECT * FROM product_keys 
        WHERE product_id = ${productId}
        ORDER BY created_at DESC
      `
    } else {
      keys = await sql`
        SELECT * FROM product_keys 
        ORDER BY created_at DESC
        LIMIT 100
      `
    }

    const stockCounts = await sql`
      SELECT 
        product_id,
        COUNT(*) FILTER (WHERE is_used = FALSE AND (unlimited = FALSE OR unlimited IS NULL)) as available_stock,
        COUNT(*) FILTER (WHERE is_used = TRUE) as used_stock,
        COUNT(*) as total_stock,
        COUNT(*) FILTER (WHERE unlimited = TRUE) > 0 as has_unlimited
      FROM product_keys
      GROUP BY product_id
    `

    const keysArray = Array.isArray(keys) ? keys : []
    const stockCountsArray = Array.isArray(stockCounts) ? stockCounts : []

    return NextResponse.json({
      success: true,
      data: {
        keys: keysArray,
        stock: stockCountsArray,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  
  try {
    const body = await request.json()
    let { product_id, keys, delimiter, unlimited } = body

    if (!product_id || !keys) {
      return NextResponse.json(
        { success: false, error: 'Product ID and keys are required' },
        { status: 400 }
      )
    }

    product_id = String(product_id).trim();
    keys = String(keys);
    
    if (product_id.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    if (keys.length > 100000) {
      return NextResponse.json(
        { success: false, error: 'Keys input too large. Maximum 100KB allowed.' },
        { status: 400 }
      )
    }

    if (!['comma', 'newline', 'space'].includes(delimiter)) {
      return NextResponse.json(
        { success: false, error: 'Invalid delimiter' },
        { status: 400 }
      )
    }

    let keyArray: string[] = []
    
    if (delimiter === 'comma') {
      keyArray = keys.split(',').map((k: string) => k.trim()).filter((k: string) => k && k.length <= 500)
    } else if (delimiter === 'newline') {
      keyArray = keys.split('\n').map((k: string) => k.trim()).filter((k: string) => k && k.length <= 500)
    } else if (delimiter === 'space') {
      keyArray = keys.split(/\s+/).map((k: string) => k.trim()).filter((k: string) => k && k.length <= 500)
    }

    if (keyArray.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid keys found' },
        { status: 400 }
      )
    }

    if (keyArray.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Too many keys. Maximum 10,000 keys per upload.' },
        { status: 400 }
      )
    }

    const insertedKeys = []
    const errors = []

    const unlimitedValue = unlimited === true || unlimited === 'true'
    
    for (const keyValue of keyArray) {
      try {
        const result = await sql`
          INSERT INTO product_keys (product_id, key_value, unlimited)
          VALUES (${product_id}, ${keyValue}, ${unlimitedValue})
          ON CONFLICT (key_value, product_id) DO NOTHING
          RETURNING id, key_value
        `
        const resultArray = Array.isArray(result) ? result : []
        if (resultArray.length > 0 && resultArray[0]) {
          insertedKeys.push(resultArray[0])
        }
      } catch (error: any) {
        errors.push({ key: keyValue, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        inserted: insertedKeys.length,
        total: keyArray.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload keys' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM product_keys WHERE id = ${keyId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete key' },
      { status: 500 }
    )
  }
}

