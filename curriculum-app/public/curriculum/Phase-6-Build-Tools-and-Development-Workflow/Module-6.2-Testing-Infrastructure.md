# Module 6.2: Testing Infrastructure

## Learning Objectives
By the end of this module, you will be able to:
- Implement comprehensive testing strategies for property management platforms
- Write unit tests for property analysis algorithms and calculations
- Create integration tests for government API integrations
- Develop end-to-end tests for complex property workflows
- Set up visual regression testing for mapping components
- Implement performance testing for large property datasets

## Prerequisites
- Understanding of React component architecture (Phases 1-2)
- Knowledge of TypeScript and async programming patterns
- Familiarity with property analysis workflows
- Basic understanding of testing concepts (unit, integration, e2e)

## Introduction

Property management platforms require robust testing strategies due to their complexity: financial calculations must be accurate, government API integrations must be reliable, and mapping components must render correctly across different browsers and devices. This module explores comprehensive testing approaches for property analysis applications.

**Why Testing Matters for Property Platforms:**
- **Financial Accuracy**: Property valuations and yield calculations must be precise
- **Data Integrity**: Government API integrations must handle data correctly
- **User Experience**: Complex workflows must work reliably across scenarios
- **Performance**: Large datasets must be processed efficiently
- **Compliance**: Regulatory requirements demand thorough testing
- **Regression Prevention**: Changes shouldn't break existing functionality

## Section 1: Unit Testing Strategy

### Testing Property Analysis Functions

Property calculations require precise unit testing to ensure accuracy:

