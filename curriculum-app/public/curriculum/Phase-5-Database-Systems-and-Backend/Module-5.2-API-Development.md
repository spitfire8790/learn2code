# Module 5.2: API Development

## Learning Objectives
By the end of this module, you will be able to:
- Design RESTful APIs for property management systems
- Implement Supabase Edge Functions for serverless API endpoints
- Build real-time subscriptions for collaborative property analysis
- Handle complex business logic in serverless functions
- Implement API authentication and authorization
- Design error handling and logging strategies

## Prerequisites
- Understanding of HTTP methods and REST principles
- Knowledge of JavaScript/TypeScript and async/await
- Familiarity with Supabase and PostgreSQL (Module 5.1)
- Basic understanding of serverless computing concepts

## Introduction

Modern property management platforms require robust APIs to handle complex workflows: property data ingestion, analysis calculations, report generation, and real-time collaboration. This module explores API development using Supabase Edge Functions, which provide serverless compute capabilities with TypeScript support and direct database access.

**Why Serverless APIs for Property Applications?**
- **Scalability**: Automatic scaling based on demand
- **Cost Efficiency**: Pay only for actual usage
- **Performance**: Edge deployment for global accessibility
- **Integration**: Direct Supabase database and auth integration
- **TypeScript Support**: Type-safe API development
- **Real-time Capabilities**: WebSocket support for live updates

## Section 1: API Architecture and Design

### RESTful API Design for Property Platforms

Property management systems typically require these API categories:

```typescript
// API endpoint structure for property platform
const API_ENDPOINTS = {
  // Authentication and user management
  auth: {
    signUp: 'POST /auth/signup',
    signIn: 'POST /auth/signin',
    refresh: 'POST /auth/refresh',
    profile: 'GET /auth/profile'
  },
  
  // Property data management
  properties: {
    list: 'GET /properties',
    create: 'POST /properties',
    get: 'GET /properties/:id',
    update: 'PUT /properties/:id',
    delete: 'DELETE /properties/:id',
    search: 'POST /properties/search'
  },
  
  // Analysis and calculations
  analysis: {
    calculate: 'POST /analysis/calculate',
    results: 'GET /analysis/:id',
    compare: 'POST /analysis/compare',
    export: 'GET /analysis/:id/export'
  },
  
  // Real-time collaboration
  realtime: {
    userStatus: 'WebSocket /realtime/user-status',
    propertyUpdates: 'WebSocket /realtime/property-updates',
    analysisProgress: 'WebSocket /realtime/analysis-progress'
  }
}
```

### Request/Response Patterns

Establish consistent patterns for API communication:

```typescript
// Standard API request/response interfaces
interface APIRequest<T = any> {
  data?: T;
  filters?: PropertyFilters;
  pagination?: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
  };
  options?: RequestOptions;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    duration?: number;
  };
}

// Property-specific interfaces
interface PropertyFilters {
  location?: {
    suburb?: string;
    state?: string;
    coordinates?: [number, number];
    radius?: number;
  };
  financial?: {
    minValue?: number;
    maxValue?: number;
    minYield?: number;
    maxYield?: number;
  };
  planning?: {
    zoning?: string[];
    landUse?: string[];
  };
  environmental?: {
    floodRisk?: string;
    contamination?: boolean;
    heritage?: boolean;
  };
}
```

## Section 2: Supabase Edge Functions

### Setting Up Edge Functions

Supabase Edge Functions run on Deno runtime with TypeScript support:

```typescript
// supabase/functions/property-analysis/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PropertyAnalysisRequest {
  propertyId: string;
  analysisType: 'financial' | 'environmental' | 'planning';
  parameters: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate request
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestData: PropertyAnalysisRequest = await req.json()

    // Perform property analysis
    const result = await performPropertyAnalysis(supabase, user.id, requestData)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Property analysis error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'ANALYSIS_ERROR',
          message: error.message 
        } 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function performPropertyAnalysis(
  supabase: any, 
  userId: string, 
  request: PropertyAnalysisRequest
) {
  // Validate user has access to property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*, projects!inner(organization_id)')
    .eq('id', request.propertyId)
    .single()

  if (propertyError) throw new Error('Property not found')

  // Check user organization access
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()

  if (profile.organization_id !== property.projects.organization_id) {
    throw new Error('Access denied')
  }

  // Perform analysis based on type
  let analysisResult
  switch (request.analysisType) {
    case 'financial':
      analysisResult = await performFinancialAnalysis(property, request.parameters)
      break
    case 'environmental':
      analysisResult = await performEnvironmentalAnalysis(property, request.parameters)
      break
    case 'planning':
      analysisResult = await performPlanningAnalysis(property, request.parameters)
      break
    default:
      throw new Error('Invalid analysis type')
  }

  // Store analysis result
  const { data: analysis } = await supabase
    .from('property_analysis')
    .insert({
      property_id: request.propertyId,
      analysis_type: request.analysisType,
      input_parameters: request.parameters,
      results: analysisResult,
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  return analysis
}
```

