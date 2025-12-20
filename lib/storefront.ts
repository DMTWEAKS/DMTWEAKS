
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYNOW_API_BASE_URL || 'https://api.paynow.gg';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  tags?: string[];
  stock?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: Array<{
    product: Product;
    quantity: number;
    line_key?: string;
  }>;
  total: number;
  currency: string;
}

export interface Checkout {
  id: string;
  cart_id: string;
  status: string;
  total: number;
  currency: string;
  payment_url?: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  currency: string;
  logo?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  order?: number;
}

export interface Delivery {
  id: string;
  name: string;
  price: number;
  currency: string;
  estimated_days?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  platform?: string;
  platform_id?: string;
}

class StorefrontClient {
  private baseUrl: string;
  private customerToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.customerToken = localStorage.getItem('paynow_customer_token');
    }
  }

  setCustomerToken(token: string) {
    this.customerToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('paynow_customer_token', token);
    }
  }

  clearCustomerToken() {
    this.customerToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('paynow_customer_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.customerToken) {
      headers['Authorization'] = `customer ${this.customerToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async getStore(): Promise<Store> {
    return this.request<Store>('/v1/store');
  }

  async getProducts(tag?: string): Promise<Product[]> {
    const endpoint = tag ? `/v1/store/products?tag=${tag}` : '/v1/store/products';
    return this.request<Product[]>(endpoint);
  }

  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/v1/store/products/${productId}`);
  }

  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/v1/store/tags');
  }

  async getNavlinks(): Promise<NavLink[]> {
    return this.request<NavLink[]>('/v1/store/navlinks');
  }

  async getCart(): Promise<Cart> {
    return this.request<Cart>('/v1/store/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return this.request<Cart>('/v1/store/cart', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    });
  }

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/v1/store/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<Cart> {
    return this.request<Cart>(`/v1/store/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<Cart> {
    return this.request<Cart>('/v1/store/cart', {
      method: 'DELETE',
    });
  }

  async createCheckout(deliveryId?: string): Promise<Checkout> {
    const body = deliveryId ? { delivery_id: deliveryId } : {};
    return this.request<Checkout>('/v1/store/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getCheckout(checkoutId: string): Promise<Checkout> {
    return this.request<Checkout>(`/v1/store/checkout/${checkoutId}`);
  }

  async getDeliveries(): Promise<Delivery[]> {
    return this.request<Delivery[]>('/v1/store/delivery');
  }

  async getCustomer(): Promise<Customer> {
    return this.request<Customer>('/v1/store/customer');
  }
}

export const storefrontClient = new StorefrontClient();

