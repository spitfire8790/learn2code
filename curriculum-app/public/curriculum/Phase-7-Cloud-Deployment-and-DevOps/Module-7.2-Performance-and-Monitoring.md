# Module 7.2: Performance and Monitoring

## Learning Objectives
By the end of this module, you will be able to:
- Implement comprehensive application performance monitoring for property platforms
- Set up error tracking and alerting systems for production environments
- Monitor and optimize Core Web Vitals for property search and analysis interfaces
- Create performance dashboards and real-time monitoring systems
- Implement automated performance testing and regression detection
- Design alerting strategies for critical property data processing workflows

## Prerequisites
- Understanding of cloud deployment strategies (Module 7.1)
- Knowledge of performance optimization techniques (Module 5.4)
- Familiarity with property platform architecture and workflows
- Basic understanding of metrics, logging, and observability concepts

## Introduction

Property management platforms require sophisticated monitoring to ensure reliable service for critical business workflows: property valuations must be accurate and timely, government API integrations must be monitored for failures, and user interfaces must perform well under varying load conditions. This module explores comprehensive performance monitoring and observability strategies.

**Why Monitoring Matters for Property Platforms:**
- **Financial Accuracy**: Property calculations must be monitored for correctness and consistency
- **API Reliability**: Government and third-party API failures must be detected immediately
- **User Experience**: Property search and analysis must maintain fast response times
- **Business Continuity**: Platform availability directly impacts property professionals' daily work
- **Compliance**: Regulatory requirements may mandate monitoring and audit trails
- **Performance Optimization**: Data-driven insights enable continuous improvement

## Section 1: Application Performance Monitoring

### Real User Monitoring (RUM) Implementation

