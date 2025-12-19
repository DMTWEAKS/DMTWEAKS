import { NextRequest, NextResponse } from 'next/server';
import { payNowClient } from '@/lib/paynow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenData = await payNowClient.generateCustomerToken(id);
    return NextResponse.json({ success: true, data: tokenData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}

