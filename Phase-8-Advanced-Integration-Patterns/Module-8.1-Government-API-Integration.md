# Module 8.1: Government API Integration

## Learning Objectives
By the end of this module, you will be able to:
- Integrate with NSW government APIs for comprehensive property data access
- Implement secure authentication and authorization for government services
- Build robust data aggregation and validation systems
- Create real-time synchronization patterns for government data updates
- Handle API rate limiting, caching, and error recovery strategies
- Ensure compliance with government data usage policies and security requirements

## Prerequisites
- Understanding of API development and integration (Module 5.2)
- Knowledge of authentication and security patterns
- Familiarity with data validation and transformation
- Experience with error handling and resilience patterns

## Introduction

Property management platforms require comprehensive integration with NSW government data sources to provide accurate, up-to-date property information. This module explores building robust, scalable integrations with key government APIs including the NSW ePlanning Portal, Spatial Services, and Property databases.

**Why Government API Integration Matters:**
- **Data Accuracy**: Official government sources provide authoritative property information
- **Regulatory Compliance**: Direct access to planning controls and zoning information
- **Real-time Updates**: Access to the latest development applications and approvals
- **Comprehensive Coverage**: State-wide property data coverage and consistency
- **Legal Requirements**: Some property analyses require official government data
- **Market Intelligence**: Access to sales data, development trends, and planning changes

## Section 1: NSW ePlanning Portal Integration

### Authentication and Authorization

```typescript
// src/services/government-api/eplanning-auth.ts
import { createHash, createHmac } from 'crypto'

interface EPlanningCredentials {
  clientId: string
  clientSecret: string
  apiKey: string
  environment: 'sandbox' | 'production'
}

interface EPlanningToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
  tokenType: string
  scope: string[]
}

class EPlanningAuthService {
  private credentials: EPlanningCredentials
  private currentToken?: EPlanningToken
  private tokenRefreshPromise?: Promise<EPlanningToken>

  constructor(credentials: EPlanningCredentials) {
    this.credentials = credentials
  }

  async getValidToken(): Promise<string> {
    // Check if current token is still valid
    if (this.currentToken && this.isTokenValid(this.currentToken)) {
      return this.currentToken.accessToken
    }

    // Refresh token if available and valid
    if (this.currentToken?.refreshToken) {
      try {
        this.currentToken = await this.refreshAccessToken(this.currentToken.refreshToken)
        return this.currentToken.accessToken
      } catch (error) {
        console.warn('Token refresh failed, attempting new authentication:', error)
      }
    }

    // Get new token
    this.currentToken = await this.authenticateWithClientCredentials()
    return this.currentToken.accessToken
  }

  private async authenticateWithClientCredentials(): Promise<EPlanningToken> {
    const baseUrl = this.getBaseUrl()
    const tokenEndpoint = `${baseUrl}/oauth2/token`

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      scope: 'planning:read property:read development:read'
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-API-Key': this.credentials.apiKey
      },
      body: body.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ePlanning authentication failed: ${response.status} ${errorText}`)
    }

    const tokenData = await response.json()
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      tokenType: tokenData.token_type,
      scope: tokenData.scope?.split(' ') || []
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<EPlanningToken> {
    // Prevent multiple simultaneous refresh attempts
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise
    }

    this.tokenRefreshPromise = this._performTokenRefresh(refreshToken)
    
    try {
      const token = await this.tokenRefreshPromise
      return token
    } finally {
      this.tokenRefreshPromise = undefined
    }
  }

  private async _performTokenRefresh(refreshToken: string): Promise<EPlanningToken> {
    const baseUrl = this.getBaseUrl()
    const tokenEndpoint = `${baseUrl}/oauth2/token`

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-API-Key': this.credentials.apiKey
      },
      body: body.toString()
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const tokenData = await response.json()
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken, // Keep existing if not provided
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      tokenType: tokenData.token_type,
      scope: tokenData.scope?.split(' ') || []
    }
  }

  private isTokenValid(token: EPlanningToken): boolean {
    // Add 5 minute buffer for token expiry
    return Date.now() < (token.expiresAt - 300000)
  }

  private getBaseUrl(): string {
    return this.credentials.environment === 'production'
      ? 'https://api.planning.nsw.gov.au'
      : 'https://api-sandbox.planning.nsw.gov.au'
  }

  // Create authenticated request headers
  async createAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await this.getValidToken()
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-API-Key': this.credentials.apiKey,
      'Accept': 'application/json',
      'User-Agent': 'PropertyPlatform/1.0 (property-analysis)',
      ...additionalHeaders
    }
  }
}

export { EPlanningAuthService, EPlanningCredentials, EPlanningToken }
```

### Property Information API Integration

```typescript
// src/services/government-api/eplanning-client.ts
import { EPlanningAuthService } from './eplanning-auth'

interface PropertySearchParams {
  address?: string
  lotNumber?: string
  dpNumber?: string
  suburb?: string
  postcode?: string
  coordinates?: {
    latitude: number
    longitude: number
    radius?: number // meters
  }
}

interface PropertyDetails {
  propertyId: string
  address: PropertyAddress
  landInformation: LandInformation
  planningControls: PlanningControls
  constraints: PropertyConstraints
  developmentHistory: DevelopmentApplication[]
  lastUpdated: string
}

interface PropertyAddress {
  fullAddress: string
  streetNumber: string
  streetName: string
  streetType: string
  suburb: string
  postcode: string
  state: string
  unitNumber?: string
  lotNumber?: string
  dpNumber?: string
}

interface LandInformation {
  lotDetails: LotDetail[]
  landArea: number // square meters
  landUse: string
  landValue: number
  zoning: ZoningInformation
}

interface ZoningInformation {
  primaryZone: string
  zoneDescription: string
  permittedUses: string[]
  prohibitedUses: string[]
  maximumHeight?: number
  floorSpaceRatio?: number
  minimumLotSize?: number
  buildingCoverage?: number
}

interface PlanningControls {
  heightRestrictions: HeightRestriction[]
  setbackRequirements: SetbackRequirement[]
  densityControls: DensityControl[]
  specialProvisions: SpecialProvision[]
  heritageConstraints: HeritageConstraint[]
  environmentalConstraints: EnvironmentalConstraint[]
}

