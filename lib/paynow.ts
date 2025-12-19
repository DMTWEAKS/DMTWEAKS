
const API_BASE_URL = process.env.PAYNOW_API_BASE_URL || 'https://api.paynow.gg';
const API_KEY = process.env.PAYNOW_API_KEY;
const STORE_ID = process.env.PAYNOW_STORE_ID;

export interface PayNowCustomer {
  id: string;
  name: string;
  email: string;
  platform?: string;
  platform_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  platform?: string;
  platform_id?: string;
}

export interface PayNowError {
  message: string;
  code?: string;
}

class PayNowClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private storeId: string | undefined;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
    this.storeId = STORE_ID;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('PAYNOW_API_KEY is not configured');
    }
    if (!this.storeId) {
      throw new Error('PAYNOW_STORE_ID is not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `apikey ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      
      if (response.status === 401 || response.status === 403) {
        const errorMsg = errorData.message || errorData.error || 'Unauthorized';
        
        if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('invalid')) {
          throw new Error(
            `${errorMsg}. Your API key token may need to be reset. After changing permissions in PayNow dashboard, you must reset the API key token for changes to take effect.`
          );
        }
        
        throw new Error(
          `${errorMsg}. Please verify: 1) API key has "Create Customers" permission enabled, 2) API key token was reset after permission changes, 3) Store ID (${this.storeId}) is correct, 4) API key format is correct (should start with "pnapi_").`
        );
      }

      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createCustomer(data: CreateCustomerRequest): Promise<PayNowCustomer> {
    return this.request<PayNowCustomer>(
      `/v1/stores/${this.storeId}/customers`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getCustomer(customerId: string): Promise<PayNowCustomer> {
    return this.request<PayNowCustomer>(
      `/v1/stores/${this.storeId}/customers/${customerId}`
    );
  }

  async listCustomers(): Promise<PayNowCustomer[]> {
    return this.request<PayNowCustomer[]>(
      `/v1/stores/${this.storeId}/customers`
    );
  }

  async generateCustomerToken(customerId: string): Promise<{ token: string }> {
    return this.request<{ token: string }>(
      `/v1/stores/${this.storeId}/customers/${customerId}/tokens`,
      {
        method: 'POST',
      }
    );
  }
}

export const payNowClient = new PayNowClient();