### Complex Business Logic Implementation

Property analysis often requires complex calculations and external API calls:

```typescript
// Financial analysis implementation
async function performFinancialAnalysis(property: any, parameters: any) {
  const {
    purchasePrice,
    renovationCosts = 0,
    rentalIncome,
    managementFees = 0.08,
    vacancy = 0.04,
    annualGrowth = 0.03
  } = parameters

  // Calculate cash flow metrics
  const grossRentalYield = (rentalIncome * 12) / purchasePrice * 100
  const netRentalIncome = rentalIncome * 12 * (1 - vacancy) * (1 - managementFees)
  const netRentalYield = netRentalIncome / (purchasePrice + renovationCosts) * 100

  // Calculate holding costs
  const councilRates = await getCouncilRates(property.basic_info.address)
  const waterRates = await getWaterRates(property.basic_info.address)
  const insurance = purchasePrice * 0.002 // Estimate 0.2% of property value
  
  const annualHoldingCosts = councilRates + waterRates + insurance

  // 10-year projection
  const projections = []
  let currentValue = purchasePrice + renovationCosts
  let currentRent = rentalIncome

  for (let year = 1; year <= 10; year++) {
    currentValue *= (1 + annualGrowth)
    currentRent *= (1 + annualGrowth)
    
    const grossIncome = currentRent * 12
    const netIncome = grossIncome * (1 - vacancy) * (1 - managementFees)
    const totalCosts = annualHoldingCosts * Math.pow(1.025, year) // 2.5% cost inflation
    const cashFlow = netIncome - totalCosts

    projections.push({
      year,
      propertyValue: Math.round(currentValue),
      rentalIncome: Math.round(currentRent),
      grossIncome: Math.round(grossIncome),
      netIncome: Math.round(netIncome),
      holdingCosts: Math.round(totalCosts),
      cashFlow: Math.round(cashFlow),
      yield: (netIncome / currentValue * 100).toFixed(2)
    })
  }

  return {
    summary: {
      grossRentalYield: grossRentalYield.toFixed(2),
      netRentalYield: netRentalYield.toFixed(2),
      annualCashFlow: Math.round(netRentalIncome - annualHoldingCosts),
      totalInvestment: purchasePrice + renovationCosts
    },
    projections,
    assumptions: {
      vacancyRate: vacancy,
      managementFees,
      annualGrowth,
      calculatedAt: new Date().toISOString()
    }
  }
}

// Environmental analysis with external API calls
async function performEnvironmentalAnalysis(property: any, parameters: any) {
  const coordinates = property.spatial_attributes?.coordinates
  if (!coordinates) {
    throw new Error('Property coordinates required for environmental analysis')
  }

  // Fetch flood risk data from government API
  const floodRisk = await fetchFloodRiskData(coordinates)
  
  // Check contaminated sites register
  const contaminationRisk = await checkContaminatedSites(coordinates)
  
  // Heritage listings check
  const heritageListings = await checkHeritageListings(property.basic_info.address)
  
  // Bushfire risk assessment
  const bushfireRisk = await assessBushfireRisk(coordinates)
  
  // Biodiversity constraints
  const biodiversityConstraints = await checkBiodiversityConstraints(coordinates)

  return {
    riskAssessment: {
      floodRisk: {
        level: floodRisk.riskLevel,
        details: floodRisk.details,
        affectedBy: floodRisk.affectedEvents
      },
      contamination: {
        risk: contaminationRisk.risk,
        nearbyContaminatedSites: contaminationRisk.sites,
        distance: contaminationRisk.nearestDistance
      },
      heritage: {
        isListed: heritageListings.isListed,
        listings: heritageListings.listings,
        restrictions: heritageListings.restrictions
      },
      bushfire: {
        riskLevel: bushfireRisk.level,
        zoning: bushfireRisk.zoning,
        requirements: bushfireRisk.buildingRequirements
      },
      biodiversity: {
        constraints: biodiversityConstraints.constraints,
        offsetRequirements: biodiversityConstraints.offsets
      }
    },
    overallRisk: calculateOverallEnvironmentalRisk({
      floodRisk,
      contaminationRisk,
      bushfireRisk,
      biodiversityConstraints
    }),
    recommendations: generateEnvironmentalRecommendations({
      floodRisk,
      contaminationRisk,
      heritageListings,
      bushfireRisk,
      biodiversityConstraints
    })
  }
}
```