```typescript
// src/utils/propertyCalculations.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateRentalYield,
  calculateCashFlow,
  calculateCapitalGrowth,
  calculatePropertyROI,
  PropertyFinancials,
  CashFlowProjection
} from './propertyCalculations'

describe('Property Financial Calculations', () => {
  let baseProperty: PropertyFinancials

  beforeEach(() => {
    baseProperty = {
      purchasePrice: 800000,
      weeklyRent: 650,
      annualExpenses: {
        councilRates: 2500,
        waterRates: 800,
        insurance: 1200,
        maintenance: 3000,
        managementFees: 0.08, // 8% of rental income
        vacancy: 0.04 // 4% vacancy rate
      },
      stampDuty: 32000,
      legalFees: 1500,
      inspectionCosts: 800
    }
  })

  describe('calculateRentalYield', () => {
    it('should calculate gross rental yield correctly', () => {
      const result = calculateRentalYield(baseProperty, 'gross')
      
      // Weekly rent * 52 weeks / purchase price * 100
      const expected = (650 * 52) / 800000 * 100
      
      expect(result).toBeCloseTo(expected, 2)
      expect(result).toBeCloseTo(4.225, 2)
    })

    it('should calculate net rental yield correctly', () => {
      const result = calculateRentalYield(baseProperty, 'net')
      
      const grossIncome = 650 * 52 // $33,800
      const managementFees = grossIncome * 0.08 // $2,704
      const vacancyLoss = grossIncome * 0.04 // $1,352
      const otherExpenses = 2500 + 800 + 1200 + 3000 // $7,500
      const netIncome = grossIncome - managementFees - vacancyLoss - otherExpenses
      const expected = netIncome / 800000 * 100
      
      expect(result).toBeCloseTo(expected, 2)
      expect(result).toBeCloseTo(2.78, 2)
    })

    it('should handle edge cases', () => {
      // Zero purchase price should throw error
      expect(() => {
        calculateRentalYield({ ...baseProperty, purchasePrice: 0 }, 'gross')
      }).toThrow('Purchase price must be greater than zero')

      // Negative rent should throw error
      expect(() => {
        calculateRentalYield({ ...baseProperty, weeklyRent: -100 }, 'gross')
      }).toThrow('Weekly rent must be greater than zero')
    })
  })

  describe('calculateCashFlow', () => {
    it('should calculate annual cash flow correctly', () => {
      const loanDetails = {
        loanAmount: 640000, // 80% LVR
        interestRate: 0.055, // 5.5%
        loanTerm: 30,
        repaymentFrequency: 'monthly' as const
      }

      const result = calculateCashFlow(baseProperty, loanDetails)
      
      expect(result.grossIncome).toBe(650 * 52)
      expect(result.loanRepayments).toBeCloseTo(435984, 0) // Annual repayments
      expect(result.netCashFlow).toBeLessThan(0) // Negative gearing expected
    })

    it('should handle different repayment frequencies', () => {
      const weeklyLoan = {
        loanAmount: 640000,
        interestRate: 0.055,
        loanTerm: 30,
        repaymentFrequency: 'weekly' as const
      }

      const monthlyLoan = {
        ...weeklyLoan,
        repaymentFrequency: 'monthly' as const
      }

      const weeklyResult = calculateCashFlow(baseProperty, weeklyLoan)
      const monthlyResult = calculateCashFlow(baseProperty, monthlyLoan)

      // Annual amounts should be similar regardless of frequency
      expect(weeklyResult.loanRepayments).toBeCloseTo(monthlyResult.loanRepayments, -2)
    })
  })

  describe('calculateCapitalGrowth', () => {
    it('should project capital growth correctly', () => {
      const projectionYears = 10
      const annualGrowthRate = 0.04 // 4%

      const result = calculateCapitalGrowth(baseProperty, projectionYears, annualGrowthRate)

      expect(result).toHaveLength(projectionYears)
      expect(result[0].year).toBe(1)
      expect(result[0].propertyValue).toBeCloseTo(832000, 0) // 800k * 1.04
      
      // Check compound growth
      const finalYear = result[projectionYears - 1]
      const expectedFinalValue = baseProperty.purchasePrice * Math.pow(1.04, projectionYears)
      expect(finalYear.propertyValue).toBeCloseTo(expectedFinalValue, 0)
    })

    it('should handle variable growth rates', () => {
      const variableRates = [0.05, 0.03, 0.04, 0.02, 0.06] // 5 years of different rates

      const result = calculateCapitalGrowth(baseProperty, 5, variableRates)

      let expectedValue = baseProperty.purchasePrice
      for (let i = 0; i < variableRates.length; i++) {
        expectedValue *= (1 + variableRates[i])
        expect(result[i].propertyValue).toBeCloseTo(expectedValue, 0)
      }
    })
  })

  describe('calculatePropertyROI', () => {
    it('should calculate comprehensive ROI correctly', () => {
      const investmentDetails = {
        deposit: 160000, // 20%
        stampDuty: 32000,
        legalFees: 1500,
        inspectionCosts: 800,
        renovationCosts: 15000
      }

      const loanDetails = {
        loanAmount: 640000,
        interestRate: 0.055,
        loanTerm: 30,
        repaymentFrequency: 'monthly' as const
      }

      const result = calculatePropertyROI(baseProperty, investmentDetails, loanDetails, 5)

      expect(result.totalInvestment).toBe(209300) // Sum of all upfront costs
      expect(result.projections).toHaveLength(5)
      expect(result.averageAnnualReturn).toBeTypeOf('number')
      expect(result.totalReturn).toBeTypeOf('number')
    })
  })
})

// Mock external dependencies for testing
vi.mock('./governmentApiService', () => ({
  fetchPropertyDetails: vi.fn().mockResolvedValue({
    zoning: 'R2',
    landArea: 600,
    lastSalePrice: 750000,
    lastSaleDate: '2023-01-15'
  }),
  
  fetchPlanningControls: vi.fn().mockResolvedValue({
    maximumHeight: 9.5,
    floorSpaceRatio: 0.5,
    setbacks: { front: 6, side: 1.5, rear: 6 }
  })
}))
```

### Testing React Components with Property Data

