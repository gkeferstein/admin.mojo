/**
 * API Client for admin.mojo API
 * 
 * NEXT_PUBLIC_API_URL should point to the base URL (e.g., https://dev.admin.mojo-institut.de)
 * The API endpoints are under /api
 */

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin)
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

export type BillingType = 'ONE_TIME' | 'SUBSCRIPTION';
export type BillingInterval = 'MONTHLY' | 'YEARLY';

export interface PlatformProduct {
  id: string;
  // Basic Info
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  // User Journey
  userJourneyLevel: number;
  levelName: string;
  // Styling
  levelColor: string;
  textColor: string;
  icon: string;
  // Pricing
  priceNet: number;
  originalPrice: number | null;
  currency: string;
  billingType: BillingType;
  billingInterval: BillingInterval | null;
  // Course Content
  duration: string | null;
  modulesCount: number | null;
  lessonsCount: number | null;
  features: string[];
  // Flags
  isPopular: boolean;
  isExclusive: boolean;
  isActive: boolean;
  sortOrder: number;
  // Stripe
  stripeProductId: string | null;
  stripePriceId: string | null;
  // Campus Integration
  campusCourseId: string | null;
  // Metadata
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  entitlements?: ProductEntitlement[];
}

export interface CharLimits {
  name: number;
  subtitle: number;
  description: number;
  duration: number;
  feature: number;
}

export interface ProductEntitlement {
  id: string;
  productId: string;
  resourceType: string;
  resourceId: string;
  resourceName: string | null;
  durationDays: number | null;
  quantity: number;
  createdAt: string;
}

export interface EntitlementDefinition {
  id: string;
  resourceType: string;
  category: string;
  name: string;
  description: string;
  navEntitlement?: string;
  isDynamic: boolean;
  source?: string;
  metadata?: {
    app?: string;
    requires?: string[];
    icon?: string;
    implemented?: boolean;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { code: 'UNKNOWN_ERROR', message: 'An error occurred' },
      }));
      throw error;
    }

    return response.json();
  }

  // Platform Products
  async getPlatformProducts(active?: boolean): Promise<PlatformProduct[]> {
    const params = active !== undefined ? `?active=${active}` : '';
    const response = await this.request<PlatformProduct[]>(
      `/api/platform-products${params}`
    );
    return response.data;
  }

  async getPlatformProduct(id: string): Promise<PlatformProduct> {
    const response = await this.request<PlatformProduct>(
      `/api/platform-products/${id}`
    );
    return response.data;
  }

  async updatePlatformProduct(
    id: string,
    data: Partial<PlatformProduct>
  ): Promise<PlatformProduct> {
    const response = await this.request<PlatformProduct>(
      `/api/platform-products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // Entitlements
  async addProductEntitlement(
    productId: string,
    entitlement: {
      resourceType: string;
      resourceId: string;
      resourceName?: string;
      durationDays?: number | null;
      quantity?: number;
    }
  ): Promise<ProductEntitlement> {
    const response = await this.request<ProductEntitlement>(
      `/api/platform-products/${productId}/entitlements`,
      {
        method: 'POST',
        body: JSON.stringify(entitlement),
      }
    );
    return response.data;
  }

  async removeProductEntitlement(
    productId: string,
    entitlementId: string
  ): Promise<void> {
    await this.request(
      `/api/platform-products/${productId}/entitlements/${entitlementId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Entitlement Registry
  async getEntitlementRegistry(): Promise<EntitlementDefinition[]> {
    const response = await this.request<EntitlementDefinition[]>(
      `/api/entitlement-registry`
    );
    return response.data;
  }

  async getEntitlementsByCategory(
    category: string
  ): Promise<EntitlementDefinition[]> {
    const response = await this.request<EntitlementDefinition[]>(
      `/api/entitlement-registry/by-category/${category}`
    );
    return response.data;
  }

  async getEntitlementById(id: string): Promise<EntitlementDefinition> {
    const response = await this.request<EntitlementDefinition>(
      `/api/entitlement-registry/${id}`
    );
    return response.data;
  }

  // Character Limits
  async getCharLimits(): Promise<CharLimits> {
    const response = await this.request<CharLimits>(
      `/api/platform-products/char-limits`
    );
    return response.data;
  }

  // Seed Products
  async seedPlatformProducts(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      `/api/platform-products/seed`,
      { method: 'POST' }
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();

