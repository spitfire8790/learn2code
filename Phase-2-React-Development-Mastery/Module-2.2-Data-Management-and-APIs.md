# Module 2.2: Data Management and APIs

## Learning Objectives
By the end of this module, you will be able to:
- Implement robust API integration patterns for property management systems
- Handle real-time data updates with WebSockets and Server-Sent Events
- Create efficient data processing and transformation pipelines
- Implement advanced caching and synchronisation strategies
- Build resilient error handling and retry mechanisms

## Prerequisites
- Completion of Module 2.1: Advanced React Patterns
- Understanding of REST API concepts and HTTP methods
- Basic knowledge of asynchronous JavaScript (Promises, async/await)
- Familiarity with TypeScript interfaces and error handling

## Introduction

Property analysis applications require sophisticated data management to handle large datasets, real-time updates, and complex data relationships. This module covers advanced techniques for integrating with APIs, managing data flow, and ensuring data consistency across your application.

The property analysis platform handles various data sources including property records, market data, government APIs, and real-time user interactions. Efficient data management is crucial for providing responsive user experiences whilst maintaining data accuracy and consistency.

## Section 1: Advanced API Integration Patterns

### Sophisticated API Service Architecture

Create a comprehensive API service architecture with advanced features:

```typescript
// src/services/api/BaseApiService.ts

interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

interface RequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  cache?: boolean;
  cacheTTL?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  meta?: {
    timestamp: Date;
    requestId: string;
    cached?: boolean;
  };
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  requestId?: string;
}

class ApiCache {
  private cache = new Map<string, { data: any; timestamp: Date; ttl: number }>();
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = new Date();
    const elapsed = now.getTime() - cached.timestamp.getTime();
    
    if (elapsed > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export class BaseApiService {
  private config: ApiConfig;
  private cache: ApiCache;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<(response: ApiResponse<any>) => ApiResponse<any>> = [];
  private errorInterceptors: Array<(error: ApiError) => ApiError> = [];

  constructor(config: ApiConfig) {
    this.config = config;
    this.cache = new ApiCache();
  }

  // Interceptor methods
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: ApiResponse<any>) => ApiResponse<any>): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: ApiError) => ApiError): void {
    this.errorInterceptors.push(interceptor);
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getCacheKey(config: RequestConfig): string {
    const { endpoint, method = 'GET', params } = config;
    const paramsString = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramsString}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = interceptor(processedConfig);
    }

    const requestId = this.generateRequestId();
    const method = processedConfig.method || 'GET';
    
    // Check cache for GET requests
    if (method === 'GET' && processedConfig.cache !== false) {
      const cacheKey = this.getCacheKey(processedConfig);
      const cached = this.cache.get<T>(cacheKey);
      
      if (cached) {
        return {
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          meta: {
            timestamp: new Date(),
            requestId,
            cached: true,
          },
        };
      }
    }

    const retryAttempts = processedConfig.retryAttempts ?? this.config.retryAttempts ?? 3;
    const retryDelay = this.config.retryDelay ?? 1000;
    let lastError: ApiError;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = processedConfig.timeout ?? this.config.timeout ?? 30000;
        
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers = {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...this.config.headers,
          ...processedConfig.headers,
        };

        const url = this.buildUrl(processedConfig.endpoint, processedConfig.params);
        
        const fetchConfig: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };

        if (processedConfig.data && method !== 'GET') {
          fetchConfig.body = JSON.stringify(processedConfig.data);
        }

        const response = await fetch(url, fetchConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError({
            message: `Request failed with status ${response.status}`,
            status: response.status,
            requestId,
          });
        }

        const data = await response.json();
        
        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          meta: {
            timestamp: new Date(),
            requestId,
          },
        };

        // Apply response interceptors
        let processedResponse = apiResponse;
        for (const interceptor of this.responseInterceptors) {
          processedResponse = interceptor(processedResponse);
        }

        // Cache successful GET requests
        if (method === 'GET' && processedConfig.cache !== false) {
          const cacheKey = this.getCacheKey(processedConfig);
          const ttl = processedConfig.cacheTTL ?? 300000; // 5 minutes default
          this.cache.set(cacheKey, data, ttl);
        }

        return processedResponse;

      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          requestId,
          ...(error as any),
        };

        // Apply error interceptors
        let processedError = apiError;
        for (const interceptor of this.errorInterceptors) {
          processedError = interceptor(processedError);
        }

        lastError = processedError;

        // Don't retry on client errors (4xx)
        if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
          throw processedError;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < retryAttempts) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'endpoint' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, endpoint, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, endpoint, method: 'POST', data });
  }

  async put<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, endpoint, method: 'PUT', data });
  }

  async patch<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, endpoint, method: 'PATCH', data });
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'endpoint' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, endpoint, method: 'DELETE' });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCachePattern(pattern: string): void {
    this.cache.invalidatePattern(pattern);
  }
}

// API Error class
class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;
  public requestId?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
    this.requestId = error.requestId;
  }
}
```