## Section 3: Real-time Subscriptions

### WebSocket Implementation

Real-time features for collaborative property analysis:

```typescript
// supabase/functions/user-status/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface UserStatusUpdate {
  userId: string;
  organizationId: string;
  status: 'online' | 'offline' | 'away';
  currentProject?: string;
  lastActivity: string;
}

serve(async (req) => {
  const url = new URL(req.url)
  
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let userId: string | null = null
    let organizationId: string | null = null

    socket.onopen = () => {
      console.log("WebSocket connection opened")
    }

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'authenticate':
            const { data: { user } } = await supabase.auth.getUser(message.token)
            if (user) {
              userId = user.id
              
              // Get user's organization
              const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', userId)
                .single()
              
              organizationId = profile?.organization_id
              
              // Update user status to online
              await updateUserStatus(supabase, userId, organizationId, 'online')
              
              socket.send(JSON.stringify({
                type: 'authenticated',
                userId,
                organizationId
              }))
            }
            break

          case 'status_update':
            if (userId && organizationId) {
              await updateUserStatus(
                supabase, 
                userId, 
                organizationId, 
                message.status,
                message.currentProject
              )
              
              // Broadcast to other users in organization
              await broadcastToOrganization(supabase, organizationId, {
                type: 'user_status_changed',
                userId,
                status: message.status,
                currentProject: message.currentProject,
                timestamp: new Date().toISOString()
              })
            }
            break

          case 'heartbeat':
            if (userId && organizationId) {
              await updateUserActivity(supabase, userId)
            }
            socket.send(JSON.stringify({ type: 'heartbeat_ack' }))
            break
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
        socket.send(JSON.stringify({
          type: 'error',
          message: error.message
        }))
      }
    }

    socket.onclose = async () => {
      if (userId && organizationId) {
        await updateUserStatus(supabase, userId, organizationId, 'offline')
        await broadcastToOrganization(supabase, organizationId, {
          type: 'user_status_changed',
          userId,
          status: 'offline',
          timestamp: new Date().toISOString()
        })
      }
      console.log("WebSocket connection closed")
    }

    return response
  }

  return new Response("WebSocket endpoint", { status: 200 })
})

async function updateUserStatus(
  supabase: any,
  userId: string,
  organizationId: string,
  status: string,
  currentProject?: string
) {
  await supabase
    .from('user_status')
    .upsert({
      user_id: userId,
      organization_id: organizationId,
      status,
      current_project: currentProject,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
}

async function broadcastToOrganization(
  supabase: any,
  organizationId: string,
  message: any
) {
  // Implementation would use Supabase realtime channels
  // or a message queue for broadcasting to all connected clients
  await supabase
    .from('realtime_messages')
    .insert({
      organization_id: organizationId,
      message_type: message.type,
      payload: message,
      created_at: new Date().toISOString()
    })
}
```

### Database Triggers for Real-time Updates

Automatically broadcast database changes:

```sql
-- Function to notify realtime changes
CREATE OR REPLACE FUNCTION notify_property_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify about property updates
    PERFORM pg_notify(
        'property_changes',
        json_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'organization_id', COALESCE(NEW.organization_id, OLD.organization_id),
            'property_id', COALESCE(NEW.id, OLD.id),
            'timestamp', NOW()
        )::text
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for property table changes
CREATE TRIGGER property_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW EXECUTE FUNCTION notify_property_changes();

-- Trigger for analysis results
CREATE TRIGGER analysis_changes_trigger
    AFTER INSERT OR UPDATE ON property_analysis
    FOR EACH ROW EXECUTE FUNCTION notify_property_changes();
```

## Section 4: Error Handling and Logging

### Comprehensive Error Handling

