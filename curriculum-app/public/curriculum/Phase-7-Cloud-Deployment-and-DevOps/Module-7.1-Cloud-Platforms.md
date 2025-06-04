# Module 7.1: Cloud Platforms

## Learning Objectives
By the end of this module, you will be able to:
- Deploy property management applications to Vercel with optimal configuration
- Implement Cloudflare Workers for global proxy services and edge computing
- Configure Supabase Cloud for production database and authentication
- Set up multi-environment deployments (development, staging, production)
- Implement environment-specific configurations and secrets management
- Optimize deployment strategies for property data applications

## Prerequisites
- Understanding of build tools and deployment concepts (Module 6.1)
- Knowledge of Supabase and database management (Module 5.1)
- Familiarity with API development and proxy configurations
- Basic understanding of DNS and CDN concepts

## Introduction

Property management platforms require robust, scalable cloud infrastructure to handle complex workflows: real-time property updates, government API integrations, large dataset processing, and global user access. This module explores deploying property analysis applications using modern cloud platforms optimized for performance and reliability.

**Why These Cloud Platforms for Property Applications:**
- **Vercel**: Optimized for React applications with automatic deployments and global CDN
- **Cloudflare Workers**: Edge computing for fast government API proxying worldwide
- **Supabase Cloud**: Managed PostgreSQL with real-time features and global distribution
- **Multi-Environment Strategy**: Separate environments for development, testing, and production
- **Performance Focus**: Fast loading times critical for property search and analysis
- **Global Reach**: Property professionals work across different time zones and regions

## Section 1: Vercel Deployment Strategy

### Advanced Vercel Configuration

Property platforms require sophisticated deployment configurations for optimal performance:

```json
// vercel.json - Production-ready Vercel configuration
{
  "version": 2,
  "name": "property-analysis-platform",
  "alias": ["propertyplatform.com", "www.propertyplatform.com"],
  
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],

  "routes": [
    {
      "src": "/api/eplanning/(.*)",
      "dest": "/api/proxy/eplanning.js"
    },
    {
      "src": "/api/spatial/(.*)",
      "dest": "/api/proxy/spatial.js"
    },
    {
      "src": "/api/property/(.*)",
      "dest": "/api/proxy/property.js"
    },
    {
      "src": "/functions/(.*)",
      "dest": "/api/supabase/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],

  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        },
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate=300"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],

  "redirects": [
    {
      "source": "/properties",
      "destination": "/properties/search",
      "permanent": false
    },
    {
      "source": "/analysis",
      "destination": "/properties/analysis",
      "permanent": false
    }
  ],

  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    }
  ],

  "functions": {
    "api/proxy/*.js": {
      "maxDuration": 30
    },
    "api/analysis/*.js": {
      "maxDuration": 60
    }
  },

  "regions": ["syd1", "sfo1", "lhr1"],

  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  }
}
```

### Serverless Functions for Property APIs