```typescript
// src/components/PropertyCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PropertyCard } from './PropertyCard'
import { PropertyContextProvider } from '../contexts/PropertyContext'

// Mock Mapbox GL to avoid canvas issues in tests
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn()
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis()
    }))
  }
}))

const mockProperty = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  basicInfo: {
    address: '123 Test Street, Sydney NSW 2000',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    propertyType: 'Apartment'
  },
  financialMetrics: {
    estimatedValue: 850000,
    weeklyRent: 650,
    lastSalePrice: 800000,
    lastSaleDate: '2023-01-15'
  },
  planningControls: {
    zoning: { primary: 'R4' },
    landArea: 600,
    floorSpaceRatio: 1.5
  },
  spatialAttributes: {
    coordinates: { type: 'Point', coordinates: [151.2093, -33.8688] }
  }
}

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <PropertyContextProvider>
      {component}
    </PropertyContextProvider>
  )
}

describe('PropertyCard Component', () => {
  it('renders property information correctly', () => {
    renderWithContext(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('123 Test Street, Sydney NSW 2000')).toBeInTheDocument()
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    expect(screen.getByText('$650/week')).toBeInTheDocument()
    expect(screen.getByText('R4')).toBeInTheDocument()
  })

  it('calculates and displays rental yield', () => {
    renderWithContext(<PropertyCard property={mockProperty} showAnalysis={true} />)
    
    // Gross yield = (650 * 52) / 850000 * 100 = 3.98%
    expect(screen.getByText(/3\.98%/)).toBeInTheDocument()
  })

  it('handles missing data gracefully', () => {
    const incompleteProperty = {
      ...mockProperty,
      financialMetrics: {
        estimatedValue: 850000
        // Missing rent data
      }
    }

    renderWithContext(<PropertyCard property={incompleteProperty} />)
    
    expect(screen.getByText('Rent not available')).toBeInTheDocument()
    expect(screen.queryByText(/yield/i)).not.toBeInTheDocument()
  })

  it('opens property details modal on click', async () => {
    const onPropertyClick = vi.fn()
    
    renderWithContext(
      <PropertyCard 
        property={mockProperty} 
        onPropertyClick={onPropertyClick}
      />
    )
    
    fireEvent.click(screen.getByTestId('property-card'))
    
    expect(onPropertyClick).toHaveBeenCalledWith(mockProperty.id)
  })

  it('shows loading state during analysis', async () => {
    const slowAnalysis = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    renderWithContext(
      <PropertyCard 
        property={mockProperty} 
        onAnalyze={slowAnalysis}
        showAnalysis={true}
      />
    )
    
    fireEvent.click(screen.getByText('Analyze'))
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()
    })
  })

  it('handles analysis errors gracefully', async () => {
    const failingAnalysis = vi.fn().mockRejectedValue(new Error('Analysis failed'))

    renderWithContext(
      <PropertyCard 
        property={mockProperty} 
        onAnalyze={failingAnalysis}
        showAnalysis={true}
      />
    )
    
    fireEvent.click(screen.getByText('Analyze'))
    
    await waitFor(() => {
      expect(screen.getByText('Analysis failed. Please try again.')).toBeInTheDocument()
    })
  })
})

// Custom render helper for components requiring Supabase context
const renderWithSupabase = (component: React.ReactElement) => {
  const mockSupabaseClient = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProperty, error: null })
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user' } }, 
        error: null 
      })
    }
  }

  return render(
    <SupabaseProvider value={mockSupabaseClient}>
      <PropertyContextProvider>
        {component}
      </PropertyContextProvider>
    </SupabaseProvider>
  )
}
```

## Section 2: Integration Testing

### Testing Government API Integrations

