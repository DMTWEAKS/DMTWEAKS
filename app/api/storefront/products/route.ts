
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYNOW_API_BASE_URL || process.env.PAYNOW_API_BASE_URL || 'https://api.paynow.gg';
const STORE_ID = process.env.PAYNOW_STORE_ID;

export async function GET(request: NextRequest) {
  try {
    if (!STORE_ID) {
      return NextResponse.json(
        { success: false, error: 'PAYNOW_STORE_ID is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    
    const endpoint = tag 
      ? `${API_BASE_URL}/v1/store/products?tag=${encodeURIComponent(tag)}`
      : `${API_BASE_URL}/v1/store/products`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Failed to fetch products');
    }

    const data = await response.json();
    
    let stockCounts: Record<string, number | null> = {}
    try {
      const unlimitedProducts = await sql`
        SELECT DISTINCT product_id
        FROM product_keys
        WHERE unlimited = TRUE
      `
      const unlimitedProductsArray = Array.isArray(unlimitedProducts) ? unlimitedProducts : []
      const unlimitedProductIds = new Set(
        unlimitedProductsArray.map((p: any) => p.product_id)
      )

      const stockData = await sql`
        SELECT 
          product_id,
          COUNT(*) FILTER (WHERE is_used = FALSE AND (unlimited = FALSE OR unlimited IS NULL)) as available_stock
        FROM product_keys
        WHERE product_id NOT IN (SELECT DISTINCT product_id FROM product_keys WHERE unlimited = TRUE)
        GROUP BY product_id
      `
      const stockDataArray = Array.isArray(stockData) ? stockData : []
      
      unlimitedProductIds.forEach((productId) => {
        stockCounts[productId] = null
      })
      
      stockDataArray.forEach((s: any) => {
        stockCounts[s.product_id] = Number(s.available_stock)
      })
    } catch (error) {
    }
    

    const transformedData = Array.isArray(data) ? data.map((product: any) => ({
      ...product,
      price: product.pricing?.price_final ? product.pricing.price_final / 100 : (product.price || 0) / 100,
      image: product.image_url || product.image || null,
      stock: stockCounts[product.id] !== undefined ? stockCounts[product.id] : 0,
    })) : data;
    
    const nextResponse = NextResponse.json({ success: true, data: transformedData });
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