interface PropertyConstraints {
  floodRisk: FloodRiskAssessment
  contamination: ContaminationAssessment
  bushfireRisk: BushfireRiskAssessment
  acidSulfateSoil: boolean
  salinity: boolean
  landslide: boolean
  coastalHazards: CoastalHazardAssessment
}

class EPlanningClient {
  private authService: EPlanningAuthService
  private baseUrl: string
  private rateLimiter: RateLimiter

  constructor(authService: EPlanningAuthService) {
    this.authService = authService
    this.baseUrl = this.authService['getBaseUrl']() // Access private method
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 10,
      burstCapacity: 50
    })
  }

  async searchProperties(params: PropertySearchParams): Promise<PropertyDetails[]> {
    await this.rateLimiter.acquire()

    const searchParams = new URLSearchParams()
    
    if (params.address) searchParams.set('address', params.address)
    if (params.lotNumber) searchParams.set('lot', params.lotNumber)
    if (params.dpNumber) searchParams.set('dp', params.dpNumber)
    if (params.suburb) searchParams.set('suburb', params.suburb)
    if (params.postcode) searchParams.set('postcode', params.postcode)
    
    if (params.coordinates) {
      searchParams.set('lat', params.coordinates.latitude.toString())
      searchParams.set('lng', params.coordinates.longitude.toString())
      if (params.coordinates.radius) {
        searchParams.set('radius', params.coordinates.radius.toString())
      }
    }

    const url = `${this.baseUrl}/v1/properties/search?${searchParams.toString()}`
    const headers = await this.authService.createAuthHeaders()

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new EPlanningAPIError(`Property search failed: ${response.status}`, response.status)
    }

    const data = await response.json()
    return data.properties.map((prop: any) => this.transformPropertyData(prop))
  }

  async getPropertyDetails(propertyId: string): Promise<PropertyDetails> {
    await this.rateLimiter.acquire()

    const url = `${this.baseUrl}/v1/properties/${propertyId}`
    const headers = await this.authService.createAuthHeaders()

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new EPlanningAPIError(`Property not found: ${propertyId}`, 404)
      }
      throw new EPlanningAPIError(`Failed to get property details: ${response.status}`, response.status)
    }

    const data = await response.json()
    return this.transformPropertyData(data)
  }

  async getPropertyPlanningHistory(propertyId: string): Promise<DevelopmentApplication[]> {
    await this.rateLimiter.acquire()

    const url = `${this.baseUrl}/v1/properties/${propertyId}/development-applications`
    const headers = await this.authService.createAuthHeaders()

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new EPlanningAPIError(`Failed to get planning history: ${response.status}`, response.status)
    }

    const data = await response.json()
    return data.applications.map((app: any) => this.transformDevelopmentApplication(app))
  }

  async getPropertyConstraints(propertyId: string): Promise<PropertyConstraints> {
    await this.rateLimiter.acquire()

    const url = `${this.baseUrl}/v1/properties/${propertyId}/constraints`
    const headers = await this.authService.createAuthHeaders()

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new EPlanningAPIError(`Failed to get property constraints: ${response.status}`, response.status)
    }

    const data = await response.json()
    return this.transformPropertyConstraints(data)
  }

  // Bulk property data retrieval
  async getBulkPropertyData(propertyIds: string[]): Promise<Map<string, PropertyDetails>> {
    const batchSize = 20 // API limit
    const results = new Map<string, PropertyDetails>()
    
    for (let i = 0; i < propertyIds.length; i += batchSize) {
      const batch = propertyIds.slice(i, i + batchSize)
      const batchResults = await this.processBatch(batch)
      
      batchResults.forEach((property, id) => {
        results.set(id, property)
      })
      
      // Rate limiting between batches
      if (i + batchSize < propertyIds.length) {
        await this.sleep(1000) // 1 second delay
      }
    }
    
    return results
  }

  private async processBatch(propertyIds: string[]): Promise<Map<string, PropertyDetails>> {
    await this.rateLimiter.acquire()

    const url = `${this.baseUrl}/v1/properties/batch`
    const headers = await this.authService.createAuthHeaders({
      'Content-Type': 'application/json'
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ propertyIds })
    })

    if (!response.ok) {
      throw new EPlanningAPIError(`Batch request failed: ${response.status}`, response.status)
    }

    const data = await response.json()
    const results = new Map<string, PropertyDetails>()
    
    data.properties.forEach((prop: any) => {
      const transformed = this.transformPropertyData(prop)
      results.set(transformed.propertyId, transformed)
    })
    
    return results
  }

  private transformPropertyData(rawData: any): PropertyDetails {
    return {
      propertyId: rawData.property_id,
      address: {
        fullAddress: rawData.address.full_address,
        streetNumber: rawData.address.street_number,
        streetName: rawData.address.street_name,
        streetType: rawData.address.street_type,
        suburb: rawData.address.suburb,
        postcode: rawData.address.postcode,
        state: rawData.address.state,
        unitNumber: rawData.address.unit_number,
        lotNumber: rawData.address.lot_number,
        dpNumber: rawData.address.dp_number
      },
      landInformation: {
        lotDetails: rawData.land_information.lot_details,
        landArea: rawData.land_information.land_area,
        landUse: rawData.land_information.land_use,
        landValue: rawData.land_information.land_value,
        zoning: {
          primaryZone: rawData.land_information.zoning.primary_zone,
          zoneDescription: rawData.land_information.zoning.description,
          permittedUses: rawData.land_information.zoning.permitted_uses || [],
          prohibitedUses: rawData.land_information.zoning.prohibited_uses || [],
          maximumHeight: rawData.land_information.zoning.maximum_height,
          floorSpaceRatio: rawData.land_information.zoning.floor_space_ratio,
          minimumLotSize: rawData.land_information.zoning.minimum_lot_size,
          buildingCoverage: rawData.land_information.zoning.building_coverage
        }
      },
      planningControls: this.transformPlanningControls(rawData.planning_controls),
      constraints: this.transformPropertyConstraints(rawData.constraints),
      developmentHistory: rawData.development_history?.map((app: any) => 
        this.transformDevelopmentApplication(app)
      ) || [],
      lastUpdated: rawData.last_updated
    }
  }

  private transformPlanningControls(controls: any): PlanningControls {
    return {
      heightRestrictions: controls.height_restrictions || [],
      setbackRequirements: controls.setback_requirements || [],
      densityControls: controls.density_controls || [],
      specialProvisions: controls.special_provisions || [],
      heritageConstraints: controls.heritage_constraints || [],
      environmentalConstraints: controls.environmental_constraints || []
    }
  }

  private transformPropertyConstraints(constraints: any): PropertyConstraints {
    return {
      floodRisk: {
        category: constraints.flood_risk?.category || 'unknown',
        floodLevel: constraints.flood_risk?.flood_level,
        probabilityLevel: constraints.flood_risk?.probability_level,
        evacuationRoute: constraints.flood_risk?.evacuation_route
      },
      contamination: {
        isContaminated: constraints.contamination?.is_contaminated || false,
        contaminationType: constraints.contamination?.contamination_type,
        remediationRequired: constraints.contamination?.remediation_required,
        remediationStatus: constraints.contamination?.remediation_status
      },
      bushfireRisk: {
        riskLevel: constraints.bushfire_risk?.risk_level || 'unknown',
        assetProtectionZone: constraints.bushfire_risk?.asset_protection_zone,
        constructionRequirements: constraints.bushfire_risk?.construction_requirements
      },
      acidSulfateSoil: constraints.acid_sulfate_soil || false,
      salinity: constraints.salinity || false,
      landslide: constraints.landslide || false,
      coastalHazards: {
        coastalErosion: constraints.coastal_hazards?.coastal_erosion || false,
        seaLevelRise: constraints.coastal_hazards?.sea_level_rise || false,
        stormSurge: constraints.coastal_hazards?.storm_surge || false
      }
    }
  }

  private transformDevelopmentApplication(app: any): DevelopmentApplication {
    return {
      applicationNumber: app.application_number,
      applicationDate: app.application_date,
      developmentType: app.development_type,
      description: app.description,
      status: app.status,
      decisionDate: app.decision_date,
      decision: app.decision,
      estimatedCost: app.estimated_cost,
      applicant: app.applicant,
      documents: app.documents || []
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Rate limiter for API calls
class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly capacity: number
  private readonly refillRate: number // tokens per second

  constructor(config: { requestsPerSecond: number; burstCapacity: number }) {
    this.capacity = config.burstCapacity
    this.refillRate = config.requestsPerSecond
    this.tokens = this.capacity
    this.lastRefill = Date.now()
  }

  async acquire(): Promise<void> {
    this.refill()
    
    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }
    
    // Wait for next available token
    const waitTime = (1 - this.tokens) / this.refillRate * 1000
    await this.sleep(waitTime)
    return this.acquire()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsed * this.refillRate
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Custom error class for ePlanning API errors
class EPlanningAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'EPlanningAPIError'
  }
}