```typescript
// Error handling utilities
class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Error codes for property platform
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Property errors
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  INVALID_PROPERTY_DATA: 'INVALID_PROPERTY_DATA',
  PROPERTY_ACCESS_DENIED: 'PROPERTY_ACCESS_DENIED',
  
  // Analysis errors
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
}

// Error handler wrapper
export function withErrorHandling(handler: Function) {
  return async (req: Request) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof APIError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details
            }
          }),
          {
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Unexpected errors
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: ERROR_CODES.SERVICE_UNAVAILABLE,
            message: 'An unexpected error occurred'
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Validation utilities
export function validatePropertyAnalysisRequest(data: any): PropertyAnalysisRequest {
  if (!data.propertyId || typeof data.propertyId !== 'string') {
    throw new APIError(
      'Property ID is required',
      ERROR_CODES.INVALID_PARAMETERS,
      400
    )
  }
  
  if (!data.analysisType || !['financial', 'environmental', 'planning'].includes(data.analysisType)) {
    throw new APIError(
      'Valid analysis type is required',
      ERROR_CODES.INVALID_PARAMETERS,
      400
    )
  }
  
  if (!data.parameters || typeof data.parameters !== 'object') {
    throw new APIError(
      'Analysis parameters are required',
      ERROR_CODES.INVALID_PARAMETERS,
      400
    )
  }
  
  return data as PropertyAnalysisRequest
}
```

### Logging and Monitoring

```typescript
// Logging utilities
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  userId?: string;
  organizationId?: string;
  requestId?: string;
  timestamp: string;
}

export class Logger {
  private requestId: string
  private userId?: string
  private organizationId?: string

  constructor(requestId: string, userId?: string, organizationId?: string) {
    this.requestId = requestId
    this.userId = userId
    this.organizationId = organizationId
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      userId: this.userId,
      organizationId: this.organizationId,
      requestId: this.requestId,
      timestamp: new Date().toISOString()
    }

    console.log(JSON.stringify(entry))
    
    // In production, send to logging service
    // await sendToLoggingService(entry)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }
}

// Request logging middleware
export function withLogging(handler: Function) {
  return async (req: Request) => {
    const requestId = crypto.randomUUID()
    const startTime = Date.now()
    
    // Extract user info from auth header
    let userId: string | undefined
    let organizationId: string | undefined
    
    try {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        // Extract user info from token (implementation depends on auth system)
        const userInfo = await extractUserFromToken(authHeader)
        userId = userInfo?.userId
        organizationId = userInfo?.organizationId
      }
    } catch (error) {
      // Continue without user info
    }
    
    const logger = new Logger(requestId, userId, organizationId)
    
    logger.info('Request started', {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('User-Agent')
    })
    
    try {
      const response = await handler(req, logger)
      const duration = Date.now() - startTime
      
      logger.info('Request completed', {
        status: response.status,
        duration
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error('Request failed', {
        error: error.message,
        stack: error.stack,
        duration
      })
      
      throw error
    }
  }
}
```

## Practical Exercises

### Exercise 1: Property Search API
Build a comprehensive property search API with:
- Multiple filter criteria
- Pagination and sorting
- Performance optimization
- Error handling

### Exercise 2: Analysis Engine
Create a property analysis API that:
- Handles multiple analysis types
- Integrates external data sources
- Stores results in database
- Provides progress updates

### Exercise 3: Real-time Collaboration
Implement real-time features for:
- User status tracking
- Live property updates
- Collaborative editing
- Conflict resolution

### Exercise 4: API Documentation
Document your APIs with:
- OpenAPI/Swagger specifications
- Usage examples
- Error code reference
- Rate limiting information

## Summary

This module covered comprehensive API development for property management platforms:

- **API Design**: RESTful architecture and consistent patterns
- **Edge Functions**: Serverless implementation with Supabase
- **Business Logic**: Complex property analysis algorithms
- **Real-time Features**: WebSocket implementation for collaboration
- **Error Handling**: Comprehensive error management and logging
- **Performance**: Optimization strategies for property data

These API development skills enable building scalable, maintainable backend systems for property analysis platforms.

## Navigation
- [Next: Module 5.3 - Data Migration and Management →](./Module-5.3-Data-Migration-and-Management.md)
- [← Previous: Module 5.1 - Supabase and PostgreSQL](./Module-5.1-Supabase-and-PostgreSQL.md)
- [↑ Back to Phase 5 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)