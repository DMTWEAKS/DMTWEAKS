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

export async function GET(request: NextRequest) {
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

    const response = await fetch(`${API_BASE_URL}/v1/store/cart`, {
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
      throw new Error(error.message || 'Failed to fetch cart');
    }

    const data = await response.json();
    
    const transformedData = {
      id: data.customer_id || data.store_id || 'cart',
      store_id: data.store_id,
      customer_id: data.customer_id,
      items: (data.lines || []).map((line: any) => ({
        product: {
          id: line.product_id,
          name: line.name || 'Unknown Product',
          slug: line.slug,
          price: (line.price || 0) / 100,
          image: line.image_url || null,
          description: line.description || '',
          currency: data.currency,
        },
        quantity: line.quantity || 1,
        line_key: line.line_key,
      })),
      total: (data.total || 0) / 100,
      currency: data.currency || 'usd',
    };
    
    return NextResponse.json({ success: true, data: transformedData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCustomerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Customer token required. Please login first.' },
        { status: 401 }
      );
    }


    const body = await request.json();
    let { product_id, quantity } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'product_id is required' },
        { status: 400 }
      );
    }

    product_id = String(product_id).trim();
    
    if (product_id.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const qty = quantity ? Math.max(1, Math.min(1000, parseInt(String(quantity), 10) || 1)) : 1;

    if (!STORE_ID) {
      return NextResponse.json(
        { success: false, error: 'PAYNOW_STORE_ID is not configured' },
        { status: 500 }
      );
    }

    const url = new URL(`${API_BASE_URL}/v1/store/cart/lines`);
    url.searchParams.set('product_id', product_id);
    if (qty > 1) {
      url.searchParams.set('quantity', String(qty));
    }
    
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
      
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Unauthorized. Please verify: 1) Customer token is valid and not expired, ` +
          `2) Customer was created successfully, 3) Token was generated correctly. ` +
          `Try logging out and logging back in. Error details: ${JSON.stringify(error)}`
        );
      }
      
      if (response.status === 400) {
        const validationErrors = error.errors ? JSON.stringify(error.errors, null, 2) : '';
        throw new Error(
          `Validation failed. ${error.message || ''} ${validationErrors ? `\nValidation errors: ${validationErrors}` : ''}`
        );
      }
      
      if (response.status === 404) {
        throw new Error(
          `Endpoint not found. PayNow Storefront API cart endpoint may have changed. ` +
          `Tried: PUT /v1/store/cart/lines. Please check PayNow documentation for the correct endpoint.`
        );
      }
      
      if (response.status === 405) {
        throw new Error(
          `Method Not Allowed. PayNow Storefront API cart endpoint structure may be different. ` +
          `Tried: PUT /v1/store/cart/lines. Please check PayNow documentation.`
        );
      }
      
      throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    let data = null;
    const text = await response.text();
    
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
      { success: false, error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const response = await fetch(`${API_BASE_URL}/v1/store/cart`, {
      method: 'DELETE',
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
      throw new Error(error.message || 'Failed to clear cart');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}