export { 
  EPlanningClient, 
  PropertySearchParams, 
  PropertyDetails, 
  EPlanningAPIError,
  PropertyConstraints,
  PlanningControls 
}
```

## Section 2: NSW Spatial Services Integration

### Spatial Data Access and Processing

```typescript
// src/services/government-api/spatial-services.ts
interface SpatialServiceConfig {
  apiKey: string
  baseUrl: string
  timeout: number
}

interface LayerQuery {
  layerName: string
  geometry?: GeoJSONGeometry
  where?: string
  outFields?: string[]
  returnGeometry?: boolean
  spatialRelationship?: 'intersects' | 'contains' | 'within'
}

interface SpatialQueryResult {
  features: GeoJSONFeature[]
  exceededTransferLimit?: boolean
  spatialReference: SpatialReference
}

interface PropertyBoundary {
  geometry: GeoJSONPolygon
  area: number // square meters
  perimeter: number // meters
  centroid: GeoJSONPoint
  addressPoints: AddressPoint[]
}

interface AddressPoint {
  address: string
  coordinates: [number, number]
  confidence: number
}

class SpatialServicesClient {
  private config: SpatialServiceConfig
  private authService: SpatialAuthService

  constructor(config: SpatialServiceConfig) {
    this.config = config
    this.authService = new SpatialAuthService(config.apiKey)
  }

  async getPropertyBoundary(
    address: string, 
    options: { includeAddressPoints?: boolean } = {}
  ): Promise<PropertyBoundary | null> {
    try {
      // First, geocode the address to get coordinates
      const coordinates = await this.geocodeAddress(address)
      if (!coordinates) {
        throw new Error(`Could not geocode address: ${address}`)
      }

      // Query cadastral boundaries using coordinates
      const cadastralQuery: LayerQuery = {
        layerName: 'NSW_Cadastre',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        spatialRelationship: 'intersects',
        returnGeometry: true,
        outFields: ['LOT_NUMBER', 'DP_NUMBER', 'LAND_AREA', 'PERIMETER']
      }

      const result = await this.querySpatialLayer(cadastralQuery)
      
      if (result.features.length === 0) {
        return null
      }

      const feature = result.features[0]
      const geometry = feature.geometry as GeoJSONPolygon

      // Calculate centroid
      const centroid = this.calculateCentroid(geometry)

      // Get address points if requested
      let addressPoints: AddressPoint[] = []
      if (options.includeAddressPoints) {
        addressPoints = await this.getAddressPointsForProperty(geometry)
      }

      return {
        geometry,
        area: feature.properties.LAND_AREA || this.calculateArea(geometry),
        perimeter: feature.properties.PERIMETER || this.calculatePerimeter(geometry),
        centroid,
        addressPoints
      }
    } catch (error) {
      console.error('Property boundary query failed:', error)
      throw new SpatialServicesError(`Failed to get property boundary: ${error.message}`)
    }
  }