### Property API Service Implementation

Implement a comprehensive property API service:

```typescript
// src/services/api/PropertyApiService.ts

import { BaseApiService } from './BaseApiService';
import { Property, PropertyFilters, PropertyAnalysis, PropertyReport } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    requestTime: number;
    cacheHit: boolean;
  };
}

interface PropertyQueryOptions {
  filters?: PropertyFilters;
  sort?: {
    field: keyof Property;
    direction: 'asc' | 'desc';
  };
  include?: ('images' | 'documents' | 'analysis' | 'reports')[];
  page?: number;
  limit?: number;
}

export class PropertyApiService extends BaseApiService {
  constructor() {
    super({
      baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Add authentication interceptor
    this.addRequestInterceptor((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      return config;
    });

    // Add error handling interceptor
    this.addErrorInterceptor((error) => {
      if (error.status === 401) {
        // Handle authentication errors
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return error;
    });
  }

  // Property CRUD operations
  async getProperties(options: PropertyQueryOptions = {}): Promise<PaginatedResponse<Property>> {
    const params: Record<string, any> = {
      page: options.page || 1,
      limit: options.limit || 20,
    };

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params[`${key}[]`] = value;
          } else {
            params[key] = value;
          }
        }
      });
    }

    if (options.sort) {
      params.sortField = options.sort.field;
      params.sortDirection = options.sort.direction;
    }

    if (options.include) {
      params.include = options.include.join(',');
    }

    const response = await this.get<PaginatedResponse<Property>>('/properties', {
      params,
      cache: true,
      cacheTTL: 60000, // 1 minute cache for property lists
    });

    return response.data;
  }

  async getProperty(id: string, include?: string[]): Promise<Property> {
    const params = include ? { include: include.join(',') } : {};
    
    const response = await this.get<Property>(`/properties/${id}`, {
      params,
      cache: true,
      cacheTTL: 300000, // 5 minutes cache for individual properties
    });

    return response.data;
  }

  async createProperty(property: Omit<Property, 'id' | 'metadata'>): Promise<Property> {
    const response = await this.post<Property>('/properties', property);
    
    // Invalidate property list cache
    this.invalidateCachePattern('GET:/properties:');
    
    return response.data;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const response = await this.put<Property>(`/properties/${id}`, updates);
    
    // Invalidate related caches
    this.invalidateCachePattern('GET:/properties:');
    this.invalidateCachePattern(`GET:/properties/${id}:`);
    
    return response.data;
  }

  async deleteProperty(id: string): Promise<void> {
    await this.delete(`/properties/${id}`);
    
    // Invalidate related caches
    this.invalidateCachePattern('GET:/properties:');
    this.invalidateCachePattern(`GET:/properties/${id}:`);
  }

  // Property search and filtering
  async searchProperties(query: string, options: PropertyQueryOptions = {}): Promise<PaginatedResponse<Property>> {
    const params = {
      q: query,
      page: options.page || 1,
      limit: options.limit || 20,
      ...options.filters,
    };

    const response = await this.get<PaginatedResponse<Property>>('/properties/search', {
      params,
      cache: true,
      cacheTTL: 30000, // 30 seconds cache for search results
    });

    return response.data;
  }

  async getPropertySuggestions(query: string, limit = 10): Promise<string[]> {
    const response = await this.get<string[]>('/properties/suggestions', {
      params: { q: query, limit },
      cache: true,
      cacheTTL: 300000, // 5 minutes cache for suggestions
    });

    return response.data;
  }

  // Property analysis operations
  async analyseProperty(
    propertyId: string, 
    analysisType: string, 
    parameters?: Record<string, any>
  ): Promise<PropertyAnalysis> {
    const response = await this.post<PropertyAnalysis>('/analyses', {
      propertyId,
      analysisType,
      parameters,
    });

    return response.data;
  }

  async getPropertyAnalyses(propertyId: string): Promise<PropertyAnalysis[]> {
    const response = await this.get<PropertyAnalysis[]>(`/properties/${propertyId}/analyses`, {
      cache: true,
      cacheTTL: 60000, // 1 minute cache for analyses
    });

    return response.data;
  }

  async getAnalysis(analysisId: string): Promise<PropertyAnalysis> {
    const response = await this.get<PropertyAnalysis>(`/analyses/${analysisId}`, {
      cache: true,
      cacheTTL: 300000, // 5 minutes cache for individual analysis
    });

    return response.data;
  }

  // Property reporting
  async generateReport(
    propertyId: string,
    template: string,
    configuration?: Record<string, any>
  ): Promise<PropertyReport> {
    const response = await this.post<PropertyReport>('/reports', {
      propertyId,
      template,
      configuration,
    });

    return response.data;
  }

  async getPropertyReports(propertyId: string): Promise<PropertyReport[]> {
    const response = await this.get<PropertyReport[]>(`/properties/${propertyId}/reports`, {
      cache: true,
      cacheTTL: 60000, // 1 minute cache for reports list
    });

    return response.data;
  }

  async downloadReport(reportId: string, format: 'pdf' | 'pptx' | 'html' = 'pdf'): Promise<Blob> {
    const response = await fetch(
      `${this.config.baseUrl}/reports/${reportId}/download?format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
  }

  // Bulk operations
  async bulkUpdateProperties(updates: { id: string; updates: Partial<Property> }[]): Promise<Property[]> {
    const response = await this.post<Property[]>('/properties/bulk-update', { updates });
    
    // Invalidate property caches
    this.invalidateCachePattern('GET:/properties:');
    updates.forEach(({ id }) => {
      this.invalidateCachePattern(`GET:/properties/${id}:`);
    });
    
    return response.data;
  }

  async bulkDeleteProperties(ids: string[]): Promise<void> {
    await this.post('/properties/bulk-delete', { ids });
    
    // Invalidate property caches
    this.invalidateCachePattern('GET:/properties:');
    ids.forEach(id => {
      this.invalidateCachePattern(`GET:/properties/${id}:`);
    });
  }

  // Property statistics and aggregations
  async getPropertyStatistics(filters?: PropertyFilters): Promise<{
    totalProperties: number;
    totalValue: number;
    averageValue: number;
    propertyTypeDistribution: Record<string, number>;
    zoneDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  }> {
    const params = filters ? { filters: JSON.stringify(filters) } : {};
    
    const response = await this.get('/properties/statistics', {
      params,
      cache: true,
      cacheTTL: 300000, // 5 minutes cache for statistics
    });

    return response.data;
  }

  // Market data integration
  async getMarketData(suburb: string, propertyType?: string): Promise<{
    medianPrice: number;
    priceGrowth: number;
    salesVolume: number;
    daysOnMarket: number;
    comparables: Array<{
      address: string;
      price: number;
      saleDate: string;
      propertyType: string;
    }>;
  }> {
    const params = { suburb, ...(propertyType && { propertyType }) };
    
    const response = await this.get('/market-data', {
      params,
      cache: true,
      cacheTTL: 1800000, // 30 minutes cache for market data
    });

    return response.data;
  }
}