```typescript
// api/proxy/eplanning.ts - NSW ePlanning API proxy
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'crypto'

interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

// In-memory cache for development (use Redis in production)
const cache = new Map<string, CacheEntry>()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path, ...queryParams } = req.query
    const propertyId = Array.isArray(path) ? path[0] : path

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID required' })
    }

    // Create cache key
    const cacheKey = createHash('md5')
      .update(`eplanning:${propertyId}:${JSON.stringify(queryParams)}`)
      .digest('hex')

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expiry) {
      res.setHeader('X-Cache', 'HIT')
      return res.json(cached.data)
    }

    // Fetch from NSW ePlanning API
    const ePlanningUrl = `${process.env.EPLANNING_API_BASE}/property/${propertyId}`
    const apiResponse = await fetch(ePlanningUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.EPLANNING_API_KEY}`,
        'User-Agent': 'PropertyPlatform/1.0',
        'Accept': 'application/json'
      }
    })

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) {
        return res.status(404).json({ error: 'Property not found' })
      }
      if (apiResponse.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: apiResponse.headers.get('Retry-After') || '60'
        })
      }
      throw new Error(`ePlanning API error: ${apiResponse.status}`)
    }

    const data = await apiResponse.json()

    // Transform data for our platform
    const transformedData = {
      propertyId,
      address: data.propertyAddress,
      zoning: {
        primary: data.zoningCode,
        description: data.zoningDescription
      },
      planningControls: {
        maximumHeight: data.developmentControls?.heightLimit,
        floorSpaceRatio: data.developmentControls?.fsrRatio,
        setbacks: {
          front: data.developmentControls?.frontSetback,
          side: data.developmentControls?.sideSetback,
          rear: data.developmentControls?.rearSetback
        }
      },
      constraints: {
        heritage: data.constraints?.heritage || false,
        floodProne: data.constraints?.flooding || false,
        bushfireRisk: data.constraints?.bushfire || 'none',
        contamination: data.constraints?.contamination || false
      },
      lastUpdated: new Date().toISOString()
    }

    // Cache the result (1 hour for property data)
    cache.set(cacheKey, {
      data: transformedData,
      timestamp: Date.now(),
      expiry: Date.now() + (60 * 60 * 1000) // 1 hour
    })

    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    
    return res.json(transformedData)

  } catch (error) {
    console.error('ePlanning proxy error:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
```

### Environment-Specific Deployments

```typescript
// scripts/deploy.ts - Automated deployment script
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  vercelProject: string
  domain?: string
  environmentVars: Record<string, string>
  buildCommand?: string
  regions: string[]
}

class PropertyPlatformDeployer {
  private configs: Record<string, DeploymentConfig> = {
    development: {
      environment: 'development',
      vercelProject: 'property-platform-dev',
      environmentVars: {
        'VITE_SUPABASE_URL': process.env.DEV_SUPABASE_URL!,
        'VITE_SUPABASE_ANON_KEY': process.env.DEV_SUPABASE_ANON_KEY!,
        'EPLANNING_API_KEY': process.env.DEV_EPLANNING_API_KEY!,
        'NODE_ENV': 'development'
      },
      regions: ['syd1']
    },
    staging: {
      environment: 'staging',
      vercelProject: 'property-platform-staging',
      domain: 'staging.propertyplatform.com',
      environmentVars: {
        'VITE_SUPABASE_URL': process.env.STAGING_SUPABASE_URL!,
        'VITE_SUPABASE_ANON_KEY': process.env.STAGING_SUPABASE_ANON_KEY!,
        'EPLANNING_API_KEY': process.env.STAGING_EPLANNING_API_KEY!,
        'NODE_ENV': 'production'
      },
      regions: ['syd1', 'sfo1']
    },
    production: {
      environment: 'production',
      vercelProject: 'property-platform',
      domain: 'propertyplatform.com',
      environmentVars: {
        'VITE_SUPABASE_URL': process.env.PROD_SUPABASE_URL!,
        'VITE_SUPABASE_ANON_KEY': process.env.PROD_SUPABASE_ANON_KEY!,
        'EPLANNING_API_KEY': process.env.PROD_EPLANNING_API_KEY!,
        'NODE_ENV': 'production'
      },
      buildCommand: 'npm run build:production',
      regions: ['syd1', 'sfo1', 'lhr1']
    }
  }

  async deploy(environment: string): Promise<void> {
    const config = this.configs[environment]
    if (!config) {
      throw new Error(`Invalid environment: ${environment}`)
    }

    console.log(`🚀 Deploying Property Platform to ${environment}...`)

    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks(config)

      // Set environment variables
      await this.setEnvironmentVariables(config)

      // Run build
      await this.runBuild(config)

      // Deploy to Vercel
      await this.deployToVercel(config)

      // Post-deployment verification
      await this.verifyDeployment(config)

      console.log(`✅ Successfully deployed to ${environment}`)

    } catch (error) {
      console.error(`❌ Deployment to ${environment} failed:`, error)
      throw error
    }
  }

  private async runPreDeploymentChecks(config: DeploymentConfig): Promise<void> {
    console.log('🔍 Running pre-deployment checks...')

    // Check required environment variables
    for (const [key, value] of Object.entries(config.environmentVars)) {
      if (!value || value === 'undefined') {
        throw new Error(`Missing required environment variable: ${key}`)
      }
    }

    // Run tests
    console.log('🧪 Running tests...')
    execSync('npm run test', { stdio: 'inherit' })

    // Type checking
    console.log('🔬 Running type checks...')
    execSync('npm run type-check', { stdio: 'inherit' })

    // Linting
    console.log('🧹 Running linter...')
    execSync('npm run lint', { stdio: 'inherit' })

    console.log('✅ Pre-deployment checks passed')
  }

  private async setEnvironmentVariables(config: DeploymentConfig): Promise<void> {
    console.log('⚙️ Setting environment variables...')

    for (const [key, value] of Object.entries(config.environmentVars)) {
      try {
        execSync(
          `vercel env add ${key} ${config.environment} --force`,
          { 
            input: value,
            stdio: ['pipe', 'inherit', 'inherit']
          }
        )
      } catch (error) {
        console.warn(`Warning: Could not set environment variable ${key}`)
      }
    }
  }

  private async runBuild(config: DeploymentConfig): Promise<void> {
    console.log('🏗️ Building application...')

    const buildCommand = config.buildCommand || 'npm run build'
    
    // Set environment variables for build
    const buildEnv = {
      ...process.env,
      ...config.environmentVars
    }

    execSync(buildCommand, { 
      stdio: 'inherit',
      env: buildEnv
    })

    console.log('✅ Build completed')
  }

  private async deployToVercel(config: DeploymentConfig): Promise<void> {
    console.log('🌐 Deploying to Vercel...')

    let deployCommand = `vercel --prod --confirm`
    
    if (config.environment !== 'production') {
      deployCommand = 'vercel --confirm'
    }

    // Deploy
    const deploymentUrl = execSync(deployCommand, { encoding: 'utf-8' }).trim()
    
    console.log(`📡 Deployed to: ${deploymentUrl}`)

    // Set up custom domain for production/staging
    if (config.domain) {
      try {
        execSync(`vercel domains add ${config.domain} --scope ${config.vercelProject}`)
        execSync(`vercel alias ${deploymentUrl} ${config.domain}`)
        console.log(`🔗 Custom domain configured: https://${config.domain}`)
      } catch (error) {
        console.warn('Warning: Could not configure custom domain')
      }
    }
  }

  private async verifyDeployment(config: DeploymentConfig): Promise<void> {
    console.log('🔍 Verifying deployment...')

    const baseUrl = config.domain 
      ? `https://${config.domain}`
      : await this.getDeploymentUrl(config)

    // Health check
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`)
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`)
      }
      console.log('✅ Health check passed')
    } catch (error) {
      console.warn('⚠️ Health check failed:', error.message)
    }

    // Test property search endpoint
    try {
      const searchResponse = await fetch(`${baseUrl}/api/properties?limit=1`)
      if (!searchResponse.ok) {
        throw new Error(`Property search test failed: ${searchResponse.status}`)
      }
      console.log('✅ Property search endpoint working')
    } catch (error) {
      console.warn('⚠️ Property search test failed:', error.message)
    }

    console.log('✅ Deployment verification completed')
  }

  private async getDeploymentUrl(config: DeploymentConfig): Promise<string> {
    const output = execSync('vercel ls --scope ${config.vercelProject} --limit 1', {
      encoding: 'utf-8'
    })
    
    // Parse the latest deployment URL from vercel ls output
    const urlMatch = output.match(/https:\/\/[^\s]+/)
    if (!urlMatch) {
      throw new Error('Could not determine deployment URL')
    }
    
    return urlMatch[0]
  }

  async rollback(environment: string, version?: string): Promise<void> {
    console.log(`🔄 Rolling back ${environment}${version ? ` to ${version}` : ''}...`)

    const config = this.configs[environment]
    if (!config) {
      throw new Error(`Invalid environment: ${environment}`)
    }

    try {
      if (version) {
        // Rollback to specific version
        execSync(`vercel rollback ${version} --scope ${config.vercelProject}`)
      } else {
        // Rollback to previous version
        execSync(`vercel rollback --scope ${config.vercelProject}`)
      }

      console.log(`✅ Successfully rolled back ${environment}`)
    } catch (error) {
      console.error(`❌ Rollback failed:`, error)
      throw error
    }
  }
}