  async querySpatialLayer(query: LayerQuery): Promise<SpatialQueryResult> {
    const token = await this.authService.getValidToken()
    
    const params = new URLSearchParams({
      f: 'geojson',
      token: token,
      outFields: query.outFields?.join(',') || '*',
      returnGeometry: query.returnGeometry?.toString() || 'true',
      spatialRel: query.spatialRelationship || 'intersects'
    })

    if (query.where) {
      params.set('where', query.where)
    }

    if (query.geometry) {
      params.set('geometry', JSON.stringify(query.geometry))
      params.set('geometryType', this.getGeometryType(query.geometry))
      params.set('inSR', '4326') // WGS84
    }

    const url = `${this.config.baseUrl}/rest/services/${query.layerName}/MapServer/0/query`
    
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PropertyPlatform/1.0'
      },
      signal: AbortSignal.timeout(this.config.timeout)
    })

    if (!response.ok) {
      throw new SpatialServicesError(`Spatial query failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new SpatialServicesError(`Spatial query error: ${data.error.message}`)
    }

    return {
      features: data.features || [],
      exceededTransferLimit: data.exceededTransferLimit,
      spatialReference: data.spatialReference
    }
  }

  async geocodeAddress(address: string): Promise<[number, number] | null> {
    const token = await this.authService.getValidToken()
    
    const params = new URLSearchParams({
      f: 'json',
      token: token,
      singleLine: address,
      countryCode: 'AUS',
      maxLocations: '1',
      outSR: '4326'
    })

    const url = `${this.config.baseUrl}/rest/services/Locators/NSW_Address_Locator/GeocodeServer/findAddressCandidates`
    
    const response = await fetch(`${url}?${params.toString()}`)

    if (!response.ok) {
      throw new SpatialServicesError(`Geocoding failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      return [candidate.location.x, candidate.location.y]
    }

    return null
  }

  async getAddressPointsForProperty(propertyGeometry: GeoJSONPolygon): Promise<AddressPoint[]> {
    const query: LayerQuery = {
      layerName: 'NSW_Address_Points',
      geometry: propertyGeometry,
      spatialRelationship: 'within',
      returnGeometry: true,
      outFields: ['FULL_ADDRESS', 'CONFIDENCE']
    }

    const result = await this.querySpatialLayer(query)
    
    return result.features.map(feature => ({
      address: feature.properties.FULL_ADDRESS,
      coordinates: feature.geometry.coordinates as [number, number],
      confidence: feature.properties.CONFIDENCE || 0
    }))
  }

  // Get spatial data for various analysis layers
  async getFloodRiskData(geometry: GeoJSONGeometry): Promise<FloodRiskData[]> {
    const query: LayerQuery = {
      layerName: 'Flood_Risk_Information',
      geometry,
      spatialRelationship: 'intersects',
      outFields: ['FLOOD_CATEGORY', 'FLOOD_LEVEL', 'PROBABILITY', 'SOURCE_DATA']
    }

    const result = await this.querySpatialLayer(query)
    
    return result.features.map(feature => ({
      category: feature.properties.FLOOD_CATEGORY,
      floodLevel: feature.properties.FLOOD_LEVEL,
      probability: feature.properties.PROBABILITY,
      sourceData: feature.properties.SOURCE_DATA,
      geometry: feature.geometry
    }))
  }

  async getBushfireRiskData(geometry: GeoJSONGeometry): Promise<BushfireRiskData[]> {
    const query: LayerQuery = {
      layerName: 'Bushfire_Risk_Planning',
      geometry,
      spatialRelationship: 'intersects',
      outFields: ['RISK_CATEGORY', 'VEGETATION_TYPE', 'SLOPE_ANALYSIS', 'CONSTRUCTION_REQUIREMENTS']
    }

    const result = await this.querySpatialLayer(query)
    
    return result.features.map(feature => ({
      riskCategory: feature.properties.RISK_CATEGORY,
      vegetationType: feature.properties.VEGETATION_TYPE,
      slopeAnalysis: feature.properties.SLOPE_ANALYSIS,
      constructionRequirements: feature.properties.CONSTRUCTION_REQUIREMENTS,
      geometry: feature.geometry
    }))
  }

  async getHeritageData(geometry: GeoJSONGeometry): Promise<HeritageData[]> {
    const query: LayerQuery = {
      layerName: 'Heritage_Items',
      geometry,
      spatialRelationship: 'intersects',
      outFields: ['ITEM_NAME', 'HERITAGE_SIGNIFICANCE', 'LISTING_TYPE', 'RESTRICTIONS']
    }

    const result = await this.querySpatialLayer(query)
    
    return result.features.map(feature => ({
      itemName: feature.properties.ITEM_NAME,
      significance: feature.properties.HERITAGE_SIGNIFICANCE,
      listingType: feature.properties.LISTING_TYPE,
      restrictions: feature.properties.RESTRICTIONS,
      geometry: feature.geometry
    }))
  }

  // Utility methods for geometry calculations
  private calculateCentroid(polygon: GeoJSONPolygon): GeoJSONPoint {
    const coordinates = polygon.coordinates[0] // Exterior ring
    let x = 0, y = 0
    
    for (const coord of coordinates) {
      x += coord[0]
      y += coord[1]
    }
    
    return {
      type: 'Point',
      coordinates: [x / coordinates.length, y / coordinates.length]
    }
  }

  private calculateArea(polygon: GeoJSONPolygon): number {
    // Simplified area calculation (for accurate results, use a proper geodesy library)
    const coordinates = polygon.coordinates[0]
    let area = 0
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i]
      const [x2, y2] = coordinates[i + 1]
      area += (x1 * y2) - (x2 * y1)
    }
    
    // Convert to square meters (approximate)
    return Math.abs(area) * 111319.9 * 111319.9 / 2
  }

  private calculatePerimeter(polygon: GeoJSONPolygon): number {
    const coordinates = polygon.coordinates[0]
    let perimeter = 0
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i]
      const [x2, y2] = coordinates[i + 1]
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      perimeter += distance * 111319.9 // Convert to meters (approximate)
    }
    
    return perimeter
  }

  private getGeometryType(geometry: GeoJSONGeometry): string {
    const typeMap = {
      'Point': 'esriGeometryPoint',
      'LineString': 'esriGeometryPolyline',
      'Polygon': 'esriGeometryPolygon',
      'MultiPoint': 'esriGeometryMultipoint',
      'MultiLineString': 'esriGeometryPolyline',
      'MultiPolygon': 'esriGeometryPolygon'
    }
    
    return typeMap[geometry.type] || 'esriGeometryPolygon'
  }
}

// Authentication service for Spatial Services
class SpatialAuthService {
  private apiKey: string
  private tokenCache?: { token: string; expiresAt: number }

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getValidToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token
    }

    // For NSW Spatial Services, the API key can be used directly as a token
    // In production, implement proper token exchange if required
    this.tokenCache = {
      token: this.apiKey,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }

    return this.tokenCache.token
  }
}

// Spatial Services specific error
class SpatialServicesError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpatialServicesError'
  }
}

