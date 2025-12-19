import { NextRequest, NextResponse } from 'next/server';

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

    const response = await fetch(`${API_BASE_URL}/v1/store/delivery`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ success: true, data: [] });
      }
      
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Failed to fetch deliveries');
    }

    const text = await response.text();
    let data = [];
    
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = [];
      }
    }
    
    return NextResponse.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}

