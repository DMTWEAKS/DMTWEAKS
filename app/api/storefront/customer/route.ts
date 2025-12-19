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

    const response = await fetch(`${API_BASE_URL}/v1/store/customer`, {
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
          `Unauthorized. Customer token may be invalid or expired. ` +
          `Please try logging out and logging back in. Error: ${error.message || error.error || 'Unknown error'}`
        );
      }
      
      throw new Error(error.message || error.error || 'Failed to fetch customer');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

