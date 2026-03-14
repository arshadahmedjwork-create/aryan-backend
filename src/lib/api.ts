/**
 * API Client — centralized HTTP client for the FastAPI backend.
 * Handles auth headers, base URL, and typed API calls.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || 'API Error');
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    business_id?: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  business_id?: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetMe(): Promise<LoginResponse['user']> {
  return apiFetch('/auth/me');
}

// ── Products ──────────────────────────────────────────────────────────────

import type { Product } from './mock-data';

export async function apiGetProducts(): Promise<Product[]> {
  return apiFetch('/products');
}

export async function apiCreateProduct(data: Omit<Product, 'id'>): Promise<Product> {
  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProduct(id: string): Promise<void> {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

// ── Orders ────────────────────────────────────────────────────────────────

import type { Order } from './mock-data';

export async function apiGetOrders(): Promise<Order[]> {
  return apiFetch('/orders');
}

export async function apiGetOrder(id: string): Promise<Order> {
  return apiFetch(`/orders/${id}`);
}

export async function apiCreateOrder(data: {
  business_id: string;
  items: { product_id: string; quantity: number }[];
}): Promise<Order> {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateOrderStatus(id: string, status: string): Promise<Order> {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ order_status: status }),
  });
}

// ── Deliveries ────────────────────────────────────────────────────────────

import type { Delivery } from './mock-data';

export async function apiGetDeliveries(): Promise<Delivery[]> {
  return apiFetch('/deliveries');
}

export async function apiUpdateDelivery(id: string, data: Partial<Delivery>): Promise<Delivery> {
  return apiFetch(`/deliveries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────

import type { RevenueMetric } from './mock-data';

export async function apiGetRevenue(days: number = 7): Promise<RevenueMetric[]> {
  return apiFetch(`/analytics/revenue?days=${days}`);
}

export async function apiGetTopProducts(limit: number = 5): Promise<any[]> {
  return apiFetch(`/analytics/top-products?limit=${limit}`);
}

// ── NPS ───────────────────────────────────────────────────────────────────

export async function apiGetNpsFeedback(): Promise<any[]> {
  return apiFetch('/nps');
}

export async function apiSubmitNps(data: {
  order_id?: string;
  score: number;
  feedback_text?: string;
}): Promise<any> {
  return apiFetch('/nps', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetNpsScore(): Promise<{
  score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
}> {
  return apiFetch('/nps/score');
}

// ── Alerts ────────────────────────────────────────────────────────────────

import type { AIAlert } from './mock-data';

export async function apiGetAlerts(resolved?: boolean): Promise<AIAlert[]> {
  const params = resolved !== undefined ? `?resolved=${resolved}` : '';
  return apiFetch(`/alerts${params}`);
}

export async function apiResolveAlert(id: string): Promise<AIAlert> {
  return apiFetch(`/alerts/${id}/resolve`, { method: 'PUT' });
}

// ── Chat ──────────────────────────────────────────────────────────────────

export interface ChatApiResponse {
  reply: string;
  agent?: string;
}

export async function apiChat(message: string): Promise<ChatApiResponse> {
  return apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function apiGetChatHistory(): Promise<{
  id: string;
  user_id: string;
  message: string;
  role: string;
  timestamp: string;
}[]> {
  return apiFetch('/chat/history');
}