```typescript
// src/utils/monitoring/rum.ts - Real User Monitoring for property platform
interface PropertyPlatformMetrics {
  pageLoadTime: number
  propertySearchTime: number
  analysisCalculationTime: number
  mapRenderTime: number
  apiResponseTime: number
  errorRate: number
  userSession: UserSession
}

interface UserSession {
  sessionId: string
  userId?: string
  organizationId?: string
  userAgent: string
  connectionType: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  location: {
    country: string
    region: string
    city: string
  }
}

class PropertyPlatformRUM {
  private sessionId: string
  private metrics: Map<string, number> = new Map()
  private errors: any[] = []
  private startTimes: Map<string, number> = new Map()

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeRUM()
  }

  private initializeRUM(): void {
    // Monitor Core Web Vitals
    this.observeWebVitals()
    
    // Monitor property-specific operations
    this.monitorPropertyOperations()
    
    // Monitor errors
    this.monitorErrors()
    
    // Monitor resource loading
    this.monitorResourceLoading()
    
    // Send metrics periodically
    this.scheduleMetricsSending()
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.recordMetric('lcp', lastEntry.startTime)
      
      // Property platform specific: Track if LCP is property image or content
      if (lastEntry.element) {
        const isPropertyImage = lastEntry.element.closest('[data-property-image]')
        const isPropertyCard = lastEntry.element.closest('[data-property-card]')
        
        if (isPropertyImage) {
          this.recordMetric('lcp_property_image', lastEntry.startTime)
        } else if (isPropertyCard) {
          this.recordMetric('lcp_property_content', lastEntry.startTime)
        }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0]
      this.recordMetric('fid', firstInput.processingStart - firstInput.startTime)
      
      // Track what type of interaction caused FID
      const targetElement = firstInput.target as Element
      if (targetElement) {
        if (targetElement.closest('[data-property-search]')) {
          this.recordMetric('fid_property_search', firstInput.processingStart - firstInput.startTime)
        } else if (targetElement.closest('[data-analysis-button]')) {
          this.recordMetric('fid_analysis_trigger', firstInput.processingStart - firstInput.startTime)
        }
      }
    }).observe({ type: 'first-input', buffered: true })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.recordMetric('cls', clsValue)
    }).observe({ type: 'layout-shift', buffered: true })
  }

  private monitorPropertyOperations(): void {
    // Monitor property search performance
    this.interceptFetch('/api/properties', (duration, response) => {
      this.recordMetric('property_search_duration', duration)
      this.recordMetric('property_search_success', response.ok ? 1 : 0)
      
      if (response.ok) {
        response.clone().json().then(data => {
          if (data.data) {
            this.recordMetric('property_search_results_count', data.data.length)
          }
        })
      }
    })

    // Monitor analysis calculations
    this.interceptFetch('/api/analysis', (duration, response) => {
      this.recordMetric('analysis_calculation_duration', duration)
      this.recordMetric('analysis_calculation_success', response.ok ? 1 : 0)
    })

    // Monitor map operations
    this.monitorMapPerformance()
    
    // Monitor file uploads (property images, documents)
    this.monitorFileOperations()
  }

  private monitorMapPerformance(): void {
    // Monitor Mapbox map loading
    if (window.mapboxgl) {
      const originalMap = window.mapboxgl.Map
      window.mapboxgl.Map = class extends originalMap {
        constructor(options: any) {
          const startTime = performance.now()
          super(options)
          
          this.on('load', () => {
            const loadTime = performance.now() - startTime
            this.recordMetric('map_load_duration', loadTime)
          })

          this.on('data', (e) => {
            if (e.sourceDataType === 'content') {
              this.recordMetric('map_data_load', performance.now())
            }
          })
        }
      }
    }
  }

  private monitorFileOperations(): void {
    // Monitor file upload performance
    const originalFormData = window.FormData
    window.FormData = class extends originalFormData {
      append(name: string, value: any, filename?: string) {
        if (value instanceof File) {
          // Track file upload metrics
          this.recordMetric('file_upload_size', value.size)
          this.recordMetric('file_upload_type', value.type.startsWith('image/') ? 'image' : 'document')
        }
        return super.append(name, value, filename)
      }
    }
  }

  private interceptFetch(urlPattern: string, callback: (duration: number, response: Response) => void): void {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [url] = args
      const startTime = performance.now()
      
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime
        
        if (typeof url === 'string' && url.includes(urlPattern)) {
          callback(duration, response.clone())
        }
        
        return response
      } catch (error) {
        const duration = performance.now() - startTime
        if (typeof url === 'string' && url.includes(urlPattern)) {
          callback(duration, new Response(null, { status: 0 }))
        }
        throw error
      }
    }
  }

  private monitorErrors(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as Element
        this.recordError({
          type: 'resource_error',
          resource: target.tagName,
          src: (target as any).src || (target as any).href,
          timestamp: Date.now()
        })
      }
    }, true)
  }

  private monitorResourceLoading(): void {
    // Monitor critical resource loading
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming
        
        // Track property-specific resources
        if (resourceEntry.name.includes('mapbox') || resourceEntry.name.includes('tiles')) {
          this.recordMetric('map_resource_load_time', resourceEntry.duration)
        } else if (resourceEntry.name.includes('property') || resourceEntry.name.includes('/api/')) {
          this.recordMetric('api_resource_load_time', resourceEntry.duration)
        }
        
        // Track slow resources
        if (resourceEntry.duration > 2000) {
          this.recordError({
            type: 'slow_resource',
            resource: resourceEntry.name,
            duration: resourceEntry.duration,
            timestamp: Date.now()
          })
        }
      })
    }).observe({ type: 'resource', buffered: true })
  }

  public startOperation(operationName: string): void {
    this.startTimes.set(operationName, performance.now())
  }

  public endOperation(operationName: string, metadata?: any): void {
    const startTime = this.startTimes.get(operationName)
    if (startTime) {
      const duration = performance.now() - startTime
      this.recordMetric(`${operationName}_duration`, duration)
      this.startTimes.delete(operationName)
      
      if (metadata) {
        this.recordMetric(`${operationName}_metadata`, JSON.stringify(metadata))
      }
    }
  }

  private recordMetric(name: string, value: number | string): void {
    if (typeof value === 'number') {
      this.metrics.set(name, value)
    }
    
    // Send critical metrics immediately
    if (this.isCriticalMetric(name)) {
      this.sendMetricsImmediate([{ name, value, timestamp: Date.now() }])
    }
  }

  private recordError(error: any): void {
    this.errors.push(error)
    
    // Send errors immediately
    this.sendErrorsImmediate([error])
  }

  private isCriticalMetric(name: string): boolean {
    const criticalMetrics = [
      'property_search_duration',
      'analysis_calculation_duration',
      'map_load_duration',
      'lcp',
      'fid',
      'cls'
    ]
    
    return criticalMetrics.includes(name) || name.includes('error') || name.includes('failure')
  }

  private scheduleMetricsSending(): void {
    // Send metrics every 30 seconds
    setInterval(() => {
      this.sendMetrics()
    }, 30000)

    // Send metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics()
    })

    // Send metrics when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics()
      }
    })
  }

  private async sendMetrics(): Promise<void> {
    if (this.metrics.size === 0 && this.errors.length === 0) return

    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: Object.fromEntries(this.metrics),
      errors: this.errors,
      session: await this.getSessionInfo()
    }

    try {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/rum', JSON.stringify(payload))
      } else {
        fetch('/api/analytics/rum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        })
      }

      // Clear sent metrics
      this.metrics.clear()
      this.errors.length = 0

    } catch (error) {
      console.warn('Failed to send RUM metrics:', error)
    }
  }

  private async sendMetricsImmediate(metrics: any[]): Promise<void> {
    try {
      await fetch('/api/analytics/rum-immediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timestamp: Date.now(),
          metrics
        })
      })
    } catch (error) {
      console.warn('Failed to send immediate metrics:', error)
    }
  }

  private async sendErrorsImmediate(errors: any[]): Promise<void> {
    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timestamp: Date.now(),
          errors
        })
      })
    } catch (error) {
      console.warn('Failed to send immediate errors:', error)
    }
  }

  private async getSessionInfo(): Promise<UserSession> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    return {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      connectionType: connection?.effectiveType || 'unknown',
      deviceType: this.getDeviceType(),
      location: await this.getLocationInfo()
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private async getLocationInfo(): Promise<any> {
    try {
      const response = await fetch('/api/location')
      return await response.json()
    } catch {
      return { country: 'unknown', region: 'unknown', city: 'unknown' }
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Initialize RUM monitoring
const propertyRUM = new PropertyPlatformRUM()

// Export for use in components
export { propertyRUM, PropertyPlatformRUM }
```