```typescript
// src/services/governmentApi.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { GovernmentApiService } from './governmentApiService'

// Mock server for government API responses
const server = setupServer(
  // NSW ePlanning API mock
  rest.get('https://api.planning.nsw.gov.au/v1/property/:id', (req, res, ctx) => {
    const { id } = req.params
    
    if (id === 'valid-property-id') {
      return res(ctx.json({
        propertyId: id,
        address: '123 Test Street, Sydney NSW 2000',
        zoning: {
          primary: 'R4',
          description: 'High Density Residential'
        },
        planningControls: {
          maximumHeight: 28,
          floorSpaceRatio: 2.5,
          setbacks: {
            front: 3,
            side: 0,
            rear: 3
          }
        },
        constraints: {
          heritage: false,
          floodProne: true,
          bushfireRisk: 'low'
        }
      }))
    }
    
    return res(ctx.status(404), ctx.json({ error: 'Property not found' }))
  }),

  // Spatial services API mock
  rest.get('https://maps.six.nsw.gov.au/arcgis/rest/services/*', (req, res, ctx) => {
    const url = new URL(req.url)
    const geometry = url.searchParams.get('geometry')
    
    if (geometry) {
      return res(ctx.json({
        features: [
          {
            attributes: {
              OBJECTID: 1,
              Zone_Code: 'R4',
              Zone_Description: 'High Density Residential',
              LGA_Name: 'City of Sydney'
            },
            geometry: {
              rings: [[[151.208, -33.868], [151.209, -33.868], [151.209, -33.869], [151.208, -33.869], [151.208, -33.868]]]
            }
          }
        ]
      }))
    }
    
    return res(ctx.status(400), ctx.json({ error: 'Invalid geometry' }))
  }),

  // Rate limiting simulation
  rest.get('https://api.planning.nsw.gov.au/v1/ratelimited', (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.set('Retry-After', '60'),
      ctx.json({ error: 'Rate limit exceeded' })
    )
  })
)

describe('Government API Integration', () => {
  let apiService: GovernmentApiService

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    server.resetHandlers()
    apiService = new GovernmentApiService({
      ePlanningApiKey: 'test-key',
      spatialApiKey: 'test-spatial-key',
      rateLimitDelay: 100 // Faster for testing
    })
  })

  describe('Property Details Fetching', () => {
    it('should fetch property details successfully', async () => {
      const result = await apiService.fetchPropertyDetails('valid-property-id')

      expect(result).toEqual({
        propertyId: 'valid-property-id',
        address: '123 Test Street, Sydney NSW 2000',
        zoning: {
          primary: 'R4',
          description: 'High Density Residential'
        },
        planningControls: {
          maximumHeight: 28,
          floorSpaceRatio: 2.5,
          setbacks: {
            front: 3,
            side: 0,
            rear: 3
          }
        },
        constraints: {
          heritage: false,
          floodProne: true,
          bushfireRisk: 'low'
        }
      })
    })

    it('should handle property not found', async () => {
      await expect(
        apiService.fetchPropertyDetails('invalid-property-id')
      ).rejects.toThrow('Property not found')
    })

    it('should retry on network failures', async () => {
      // Simulate network failure then success
      server.use(
        rest.get('https://api.planning.nsw.gov.au/v1/property/:id', (req, res, ctx) => {
          return res.networkError('Connection failed')
        })
      )

      // First call should fail
      await expect(
        apiService.fetchPropertyDetails('valid-property-id')
      ).rejects.toThrow('Connection failed')

      // Reset to working handler
      server.resetHandlers()

      // Second call should succeed
      const result = await apiService.fetchPropertyDetails('valid-property-id')
      expect(result.propertyId).toBe('valid-property-id')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      const startTime = Date.now()

      // This should trigger rate limiting and retry
      await expect(
        apiService.fetchPropertyDetails('ratelimited')
      ).rejects.toThrow('Rate limit exceeded')

      const endTime = Date.now()
      
      // Should have waited at least the retry delay
      expect(endTime - startTime).toBeGreaterThan(100)
    })

    it('should respect rate limit headers', async () => {
      // Mock rate limit response with Retry-After header
      server.use(
        rest.get('https://api.planning.nsw.gov.au/v1/property/:id', (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.set('Retry-After', '2'),
            ctx.json({ error: 'Rate limit exceeded' })
          )
        })
      )

      const startTime = Date.now()
      
      await expect(
        apiService.fetchPropertyDetails('valid-property-id')
      ).rejects.toThrow('Rate limit exceeded')

      const endTime = Date.now()
      
      // Should have waited at least 2 seconds
      expect(endTime - startTime).toBeGreaterThan(1900)
    })
  })

  describe('Spatial Queries', () => {
    it('should query spatial data by coordinates', async () => {
      const coordinates: [number, number] = [151.2093, -33.8688]
      
      const result = await apiService.querySpatialData(coordinates, 'zoning')

      expect(result.features).toHaveLength(1)
      expect(result.features[0].attributes.Zone_Code).toBe('R4')
    })

    it('should handle invalid coordinates', async () => {
      const invalidCoordinates: [number, number] = [999, 999]

      await expect(
        apiService.querySpatialData(invalidCoordinates, 'zoning')
      ).rejects.toThrow('Invalid geometry')
    })
  })

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      // First call
      await apiService.fetchPropertyDetails('valid-property-id')
      const firstCallCount = fetchSpy.mock.calls.length

      // Second call should use cache
      await apiService.fetchPropertyDetails('valid-property-id')
      const secondCallCount = fetchSpy.mock.calls.length

      expect(secondCallCount).toBe(firstCallCount) // No additional fetch

      fetchSpy.mockRestore()
    })

    it('should not cache error responses', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      // First call (should fail)
      await expect(
        apiService.fetchPropertyDetails('invalid-property-id')
      ).rejects.toThrow()
      const firstCallCount = fetchSpy.mock.calls.length

      // Second call should not use cache
      await expect(
        apiService.fetchPropertyDetails('invalid-property-id')
      ).rejects.toThrow()
      const secondCallCount = fetchSpy.mock.calls.length

      expect(secondCallCount).toBeGreaterThan(firstCallCount)

      fetchSpy.mockRestore()
    })
  })
})
```

### Database Integration Testing