// Type definitions for spatial data
interface FloodRiskData {
  category: string
  floodLevel?: number
  probability?: string
  sourceData?: string
  geometry: GeoJSONGeometry
}

interface BushfireRiskData {
  riskCategory: string
  vegetationType?: string
  slopeAnalysis?: string
  constructionRequirements?: string
  geometry: GeoJSONGeometry
}

interface HeritageData {
  itemName: string
  significance: string
  listingType: string
  restrictions?: string
  geometry: GeoJSONGeometry
}

interface GeoJSONGeometry {
  type: string
  coordinates: any[]
}

interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number]
}

interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: Record<string, any>
}

interface SpatialReference {
  wkid: number
  latestWkid?: number
}

export { 
  SpatialServicesClient, 
  SpatialServiceConfig, 
  PropertyBoundary, 
  LayerQuery,
  SpatialQueryResult,
  SpatialServicesError,
  FloodRiskData,
  BushfireRiskData,
  HeritageData
}
```

## Section 3: Data Aggregation and Validation

### Comprehensive Property Data Service

```typescript
// src/services/government-api/property-data-aggregator.ts
import { EPlanningClient, PropertyDetails } from './eplanning-client'
import { SpatialServicesClient, PropertyBoundary } from './spatial-services'
import { createClient } from '@supabase/supabase-js'

interface AggregatedPropertyData {
  basicInfo: PropertyBasicInfo
  governmentData: GovernmentPropertyData
  spatialData: SpatialPropertyData
  riskAssessment: PropertyRiskAssessment
  validationResults: DataValidationResults
  dataProvenance: DataProvenance
  lastUpdated: string
}

interface GovernmentPropertyData {
  eplanning: PropertyDetails
  planning: PlanningInformation
  development: DevelopmentInformation
}

interface SpatialPropertyData {
  boundary: PropertyBoundary
  floodRisk: FloodRiskData[]
  bushfireRisk: BushfireRiskData[]
  heritage: HeritageData[]
  environmental: EnvironmentalData[]
}

interface PropertyRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'very-high'
  riskFactors: RiskFactor[]
  recommendations: string[]
  complianceIssues: ComplianceIssue[]
}

interface DataValidationResults {
  isValid: boolean
  warnings: ValidationWarning[]
  errors: ValidationError[]
  completenessScore: number
  accuracyScore: number
}

interface DataProvenance {
  sources: DataSource[]
  lastSync: Record<string, string>
  dataQuality: Record<string, number>
}

class PropertyDataAggregator {
  private ePlanningClient: EPlanningClient
  private spatialClient: SpatialServicesClient
  private supabase: any
  private validationService: DataValidationService

  constructor(
    ePlanningClient: EPlanningClient,
    spatialClient: SpatialServicesClient,
    supabaseClient: any
  ) {
    this.ePlanningClient = ePlanningClient
    this.spatialClient = spatialClient
    this.supabase = supabaseClient
    this.validationService = new DataValidationService()
  }

  async aggregatePropertyData(
    address: string,
    options: AggregationOptions = {}
  ): Promise<AggregatedPropertyData> {
    console.log(`Starting property data aggregation for: ${address}`)
    
    const startTime = Date.now()
    const dataProvenance: DataProvenance = {
      sources: [],
      lastSync: {},
      dataQuality: {}
    }

    try {
      // Step 1: Get basic property information from ePlanning
      console.log('Fetching ePlanning data...')
      const ePlanningData = await this.getEPlanningData(address)
      dataProvenance.sources.push({
        name: 'NSW ePlanning Portal',
        type: 'government_api',
        url: 'https://api.planning.nsw.gov.au',
        lastAccessed: new Date().toISOString()
      })

      // Step 2: Get spatial data and property boundary
      console.log('Fetching spatial data...')
      const spatialData = await this.getSpatialData(address, ePlanningData)
      dataProvenance.sources.push({
        name: 'NSW Spatial Services',
        type: 'spatial_api',
        url: 'https://portal.spatial.nsw.gov.au',
        lastAccessed: new Date().toISOString()
      })

      // Step 3: Validate and cross-reference data
      console.log('Validating data consistency...')
      const validationResults = await this.validateAggregatedData(ePlanningData, spatialData)

      // Step 4: Perform risk assessment
      console.log('Performing risk assessment...')
      const riskAssessment = await this.performRiskAssessment(ePlanningData, spatialData)

      // Step 5: Calculate data quality scores
      const qualityScores = this.calculateDataQuality(ePlanningData, spatialData, validationResults)
      dataProvenance.dataQuality = qualityScores

      // Step 6: Store aggregated data if caching is enabled
      if (options.enableCaching !== false) {
        await this.cacheAggregatedData(address, {
          ePlanningData,
          spatialData,
          validationResults,
          riskAssessment
        })
      }

      const aggregatedData: AggregatedPropertyData = {
        basicInfo: this.extractBasicInfo(ePlanningData),
        governmentData: {
          eplanning: ePlanningData,
          planning: this.extractPlanningInfo(ePlanningData),
          development: this.extractDevelopmentInfo(ePlanningData)
        },
        spatialData: {
          boundary: spatialData.boundary,
          floodRisk: spatialData.floodRisk,
          bushfireRisk: spatialData.bushfireRisk,
          heritage: spatialData.heritage,
          environmental: spatialData.environmental || []
        },
        riskAssessment,
        validationResults,
        dataProvenance,
        lastUpdated: new Date().toISOString()
      }

      const duration = Date.now() - startTime
      console.log(`Property data aggregation completed in ${duration}ms`)

      return aggregatedData
    } catch (error) {
      console.error('Property data aggregation failed:', error)
      throw new PropertyDataAggregationError(`Failed to aggregate data for ${address}: ${error.message}`)
    }
  }

  private async getEPlanningData(address: string): Promise<PropertyDetails> {
    // Try to find property by address search
    const searchResults = await this.ePlanningClient.searchProperties({ address })
    
    if (searchResults.length === 0) {
      throw new Error(`No property found for address: ${address}`)
    }

    // Get detailed information for the first match
    const property = searchResults[0]
    const detailedData = await this.ePlanningClient.getPropertyDetails(property.propertyId)
    
    // Get additional planning history and constraints
    const [planningHistory, constraints] = await Promise.all([
      this.ePlanningClient.getPropertyPlanningHistory(property.propertyId),
      this.ePlanningClient.getPropertyConstraints(property.propertyId)
    ])

    return {
      ...detailedData,
      developmentHistory: planningHistory,
      constraints
    }
  }

