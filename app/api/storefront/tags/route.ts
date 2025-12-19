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

    const response = await fetch(`${API_BASE_URL}/v1/store/tags`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paynow-store-id': STORE_ID,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Failed to fetch tags');
    }

    const data = await response.json();
    const nextResponse = NextResponse.json({ success: true, data });
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

