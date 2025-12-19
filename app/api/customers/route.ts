import { NextRequest, NextResponse } from 'next/server';
import { payNowClient } from '@/lib/paynow';
import { sql, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const customers = await payNowClient.listCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { name, password, platform, platform_id } = body;

    if (!name) {
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

    if (typeof name !== 'string') {
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

    name = String(name).trim().substring(0, 255);
    password = String(password).trim();
    
    if (!name || name.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    if (name.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Username must be less than 255 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    platform = platform ? String(platform).trim().substring(0, 100) : undefined;
    platform_id = platform_id ? String(platform_id).trim().substring(0, 255) : undefined;

    let existingCustomers: any;
    try {
      existingCustomers = await payNowClient.listCustomers();
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Failed to check existing customers', details: error.message },
        { status: 500 }
      );
    }

    if (!existingCustomers) {
      existingCustomers = [];
    }

    let existingCustomersArray: any[] = [];
    if (Array.isArray(existingCustomers)) {
      existingCustomersArray = existingCustomers;
    } else if (existingCustomers && typeof existingCustomers === 'object') {
      const existingCustomersObj = existingCustomers as any;
      if (Array.isArray(existingCustomersObj.customers)) {
        existingCustomersArray = existingCustomersObj.customers;
      } else if (Array.isArray(existingCustomersObj.data)) {
        existingCustomersArray = existingCustomersObj.data;
      } else if (Array.isArray(existingCustomersObj.items)) {
        existingCustomersArray = existingCustomersObj.items;
      } else if (Array.isArray(existingCustomersObj.results)) {
        existingCustomersArray = existingCustomersObj.results;
      }
    }

    const normalizedUsername = name.toLowerCase().trim();
    const usernameExists = existingCustomersArray.some((c) => {
      if (!c || !c.name) {
        return false;
      }
      const customerName = String(c.name).trim().toLowerCase();
      return customerName === normalizedUsername;
    });

    if (usernameExists) {
      return NextResponse.json(
        { success: false, error: 'This username is already taken. Please choose a different username.' },
        { status: 409 }
      );
    }


    let customer;
    try {
      customer = await payNowClient.createCustomer({
        name,
        platform,
        platform_id,
      });
    } catch (error: any) {
      const errorMsg = String(error.message || '').toLowerCase();
      if (errorMsg.includes('already exists') || 
          errorMsg.includes('duplicate') || 
          errorMsg.includes('409') ||
          (errorMsg.includes('name') || errorMsg.includes('username')) && (errorMsg.includes('taken') || errorMsg.includes('used') || errorMsg.includes('exists'))) {
        return NextResponse.json(
          { success: false, error: 'This username is already taken. Please choose a different username.' },
          { status: 409 }
        );
      }
      throw error;
    }

    if (!customer || !customer.id) {
      return NextResponse.json(
        { success: false, error: 'Failed to create customer. Invalid response from server.' },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await sql`
        INSERT INTO customer_passwords (customer_id, password_hash)
        VALUES (${customer.id}, ${passwordHash})
        ON CONFLICT (customer_id) DO UPDATE SET
          password_hash = ${passwordHash},
          updated_at = CURRENT_TIMESTAMP
      `
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        try {
          await initDatabase();
          await sql`
            INSERT INTO customer_passwords (customer_id, password_hash)
            VALUES (${customer.id}, ${passwordHash})
            ON CONFLICT (customer_id) DO UPDATE SET
              password_hash = ${passwordHash},
              updated_at = CURRENT_TIMESTAMP
          `
        } catch (retryError: any) {
          return NextResponse.json(
            { success: false, error: 'Failed to save password. Please initialize database first.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to save password. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create customer';
    const statusCode = error.message?.includes('Unauthorized') || error.message?.includes('permissions') 
      ? 403 
      : error.message?.includes('already exists') || error.message?.includes('duplicate')
      ? 409
      : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message?.includes('permissions') 
          ? 'Your API key may not have "Create Customers" permission. Please check your PayNow dashboard API key settings.'
          : undefined
      },
      { status: statusCode }
    );
  }
}

