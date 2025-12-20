import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  
  try {
    const formData = await request.formData()
    let product_id = formData.get('product_id') as string
    const file = formData.get('file') as File
    const unlimited = formData.get('unlimited') === 'true'

    if (!product_id || !file) {
      return NextResponse.json(
        { success: false, error: 'Product ID and file are required' },
        { status: 400 }
      )
    }

    product_id = String(product_id).trim();
    
    if (product_id.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    if (file.size > 100000) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 100KB allowed.' },
        { status: 400 }
      )
    }

    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only text files (.txt) are allowed.' },
        { status: 400 }
      )
    }

    const text = await file.text()
    
    if (text.length > 100000) {
      return NextResponse.json(
        { success: false, error: 'File content too large. Maximum 100KB allowed.' },
        { status: 400 }
      )
    }

    const keyArray = text
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k && k.length <= 500)

    if (keyArray.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid keys found in file' },
        { status: 400 }
      )
    }

    if (keyArray.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Too many keys. Maximum 10,000 keys per file.' },
        { status: 400 }
      )
    }

    const insertedKeys = []
    const errors = []

    for (const keyValue of keyArray) {
      try {
        const result = await sql`
          INSERT INTO product_keys (product_id, key_value, unlimited)
          VALUES (${product_id}, ${keyValue}, ${unlimited})
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
      { success: false, error: error.message || 'Failed to upload keys from file' },
      { status: 500 }
    )
  }
}