```typescript
// src/services/database.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { PropertyService } from './propertyService'

// Use test database configuration
const testSupabase = createClient(
  process.env.VITE_TEST_SUPABASE_URL!,
  process.env.VITE_TEST_SUPABASE_ANON_KEY!
)

describe('Database Integration', () => {
  let propertyService: PropertyService
  let testOrganizationId: string
  let testProjectId: string

  beforeAll(async () => {
    propertyService = new PropertyService(testSupabase)
    
    // Create test organization
    const { data: org } = await testSupabase
      .from('organizations')
      .insert({ name: 'Test Organization', slug: 'test-org' })
      .select()
      .single()
    
    testOrganizationId = org.id

    // Create test project
    const { data: project } = await testSupabase
      .from('projects')
      .insert({
        organization_id: testOrganizationId,
        name: 'Test Project',
        description: 'Integration test project'
      })
      .select()
      .single()
    
    testProjectId = project.id
  })

  afterAll(async () => {
    // Clean up test data
    await testSupabase
      .from('projects')
      .delete()
      .eq('organization_id', testOrganizationId)
    
    await testSupabase
      .from('organizations')
      .delete()
      .eq('id', testOrganizationId)
  })

  beforeEach(async () => {
    // Clean up properties before each test
    await testSupabase
      .from('properties')
      .delete()
      .eq('project_id', testProjectId)
  })

  describe('Property CRUD Operations', () => {
    it('should create property with all attributes', async () => {
      const propertyData = {
        project_id: testProjectId,
        external_id: 'test-prop-001',
        basic_info: {
          address: '123 Test Street, Sydney NSW 2000',
          suburb: 'Sydney',
          state: 'NSW',
          postcode: '2000'
        },
        planning_controls: {
          zoning: { primary: 'R4' },
          landArea: 600
        },
        financial_metrics: {
          estimatedValue: 850000,
          weeklyRent: 650
        }
      }

      const result = await propertyService.createProperty(propertyData)

      expect(result.id).toBeDefined()
      expect(result.basic_info.address).toBe(propertyData.basic_info.address)
      expect(result.planning_controls.zoning.primary).toBe('R4')
    })

    it('should handle duplicate external_id within project', async () => {
      const propertyData = {
        project_id: testProjectId,
        external_id: 'duplicate-id',
        basic_info: { address: 'Test Address' }
      }

      // First property should succeed
      await propertyService.createProperty(propertyData)

      // Second property with same external_id should fail
      await expect(
        propertyService.createProperty(propertyData)
      ).rejects.toThrow(/duplicate key value/)
    })

    it('should search properties by multiple criteria', async () => {
      // Create test properties
      const properties = [
        {
          project_id: testProjectId,
          external_id: 'search-test-1',
          basic_info: { suburb: 'Sydney' },
          planning_controls: { zoning: { primary: 'R4' } },
          financial_metrics: { estimatedValue: 800000 }
        },
        {
          project_id: testProjectId,
          external_id: 'search-test-2',
          basic_info: { suburb: 'Sydney' },
          planning_controls: { zoning: { primary: 'R2' } },
          financial_metrics: { estimatedValue: 600000 }
        },
        {
          project_id: testProjectId,
          external_id: 'search-test-3',
          basic_info: { suburb: 'Parramatta' },
          planning_controls: { zoning: { primary: 'R4' } },
          financial_metrics: { estimatedValue: 700000 }
        }
      ]

      for (const prop of properties) {
        await propertyService.createProperty(prop)
      }

      // Search by suburb
      const sydneyProperties = await propertyService.searchProperties({
        project_id: testProjectId,
        filters: { suburb: 'Sydney' }
      })
      expect(sydneyProperties).toHaveLength(2)

      // Search by zoning
      const r4Properties = await propertyService.searchProperties({
        project_id: testProjectId,
        filters: { zoning: 'R4' }
      })
      expect(r4Properties).toHaveLength(2)

      // Search by price range
      const midRangeProperties = await propertyService.searchProperties({
        project_id: testProjectId,
        filters: { 
          minValue: 650000,
          maxValue: 750000
        }
      })
      expect(midRangeProperties).toHaveLength(1)
      expect(midRangeProperties[0].external_id).toBe('search-test-3')
    })
  })

  describe('Analysis Operations', () => {
    it('should store and retrieve analysis results', async () => {
      // Create a property first
      const { data: property } = await testSupabase
        .from('properties')
        .insert({
          project_id: testProjectId,
          external_id: 'analysis-test',
          basic_info: { address: 'Analysis Test Property' }
        })
        .select()
        .single()

      const analysisData = {
        property_id: property.id,
        analysis_type: 'financial',
        input_parameters: {
          purchasePrice: 800000,
          weeklyRent: 650,
          loanAmount: 640000
        },
        results: {
          grossYield: 4.225,
          netYield: 2.78,
          cashFlow: -15000
        }
      }

      const analysis = await propertyService.storeAnalysisResult(analysisData)

      expect(analysis.id).toBeDefined()
      expect(analysis.status).toBe('completed')
      expect(analysis.results.grossYield).toBe(4.225)

      // Retrieve analysis
      const retrieved = await propertyService.getAnalysisResults(property.id, 'financial')
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].results.grossYield).toBe(4.225)
    })
  })

  describe('Performance Tests', () => {
    it('should handle bulk property creation efficiently', async () => {
      const bulkProperties = Array.from({ length: 100 }, (_, i) => ({
        project_id: testProjectId,
        external_id: `bulk-test-${i}`,
        basic_info: {
          address: `${i} Bulk Test Street`,
          suburb: i % 2 === 0 ? 'Sydney' : 'Parramatta'
        },
        financial_metrics: {
          estimatedValue: 500000 + (i * 10000)
        }
      }))

      const startTime = Date.now()
      
      // Bulk insert
      const { data } = await testSupabase
        .from('properties')
        .insert(bulkProperties)
        .select()

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(data).toHaveLength(100)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should efficiently query large datasets', async () => {
      // This test assumes the bulk data from previous test
      const startTime = Date.now()

      const results = await propertyService.searchProperties({
        project_id: testProjectId,
        filters: { suburb: 'Sydney' },
        limit: 20,
        offset: 0
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(results.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})
```