// Singleton instance
export const propertyApiService = new PropertyApiService();
```

## Section 2: Real-time Data Management

### WebSocket Integration for Real-time Updates

Implement comprehensive WebSocket management:

```typescript
// src/services/websocket/WebSocketService.ts

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  authToken?: string;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  id?: string;
}

type WebSocketEventHandler = (message: WebSocketMessage) => void;
type WebSocketConnectionHandler = () => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventHandlers = new Map<string, WebSocketEventHandler[]>();
  private connectionHandlers: WebSocketConnectionHandler[] = [];
  private disconnectionHandlers: WebSocketConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManuallyDisconnected = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;
      this.isManuallyDisconnected = false;

      try {
        const url = new URL(this.config.url);
        if (this.config.authToken) {
          url.searchParams.set('token', this.config.authToken);
        }

        this.ws = new WebSocket(url.toString(), this.config.protocols);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyConnectionHandlers();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notifyDisconnectionHandlers();

          if (!this.isManuallyDisconnected && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  send(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date(),
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  onConnection(handler: WebSocketConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onDisconnection(handler: WebSocketConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in WebSocket message handler:', error);
        }
      });
    }
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private notifyDisconnectionHandlers(): void {
    this.disconnectionHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in disconnection handler:', error);
      }
    });
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < (this.config.maxReconnectAttempts || 10);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        this.send({
          type: 'ping',
          payload: {},
        });
      }, this.config.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Property-specific WebSocket service