  private async getSpatialData(address: string, ePlanningData: PropertyDetails): Promise<any> {
    // Get property boundary and spatial features
    const boundary = await this.spatialClient.getPropertyBoundary(address, {
      includeAddressPoints: true
    })

    if (!boundary) {
      throw new Error(`No spatial boundary found for address: ${address}`)
    }

    // Use property boundary to query spatial risk data
    const [floodRisk, bushfireRisk, heritage] = await Promise.all([
      this.spatialClient.getFloodRiskData(boundary.geometry),
      this.spatialClient.getBushfireRiskData(boundary.geometry),
      this.spatialClient.getHeritageData(boundary.geometry)
    ])

    return {
      boundary,
      floodRisk,
      bushfireRisk,
      heritage
    }
  }

  private async validateAggregatedData(
    ePlanningData: PropertyDetails,
    spatialData: any
  ): Promise<DataValidationResults> {
    const validationResults = await this.validationService.validatePropertyData({
      ePlanning: ePlanningData,
      spatial: spatialData
    })

    // Cross-validate data between sources
    const crossValidation = this.crossValidateData(ePlanningData, spatialData)
    validationResults.warnings.push(...crossValidation.warnings)
    validationResults.errors.push(...crossValidation.errors)

    return validationResults
  }

  private crossValidateData(ePlanningData: PropertyDetails, spatialData: any): any {
    const warnings: ValidationWarning[] = []
    const errors: ValidationError[] = []

    // Validate land area consistency
    const ePlanningArea = ePlanningData.landInformation.landArea
    const spatialArea = spatialData.boundary.area
    
    if (Math.abs(ePlanningArea - spatialArea) / ePlanningArea > 0.1) { // 10% variance
      warnings.push({
        type: 'data_inconsistency',
        field: 'land_area',
        message: `Land area discrepancy: ePlanning (${ePlanningArea}m²) vs Spatial (${spatialArea}m²)`,
        severity: 'medium'
      })
    }

    // Validate address consistency
    const ePlanningAddress = ePlanningData.address.fullAddress
    const spatialAddresses = spatialData.boundary.addressPoints.map((ap: any) => ap.address)
    
    if (!spatialAddresses.some((addr: string) => this.addressesMatch(ePlanningAddress, addr))) {
      warnings.push({
        type: 'address_mismatch',
        field: 'address',
        message: 'Address not found in spatial address points',
        severity: 'low'
      })
    }

    return { warnings, errors }
  }

  private addressesMatch(addr1: string, addr2: string): boolean {
    // Normalize addresses for comparison
    const normalize = (addr: string) => 
      addr.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim()
    
    return normalize(addr1) === normalize(addr2)
  }

  private async performRiskAssessment(
    ePlanningData: PropertyDetails,
    spatialData: any
  ): Promise<PropertyRiskAssessment> {
    const riskFactors: RiskFactor[] = []
    const recommendations: string[] = []
    const complianceIssues: ComplianceIssue[] = []

    // Assess flood risk
    if (spatialData.floodRisk.length > 0) {
      const highestRisk = spatialData.floodRisk.reduce((max: any, current: any) => 
        this.getFloodRiskLevel(current.category) > this.getFloodRiskLevel(max.category) ? current : max
      )
      
      riskFactors.push({
        type: 'flood',
        level: this.getFloodRiskLevel(highestRisk.category),
        description: `Property is in ${highestRisk.category} flood risk area`,
        impact: 'Insurance premiums may be higher, development restrictions may apply'
      })

      if (this.getFloodRiskLevel(highestRisk.category) >= 3) {
        recommendations.push('Consider flood risk insurance and emergency evacuation planning')
        recommendations.push('Check council requirements for flood-resistant construction')
      }
    }

    // Assess bushfire risk
    if (spatialData.bushfireRisk.length > 0) {
      const bushfireRisk = spatialData.bushfireRisk[0]
      const riskLevel = this.getBushfireRiskLevel(bushfireRisk.riskCategory)
      
      riskFactors.push({
        type: 'bushfire',
        level: riskLevel,
        description: `Property is in ${bushfireRisk.riskCategory} bushfire risk zone`,
        impact: 'Special construction requirements may apply'
      })

      if (riskLevel >= 3) {
        recommendations.push('Implement bushfire protection measures')
        recommendations.push('Maintain asset protection zones as required')
      }
    }

    // Assess heritage constraints
    if (spatialData.heritage.length > 0) {
      riskFactors.push({
        type: 'heritage',
        level: 2, // Medium impact
        description: 'Property has heritage constraints',
        impact: 'Development approvals may require heritage assessment'
      })
      
      recommendations.push('Consult heritage specialist before any development')
    }

    // Assess planning compliance
    const planningIssues = await this.assessPlanningCompliance(ePlanningData)
    complianceIssues.push(...planningIssues)

    // Calculate overall risk level
    const maxRiskLevel = Math.max(...riskFactors.map(rf => rf.level))
    const overallRisk = this.calculateOverallRisk(maxRiskLevel, complianceIssues.length)

    return {
      overallRisk,
      riskFactors,
      recommendations,
      complianceIssues
    }
  }