// CLI interface
const environment = process.argv[2]
const action = process.argv[3]

if (!environment || !['development', 'staging', 'production'].includes(environment)) {
  console.error('Usage: npm run deploy <environment> [rollback] [version]')
  console.error('Environments: development, staging, production')
  process.exit(1)
}

const deployer = new PropertyPlatformDeployer()

if (action === 'rollback') {
  const version = process.argv[4]
  deployer.rollback(environment, version).catch((error) => {
    console.error(error)
    process.exit(1)
  })
} else {
  deployer.deploy(environment).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
```

## Section 2: Cloudflare Workers for Edge Computing

### Global Property API Proxy

```typescript
// workers/property-proxy.ts - Global edge proxy for property APIs
interface Env {
  EPLANNING_API_KEY: string
  SPATIAL_API_KEY: string
  PROPERTY_CACHE: KVNamespace
  RATE_LIMITER: RateLimit
}

interface PropertyRequest {
  type: 'eplanning' | 'spatial' | 'property'
  endpoint: string
  params: Record<string, string>
}

class PropertyAPIProxy {
  private env: Env
  private cache: Cache

  constructor(env: Env) {
    this.env = env
    this.cache = caches.default
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Parse request type and endpoint
    const requestData = this.parseRequest(pathname, url.searchParams)
    if (!requestData) {
      return new Response('Invalid request path', { status: 400 })
    }

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return this.handleCORS()
    }

    // Rate limiting
    const rateLimitKey = this.getRateLimitKey(request)
    const rateLimitResult = await this.checkRateLimit(rateLimitKey)
    if (!rateLimitResult.allowed) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter.toString(),
          ...this.getCORSHeaders()
        }
      })
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(requestData)
      const cachedResponse = await this.cache.match(cacheKey)
      
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse)
        response.headers.set('X-Cache', 'HIT')
        response.headers.set('X-Edge-Location', this.getEdgeLocation())
        return this.addCORSHeaders(response)
      }

      // Fetch from origin API
      const apiResponse = await this.fetchFromAPI(requestData)
      
      // Transform and cache response
      const transformedData = await this.transformAPIResponse(requestData, apiResponse)
      
      const response = new Response(JSON.stringify(transformedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache': 'MISS',
          'X-Edge-Location': this.getEdgeLocation()
        }
      })

      // Cache the response
      await this.cache.put(cacheKey, response.clone())

      return this.addCORSHeaders(response)

    } catch (error) {
      console.error('API proxy error:', error)
      
      return new Response(JSON.stringify({
        error: 'API request failed',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...this.getCORSHeaders()
        }
      })
    }
  }

  private parseRequest(pathname: string, params: URLSearchParams): PropertyRequest | null {
    // Parse different API endpoints
    const ePlanningMatch = pathname.match(/^\/api\/eplanning\/(.+)$/)
    if (ePlanningMatch) {
      return {
        type: 'eplanning',
        endpoint: ePlanningMatch[1],
        params: Object.fromEntries(params.entries())
      }
    }

    const spatialMatch = pathname.match(/^\/api\/spatial\/(.+)$/)
    if (spatialMatch) {
      return {
        type: 'spatial',
        endpoint: spatialMatch[1],
        params: Object.fromEntries(params.entries())
      }
    }

    const propertyMatch = pathname.match(/^\/api\/property\/(.+)$/)
    if (propertyMatch) {
      return {
        type: 'property',
        endpoint: propertyMatch[1],
        params: Object.fromEntries(params.entries())
      }
    }

    return null
  }

  private async fetchFromAPI(requestData: PropertyRequest): Promise<any> {
    let apiUrl: string
    let headers: Record<string, string> = {
      'User-Agent': 'PropertyPlatform-EdgeProxy/1.0',
      'Accept': 'application/json'
    }

    switch (requestData.type) {
      case 'eplanning':
        apiUrl = `https://api.planning.nsw.gov.au/v1/${requestData.endpoint}`
        headers['Authorization'] = `Bearer ${this.env.EPLANNING_API_KEY}`
        break

      case 'spatial':
        apiUrl = `https://maps.six.nsw.gov.au/arcgis/rest/services/${requestData.endpoint}`
        headers['Authorization'] = `Bearer ${this.env.SPATIAL_API_KEY}`
        break

      case 'property':
        apiUrl = `https://api.property.nsw.gov.au/v1/${requestData.endpoint}`
        headers['X-API-Key'] = this.env.SPATIAL_API_KEY
        break

      default:
        throw new Error('Invalid API type')
    }

    // Add query parameters
    if (Object.keys(requestData.params).length > 0) {
      const url = new URL(apiUrl)
      Object.entries(requestData.params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
      apiUrl = url.toString()
    }

    const response = await fetch(apiUrl, {
      headers,
      cf: {
        // Cloudflare-specific options
        cacheTtl: 3600,
        cacheEverything: true
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async transformAPIResponse(requestData: PropertyRequest, data: any): Promise<any> {
    // Transform API responses to consistent format
    switch (requestData.type) {
      case 'eplanning':
        return this.transformEPlanningResponse(data)

      case 'spatial':
        return this.transformSpatialResponse(data)

      case 'property':
        return this.transformPropertyResponse(data)

      default:
        return data
    }
  }

  private transformEPlanningResponse(data: any): any {
    return {
      propertyId: data.propertyId,
      address: data.propertyAddress,
      zoning: {
        primary: data.zoningCode,
        description: data.zoningDescription,
        minimumLotSize: data.developmentControls?.minimumLotSize
      },
      planningControls: {
        maximumHeight: data.developmentControls?.heightLimit,
        floorSpaceRatio: data.developmentControls?.fsrRatio,
        setbacks: {
          front: data.developmentControls?.frontSetback,
          side: data.developmentControls?.sideSetback,
          rear: data.developmentControls?.rearSetback
        },
        buildingCoverage: data.developmentControls?.siteCoverage
      },
      constraints: {
        heritage: data.constraints?.heritage || false,
        heritageItems: data.constraints?.heritageItems || [],
        floodProne: data.constraints?.flooding || false,
        floodCategory: data.constraints?.floodCategory,
        bushfireRisk: data.constraints?.bushfire || 'none',
        contamination: data.constraints?.contamination || false,
        acidSulfate: data.constraints?.acidSulfate || false
      },
      dataSource: 'NSW_ePlanning',
      lastUpdated: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + 3600000).toISOString() // 1 hour
    }
  }

  private transformSpatialResponse(data: any): any {
    if (data.features) {
      return {
        type: 'FeatureCollection',
        features: data.features.map((feature: any) => ({
          type: 'Feature',
          properties: {
            ...feature.attributes,
            dataSource: 'NSW_SpatialServices'
          },
          geometry: this.transformGeometry(feature.geometry)
        })),
        dataSource: 'NSW_SpatialServices',
        lastUpdated: new Date().toISOString()
      }
    }

    return data
  }

  private transformGeometry(geometry: any): any {
    // Convert ESRI geometry to GeoJSON
    if (geometry.rings) {
      return {
        type: 'Polygon',
        coordinates: geometry.rings
      }
    }

    if (geometry.x && geometry.y) {
      return {
        type: 'Point',
        coordinates: [geometry.x, geometry.y]
      }
    }

    return geometry
  }

  private transformPropertyResponse(data: any): any {
    return {
      ...data,
      dataSource: 'NSW_PropertyData',
      lastUpdated: new Date().toISOString()
    }
  }

  private generateCacheKey(requestData: PropertyRequest): string {
    const key = `${requestData.type}:${requestData.endpoint}:${JSON.stringify(requestData.params)}`
    return `https://cache.propertyplatform.com/${btoa(key)}`
  }

  private async checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfter: number }> {
    // Implement rate limiting using Cloudflare's Rate Limiting API
    // This is a simplified implementation
    const limit = 100 // requests per minute
    const window = 60 // seconds

    const current = await this.env.PROPERTY_CACHE.get(`ratelimit:${key}`)
    const count = current ? parseInt(current) : 0

    if (count >= limit) {
      return { allowed: false, retryAfter: window }
    }

    // Increment counter
    await this.env.PROPERTY_CACHE.put(
      `ratelimit:${key}`,
      (count + 1).toString(),
      { expirationTtl: window }
    )

    return { allowed: true, retryAfter: 0 }
  }

  private getRateLimitKey(request: Request): string {
    // Use CF-Connecting-IP for rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    return `ip:${ip}`
  }

  private getEdgeLocation(): string {
    // Get Cloudflare edge location from request
    return globalThis.cf?.colo || 'unknown'
  }

  private handleCORS(): Response {
    return new Response(null, {
      status: 200,
      headers: this.getCORSHeaders()
    })
  }

  private getCORSHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  }

  private addCORSHeaders(response: Response): Response {
    const corsHeaders = this.getCORSHeaders()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}

// Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const proxy = new PropertyAPIProxy(env)
    return proxy.handleRequest(request)
  }
}
```

### Cloudflare Workers Deployment

```toml
# wrangler.toml - Cloudflare Workers configuration
name = "property-platform-proxy"
main = "src/index.ts"
compatibility_date = "2024-01-01"
workers_dev = false

