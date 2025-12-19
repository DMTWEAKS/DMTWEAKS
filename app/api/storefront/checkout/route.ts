import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_PAYNOW_API_BASE_URL || process.env.PAYNOW_API_BASE_URL || 'https://api.paynow.gg';
const STORE_ID = process.env.PAYNOW_STORE_ID;

function getCustomerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('customer ')) {
    return authHeader.substring(authHeader.indexOf(' ') + 1);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (!STORE_ID) {
      return NextResponse.json(
        { success: false, error: 'PAYNOW_STORE_ID is not configured' },
        { status: 500 }
      );
    }

    const token = getCustomerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Customer token required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { delivery_id, lines } = body;

    let checkoutLines: any[] = [];

    if (lines && Array.isArray(lines) && lines.length > 0) {
      checkoutLines = lines;
    } else {
      const cartResponse = await fetch(`${API_BASE_URL}/v1/store/cart`, {
        headers: {
          'Content-Type': 'application/json',
          'x-paynow-store-id': STORE_ID,
          'Authorization': `Customer ${token}`,
        },
      });

      if (!cartResponse.ok) {
        const error = await cartResponse.json().catch(() => ({
          message: `HTTP ${cartResponse.status}: ${cartResponse.statusText}`,
        }));
        throw new Error(error.message || 'Failed to fetch cart');
      }

      const cartData = await cartResponse.json();
      const cartLines = cartData.lines || [];

      if (cartLines.length === 0) {
        throw new Error('Cart is empty. Please add items to your cart before checkout.');
      }

      checkoutLines = cartLines
        .filter((line: any) => line.product_id && line.quantity)
        .map((line: any) => ({
          product_id: String(line.product_id).trim().substring(0, 255),
          quantity: Math.max(1, Math.min(1000, parseInt(String(line.quantity), 10) || 1)),
        }))
        .slice(0, 100);
    }

    if (checkoutLines.length === 0) {
      throw new Error('No items to checkout');
    }

    const endpoint = `${API_BASE_URL}/v1/checkouts`;
    const requestBody: any = {
      lines: checkoutLines,
    };

    if (delivery_id) {
      requestBody.delivery_id = delivery_id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    requestBody.success_url = `${baseUrl}/store`;
    requestBody.cancel_url = `${baseUrl}/store`;
    requestBody.webhook_url = `${baseUrl}/api/webhooks/paynow`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
        'Authorization': `Customer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new Error(error.message || 'Failed to create checkout');
    }

    const text = await response.text();
    let data = null;
    
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