## Section 3: End-to-End Testing

### Property Analysis Workflow Testing

```typescript
// tests/e2e/property-analysis.spec.ts
import { test, expect, Page } from '@playwright/test'

class PropertyAnalysisPage {
  constructor(private page: Page) {}

  async navigateToPropertySearch() {
    await this.page.goto('/properties/search')
    await this.page.waitForLoadState('networkidle')
  }

  async searchProperties(suburb: string) {
    await this.page.fill('[data-testid="suburb-search"]', suburb)
    await this.page.click('[data-testid="search-button"]')
    await this.page.waitForSelector('[data-testid="property-card"]')
  }

  async selectProperty(index: number = 0) {
    const properties = this.page.locator('[data-testid="property-card"]')
    await properties.nth(index).click()
    await this.page.waitForSelector('[data-testid="property-details-modal"]')
  }

  async runFinancialAnalysis(analysisParams: {
    purchasePrice: number
    weeklyRent: number
    loanAmount: number
  }) {
    await this.page.click('[data-testid="run-analysis-button"]')
    
    // Fill analysis parameters
    await this.page.fill('[data-testid="purchase-price"]', analysisParams.purchasePrice.toString())
    await this.page.fill('[data-testid="weekly-rent"]', analysisParams.weeklyRent.toString())
    await this.page.fill('[data-testid="loan-amount"]', analysisParams.loanAmount.toString())
    
    await this.page.click('[data-testid="calculate-button"]')
    
    // Wait for analysis to complete
    await this.page.waitForSelector('[data-testid="analysis-results"]', { timeout: 10000 })
  }

  async exportAnalysisReport() {
    await this.page.click('[data-testid="export-report-button"]')
    
    // Wait for download
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.click('[data-testid="download-pdf-button"]')
    
    return downloadPromise
  }

  async getAnalysisResults() {
    return {
      grossYield: await this.page.textContent('[data-testid="gross-yield"]'),
      netYield: await this.page.textContent('[data-testid="net-yield"]'),
      cashFlow: await this.page.textContent('[data-testid="cash-flow"]'),
      roi: await this.page.textContent('[data-testid="roi"]')
    }
  }
}

test.describe('Property Analysis Workflow', () => {
  let propertyPage: PropertyAnalysisPage

  test.beforeEach(async ({ page }) => {
    propertyPage = new PropertyAnalysisPage(page)
    
    // Mock authentication
    await page.route('**/auth/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'test-user', email: 'test@example.com' }
        })
      })
    })

    // Mock property data
    await page.route('**/api/properties/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1',
              basic_info: {
                address: '123 Test Street, Sydney NSW 2000',
                suburb: 'Sydney'
              },
              financial_metrics: {
                estimatedValue: 850000
              }
            }
          ]
        })
      })
    })
  })

  test('should complete full property analysis workflow', async () => {
    await propertyPage.navigateToPropertySearch()
    
    // Search for properties
    await propertyPage.searchProperties('Sydney')
    
    // Select a property
    await propertyPage.selectProperty(0)
    
    // Run financial analysis
    await propertyPage.runFinancialAnalysis({
      purchasePrice: 850000,
      weeklyRent: 650,
      loanAmount: 680000
    })
    
    // Verify results are displayed
    const results = await propertyPage.getAnalysisResults()
    expect(results.grossYield).toContain('3.98%')
    expect(results.cashFlow).toContain('-')
    
    // Export report
    const download = await propertyPage.exportAnalysisReport()
    expect(download.suggestedFilename()).toMatch(/property-analysis.*\.pdf/)
  })

  test('should handle analysis errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analysis/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Analysis service unavailable' })
      })
    })

    await propertyPage.navigateToPropertySearch()
    await propertyPage.searchProperties('Sydney')
    await propertyPage.selectProperty(0)
    
    // Attempt analysis
    await page.click('[data-testid="run-analysis-button"]')
    await page.fill('[data-testid="purchase-price"]', '850000')
    await page.click('[data-testid="calculate-button"]')
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Analysis service unavailable')
    
    // Should allow retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should save analysis to user history', async ({ page }) => {
    // Mock analysis save
    await page.route('**/api/analysis', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'analysis-123', status: 'completed' })
        })
      }
    })

    await propertyPage.navigateToPropertySearch()
    await propertyPage.searchProperties('Sydney')
    await propertyPage.selectProperty(0)
    
    await propertyPage.runFinancialAnalysis({
      purchasePrice: 850000,
      weeklyRent: 650,
      loanAmount: 680000
    })
    
    // Navigate to analysis history
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="analysis-history"]')
    
    // Should see the saved analysis
    await expect(page.locator('[data-testid="analysis-item"]')).toContainText('123 Test Street')
  })
})

test.describe('Map Integration', () => {
  test('should display properties on map correctly', async ({ page }) => {
    // Mock Mapbox
    await page.addInitScript(() => {
      window.mapboxgl = {
        Map: class {
          on() {}
          addSource() {}
          addLayer() {}
          remove() {}
        },
        NavigationControl: class {},
        Marker: class {
          setLngLat() { return this }
          addTo() { return this }
        }
      }
    })

    await page.goto('/properties/map')
    
    // Wait for map to load
    await page.waitForSelector('[data-testid="mapbox-map"]')
    
    // Should show property markers
    await expect(page.locator('[data-testid="property-marker"]')).toHaveCount(3)
    
    // Click on a marker
    await page.click('[data-testid="property-marker"]')
    
    // Should show property popup
    await expect(page.locator('[data-testid="property-popup"]')).toBeVisible()
  })
})
```