  private getFloodRiskLevel(category: string): number {
    const riskLevels: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'very-high': 4,
      'extreme': 5
    }
    return riskLevels[category.toLowerCase()] || 0
  }

  private getBushfireRiskLevel(category: string): number {
    const riskLevels: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'very-high': 4,
      'extreme': 5
    }
    return riskLevels[category.toLowerCase()] || 0
  }

  private calculateOverallRisk(maxRiskLevel: number, complianceIssueCount: number): 'low' | 'medium' | 'high' | 'very-high' {
    const adjustedRisk = maxRiskLevel + (complianceIssueCount * 0.5)
    
    if (adjustedRisk <= 1.5) return 'low'
    if (adjustedRisk <= 2.5) return 'medium'
    if (adjustedRisk <= 3.5) return 'high'
    return 'very-high'
  }

  private async assessPlanningCompliance(ePlanningData: PropertyDetails): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = []

    // Check for outstanding development applications
    const outstandingDAs = ePlanningData.developmentHistory.filter(
      da => da.status === 'under_assessment' || da.status === 'pending'
    )

    if (outstandingDAs.length > 0) {
      issues.push({
        type: 'outstanding_applications',
        severity: 'medium',
        description: `${outstandingDAs.length} outstanding development application(s)`,
        recommendation: 'Review status of pending applications before proceeding'
      })
    }

    // Check for compliance orders or notices
    const complianceActions = ePlanningData.developmentHistory.filter(
      da => da.developmentType === 'compliance_order' || da.developmentType === 'enforcement_notice'
    )

    if (complianceActions.length > 0) {
      issues.push({
        type: 'compliance_orders',
        severity: 'high',
        description: `${complianceActions.length} compliance order(s) or enforcement notice(s)`,
        recommendation: 'Resolve compliance issues before any development'
      })
    }

    return issues
  }

  private calculateDataQuality(
    ePlanningData: PropertyDetails,
    spatialData: any,
    validationResults: DataValidationResults
  ): Record<string, number> {
    const scores: Record<string, number> = {}

    // ePlanning data quality
    scores.eplanning = this.assessEPlanningQuality(ePlanningData)
    
    // Spatial data quality
    scores.spatial = this.assessSpatialQuality(spatialData)
    
    // Overall validation score
    scores.validation = validationResults.completenessScore

    // Overall quality score
    scores.overall = (scores.eplanning + scores.spatial + scores.validation) / 3

    return scores
  }

  private assessEPlanningQuality(data: PropertyDetails): number {
    let score = 0
    let maxScore = 0

    // Address completeness
    maxScore += 20
    if (data.address.fullAddress) score += 20

    // Land information completeness
    maxScore += 30
    if (data.landInformation.landArea > 0) score += 10
    if (data.landInformation.zoning.primaryZone) score += 10
    if (data.landInformation.zoning.permittedUses.length > 0) score += 10

    // Planning controls completeness
    maxScore += 25
    if (data.planningControls.heightRestrictions.length > 0) score += 5
    if (data.planningControls.setbackRequirements.length > 0) score += 5
    if (data.planningControls.heritageConstraints.length >= 0) score += 5 // Having 0 is still good data
    if (data.planningControls.environmentalConstraints.length >= 0) score += 5
    if (data.planningControls.specialProvisions.length >= 0) score += 5

    // Development history
    maxScore += 15
    if (data.developmentHistory.length >= 0) score += 15 // Having 0 is still valid

    // Data freshness
    maxScore += 10
    const daysSinceUpdate = (Date.now() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate <= 30) score += 10
    else if (daysSinceUpdate <= 90) score += 5

    return (score / maxScore) * 100
  }

  private assessSpatialQuality(spatialData: any): number {
    let score = 0
    let maxScore = 0

    // Boundary quality
    maxScore += 40
    if (spatialData.boundary) {
      score += 20
      if (spatialData.boundary.area > 0) score += 10
      if (spatialData.boundary.addressPoints.length > 0) score += 10
    }

    // Risk data availability
    maxScore += 30
    if (spatialData.floodRisk.length >= 0) score += 10
    if (spatialData.bushfireRisk.length >= 0) score += 10
    if (spatialData.heritage.length >= 0) score += 10

    // Geometry quality
    maxScore += 30
    if (spatialData.boundary?.geometry) {
      score += 15
      if (this.isValidGeometry(spatialData.boundary.geometry)) score += 15
    }

    return (score / maxScore) * 100
  }

  private isValidGeometry(geometry: any): boolean {
    try {
      return geometry.type === 'Polygon' && 
             geometry.coordinates && 
             geometry.coordinates[0] && 
             geometry.coordinates[0].length >= 4
    } catch {
      return false
    }
  }

  private async cacheAggregatedData(address: string, data: any): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(address)
      
      await this.supabase
        .from('property_data_cache')
        .upsert({
          cache_key: cacheKey,
          address: address,
          data: data,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
    } catch (error) {
      console.warn('Failed to cache aggregated data:', error)
      // Don't throw - caching is optional
    }
  }

  private generateCacheKey(address: string): string {
    return Buffer.from(address.toLowerCase().trim()).toString('base64')
  }

  private extractBasicInfo(ePlanningData: PropertyDetails): PropertyBasicInfo {
    return {
      address: ePlanningData.address.fullAddress,
      suburb: ePlanningData.address.suburb,
      postcode: ePlanningData.address.postcode,
      state: ePlanningData.address.state,
      lotNumber: ePlanningData.address.lotNumber,
      dpNumber: ePlanningData.address.dpNumber,
      landArea: ePlanningData.landInformation.landArea,
      zoning: ePlanningData.landInformation.zoning.primaryZone
    }
  }

  private extractPlanningInfo(ePlanningData: PropertyDetails): PlanningInformation {
    return {
      zoning: ePlanningData.landInformation.zoning,
      planningControls: ePlanningData.planningControls,
      permittedUses: ePlanningData.landInformation.zoning.permittedUses,
      prohibitedUses: ePlanningData.landInformation.zoning.prohibitedUses
    }
  }

  private extractDevelopmentInfo(ePlanningData: PropertyDetails): DevelopmentInformation {
    return {
      developmentHistory: ePlanningData.developmentHistory,
      recentApplications: ePlanningData.developmentHistory
        .filter(da => new Date(da.applicationDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()),
      developmentPotential: this.assessDevelopmentPotential(ePlanningData)
    }
  }

  private assessDevelopmentPotential(ePlanningData: PropertyDetails): string {
    const zoning = ePlanningData.landInformation.zoning
    const constraints = ePlanningData.planningControls

    if (constraints.heritageConstraints.length > 0) {
      return 'limited' // Heritage constraints typically limit development
    }

    if (zoning.primaryZone.startsWith('R')) {
      return 'residential' // Residential development potential
    }

    if (zoning.primaryZone.startsWith('B')) {
      return 'commercial' // Commercial development potential
    }

    if (zoning.primaryZone.startsWith('IN')) {
      return 'industrial' // Industrial development potential
    }

    return 'unknown'
  }
}