# Production routes
routes = [
  { pattern = "api.propertyplatform.com/*", zone_name = "propertyplatform.com" }
]

# Environment variables
[env.production.vars]
ENVIRONMENT = "production"

# KV Namespaces for caching
[[env.production.kv_namespaces]]
binding = "PROPERTY_CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# Secrets (set via wrangler secret put)
# EPLANNING_API_KEY
# SPATIAL_API_KEY
# SUPABASE_SERVICE_ROLE_KEY

# Rate limiting
[[env.production.rate_limiting]]
zone_name = "propertyplatform.com"

# Analytics
[env.production.analytics_engine_datasets]
PROPERTY_ANALYTICS = "property_api_analytics"

# Staging environment
[env.staging]
name = "property-platform-proxy-staging"
routes = [
  { pattern = "staging-api.propertyplatform.com/*", zone_name = "propertyplatform.com" }
]

[env.staging.vars]
ENVIRONMENT = "staging"

[[env.staging.kv_namespaces]]
binding = "PROPERTY_CACHE"
id = "your-staging-kv-namespace-id"
```

## Section 3: Supabase Cloud Production Setup

### Production Database Configuration

```sql
-- Production database setup and optimization
-- Run these commands in Supabase SQL Editor

-- Enable necessary extensions for property platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for property data
CREATE TYPE property_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE analysis_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'analyst', 'viewer');