export class PropertyWebSocketService extends WebSocketService {
  constructor(authToken?: string) {
    super({
      url: process.env.VITE_WS_URL || 'ws://localhost:3001/ws',
      authToken,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
    });

    // Set up property-specific event handling
    this.setupPropertyEventHandlers();
  }

  private setupPropertyEventHandlers(): void {
    // Handle pong responses
    this.subscribe('pong', () => {
      // Heartbeat received
    });

    // Handle authentication responses
    this.subscribe('auth_success', () => {
      console.log('WebSocket authentication successful');
    });

    this.subscribe('auth_error', (message) => {
      console.error('WebSocket authentication failed:', message.payload);
    });
  }

  // Property-specific methods
  subscribeToProperty(propertyId: string): void {
    this.send({
      type: 'subscribe_property',
      payload: { propertyId },
    });
  }

  unsubscribeFromProperty(propertyId: string): void {
    this.send({
      type: 'unsubscribe_property',
      payload: { propertyId },
    });
  }

  subscribeToPropertyList(filters?: any): void {
    this.send({
      type: 'subscribe_property_list',
      payload: { filters },
    });
  }

  unsubscribeFromPropertyList(): void {
    this.send({
      type: 'unsubscribe_property_list',
      payload: {},
    });
  }

  broadcastPropertyUpdate(propertyId: string, updates: any): void {
    this.send({
      type: 'property_update',
      payload: { propertyId, updates },
    });
  }
}

