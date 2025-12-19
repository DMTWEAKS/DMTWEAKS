import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYNOW_API_BASE_URL || process.env.PAYNOW_API_BASE_URL || 'https://api.paynow.gg';
const STORE_ID = process.env.PAYNOW_STORE_ID;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!STORE_ID) {
      return NextResponse.json(
        { success: false, error: 'PAYNOW_STORE_ID is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/v1/store/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Failed to fetch product');
    }

    const data = await response.json();
    
    let stock = 0
    try {
      const stockData = await sql`
        SELECT COUNT(*) FILTER (WHERE is_used = FALSE) as available_stock
        FROM product_keys
        WHERE product_id = ${id}
      `
      const stockDataArray = Array.isArray(stockData) ? stockData : []
      const firstStockData = stockDataArray.length > 0 ? stockDataArray[0] : null
      stock = firstStockData && typeof firstStockData === 'object' && 'available_stock' in firstStockData
        ? Number((firstStockData as { available_stock: any }).available_stock)
        : 0
    } catch (error) {
    }
    
    const transformedData = {
      ...data,
      price: data.pricing?.price_final ? data.pricing.price_final / 100 : (data.price || 0) / 100,
      image: data.image_url || data.image || null,
      stock: stock,
    };
    
    const nextResponse = NextResponse.json({ success: true, data: transformedData });
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