-- Organizations table with enhanced structure
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Subscription and billing
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    billing_email TEXT,
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    api_limits JSONB DEFAULT '{"monthly_requests": 1000, "concurrent_analyses": 5}',
    
    -- Compliance and auditing
    data_retention_days INTEGER DEFAULT 365,
    audit_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT organizations_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- User information
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    department TEXT,
    
    -- Access control
    role user_role DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'Australia/Sydney',
    notification_settings JSONB DEFAULT '{"email": true, "push": false}',
    
    -- Activity tracking
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    last_active TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^[\+]?[1-9][\d\s\-\(\)]{7,15}$'),
    CONSTRAINT profiles_timezone_valid CHECK (timezone IN (
        'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
        'Australia/Perth', 'Australia/Adelaide', 'Australia/Darwin',
        'Australia/Hobart', 'UTC'
    ))
);

-- Enhanced properties table for production
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- External references
    external_id TEXT,
    data_source TEXT DEFAULT 'manual',
    source_system_id TEXT,
    
    -- Property information
    basic_info JSONB NOT NULL DEFAULT '{}',
    financial_metrics JSONB DEFAULT '{}',
    planning_controls JSONB DEFAULT '{}',
    environmental_factors JSONB DEFAULT '{}',
    spatial_attributes JSONB DEFAULT '{}',
    
    -- Geospatial data
    location_point GEOGRAPHY(POINT, 4326),
    boundary_polygon GEOGRAPHY(POLYGON, 4326),
    
    -- Data quality and validation
    data_quality_score NUMERIC(3,2) CHECK (data_quality_score >= 0 AND data_quality_score <= 1),
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    validation_errors JSONB DEFAULT '[]',
    
    -- Status and lifecycle
    status property_status DEFAULT 'active',
    is_public BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full-text search
    search_vector TSVECTOR,
    
    -- Constraints
    UNIQUE(project_id, external_id),
    CONSTRAINT properties_basic_info_required CHECK (basic_info ? 'address'),
    CONSTRAINT properties_coordinates_valid CHECK (
        spatial_attributes->'coordinates' IS NULL OR 
        (spatial_attributes->'coordinates'->>'type' = 'Point' AND
         jsonb_array_length(spatial_attributes->'coordinates'->'coordinates') = 2)
    )
);