### Server-Side Performance Monitoring

```typescript
// api/analytics/performance-monitor.ts - Server-side performance monitoring
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface SystemHealth {
  database: {
    connectionPool: number
    queryLatency: number
    activeConnections: number
  }
  apis: {
    eplanning: { status: 'healthy' | 'degraded' | 'down', latency: number }
    spatial: { status: 'healthy' | 'degraded' | 'down', latency: number }
    supabase: { status: 'healthy' | 'degraded' | 'down', latency: number }
  }
  cache: {
    hitRate: number
    memoryUsage: number
  }
  server: {
    memoryUsage: number
    cpuUsage: number
    uptime: number
  }
}

class PropertyPlatformMonitor {
  private supabase: any
  private metrics: PerformanceMetric[] = []
  private alertThresholds = {
    propertySearchLatency: 2000, // 2 seconds
    analysisCalculationLatency: 10000, // 10 seconds
    mapLoadLatency: 3000, // 3 seconds
    errorRate: 0.05, // 5%
    databaseLatency: 500, // 500ms
    apiLatency: 1000 // 1 second
  }

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async collectSystemHealth(): Promise<SystemHealth> {
    const [databaseHealth, apiHealth, cacheHealth, serverHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkAPIHealth(),
      this.checkCacheHealth(),
      this.checkServerHealth()
    ])

    return {
      database: databaseHealth,
      apis: apiHealth,
      cache: cacheHealth,
      server: serverHealth
    }
  }

  private async checkDatabaseHealth(): Promise<SystemHealth['database']> {
    const startTime = Date.now()
    
    try {
      // Test database connection and query performance
      const { data, error } = await this.supabase
        .from('properties')
        .select('id')
        .limit(1)

      const queryLatency = Date.now() - startTime

      if (error) {
        throw error
      }

      // Get connection pool metrics from database
      const { data: poolStats } = await this.supabase
        .rpc('get_connection_pool_stats')

      return {
        connectionPool: poolStats?.pool_size || 0,
        queryLatency,
        activeConnections: poolStats?.active_connections || 0
      }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        connectionPool: 0,
        queryLatency: Date.now() - startTime,
        activeConnections: 0
      }
    }
  }

  private async checkAPIHealth(): Promise<SystemHealth['apis']> {
    const [eplanning, spatial, supabase] = await Promise.all([
      this.checkAPIEndpoint('eplanning'),
      this.checkAPIEndpoint('spatial'),
      this.checkAPIEndpoint('supabase')
    ])

    return { eplanning, spatial, supabase }
  }

  private async checkAPIEndpoint(
    apiType: 'eplanning' | 'spatial' | 'supabase'
  ): Promise<{ status: 'healthy' | 'degraded' | 'down', latency: number }> {
    const startTime = Date.now()
    
    try {
      let url: string
      let options: RequestInit = {}

      switch (apiType) {
        case 'eplanning':
          url = `${process.env.EPLANNING_API_BASE}/health`
          options.headers = { 'Authorization': `Bearer ${process.env.EPLANNING_API_KEY}` }
          break
        case 'spatial':
          url = `${process.env.SPATIAL_API_BASE}/health`
          options.headers = { 'X-API-Key': process.env.SPATIAL_API_KEY }
          break
        case 'supabase':
          url = `${process.env.SUPABASE_URL}/rest/v1/`
          options.headers = { 'apikey': process.env.SUPABASE_ANON_KEY! }
          break
        default:
          throw new Error('Invalid API type')
      }

      const response = await fetch(url, options)
      const latency = Date.now() - startTime

      if (response.ok) {
        return {
          status: latency > this.alertThresholds.apiLatency ? 'degraded' : 'healthy',
          latency
        }
      } else {
        return { status: 'down', latency }
      }
    } catch (error) {
      return { status: 'down', latency: Date.now() - startTime }
    }
  }

  private async checkCacheHealth(): Promise<SystemHealth['cache']> {
    // This would integrate with your caching solution (Redis, etc.)
    return {
      hitRate: 0.85, // 85% cache hit rate
      memoryUsage: 0.6 // 60% memory usage
    }
  }

  private async checkServerHealth(): Promise<SystemHealth['server']> {
    const memoryUsage = process.memoryUsage()
    
    return {
      memoryUsage: memoryUsage.heapUsed / memoryUsage.heapTotal,
      cpuUsage: await this.getCPUUsage(),
      uptime: process.uptime()
    }
  }

  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage()
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage)
        const totalUsage = endUsage.user + endUsage.system
        resolve(totalUsage / 1000000) // Convert to percentage
      }, 100)
    })
  }

  async recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Check for alert conditions
    await this.checkAlerts(metric)

    // Store in database for historical analysis
    await this.storeMetric(metric)
  }

  private async checkAlerts(metric: PerformanceMetric): Promise<void> {
    const alerts: any[] = []

    // Property search latency alert
    if (metric.name === 'property_search_duration' && metric.value > this.alertThresholds.propertySearchLatency) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Property search latency high: ${metric.value}ms`,
        metric: metric.name,
        value: metric.value,
        threshold: this.alertThresholds.propertySearchLatency
      })
    }

    // Analysis calculation latency alert
    if (metric.name === 'analysis_calculation_duration' && metric.value > this.alertThresholds.analysisCalculationLatency) {
      alerts.push({
        type: 'performance',
        severity: 'critical',
        message: `Analysis calculation timeout: ${metric.value}ms`,
        metric: metric.name,
        value: metric.value,
        threshold: this.alertThresholds.analysisCalculationLatency
      })
    }

    // Database latency alert
    if (metric.name === 'database_query_latency' && metric.value > this.alertThresholds.databaseLatency) {
      alerts.push({
        type: 'database',
        severity: 'warning',
        message: `Database query slow: ${metric.value}ms`,
        metric: metric.name,
        value: metric.value,
        threshold: this.alertThresholds.databaseLatency
      })
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert)
    }
  }

  private async sendAlert(alert: any): Promise<void> {
    try {
      // Store alert in database
      await this.supabase
        .from('system_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          metric_name: alert.metric,
          metric_value: alert.value,
          threshold: alert.threshold,
          created_at: new Date().toISOString()
        })

      // Send to external alerting system (Slack, PagerDuty, etc.)
      if (alert.severity === 'critical') {
        await this.sendCriticalAlert(alert)
      }

    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  private async sendCriticalAlert(alert: any): Promise<void> {
    // Integration with alerting services
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    
    if (slackWebhook) {
      try {
        await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Critical Alert: ${alert.message}`,
            attachments: [
              {
                color: 'danger',
                fields: [
                  { title: 'Metric', value: alert.metric, short: true },
                  { title: 'Value', value: `${alert.value}ms`, short: true },
                  { title: 'Threshold', value: `${alert.threshold}ms`, short: true },
                  { title: 'Time', value: new Date().toISOString(), short: true }
                ]
              }
            ]
          })
        })
      } catch (error) {
        console.error('Failed to send Slack alert:', error)
      }
    }
  }

  private async storeMetric(metric: PerformanceMetric): Promise<void> {
    try {
      await this.supabase
        .from('performance_metrics')
        .insert({
          name: metric.name,
          value: metric.value,
          timestamp: new Date(metric.timestamp).toISOString(),
          tags: metric.tags || {}
        })
    } catch (error) {
      console.error('Failed to store metric:', error)
    }
  }

  async generatePerformanceReport(timeRange: { start: Date, end: Date }): Promise<any> {
    const { data: metrics, error } = await this.supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      throw error
    }

    // Aggregate metrics
    const report = {
      timeRange,
      summary: {
        totalMetrics: metrics.length,
        averagePropertySearchTime: this.calculateAverage(metrics, 'property_search_duration'),
        averageAnalysisTime: this.calculateAverage(metrics, 'analysis_calculation_duration'),
        averageMapLoadTime: this.calculateAverage(metrics, 'map_load_duration'),
        errorRate: this.calculateErrorRate(metrics)
      },
      trends: this.calculateTrends(metrics),
      alerts: await this.getAlertsInRange(timeRange)
    }

    return report
  }

  private calculateAverage(metrics: any[], metricName: string): number {
    const filteredMetrics = metrics.filter(m => m.name === metricName)
    if (filteredMetrics.length === 0) return 0
    
    const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0)
    return sum / filteredMetrics.length
  }

  private calculateErrorRate(metrics: any[]): number {
    const totalRequests = metrics.filter(m => m.name.includes('_duration')).length
    const errors = metrics.filter(m => m.name.includes('_error')).length
    
    return totalRequests > 0 ? errors / totalRequests : 0
  }

  private calculateTrends(metrics: any[]): any {
    // Calculate hourly trends
    const hourlyData = new Map()
    
    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).getHours()
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, [])
      }
      hourlyData.get(hour).push(metric)
    })

    const trends = Array.from(hourlyData.entries()).map(([hour, hourMetrics]) => ({
      hour,
      averagePropertySearch: this.calculateAverage(hourMetrics, 'property_search_duration'),
      averageAnalysis: this.calculateAverage(hourMetrics, 'analysis_calculation_duration'),
      requestCount: hourMetrics.length
    }))

    return trends
  }

  private async getAlertsInRange(timeRange: { start: Date, end: Date }): Promise<any[]> {
    const { data: alerts } = await this.supabase
      .from('system_alerts')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())
      .order('created_at', { ascending: false })

    return alerts || []
  }
}

// API endpoint for health checks
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const monitor = new PropertyPlatformMonitor()

  if (req.method === 'GET') {
    try {
      const health = await monitor.collectSystemHealth()
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        health
      })
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  } else if (req.method === 'POST') {
    // Record custom metric
    const { name, value, tags } = req.body
    
    try {
      await monitor.recordMetric(name, value, tags)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
```

## Section 2: Error Tracking and Alerting

### Comprehensive Error Tracking System

```typescript
// src/utils/monitoring/error-tracking.ts - Advanced error tracking for property platform
interface PropertyError {
  id: string
  type: 'javascript' | 'api' | 'business_logic' | 'validation' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  stack?: string
  context: ErrorContext
  fingerprint: string
  timestamp: number
  resolved: boolean
}

interface ErrorContext {
  userId?: string
  organizationId?: string
  sessionId: string
  url: string
  userAgent: string
  component?: string
  operation?: string
  propertyId?: string
  analysisId?: string
  additionalData?: any
}

class PropertyErrorTracker {
  private errors: Map<string, PropertyError> = new Map()
  private errorQueue: PropertyError[] = []
  private isOnline: boolean = navigator.onLine

  constructor() {
    this.initializeErrorTracking()
    this.setupOfflineHandling()
  }

  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureJavaScriptError(event)
    })

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.capturePromiseRejection(event)
    })

    // Network monitoring
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private captureJavaScriptError(event: ErrorEvent): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type: 'javascript',
      severity: this.determineSeverity(event.error),
      message: event.message,
      stack: event.error?.stack,
      context: this.getErrorContext({
        component: this.getComponentFromStack(event.error?.stack),
        operation: this.getOperationFromStack(event.error?.stack)
      }),
      fingerprint: this.generateFingerprint(event.message, event.filename, event.lineno),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  private capturePromiseRejection(event: PromiseRejectionEvent): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type: 'javascript',
      severity: 'medium',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      context: this.getErrorContext(),
      fingerprint: this.generateFingerprint(event.reason?.message || String(event.reason)),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  public captureAPIError(
    endpoint: string,
    method: string,
    status: number,
    response: any,
    context?: Partial<ErrorContext>
  ): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type: 'api',
      severity: this.getAPISeverity(status),
      message: `API Error: ${method} ${endpoint} (${status})`,
      context: this.getErrorContext({
        ...context,
        operation: `${method} ${endpoint}`,
        additionalData: { status, response: this.sanitizeResponse(response) }
      }),
      fingerprint: this.generateFingerprint(`${method}_${endpoint}_${status}`),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  public captureBusinessLogicError(
    operation: string,
    message: string,
    propertyId?: string,
    analysisId?: string,
    additionalData?: any
  ): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type: 'business_logic',
      severity: 'high',
      message: `Business Logic Error: ${message}`,
      context: this.getErrorContext({
        operation,
        propertyId,
        analysisId,
        additionalData
      }),
      fingerprint: this.generateFingerprint(operation, message),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  public captureValidationError(
    field: string,
    value: any,
    rule: string,
    context?: Partial<ErrorContext>
  ): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type: 'validation',
      severity: 'low',
      message: `Validation Error: ${field} failed ${rule}`,
      context: this.getErrorContext({
        ...context,
        operation: 'validation',
        additionalData: { field, value: this.sanitizeValue(value), rule }
      }),
      fingerprint: this.generateFingerprint('validation', field, rule),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  private processError(error: PropertyError): void {
    // Check if this is a duplicate error
    const existingError = this.findDuplicateError(error)
    if (existingError) {
      this.incrementErrorCount(existingError)
      return
    }

    // Store error
    this.errors.set(error.id, error)

    // Add to queue for sending
    this.errorQueue.push(error)

    // Log locally for debugging
    this.logError(error)

    // Send immediately if critical
    if (error.severity === 'critical') {
      this.sendErrorImmediate(error)
    } else if (this.isOnline) {
      // Debounced sending for non-critical errors
      this.debouncedSendErrors()
    }
  }

  private findDuplicateError(error: PropertyError): PropertyError | undefined {
    return Array.from(this.errors.values()).find(
      existingError => existingError.fingerprint === error.fingerprint &&
                      Date.now() - existingError.timestamp < 60000 // Within 1 minute
    )
  }

  private incrementErrorCount(error: PropertyError): void {
    const additionalData = error.context.additionalData || {}
    additionalData.count = (additionalData.count || 1) + 1
    additionalData.lastSeen = Date.now()
    
    error.context.additionalData = additionalData
  }

  private debouncedSendErrors = this.debounce(() => {
    this.sendErrors()
  }, 5000)

  private async sendErrors(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.isOnline) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue.length = 0

    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now()
        })
      })
    } catch (sendError) {
      // Re-queue errors if sending failed
      this.errorQueue.unshift(...errorsToSend)
      console.warn('Failed to send errors:', sendError)
    }
  }

  private async sendErrorImmediate(error: PropertyError): Promise<void> {
    try {
      await fetch('/api/analytics/errors/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error })
      })
    } catch (sendError) {
      this.errorQueue.unshift(error)
      console.warn('Failed to send critical error:', sendError)
    }
  }

  private setupOfflineHandling(): void {
    // Store errors locally when offline
    if ('localStorage' in window) {
      window.addEventListener('beforeunload', () => {
        if (this.errorQueue.length > 0) {
          localStorage.setItem('pendingErrors', JSON.stringify(this.errorQueue))
        }
      })

      // Restore errors on load
      const pendingErrors = localStorage.getItem('pendingErrors')
      if (pendingErrors) {
        try {
          const errors = JSON.parse(pendingErrors)
          this.errorQueue.push(...errors)
          localStorage.removeItem('pendingErrors')
          
          if (this.isOnline) {
            this.sendErrors()
          }
        } catch (error) {
          console.warn('Failed to restore pending errors:', error)
        }
      }
    }
  }

  private flushErrorQueue(): void {
    if (this.errorQueue.length > 0) {
      this.sendErrors()
    }
  }

  private determineSeverity(error: Error): PropertyError['severity'] {
    if (!error) return 'low'

    const message = error.message.toLowerCase()
    
    // Critical errors that break core functionality
    if (message.includes('network error') || 
        message.includes('failed to fetch') ||
        message.includes('property calculation') ||
        message.includes('analysis failed')) {
      return 'critical'
    }

    // High severity errors
    if (message.includes('permission') ||
        message.includes('authentication') ||
        message.includes('validation')) {
      return 'high'
    }

    // Medium severity errors
    if (message.includes('timeout') ||
        message.includes('not found') ||
        message.includes('invalid')) {
      return 'medium'
    }

    return 'low'
  }

  private getAPISeverity(status: number): PropertyError['severity'] {
    if (status >= 500) return 'critical'
    if (status === 401 || status === 403) return 'high'
    if (status >= 400) return 'medium'
    return 'low'
  }

  private getErrorContext(additional?: Partial<ErrorContext>): ErrorContext {
    return {
      sessionId: this.getSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      organizationId: this.getCurrentOrganizationId(),
      ...additional
    }
  }

  private getComponentFromStack(stack?: string): string | undefined {
    if (!stack) return undefined

    // Extract React component name from stack trace
    const componentMatch = stack.match(/at (\w+Component|use\w+)/i)
    return componentMatch ? componentMatch[1] : undefined
  }

  private getOperationFromStack(stack?: string): string | undefined {
    if (!stack) return undefined

    // Extract function/operation name from stack trace
    const operationMatch = stack.match(/at (calculate\w+|fetch\w+|handle\w+)/i)
    return operationMatch ? operationMatch[1] : undefined
  }

  private generateFingerprint(...parts: (string | undefined)[]): string {
    const validParts = parts.filter(Boolean)
    return btoa(validParts.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
  }

  private sanitizeResponse(response: any): any {
    if (typeof response === 'string') {
      return response.length > 1000 ? response.substring(0, 1000) + '...' : response
    }
    
    if (typeof response === 'object') {
      const sanitized = { ...response }
      // Remove sensitive data
      delete sanitized.password
      delete sanitized.token
      delete sanitized.apiKey
      return sanitized
    }
    
    return response
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...'
    }
    return value
  }

  private logError(error: PropertyError): void {
    const logLevel = error.severity === 'critical' ? 'error' : 
                    error.severity === 'high' ? 'warn' : 'info'
    
    console[logLevel](`[${error.type.toUpperCase()}] ${error.message}`, {
      id: error.id,
      fingerprint: error.fingerprint,
      context: error.context
    })
  }

  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private getSessionId(): string {
    // Implementation depends on your session management
    return sessionStorage.getItem('sessionId') || 'unknown'
  }

  private getCurrentUserId(): string | undefined {
    // Implementation depends on your auth system
    return localStorage.getItem('userId') || undefined
  }

  private getCurrentOrganizationId(): string | undefined {
    // Implementation depends on your auth system
    return localStorage.getItem('organizationId') || undefined
  }

  private debounce(func: Function, wait: number): Function {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Public methods for manual error reporting
  public reportError(
    message: string,
    type: PropertyError['type'] = 'javascript',
    severity: PropertyError['severity'] = 'medium',
    context?: Partial<ErrorContext>
  ): void {
    const error: PropertyError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      context: this.getErrorContext(context),
      fingerprint: this.generateFingerprint(type, message),
      timestamp: Date.now(),
      resolved: false
    }

    this.processError(error)
  }

  public getErrorStats(): any {
    const errors = Array.from(this.errors.values())
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const recentErrors = errors.filter(error => error.timestamp > oneDayAgo)

    return {
      total: errors.length,
      last24Hours: recentErrors.length,
      bySeverity: {
        critical: recentErrors.filter(e => e.severity === 'critical').length,
        high: recentErrors.filter(e => e.severity === 'high').length,
        medium: recentErrors.filter(e => e.severity === 'medium').length,
        low: recentErrors.filter(e => e.severity === 'low').length
      },
      byType: {
        javascript: recentErrors.filter(e => e.type === 'javascript').length,
        api: recentErrors.filter(e => e.type === 'api').length,
        business_logic: recentErrors.filter(e => e.type === 'business_logic').length,
        validation: recentErrors.filter(e => e.type === 'validation').length,
        system: recentErrors.filter(e => e.type === 'system').length
      }
    }
  }
}

// Initialize error tracking
const propertyErrorTracker = new PropertyErrorTracker()

// Export for use throughout the application
export { propertyErrorTracker, PropertyErrorTracker }
```

## Section 3: Performance Dashboards

### Real-Time Performance Dashboard

```typescript
// src/components/admin/PerformanceDashboard.tsx - Real-time performance monitoring dashboard
import React, { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PerformanceMetrics {
  timestamp: number
  propertySearchLatency: number
  analysisCalculationLatency: number
  mapLoadLatency: number
  errorRate: number
  throughput: number
  userCount: number
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down'
    latency: number
    connections: number
  }
  apis: {
    eplanning: { status: 'healthy' | 'degraded' | 'down', latency: number }
    spatial: { status: 'healthy' | 'degraded' | 'down', latency: number }
  }
  cache: {
    hitRate: number
    memoryUsage: number
  }
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h')
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Fetch initial data
    fetchPerformanceData()
    fetchSystemHealth()
    fetchAlerts()

    // Set up real-time updates
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(() => {
        fetchPerformanceData()
        fetchSystemHealth()
      }, 30000) // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeRange, isLive])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`/api/analytics/performance?range=${timeRange}`)
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/analytics/health')
      const data = await response.json()
      setSystemHealth(data.health)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/analytics/alerts?range=${timeRange}`)
      const data = await response.json()
      setAlerts(data.alerts)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const latencyChartData = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Property Search',
        data: metrics.map(m => m.propertySearchLatency),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Analysis Calculation',
        data: metrics.map(m => m.analysisCalculationLatency),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Map Loading',
        data: metrics.map(m => m.mapLoadLatency),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const throughputChartData = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Requests per Minute',
        data: metrics.map(m => m.throughput),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1
      }
    ]
  }

  const errorDistributionData = {
    labels: ['API Errors', 'Validation Errors', 'JavaScript Errors', 'System Errors'],
    datasets: [
      {
        data: [25, 15, 35, 25], // This would come from actual error data
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'down': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring of property platform performance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isLive
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isLive ? '🔴 Live' : '⏸️ Paused'}
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database</h3>
              <div className="space-y-2">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  Latency: {systemHealth.database.latency}ms
                </div>
                <div className="text-sm text-gray-600">
                  Connections: {systemHealth.database.connections}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ePlanning API</h3>
              <div className="space-y-2">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.apis.eplanning.status)}`}>
                  {systemHealth.apis.eplanning.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  Latency: {systemHealth.apis.eplanning.latency}ms
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spatial API</h3>
              <div className="space-y-2">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.apis.spatial.status)}`}>
                  {systemHealth.apis.spatial.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  Latency: {systemHealth.apis.spatial.latency}ms
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Hit Rate: {(systemHealth.cache.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Memory: {(systemHealth.cache.memoryUsage * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
            <div className="h-64">
              <Line data={latencyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Throughput</h3>
            <div className="h-64">
              <Bar data={throughputChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Distribution</h3>
            <div className="h-64">
              <Doughnut data={errorDistributionData} options={{ ...chartOptions, maintainAspectRatio: true }} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent alerts</p>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.length > 0 ? Math.round(metrics[metrics.length - 1]?.propertySearchLatency || 0) : 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Property Search</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.length > 0 ? Math.round(metrics[metrics.length - 1]?.analysisCalculationLatency || 0) : 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.length > 0 ? Math.round(metrics[metrics.length - 1]?.throughput || 0) : 0}
              </div>
              <div className="text-sm text-gray-600">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.length > 0 ? (metrics[metrics.length - 1]?.errorRate * 100 || 0).toFixed(2) : 0}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDashboard
```

## Practical Exercises

### Exercise 1: RUM Implementation
Set up Real User Monitoring for a property search interface:
- Core Web Vitals tracking
- Property-specific operation monitoring
- Error tracking and reporting
- Performance metric collection

### Exercise 2: Health Check System
Build a comprehensive health monitoring system:
- Database connection monitoring
- API endpoint health checks
- Cache performance tracking
- Automated alerting setup

### Exercise 3: Performance Dashboard
Create a real-time performance dashboard:
- Live metrics visualization
- Historical trend analysis
- Alert management interface
- System health overview

### Exercise 4: Alerting Strategy
Design and implement alerting for:
- Critical performance degradation
- API failures and timeouts
- Error rate threshold breaches
- Resource utilization warnings

## Summary

This module covered comprehensive performance monitoring and alerting strategies for property management platforms:

- **Real User Monitoring**: Client-side performance tracking with Core Web Vitals and property-specific metrics
- **Error Tracking**: Advanced error capture, categorization, and reporting systems
- **Health Monitoring**: Server-side system health checks and API monitoring
- **Performance Dashboards**: Real-time visualization and historical analysis
- **Alerting Systems**: Automated notification and escalation strategies

These monitoring and alerting capabilities ensure property platforms maintain optimal performance and reliability for critical business operations.

## Navigation
- [Next: Module 7.3 - CI/CD and Automation →](./Module-7.3-CI-CD-and-Automation.md)
- [← Previous: Module 7.1 - Cloud Platforms](./Module-7.1-Cloud-Platforms.md)
- [↑ Back to Phase 7 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)