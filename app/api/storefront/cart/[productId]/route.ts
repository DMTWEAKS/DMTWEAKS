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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
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

    const { productId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'quantity is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/v1/store/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
        'Authorization': `Customer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Failed to add/update cart item');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add/update cart item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
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

    const { productId } = await params;
    const body = await request.json();
    let { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'quantity is required' },
        { status: 400 }
      );
    }

    quantity = Math.max(0, Math.min(1000, parseInt(String(quantity), 10) || 0));
    
    if (String(productId).length > 255) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_BASE_URL}/v1/store/cart/lines`);
    url.searchParams.set('product_id', String(productId).trim());
    url.searchParams.set('quantity', quantity.toString());
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
        'Authorization': `Customer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new Error(error.message || 'Failed to update cart item');
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
      { success: false, error: error.message || 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
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

    const { productId } = await params;
    const url = new URL(`${API_BASE_URL}/v1/store/cart/lines`);
    url.searchParams.set('product_id', productId);
    url.searchParams.set('quantity', '0');
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
        'Authorization': `Customer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new Error(error.message || 'Failed to remove from cart');
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
      { success: false, error: error.message || 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}