### Visual Regression Testing

```typescript
// tests/visual/components.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Mock data for consistent visuals
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: '1',
              basic_info: {
                address: '123 Example Street, Sydney NSW 2000',
                suburb: 'Sydney'
              },
              financial_metrics: {
                estimatedValue: 850000,
                weeklyRent: 650
              },
              planning_controls: {
                zoning: { primary: 'R4' }
              }
            }
          ]
        })
      })
    })
  })

  test('property card component appearance', async ({ page }) => {
    await page.goto('/storybook/?path=/story/components-propertycard--default')
    
    const propertyCard = page.locator('[data-testid="property-card"]')
    await expect(propertyCard).toHaveScreenshot('property-card-default.png')
  })

  test('property card with analysis results', async ({ page }) => {
    await page.goto('/storybook/?path=/story/components-propertycard--with-analysis')
    
    const propertyCard = page.locator('[data-testid="property-card"]')
    await expect(propertyCard).toHaveScreenshot('property-card-with-analysis.png')
  })

  test('property search interface', async ({ page }) => {
    await page.goto('/properties/search')
    await page.waitForLoadState('networkidle')
    
    // Fill search form for consistent state
    await page.fill('[data-testid="suburb-search"]', 'Sydney')
    
    await expect(page).toHaveScreenshot('property-search-interface.png')
  })

  test('analysis results dashboard', async ({ page }) => {
    await page.goto('/properties/1/analysis')
    await page.waitForLoadState('networkidle')
    
    // Wait for charts to render
    await page.waitForTimeout(2000)
    
    await expect(page.locator('[data-testid="analysis-dashboard"]')).toHaveScreenshot('analysis-dashboard.png')
  })

  test('mobile property card layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    
    await page.goto('/storybook/?path=/story/components-propertycard--mobile')
    
    const propertyCard = page.locator('[data-testid="property-card"]')
    await expect(propertyCard).toHaveScreenshot('property-card-mobile.png')
  })

  test('dark mode property interface', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    
    await page.goto('/properties/search')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('property-search-dark-mode.png')
  })
})
```

## Section 4: Performance Testing

### Load Testing for Property Data