// React hook for WebSocket integration
import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  authToken?: string;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocketService | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocketService({
      url: options.url,
      authToken: options.authToken,
    });

    const ws = wsRef.current;

    // Set up event handlers
    const unsubscribeConnection = ws.onConnection(() => {
      setConnectionState('open');
      setError(null);
      options.onConnect?.();
    });

    const unsubscribeDisconnection = ws.onDisconnection(() => {
      setConnectionState('closed');
      options.onDisconnect?.();
    });

    // Auto-connect if enabled
    if (options.autoConnect !== false) {
      ws.connect().catch(err => {
        setError(err.message);
        setConnectionState('closed');
      });
    }

    return () => {
      unsubscribeConnection();
      unsubscribeDisconnection();
      ws.disconnect();
    };
  }, [options.url, options.authToken]);

  const connect = async () => {
    if (wsRef.current) {
      try {
        setConnectionState('connecting');
        await wsRef.current.connect();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setConnectionState('closed');
      }
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      setConnectionState('closed');
    }
  };

  const send = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current) {
      wsRef.current.send(message);
    }
  };

  const subscribe = (eventType: string, handler: WebSocketEventHandler) => {
    return wsRef.current?.subscribe(eventType, handler) || (() => {});
  };

  return {
    connectionState,
    error,
    connect,
    disconnect,
    send,
    subscribe,
    isConnected: connectionState === 'open',
  };
};

// Property-specific React hook
export const usePropertyWebSocket = (authToken?: string) => {
  const wsRef = useRef<PropertyWebSocketService | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');

  useEffect(() => {
    wsRef.current = new PropertyWebSocketService(authToken);
    
    const ws = wsRef.current;

    const unsubscribeConnection = ws.onConnection(() => {
      setConnectionState('open');
    });

    const unsubscribeDisconnection = ws.onDisconnection(() => {
      setConnectionState('closed');
    });

    ws.connect().catch(console.error);

    return () => {
      unsubscribeConnection();
      unsubscribeDisconnection();
      ws.disconnect();
    };
  }, [authToken]);

  return {
    connectionState,
    isConnected: connectionState === 'open',
    subscribeToProperty: (propertyId: string) => wsRef.current?.subscribeToProperty(propertyId),
    unsubscribeFromProperty: (propertyId: string) => wsRef.current?.unsubscribeFromProperty(propertyId),
    subscribeToPropertyList: (filters?: any) => wsRef.current?.subscribeToPropertyList(filters),
    unsubscribeFromPropertyList: () => wsRef.current?.unsubscribeFromPropertyList(),
    subscribe: (eventType: string, handler: WebSocketEventHandler) => wsRef.current?.subscribe(eventType, handler),
  };
};
```

## Section 3: Data Processing and Transformation

### Advanced Data Processing Pipeline

Create sophisticated data processing utilities:

```typescript
// src/utils/dataProcessing/DataProcessor.ts

interface ProcessingStep<T, R> {
  name: string;
  process: (data: T) => R | Promise<R>;
  validate?: (data: T) => boolean | Promise<boolean>;
  onError?: (error: Error, data: T) => R | Promise<R>;
}

interface ProcessingOptions {
  parallel?: boolean;
  errorHandling?: 'throw' | 'skip' | 'default';
  progress?: (step: string, progress: number) => void;
}

export class DataProcessor<T> {
  private steps: ProcessingStep<any, any>[] = [];

  addStep<R>(step: ProcessingStep<T, R>): DataProcessor<R> {
    this.steps.push(step);
    return this as any;
  }

  async process(data: T[], options: ProcessingOptions = {}): Promise<any[]> {
    const { parallel = false, errorHandling = 'throw', progress } = options;
    
    let currentData: any[] = data;
    
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      progress?.(step.name, (i / this.steps.length) * 100);
      
      try {
        if (parallel) {
          currentData = await this.processStepParallel(currentData, step, errorHandling);
        } else {
          currentData = await this.processStepSequential(currentData, step, errorHandling);
        }
      } catch (error) {
        if (errorHandling === 'throw') {
          throw error;
        }
        console.error(`Error in processing step ${step.name}:`, error);
      }
    }
    