-- Property analysis results table
CREATE TABLE IF NOT EXISTS property_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Analysis configuration
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('financial', 'environmental', 'planning', 'development', 'comprehensive')),
    analysis_version TEXT DEFAULT '1.0',
    input_parameters JSONB NOT NULL DEFAULT '{}',
    
    -- Results
    results JSONB DEFAULT '{}',
    summary JSONB DEFAULT '{}',
    
    -- Processing information
    status analysis_status DEFAULT 'pending',
    processing_time_ms INTEGER,
    error_message TEXT,
    warnings JSONB DEFAULT '[]',
    
    -- Data sources and validation
    data_sources JSONB DEFAULT '[]',
    confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Scheduling and automation
    scheduled_by UUID REFERENCES profiles(id),
    parent_analysis_id UUID REFERENCES property_analysis(id),
    
    -- Timestamps
    created_by UUID REFERENCES profiles(id),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT analysis_completion_logic CHECK (
        (status = 'completed' AND completed_at IS NOT NULL AND results != '{}') OR
        (status != 'completed' AND (completed_at IS NULL OR results = '{}'))
    )
);

-- Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_organization_status 
ON properties(organization_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_location_point 
ON properties USING GIST(location_point) WHERE location_point IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search_vector 
ON properties USING GIN(search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_suburb 
ON properties USING GIN((basic_info->'suburb'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_zoning 
ON properties USING GIN((planning_controls->'zoning'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_price_range 
ON properties USING BTREE(((financial_metrics->>'estimated_value')::numeric)) 
WHERE financial_metrics ? 'estimated_value';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_property_type 
ON property_analysis(property_id, analysis_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_organization_recent 
ON property_analysis(organization_id, created_at DESC) WHERE status = 'completed';

-- Row Level Security policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;

-- Organization access policy
CREATE POLICY "Users can access their organization" ON organizations
    FOR ALL TO authenticated
    USING (id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Profile access policy
CREATE POLICY "Users can access profiles in their organization" ON profiles
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ) OR id = auth.uid()
    );

-- Property access policy with role-based permissions
CREATE POLICY "Property access by organization and role" ON properties
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (
                p.role IN ('admin', 'manager') OR 
                (p.role = 'analyst' AND properties.created_by = auth.uid()) OR
                (p.role = 'viewer' AND properties.is_public = true)
            )
        )
    );

-- Analysis access policy
CREATE POLICY "Analysis access by organization" ON property_analysis
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'address', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'suburb', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.planning_controls->'zoning'->>'primary', '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'description', '')), 'C');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_search_vector
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_property_search_vector();

-- Analysis performance monitoring
CREATE OR REPLACE FUNCTION log_analysis_performance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.processing_time_ms := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
        
        -- Log to analytics table for monitoring
        INSERT INTO analysis_performance_log (
            analysis_type,
            processing_time_ms,
            organization_id,
            created_at
        ) VALUES (
            NEW.analysis_type,
            NEW.processing_time_ms,
            NEW.organization_id,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_analysis_performance_trigger
    BEFORE UPDATE ON property_analysis
    FOR EACH ROW EXECUTE FUNCTION log_analysis_performance();
```

## Practical Exercises

### Exercise 1: Vercel Deployment Setup
Configure complete Vercel deployment for a property platform including:
- Multi-environment setup (dev/staging/production)
- Serverless API functions for property data
- Custom domain configuration
- Performance optimization

### Exercise 2: Cloudflare Workers Implementation
Build a global edge proxy system:
- Government API proxy with caching
- Rate limiting and security
- Geographic routing optimization
- Performance monitoring

### Exercise 3: Supabase Production Configuration
Set up production-ready Supabase environment:
- Database schema with RLS policies
- Performance optimization and indexing
- Backup and monitoring configuration
- Multi-region setup

### Exercise 4: Multi-Environment CI/CD
Create automated deployment pipeline:
- Environment-specific configurations
- Automated testing and validation
- Rollback capabilities
- Performance monitoring

## Summary

This module covered comprehensive cloud platform deployment strategies for property management applications:

- **Vercel Deployment**: Advanced configuration for React applications with serverless functions
- **Cloudflare Workers**: Global edge computing for API proxying and performance optimization  
- **Supabase Cloud**: Production database setup with security and performance considerations
- **Multi-Environment Strategy**: Proper separation and automation for development workflows
- **Performance Optimization**: Global distribution and caching strategies

These cloud deployment skills enable building scalable, performant property platforms that serve users globally with optimal performance and reliability.

## Navigation
- [Next: Module 7.2 - Performance and Monitoring →](./Module-7.2-Performance-and-Monitoring.md)
- [← Previous: Phase 6 - Build Tools and Development Workflow](../Phase-6-Build-Tools-and-Development-Workflow/README.md)
- [↑ Back to Phase 7 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)