```typescript
// tests/performance/property-search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('property search performance with large dataset', async ({ page }) => {
    // Navigate to search page
    await page.goto('/properties/search')
    
    // Measure search performance
    const searchStartTime = Date.now()
    
    await page.fill('[data-testid="suburb-search"]', 'Sydney')
    await page.click('[data-testid="search-button"]')
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="property-card"]')
    
    const searchEndTime = Date.now()
    const searchDuration = searchEndTime - searchStartTime
    
    // Search should complete within 2 seconds
    expect(searchDuration).toBeLessThan(2000)
    
    // Should display at least 10 results
    const propertyCards = page.locator('[data-testid="property-card"]')
    expect(await propertyCards.count()).toBeGreaterThanOrEqual(10)
  })

  test('analysis calculation performance', async ({ page }) => {
    await page.goto('/properties/1')
    
    // Click analysis button
    const analysisStartTime = Date.now()
    
    await page.click('[data-testid="run-analysis-button"]')
    
    // Fill analysis form
    await page.fill('[data-testid="purchase-price"]', '850000')
    await page.fill('[data-testid="weekly-rent"]', '650')
    await page.fill('[data-testid="loan-amount"]', '680000')
    
    await page.click('[data-testid="calculate-button"]')
    
    // Wait for results
    await page.waitForSelector('[data-testid="analysis-results"]')
    
    const analysisEndTime = Date.now()
    const analysisDuration = analysisEndTime - analysisStartTime
    
    // Analysis should complete within 3 seconds
    expect(analysisDuration).toBeLessThan(3000)
  })

  test('map rendering performance', async ({ page }) => {
    // Mock Mapbox for performance testing
    await page.addInitScript(() => {
      window.mapboxgl = {
        Map: class {
          constructor() {
            setTimeout(() => this.onload?.(), 100) // Simulate load
          }
          on(event, callback) {
            if (event === 'load') this.onload = callback
          }
          addSource() {}
          addLayer() {}
          remove() {}
        },
        NavigationControl: class {},
        Marker: class {
          setLngLat() { return this }
          addTo() { return this }
        }
      }
    })

    const mapStartTime = Date.now()
    
    await page.goto('/properties/map')
    
    // Wait for map to be ready
    await page.waitForSelector('[data-testid="mapbox-map"]')
    await page.waitForFunction(() => window.mapReady === true, undefined, { timeout: 5000 })
    
    const mapEndTime = Date.now()
    const mapDuration = mapEndTime - mapStartTime
    
    // Map should load within 3 seconds
    expect(mapDuration).toBeLessThan(3000)
  })

  test('memory usage during extended use', async ({ page }) => {
    await page.goto('/properties/search')
    
    // Measure initial memory usage
    const initialMetrics = await page.evaluate(() => performance.memory)
    
    // Perform multiple searches to stress test memory
    const suburbs = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
    
    for (const suburb of suburbs) {
      await page.fill('[data-testid="suburb-search"]', suburb)
      await page.click('[data-testid="search-button"]')
      await page.waitForSelector('[data-testid="property-card"]')
      
      // Brief pause between searches
      await page.waitForTimeout(500)
    }
    
    // Measure final memory usage
    const finalMetrics = await page.evaluate(() => performance.memory)
    
    // Memory usage shouldn't increase dramatically
    const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize
    const memoryIncreasePercent = (memoryIncrease / initialMetrics.usedJSHeapSize) * 100
    
    expect(memoryIncreasePercent).toBeLessThan(50) // Less than 50% increase
  })
})
```

## Practical Exercises

### Exercise 1: Testing Strategy Implementation
Create a comprehensive testing strategy for a property analysis feature including:
- Unit tests for calculation functions
- Component tests for UI elements
- Integration tests for API calls
- End-to-end workflow tests

### Exercise 2: Mock Data Management
Build a robust mock data system for:
- Government API responses
- Property dataset variations
- Error condition simulation
- Performance testing scenarios

### Exercise 3: Visual Testing Setup
Implement visual regression testing for:
- Property card components
- Map visualizations
- Analysis dashboards
- Mobile responsive layouts

### Exercise 4: Performance Test Suite
Create performance tests for:
- Large dataset handling
- Analysis calculation speed
- Map rendering performance
- Memory usage optimization

## Summary

This module covered comprehensive testing strategies for property management platforms:

- **Unit Testing**: Property calculations, component logic, and utility functions
- **Integration Testing**: Government APIs, database operations, and service interactions
- **End-to-End Testing**: Complete user workflows and cross-browser compatibility
- **Visual Testing**: UI consistency and responsive design verification
- **Performance Testing**: Load handling, calculation speed, and memory management

These testing skills ensure property platforms are reliable, accurate, and performant across all scenarios and user interactions.

## Navigation
- [Next: Module 6.3 - Documentation and Maintenance →](./Module-6.3-Documentation-and-Maintenance.md)
- [← Previous: Module 6.1 - Modern Build Tools](./Module-6.1-Modern-Build-Tools.md)
- [↑ Back to Phase 6 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)