    progress?.('Complete', 100);
    return currentData;
  }

  private async processStepParallel<T, R>(
    data: T[], 
    step: ProcessingStep<T, R>, 
    errorHandling: string
  ): Promise<R[]> {
    const promises = data.map(async (item) => {
      try {
        if (step.validate && !(await step.validate(item))) {
          if (errorHandling === 'skip') {
            return null;
          }
          throw new Error(`Validation failed for step ${step.name}`);
        }
        
        return await step.process(item);
      } catch (error) {
        if (step.onError) {
          return await step.onError(error as Error, item);
        }
        
        if (errorHandling === 'skip') {
          return null;
        }
        
        throw error;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

  private async processStepSequential<T, R>(
    data: T[], 
    step: ProcessingStep<T, R>, 
    errorHandling: string
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (const item of data) {
      try {
        if (step.validate && !(await step.validate(item))) {
          if (errorHandling === 'skip') {
            continue;
          }
          throw new Error(`Validation failed for step ${step.name}`);
        }
        
        const result = await step.process(item);
        results.push(result);
      } catch (error) {
        if (step.onError) {
          const fallbackResult = await step.onError(error as Error, item);
          results.push(fallbackResult);
          continue;
        }
        
        if (errorHandling === 'skip') {
          continue;
        }
        
        throw error;
      }
    }
    
    return results;
  }
}

// Property-specific data transformations
export class PropertyDataTransformer {
  static normaliseAddress(property: Property): Property {
    const { address } = property;
    
    return {
      ...property,
      address: {
        ...address,
        streetNumber: address.streetNumber.trim(),
        streetName: this.capitaliseWords(address.streetName.trim()),
        suburb: this.capitaliseWords(address.suburb.trim()),
        state: address.state.toUpperCase(),
        postcode: address.postcode.replace(/\D/g, ''),
        fullAddress: `${address.streetNumber} ${this.capitaliseWords(address.streetName)}, ${this.capitaliseWords(address.suburb)} ${address.state.toUpperCase()} ${address.postcode}`,
      },
    };
  }

  static enrichWithMarketData(property: Property, marketData: any): Property {
    return {
      ...property,
      marketInsights: {
        medianPrice: marketData.medianPrice,
        priceGrowth: marketData.priceGrowth,
        daysOnMarket: marketData.daysOnMarket,
        marketTrend: this.calculateMarketTrend(property.financials.currentValue, marketData.medianPrice),
      },
    };
  }

  static calculateMetrics(property: Property): Property {
    const { financials, dimensions } = property;
    
    const pricePerSqm = dimensions.landSize > 0 
      ? financials.currentValue / dimensions.landSize 
      : 0;
    
    const buildingRatio = dimensions.landSize > 0 
      ? dimensions.buildingArea / dimensions.landSize 
      : 0;

    const grossYield = financials.rentalIncome 
      ? (financials.rentalIncome * 12) / financials.currentValue * 100
      : 0;

    const totalExpenses = Object.values(financials.expenses).reduce((sum, expense) => sum + expense, 0);
    const netYield = financials.rentalIncome 
      ? ((financials.rentalIncome * 12) - totalExpenses) / financials.currentValue * 100
      : 0;

    return {
      ...property,
      calculatedMetrics: {
        pricePerSqm,
        buildingRatio,
        grossYield,
        netYield,
        landToValueRatio: pricePerSqm,
      },
    };
  }

  static validatePropertyData(property: Property): boolean {
    // Required fields validation
    if (!property.address.fullAddress || !property.type) {
      return false;
    }

    // Address validation
    if (!property.address.postcode.match(/^\d{4}$/)) {
      return false;
    }

    // Financial validation
    if (property.financials.currentValue <= 0) {
      return false;
    }

    // Dimension validation
    if (property.dimensions.landSize < 0 || property.dimensions.buildingArea < 0) {
      return false;
    }

    return true;
  }

  private static capitaliseWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private static calculateMarketTrend(propertyValue: number, medianPrice: number): 'above' | 'below' | 'market' {
    const variance = Math.abs(propertyValue - medianPrice) / medianPrice;
    
    if (variance < 0.1) return 'market';
    return propertyValue > medianPrice ? 'above' : 'below';
  }
}

// Bulk data processing utilities
export class BulkPropertyProcessor {
  private processor: DataProcessor<Property>;

  constructor() {
    this.processor = new DataProcessor<Property>()
      .addStep({
        name: 'Validate',
        process: (property) => property,
        validate: PropertyDataTransformer.validatePropertyData,
      })
      .addStep({
        name: 'Normalise Address',
        process: PropertyDataTransformer.normaliseAddress,
      })
      .addStep({
        name: 'Calculate Metrics',
        process: PropertyDataTransformer.calculateMetrics,
      });
  }

  async processProperties(
    properties: Property[], 
    options?: ProcessingOptions
  ): Promise<Property[]> {
    return this.processor.process(properties, options);
  }

  async enrichWithMarketData(
    properties: Property[],
    getMarketData: (suburb: string, propertyType: string) => Promise<any>
  ): Promise<Property[]> {
    const enrichmentProcessor = new DataProcessor<Property>()
      .addStep({
        name: 'Enrich with Market Data',
        process: async (property) => {
          try {
            const marketData = await getMarketData(property.address.suburb, property.type);
            return PropertyDataTransformer.enrichWithMarketData(property, marketData);
          } catch (error) {
            console.warn(`Failed to get market data for ${property.address.suburb}:`, error);
            return property;
          }
        },
      });

    return enrichmentProcessor.process(properties, { parallel: true });
  }

  async generateReports(
    properties: Property[],
    generateReport: (property: Property) => Promise<any>
  ): Promise<Array<{ property: Property; report: any }>> {
    const reportProcessor = new DataProcessor<Property>()
      .addStep({
        name: 'Generate Report',
        process: async (property) => {
          const report = await generateReport(property);
          return { property, report };
        },
        onError: async (error, property) => {
          console.error(`Failed to generate report for property ${property.id}:`, error);
          return { property, report: null };
        },
      });

    return reportProcessor.process(properties, { 
      parallel: true, 
      errorHandling: 'skip' 
    });
  }
}

// Data aggregation utilities
export class PropertyDataAggregator {
  static aggregateByType(properties: Property[]): Record<string, {
    count: number;
    totalValue: number;
    averageValue: number;
    averageSize: number;
  }> {
    const aggregation: Record<string, any> = {};

    properties.forEach(property => {
      if (!aggregation[property.type]) {
        aggregation[property.type] = {
          count: 0,
          totalValue: 0,
          totalSize: 0,
        };
      }

      const agg = aggregation[property.type];
      agg.count++;
      agg.totalValue += property.financials.currentValue;
      agg.totalSize += property.dimensions.landSize;
    });

    // Calculate averages
    Object.keys(aggregation).forEach(type => {
      const agg = aggregation[type];
      agg.averageValue = agg.totalValue / agg.count;
      agg.averageSize = agg.totalSize / agg.count;
      delete agg.totalSize;
    });

    return aggregation;
  }

  static aggregateBySuburb(properties: Property[]): Record<string, {
    count: number;
    medianValue: number;
    totalValue: number;
    priceRange: { min: number; max: number };
  }> {
    const aggregation: Record<string, any> = {};

    properties.forEach(property => {
      const suburb = property.address.suburb;
      
      if (!aggregation[suburb]) {
        aggregation[suburb] = {
          count: 0,
          totalValue: 0,
          values: [],
        };
      }

      const agg = aggregation[suburb];
      agg.count++;
      agg.totalValue += property.financials.currentValue;
      agg.values.push(property.financials.currentValue);
    });

    // Calculate medians and ranges
    Object.keys(aggregation).forEach(suburb => {
      const agg = aggregation[suburb];
      const sortedValues = agg.values.sort((a: number, b: number) => a - b);
      
      agg.medianValue = this.calculateMedian(sortedValues);
      agg.priceRange = {
        min: Math.min(...sortedValues),
        max: Math.max(...sortedValues),
      };
      
      delete agg.values;
    });

    return aggregation;
  }

  static calculatePerformanceMetrics(properties: Property[]): {
    totalPortfolioValue: number;
    averageYield: number;
    topPerformers: Property[];
    underperformers: Property[];
    diversificationScore: number;
  } {
    const totalValue = properties.reduce((sum, p) => sum + p.financials.currentValue, 0);
    
    const propertiesWithYield = properties.filter(p => 
      p.calculatedMetrics?.grossYield && p.calculatedMetrics.grossYield > 0
    );
    
    const averageYield = propertiesWithYield.length > 0
      ? propertiesWithYield.reduce((sum, p) => sum + (p.calculatedMetrics?.grossYield || 0), 0) / propertiesWithYield.length
      : 0;

    const sortedByYield = propertiesWithYield.sort((a, b) => 
      (b.calculatedMetrics?.grossYield || 0) - (a.calculatedMetrics?.grossYield || 0)
    );

    const topPerformers = sortedByYield.slice(0, Math.ceil(sortedByYield.length * 0.2));
    const underperformers = sortedByYield.slice(-Math.ceil(sortedByYield.length * 0.2));

    const typeDistribution = this.aggregateByType(properties);
    const diversificationScore = this.calculateDiversificationScore(typeDistribution);

    return {
      totalPortfolioValue: totalValue,
      averageYield,
      topPerformers,
      underperformers,
      diversificationScore,
    };
  }

  private static calculateMedian(values: number[]): number {
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  }

  private static calculateDiversificationScore(typeDistribution: Record<string, any>): number {
    const types = Object.keys(typeDistribution);
    const totalCount = Object.values(typeDistribution).reduce((sum: number, agg: any) => sum + agg.count, 0);
    
    // Calculate Herfindahl index for diversification
    const herfindahl = types.reduce((sum, type) => {
      const proportion = typeDistribution[type].count / totalCount;
      return sum + Math.pow(proportion, 2);
    }, 0);

    // Convert to diversification score (1 - HHI), normalized to 0-100
    return Math.round((1 - herfindahl) * 100);
  }
}
```

## Practical Exercises

### Exercise 1: Advanced API Integration
Build a comprehensive API integration system:
1. Implement request/response interceptors for authentication
2. Create sophisticated caching strategies with cache invalidation
3. Add request deduplication and batch processing
4. Implement offline support with sync capabilities

### Exercise 2: Real-time Property Dashboard
Create a real-time property monitoring dashboard:
1. Implement WebSocket connections for live updates
2. Build real-time property value tracking
3. Add collaborative editing with conflict resolution
4. Create real-time notifications and alerts

### Exercise 3: Data Processing Pipeline
Develop a comprehensive data processing system:
1. Build multi-step data transformation pipelines
2. Implement parallel processing for large datasets
3. Add data validation and quality checks
4. Create automated data enrichment workflows

## Summary

This module covered advanced data management patterns essential for property analysis applications:

- **API Integration**: Sophisticated service architecture with caching, retry logic, and error handling
- **Real-time Updates**: WebSocket integration for live data synchronisation
- **Data Processing**: Advanced transformation and aggregation pipelines
- **Performance Optimisation**: Caching strategies and efficient data handling
- **Error Resilience**: Comprehensive error handling and recovery mechanisms

These patterns enable building robust, scalable applications that can handle complex property data requirements whilst providing excellent user experiences.

## Navigation
- [← Previous: Module 2.1 - Advanced React Patterns](./Module-2.1-Advanced-React-Patterns.md)
- [Next: Module 2.3 - Advanced UI Patterns →](./Module-2.3-Advanced-UI-Patterns.md)
- [↑ Back to Phase 2 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)