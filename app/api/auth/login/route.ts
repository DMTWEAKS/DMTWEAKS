import { NextRequest, NextResponse } from 'next/server';
import { payNowClient } from '@/lib/paynow';
import { sql, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { username, password } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username must be a string' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password must be a string' },
        { status: 400 }
      );
    }

    username = String(username).trim().substring(0, 255);
    password = String(password).trim();

    if (!username || username.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    let customers;
    try {
      customers = await payNowClient.listCustomers();
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch customers',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!customers) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch customers. No data returned.' },
        { status: 500 }
      );
    }

    let customersArray: any[] = [];
    if (Array.isArray(customers)) {
      customersArray = customers;
    } else if (customers && typeof customers === 'object') {
      const customersObj = customers as any;
      if (Array.isArray(customersObj.customers)) {
        customersArray = customersObj.customers;
      } else if (Array.isArray(customersObj.data)) {
        customersArray = customersObj.data;
      } else if (Array.isArray(customersObj.items)) {
        customersArray = customersObj.items;
      } else if (Array.isArray(customersObj.results)) {
        customersArray = customersObj.results;
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to fetch customers. Unexpected response format.',
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch customers. Invalid response format.' },
        { status: 500 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();
    let customer = customersArray.find((c) => {
      if (!c || !c.name || typeof c.name !== 'string') {
        return false;
      }
      const customerName = c.name.trim().toLowerCase();
      return customerName === normalizedUsername;
    });

    if (!customer) {
      if (customersArray.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No customers found. Please register first.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    if (!customer.id) {
      return NextResponse.json(
        { success: false, error: 'Customer data is invalid' },
        { status: 500 }
      );
    }

    let passwordRecord;
    try {
      passwordRecord = await sql`
        SELECT password_hash FROM customer_passwords WHERE customer_id = ${customer.id} LIMIT 1
      `
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        try {
          await initDatabase();
          passwordRecord = await sql`
            SELECT password_hash FROM customer_passwords WHERE customer_id = ${customer.id} LIMIT 1
          `
        } catch (retryError: any) {
          return NextResponse.json(
            { success: false, error: 'Database not initialized. Please contact administrator.' },
            { status: 500 }
          );
        }
      } else {
        throw error;
      }
    }

    const passwordRecordArray = Array.isArray(passwordRecord) ? passwordRecord : []
    const firstPasswordRecord = passwordRecordArray.length > 0 ? passwordRecordArray[0] : null
    const isPasswordRecordValid = firstPasswordRecord !== null && 
      typeof firstPasswordRecord === 'object' && 
      'password_hash' in firstPasswordRecord

    if (!isPasswordRecordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const passwordHash = (firstPasswordRecord as { password_hash: string }).password_hash
    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    let tokenData;
    try {
      tokenData = await payNowClient.generateCustomerToken(customer.id);
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate authentication token',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!tokenData || !tokenData.token) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate authentication token. Invalid response.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token: tokenData.token,
        customer: {
          id: customer.id,
          name: customer.name,
        },
      },
    });
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to login';
    const statusCode = error.message?.includes('Unauthorized') || error.message?.includes('401') || error.message?.includes('403')
      ? 401
      : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