// Data validation service
class DataValidationService {
  async validatePropertyData(data: any): Promise<DataValidationResults> {
    const warnings: ValidationWarning[] = []
    const errors: ValidationError[] = []

    // Validate ePlanning data
    if (!data.ePlanning) {
      errors.push({
        type: 'missing_data',
        field: 'ePlanning',
        message: 'ePlanning data is missing',
        severity: 'high'
      })
    } else {
      this.validateEPlanningData(data.ePlanning, warnings, errors)
    }

    // Validate spatial data
    if (!data.spatial) {
      errors.push({
        type: 'missing_data',
        field: 'spatial',
        message: 'Spatial data is missing',
        severity: 'high'
      })
    } else {
      this.validateSpatialData(data.spatial, warnings, errors)
    }

    const completenessScore = this.calculateCompletenessScore(data)
    const accuracyScore = this.calculateAccuracyScore(data, warnings, errors)

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      completenessScore,
      accuracyScore
    }
  }

  private validateEPlanningData(data: PropertyDetails, warnings: ValidationWarning[], errors: ValidationError[]): void {
    // Required fields validation
    if (!data.address?.fullAddress) {
      errors.push({
        type: 'missing_required_field',
        field: 'address',
        message: 'Property address is required',
        severity: 'high'
      })
    }

    if (!data.landInformation?.landArea || data.landInformation.landArea <= 0) {
      warnings.push({
        type: 'invalid_value',
        field: 'landArea',
        message: 'Land area is missing or invalid',
        severity: 'medium'
      })
    }

    if (!data.landInformation?.zoning?.primaryZone) {
      errors.push({
        type: 'missing_required_field',
        field: 'zoning',
        message: 'Primary zoning information is required',
        severity: 'high'
      })
    }

    // Data quality checks
    if (data.developmentHistory.length === 0) {
      warnings.push({
        type: 'incomplete_data',
        field: 'developmentHistory',
        message: 'No development history available',
        severity: 'low'
      })
    }
  }

  private validateSpatialData(data: any, warnings: ValidationWarning[], errors: ValidationError[]): void {
    if (!data.boundary) {
      errors.push({
        type: 'missing_data',
        field: 'boundary',
        message: 'Property boundary is missing',
        severity: 'high'
      })
      return
    }

    if (!data.boundary.geometry) {
      errors.push({
        type: 'invalid_geometry',
        field: 'boundary.geometry',
        message: 'Boundary geometry is invalid',
        severity: 'high'
      })
    }

    if (data.boundary.area <= 0) {
      warnings.push({
        type: 'invalid_value',
        field: 'boundary.area',
        message: 'Boundary area is invalid',
        severity: 'medium'
      })
    }
  }

  private calculateCompletenessScore(data: any): number {
    let score = 0
    let totalFields = 0

    // Score based on presence of key data fields
    const requiredFields = [
      'ePlanning.address.fullAddress',
      'ePlanning.landInformation.landArea',
      'ePlanning.landInformation.zoning.primaryZone',
      'spatial.boundary.geometry',
      'spatial.boundary.area'
    ]

    for (const field of requiredFields) {
      totalFields++
      if (this.getNestedValue(data, field)) {
        score++
      }
    }

    return (score / totalFields) * 100
  }

  private calculateAccuracyScore(data: any, warnings: ValidationWarning[], errors: ValidationError[]): number {
    // Base score
    let score = 100

    // Deduct points for errors and warnings
    score -= errors.length * 20
    score -= warnings.length * 5

    return Math.max(0, score)
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}

// Error classes and interfaces
class PropertyDataAggregationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PropertyDataAggregationError'
  }
}

interface AggregationOptions {
  enableCaching?: boolean
  includeHistoricalData?: boolean
  riskAssessmentLevel?: 'basic' | 'comprehensive'
}

interface PropertyBasicInfo {
  address: string
  suburb: string
  postcode: string
  state: string
  lotNumber?: string
  dpNumber?: string
  landArea: number
  zoning: string
}

interface PlanningInformation {
  zoning: any
  planningControls: any
  permittedUses: string[]
  prohibitedUses: string[]
}

interface DevelopmentInformation {
  developmentHistory: any[]
  recentApplications: any[]
  developmentPotential: string
}

interface RiskFactor {
  type: string
  level: number
  description: string
  impact: string
}

interface ComplianceIssue {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
}

interface ValidationWarning {
  type: string
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

interface ValidationError {
  type: string
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

interface DataSource {
  name: string
  type: string
  url: string
  lastAccessed: string
}

interface EnvironmentalData {
  type: string
  description: string
  impact: string
  geometry: any
}

export { 
  PropertyDataAggregator, 
  AggregatedPropertyData, 
  PropertyDataAggregationError,
  AggregationOptions,
  PropertyRiskAssessment,
  DataValidationResults
}
```

## Practical Exercises

### Exercise 1: ePlanning API Integration
Build a complete NSW ePlanning Portal integration:
- Implement OAuth 2.0 authentication
- Create property search and retrieval functions
- Handle rate limiting and error recovery
- Implement data transformation and validation

### Exercise 2: Spatial Services Integration  
Develop comprehensive spatial data integration:
- Property boundary retrieval and validation
- Risk data aggregation (flood, bushfire, heritage)
- Geometry processing and validation
- Spatial query optimization

### Exercise 3: Data Aggregation System
Create a robust data aggregation service:
- Cross-validate data from multiple sources
- Implement data quality scoring
- Build caching and synchronization
- Create comprehensive risk assessment

### Exercise 4: Real-time Synchronization
Implement real-time government data updates:
- Webhook integration for data changes
- Incremental data synchronization
- Conflict resolution strategies
- Performance monitoring and alerting

## Summary

This module covered comprehensive government API integration for property management platforms:

- **Authentication and Security**: OAuth 2.0 implementation and secure API access patterns
- **Data Integration**: Robust integration with NSW ePlanning Portal and Spatial Services
- **Data Aggregation**: Cross-validation and quality assessment of government data sources
- **Risk Assessment**: Automated analysis of property constraints and compliance issues
- **Performance and Reliability**: Rate limiting, caching, and error recovery strategies

These government integration skills enable building property platforms with authoritative, up-to-date data that meets regulatory requirements and provides comprehensive property intelligence.

## Navigation
- [Next: Module 8.2 - Document Generation and Automation →](./Module-8.2-Document-Generation-and-Automation.md)
- [← Previous: Phase 7 - Cloud Deployment and DevOps](../Phase-7-Cloud-Deployment-and-DevOps/README.md)
- [↑ Back to Phase 8 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)