# Module 6.3: Documentation and Maintenance

## Learning Objectives
By the end of this module, you will be able to:
- Create comprehensive API documentation for property management systems
- Implement automated documentation generation workflows
- Design maintainable code architecture with clear documentation patterns
- Establish code review and maintenance processes
- Create user guides and technical documentation for complex property workflows
- Implement changelog management and version documentation

## Prerequisites
- Understanding of software development lifecycle
- Knowledge of API design patterns (Module 5.2)
- Familiarity with build tools and automation (Module 6.1)
- Experience with property management workflows

## Introduction

Property management platforms require extensive documentation due to their complexity: financial calculations must be transparent, government API integrations need clear specifications, and complex workflows require user guidance. This module explores creating and maintaining comprehensive documentation systems that serve developers, stakeholders, and end users.

**Why Documentation Matters for Property Platforms:**
- **Regulatory Compliance**: Financial calculations must be documented and auditable
- **Team Collaboration**: Complex property workflows require clear specifications
- **API Integration**: Government and third-party APIs need comprehensive documentation
- **User Training**: Property professionals need guidance for complex analysis tools
- **Maintenance**: Code must be maintainable by multiple developers over time
- **Knowledge Transfer**: Domain expertise must be preserved and shared

## Section 1: API Documentation

### OpenAPI Specification for Property APIs

Property platforms require detailed API documentation for internal and external integrations:

```yaml
# openapi.yaml - Comprehensive API specification
openapi: 3.0.3
info:
  title: Property Analysis Platform API
  description: |
    Comprehensive API for property analysis, valuation, and management.
    
    ## Authentication
    This API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    
    ## Rate Limiting
    API requests are limited to 1000 requests per hour per organization.
    
    ## Error Handling
    All errors follow RFC 7807 Problem Details specification.
    
  version: 2.1.0
  contact:
    name: Property Platform API Team
    email: api-support@propertyplatform.com
    url: https://docs.propertyplatform.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.propertyplatform.com/v2
    description: Production server
  - url: https://staging-api.propertyplatform.com/v2
    description: Staging server
  - url: http://localhost:3000/api/v2
    description: Local development server

paths:
  /properties:
    get:
      summary: Search properties
      description: |
        Search properties using various criteria including location, price range, zoning, and property characteristics.
        
        ## Search Examples
        
        **Basic location search:**
        ```
        GET /properties?suburb=Sydney&state=NSW
        ```
        
        **Price range search:**
        ```
        GET /properties?minValue=500000&maxValue=1000000
        ```
        
        **Complex criteria search:**
        ```
        GET /properties?suburb=Sydney&zoning=R4&minYield=4.0&sortBy=estimatedValue&order=desc
        ```
        
      operationId: searchProperties
      tags:
        - Properties
      parameters:
        - name: suburb
          in: query
          description: Filter by suburb name
          schema:
            type: string
            example: Sydney
        - name: state
          in: query
          description: Filter by state (NSW, VIC, QLD, etc.)
          schema:
            type: string
            enum: [NSW, VIC, QLD, WA, SA, TAS, ACT, NT]
        - name: minValue
          in: query
          description: Minimum estimated property value
          schema:
            type: integer
            minimum: 0
            example: 500000
        - name: maxValue
          in: query
          description: Maximum estimated property value
          schema:
            type: integer
            minimum: 0
            example: 1500000
        - name: minYield
          in: query
          description: Minimum rental yield percentage
          schema:
            type: number
            minimum: 0
            maximum: 20
            example: 4.0
        - name: zoning
          in: query
          description: Property zoning classification
          schema:
            type: string
            enum: [R1, R2, R3, R4, R5, B1, B2, B3, B4, IN1, IN2, IN3, SP1, SP2, SP3]
        - name: page
          in: query
          description: Page number for pagination
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of properties per page
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: sortBy
          in: query
          description: Field to sort by
          schema:
            type: string
            enum: [estimatedValue, weeklyRent, yield, landArea, createdAt]
            default: createdAt
        - name: order
          in: query
          description: Sort order
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        '200':
          description: Successful property search
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Property'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
              examples:
                successful_search:
                  summary: Successful property search
                  value:
                    success: true
                    data:
                      - id: "123e4567-e89b-12d3-a456-426614174000"
                        basicInfo:
                          address: "123 Example Street, Sydney NSW 2000"
                          suburb: "Sydney"
                          state: "NSW"
                          postcode: "2000"
                          propertyType: "Apartment"
                        financialMetrics:
                          estimatedValue: 850000
                          weeklyRent: 650
                          grossYield: 3.98
                        planningControls:
                          zoning:
                            primary: "R4"
                            description: "High Density Residential"
                          landArea: 600
                    meta:
                      total: 156
                      page: 1
                      limit: 20
                      totalPages: 8
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'

    post:
      summary: Create a new property
      description: |
        Create a new property in the specified project. Properties must be associated with a project
        and organization for access control.
        
        ## Required Fields
        - `projectId`: Valid project UUID
        - `basicInfo.address`: Full property address
        
        ## Optional Financial Data
        Property financial data can be provided during creation or added later through analysis endpoints.
        
      operationId: createProperty
      tags:
        - Properties
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PropertyCreate'
            examples:
              basic_property:
                summary: Basic property creation
                value:
                  projectId: "proj_123e4567-e89b-12d3-a456-426614174000"
                  externalId: "PROP-2024-001"
                  basicInfo:
                    address: "456 New Street, Melbourne VIC 3000"
                    suburb: "Melbourne"
                    state: "VIC"
                    postcode: "3000"
                    propertyType: "House"
                  planningControls:
                    zoning:
                      primary: "R2"
                    landArea: 750
              complete_property:
                summary: Property with financial data
                value:
                  projectId: "proj_123e4567-e89b-12d3-a456-426614174000"
                  externalId: "PROP-2024-002"
                  basicInfo:
                    address: "789 Investment Avenue, Brisbane QLD 4000"
                    suburb: "Brisbane"
                    state: "QLD"
                    postcode: "4000"
                    propertyType: "Apartment"
                  financialMetrics:
                    estimatedValue: 650000
                    weeklyRent: 500
                    lastSalePrice: 620000
                    lastSaleDate: "2023-06-15"
                  planningControls:
                    zoning:
                      primary: "R4"
                    landArea: 400
                  spatialAttributes:
                    coordinates:
                      type: "Point"
                      coordinates: [153.0281, -27.4679]
      responses:
        '201':
          description: Property created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/Property'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /properties/{propertyId}/analysis:
    post:
      summary: Run property analysis
      description: |
        Execute comprehensive property analysis including financial modeling, 
        risk assessment, and investment projections.
        
        ## Analysis Types
        
        ### Financial Analysis
        Calculates rental yields, cash flow projections, and ROI metrics.
        Required parameters: `purchasePrice`, `weeklyRent`
        
        ### Environmental Analysis  
        Assesses environmental risks including flood, contamination, and heritage constraints.
        Requires property coordinates to be set.
        
        ### Development Analysis
        Evaluates development potential based on planning controls and site characteristics.
        
        ## Calculation Accuracy
        All financial calculations are performed using industry-standard formulas and are accurate to 2 decimal places.
        
      operationId: runPropertyAnalysis
      tags:
        - Analysis
      parameters:
        - name: propertyId
          in: path
          required: true
          description: Unique property identifier
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AnalysisRequest'
            examples:
              financial_analysis:
                summary: Financial analysis request
                value:
                  analysisType: "financial"
                  parameters:
                    purchasePrice: 850000
                    weeklyRent: 650
                    renovationCosts: 25000
                    loanDetails:
                      loanAmount: 680000
                      interestRate: 5.5
                      loanTerm: 30
                    assumptions:
                      vacancyRate: 4
                      managementFees: 8
                      annualGrowth: 3.5
                      inflationRate: 2.5
              environmental_analysis:
                summary: Environmental risk analysis
                value:
                  analysisType: "environmental"
                  parameters:
                    includeFloodRisk: true
                    includeContamination: true
                    includeHeritage: true
                    includeBushfire: true
                    bufferDistance: 500
      responses:
        '201':
          description: Analysis completed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    $ref: '#/components/schemas/AnalysisResult'
        '400':
          $ref: '#/components/responses/BadRequest'
        '422':
          description: Analysis parameters validation failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Property:
      type: object
      description: Complete property information including location, financial metrics, and planning controls
      properties:
        id:
          type: string
          format: uuid
          description: Unique property identifier
          example: "123e4567-e89b-12d3-a456-426614174000"
        projectId:
          type: string
          format: uuid
          description: Associated project identifier
        externalId:
          type: string
          description: External system property identifier
          example: "PROP-2024-001"
        basicInfo:
          $ref: '#/components/schemas/PropertyBasicInfo'
        financialMetrics:
          $ref: '#/components/schemas/PropertyFinancialMetrics'
        planningControls:
          $ref: '#/components/schemas/PropertyPlanningControls'
        spatialAttributes:
          $ref: '#/components/schemas/PropertySpatialAttributes'
        createdAt:
          type: string
          format: date-time
          description: Property creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp

    PropertyBasicInfo:
      type: object
      required:
        - address
      properties:
        address:
          type: string
          description: Full property address
          example: "123 Example Street, Sydney NSW 2000"
        suburb:
          type: string
          example: "Sydney"
        state:
          type: string
          enum: [NSW, VIC, QLD, WA, SA, TAS, ACT, NT]
          example: "NSW"
        postcode:
          type: string
          pattern: '^\d{4}$'
          example: "2000"
        propertyType:
          type: string
          enum: [House, Apartment, Townhouse, Unit, Land, Commercial, Industrial]
          example: "Apartment"
        description:
          type: string
          description: Additional property description

    PropertyFinancialMetrics:
      type: object
      properties:
        estimatedValue:
          type: integer
          minimum: 0
          description: Current estimated property value in AUD
          example: 850000
        weeklyRent:
          type: integer
          minimum: 0
          description: Weekly rental income in AUD
          example: 650
        grossYield:
          type: number
          minimum: 0
          maximum: 50
          description: Gross rental yield percentage
          example: 3.98
        netYield:
          type: number
          minimum: 0
          maximum: 50
          description: Net rental yield percentage
          example: 2.85
        lastSalePrice:
          type: integer
          minimum: 0
          description: Most recent sale price
        lastSaleDate:
          type: string
          format: date
          description: Date of most recent sale

    AnalysisResult:
      type: object
      properties:
        id:
          type: string
          format: uuid
        propertyId:
          type: string
          format: uuid
        analysisType:
          type: string
          enum: [financial, environmental, development, comprehensive]
        status:
          type: string
          enum: [completed, failed, pending]
        results:
          type: object
          description: Analysis results (structure varies by analysis type)
          example:
            summary:
              grossRentalYield: 3.98
              netRentalYield: 2.85
              annualCashFlow: -12500
              totalInvestment: 875000
            projections:
              - year: 1
                propertyValue: 884750
                rentalIncome: 34580
                cashFlow: -11250
        calculatedAt:
          type: string
          format: date-time

  responses:
    BadRequest:
      description: Bad request - invalid parameters
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                type: object
                properties:
                  code:
                    type: string
                    example: "INVALID_PARAMETERS"
                  message:
                    type: string
                    example: "Invalid suburb parameter"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                type: object
                properties:
                  code:
                    type: string
                    example: "UNAUTHORIZED"
                  message:
                    type: string
                    example: "Valid authentication token required"

security:
  - BearerAuth: []
```

### Automated Documentation Generation

```typescript
// scripts/generate-docs.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface DocumentationConfig {
  inputFiles: string[]
  outputDir: string
  templates: {
    api: string
    components: string
    hooks: string
  }
  includePrivate: boolean
  generateChangelog: boolean
}

class DocumentationGenerator {
  private config: DocumentationConfig
  private projectRoot: string

  constructor(config: DocumentationConfig, projectRoot: string) {
    this.config = config
    this.projectRoot = projectRoot
  }

  async generateAll(): Promise<void> {
    console.log('🚀 Starting documentation generation...')

    // Clean output directory
    this.cleanOutputDirectory()

    // Generate API documentation from OpenAPI spec
    await this.generateApiDocs()

    // Generate component documentation from TSDoc
    await this.generateComponentDocs()

    // Generate hook documentation
    await this.generateHookDocs()

    // Generate utility function documentation
    await this.generateUtilityDocs()

    // Generate changelog
    if (this.config.generateChangelog) {
      await this.generateChangelog()
    }

    // Generate navigation and index files
    await this.generateNavigation()

    console.log('✅ Documentation generation complete!')
  }

  private cleanOutputDirectory(): void {
    if (fs.existsSync(this.config.outputDir)) {
      fs.rmSync(this.config.outputDir, { recursive: true, force: true })
    }
    fs.mkdirSync(this.config.outputDir, { recursive: true })
  }

  private async generateApiDocs(): Promise<void> {
    console.log('📋 Generating API documentation...')

    try {
      // Use Redoc CLI to generate API docs from OpenAPI spec
      execSync(`npx redoc-cli build openapi.yaml --output ${this.config.outputDir}/api.html`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      })

      // Generate markdown version for integration
      execSync(`npx swagger-codegen-cli generate -i openapi.yaml -l markdown -o ${this.config.outputDir}/api`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      })

      console.log('✅ API documentation generated')
    } catch (error) {
      console.error('❌ API documentation generation failed:', error)
    }
  }

  private async generateComponentDocs(): Promise<void> {
    console.log('🎨 Generating component documentation...')

    try {
      // Use TypeDoc to generate component documentation
      execSync(`npx typedoc src/components --out ${this.config.outputDir}/components --readme none`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      })

      // Generate component usage examples
      await this.generateComponentExamples()

      console.log('✅ Component documentation generated')
    } catch (error) {
      console.error('❌ Component documentation generation failed:', error)
    }
  }

  private async generateComponentExamples(): Promise<void> {
    const componentsDir = path.join(this.projectRoot, 'src', 'components')
    const examplesDir = path.join(this.config.outputDir, 'components', 'examples')

    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true })
    }

    // Find all component files
    const componentFiles = this.findFiles(componentsDir, /\.tsx$/)

    for (const file of componentFiles) {
      const componentName = path.basename(file, '.tsx')
      const exampleFile = path.join(examplesDir, `${componentName}.md`)

      // Extract JSDoc examples from component files
      const examples = this.extractComponentExamples(file)
      if (examples.length > 0) {
        const markdown = this.generateExampleMarkdown(componentName, examples)
        fs.writeFileSync(exampleFile, markdown)
      }
    }
  }

  private extractComponentExamples(filePath: string): any[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const examples: any[] = []

    // Extract @example blocks from JSDoc comments
    const exampleRegex = /\/\*\*[\s\S]*?@example\s+([\s\S]*?)(?=\*\/|\*\s*@)/g
    let match

    while ((match = exampleRegex.exec(content)) !== null) {
      const example = match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n')
        .trim()

      if (example) {
        examples.push({
          code: example,
          description: this.extractExampleDescription(content, match.index)
        })
      }
    }

    return examples
  }

  private generateExampleMarkdown(componentName: string, examples: any[]): string {
    let markdown = `# ${componentName} Examples\n\n`

    examples.forEach((example, index) => {
      markdown += `## Example ${index + 1}\n\n`
      
      if (example.description) {
        markdown += `${example.description}\n\n`
      }

      markdown += '```tsx\n'
      markdown += example.code
      markdown += '\n```\n\n'
    })

    return markdown
  }

  private async generateHookDocs(): Promise<void> {
    console.log('🪝 Generating hooks documentation...')

    const hooksDir = path.join(this.projectRoot, 'src', 'hooks')
    const outputDir = path.join(this.config.outputDir, 'hooks')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate TypeDoc for hooks
    try {
      execSync(`npx typedoc src/hooks --out ${outputDir} --readme none`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      })

      console.log('✅ Hooks documentation generated')
    } catch (error) {
      console.error('❌ Hooks documentation generation failed:', error)
    }
  }

  private async generateUtilityDocs(): Promise<void> {
    console.log('🔧 Generating utility documentation...')

    const utilsDir = path.join(this.projectRoot, 'src', 'utils')
    const outputDir = path.join(this.config.outputDir, 'utils')

    // Generate documentation for property calculation utilities
    await this.generatePropertyCalculationDocs(utilsDir, outputDir)

    console.log('✅ Utility documentation generated')
  }

  private async generatePropertyCalculationDocs(utilsDir: string, outputDir: string): Promise<void> {
    const calcFile = path.join(utilsDir, 'propertyCalculations.ts')
    
    if (!fs.existsSync(calcFile)) return

    const content = fs.readFileSync(calcFile, 'utf-8')
    
    // Extract function documentation
    const functions = this.extractFunctionDocs(content)
    
    let markdown = '# Property Calculation Functions\n\n'
    markdown += 'This module provides financial calculation functions for property analysis.\n\n'

    functions.forEach(func => {
      markdown += `## ${func.name}\n\n`
      markdown += `${func.description}\n\n`
      
      if (func.parameters.length > 0) {
        markdown += '### Parameters\n\n'
        func.parameters.forEach(param => {
          markdown += `- **${param.name}** (${param.type}): ${param.description}\n`
        })
        markdown += '\n'
      }

      if (func.returns) {
        markdown += `### Returns\n\n${func.returns}\n\n`
      }

      if (func.example) {
        markdown += '### Example\n\n```typescript\n'
        markdown += func.example
        markdown += '\n```\n\n'
      }
    })

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(path.join(outputDir, 'property-calculations.md'), markdown)
  }

  private extractFunctionDocs(content: string): any[] {
    const functions: any[] = []
    
    // Regex to match function declarations with JSDoc
    const functionRegex = /\/\*\*([\s\S]*?)\*\/\s*export\s+(?:function|const)\s+(\w+)/g
    let match

    while ((match = functionRegex.exec(content)) !== null) {
      const jsdoc = match[1]
      const functionName = match[2]

      const func = {
        name: functionName,
        description: this.extractDescription(jsdoc),
        parameters: this.extractParameters(jsdoc),
        returns: this.extractReturns(jsdoc),
        example: this.extractExample(jsdoc)
      }

      functions.push(func)
    }

    return functions
  }

  private extractDescription(jsdoc: string): string {
    const lines = jsdoc.split('\n').map(line => line.replace(/^\s*\*\s?/, ''))
    const descriptionLines = []

    for (const line of lines) {
      if (line.startsWith('@')) break
      if (line.trim()) descriptionLines.push(line)
    }

    return descriptionLines.join(' ')
  }

  private extractParameters(jsdoc: string): any[] {
    const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)\s+(.*)/g
    const parameters: any[] = []
    let match

    while ((match = paramRegex.exec(jsdoc)) !== null) {
      parameters.push({
        type: match[1],
        name: match[2],
        description: match[3]
      })
    }

    return parameters
  }

  private extractReturns(jsdoc: string): string | null {
    const returnMatch = jsdoc.match(/@returns?\s+(.*)/s)
    return returnMatch ? returnMatch[1].trim() : null
  }

  private extractExample(jsdoc: string): string | null {
    const exampleMatch = jsdoc.match(/@example\s+([\s\S]*?)(?=\*\/|\*\s*@)/s)
    if (!exampleMatch) return null

    return exampleMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim()
  }

  private async generateChangelog(): Promise<void> {
    console.log('📝 Generating changelog...')

    try {
      // Use conventional-changelog to generate changelog
      execSync(`npx conventional-changelog -p angular -i ${this.config.outputDir}/CHANGELOG.md -s`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      })

      console.log('✅ Changelog generated')
    } catch (error) {
      console.error('❌ Changelog generation failed:', error)
    }
  }

  private async generateNavigation(): Promise<void> {
    console.log('🗺️ Generating navigation...')

    const navigation = {
      sections: [
        {
          title: 'API Reference',
          path: '/api.html',
          description: 'Complete API documentation with examples'
        },
        {
          title: 'Components',
          path: '/components/',
          description: 'React component library documentation'
        },
        {
          title: 'Hooks',
          path: '/hooks/',
          description: 'Custom React hooks documentation'
        },
        {
          title: 'Utilities',
          path: '/utils/',
          description: 'Utility functions and calculations'
        },
        {
          title: 'Changelog',
          path: '/CHANGELOG.md',
          description: 'Version history and release notes'
        }
      ]
    }

    const indexHtml = this.generateIndexHtml(navigation)
    fs.writeFileSync(path.join(this.config.outputDir, 'index.html'), indexHtml)

    console.log('✅ Navigation generated')
  }

  private generateIndexHtml(navigation: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Platform Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .section { padding: 2rem; border: 1px solid #e1e5e9; border-radius: 8px; text-decoration: none; color: inherit; }
        .section:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .section h3 { margin: 0 0 1rem 0; color: #1f2937; }
        .section p { margin: 0; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Property Platform Documentation</h1>
            <p>Comprehensive documentation for the Property Analysis Platform</p>
        </div>
        <div class="sections">
            ${navigation.sections.map(section => `
                <a href="${section.path}" class="section">
                    <h3>${section.title}</h3>
                    <p>${section.description}</p>
                </a>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  private findFiles(dir: string, pattern: RegExp): string[] {
    const files: string[] = []

    if (!fs.existsSync(dir)) return files

    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, pattern))
      } else if (pattern.test(item)) {
        files.push(fullPath)
      }
    }

    return files
  }

  private extractExampleDescription(content: string, index: number): string {
    // Extract description before @example
    const beforeExample = content.substring(0, index)
    const descMatch = beforeExample.match(/\/\*\*\s*([\s\S]*?)(?=@example|\*\/)/s)
    
    if (!descMatch) return ''

    return descMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join(' ')
      .trim()
  }
}

// Configuration
const config: DocumentationConfig = {
  inputFiles: [
    'src/components/**/*.tsx',
    'src/hooks/**/*.ts',
    'src/utils/**/*.ts',
    'src/services/**/*.ts'
  ],
  outputDir: 'docs',
  templates: {
    api: 'templates/api.hbs',
    components: 'templates/component.hbs',
    hooks: 'templates/hook.hbs'
  },
  includePrivate: false,
  generateChangelog: true
}

// Generate documentation
const generator = new DocumentationGenerator(config, process.cwd())
generator.generateAll().catch(console.error)
```

## Section 2: Code Documentation Standards

### TSDoc Documentation Patterns

```typescript
/**
 * Property financial calculation utilities
 * 
 * This module provides comprehensive financial analysis functions for property investment
 * calculations including rental yields, cash flow projections, and ROI analysis.
 * 
 * All calculations follow Australian property investment standards and regulatory guidelines.
 * 
 * @packageDocumentation
 */

/**
 * Configuration for property financial analysis
 * 
 * @public
 */
export interface PropertyFinancialConfig {
  /** Purchase price including all acquisition costs */
  purchasePrice: number
  /** Weekly rental income */
  weeklyRent: number
  /** Annual property expenses */
  expenses: PropertyExpenses
  /** Loan configuration if property is financed */
  loanDetails?: LoanConfiguration
  /** Growth and inflation assumptions */
  assumptions: GrowthAssumptions
}

/**
 * Detailed property expense breakdown
 * 
 * @public
 */
export interface PropertyExpenses {
  /** Annual council rates */
  councilRates: number
  /** Annual water rates */
  waterRates: number
  /** Property insurance premium */
  insurance: number
  /** Annual maintenance budget */
  maintenance: number
  /** Property management fees as percentage (0.08 = 8%) */
  managementFees: number
  /** Vacancy allowance as percentage (0.04 = 4%) */
  vacancy: number
  /** Annual body corporate fees (for apartments/units) */
  bodyCorporate?: number
  /** Annual land tax (if applicable) */
  landTax?: number
}

/**
 * Calculate gross rental yield for a property
 * 
 * Gross rental yield represents the annual rental income as a percentage of the property's value,
 * before deducting any expenses. This is the most commonly quoted yield figure in property marketing.
 * 
 * Formula: (Weekly Rent × 52) ÷ Property Value × 100
 * 
 * @param config - Property financial configuration
 * @returns Gross rental yield as a percentage
 * 
 * @example
 * ```typescript
 * const config = {
 *   purchasePrice: 800000,
 *   weeklyRent: 650,
 *   expenses: { ... },
 *   assumptions: { ... }
 * }
 * 
 * const grossYield = calculateGrossRentalYield(config)
 * console.log(`Gross yield: ${grossYield.toFixed(2)}%`) // "Gross yield: 4.23%"
 * ```
 * 
 * @example
 * ```typescript
 * // For a $500,000 property with $400/week rent
 * const yield = calculateGrossRentalYield({
 *   purchasePrice: 500000,
 *   weeklyRent: 400,
 *   // ... other required fields
 * })
 * // Returns: 4.16
 * ```
 * 
 * @throws {@link PropertyCalculationError}
 * Thrown when purchase price is zero or negative
 * 
 * @throws {@link PropertyCalculationError}
 * Thrown when weekly rent is negative
 * 
 * @public
 */
export function calculateGrossRentalYield(config: PropertyFinancialConfig): number {
  if (config.purchasePrice <= 0) {
    throw new PropertyCalculationError('Purchase price must be greater than zero')
  }

  if (config.weeklyRent < 0) {
    throw new PropertyCalculationError('Weekly rent cannot be negative')
  }

  const annualRent = config.weeklyRent * 52
  return (annualRent / config.purchasePrice) * 100
}

/**
 * Calculate net rental yield after all expenses
 * 
 * Net rental yield provides a more realistic picture of property returns by factoring in
 * all operating expenses including management fees, vacancy allowances, and holding costs.
 * 
 * This metric is crucial for serious property investors as it represents the actual
 * cash-on-cash return before financing costs.
 * 
 * Formula: (Annual Net Income) ÷ Property Value × 100
 * Where Net Income = Gross Income - All Expenses
 * 
 * @param config - Property financial configuration
 * @returns Net rental yield as a percentage
 * 
 * @example
 * ```typescript
 * const config = {
 *   purchasePrice: 800000,
 *   weeklyRent: 650,
 *   expenses: {
 *     councilRates: 2500,
 *     waterRates: 800,
 *     insurance: 1200,
 *     maintenance: 3000,
 *     managementFees: 0.08, // 8%
 *     vacancy: 0.04 // 4%
 *   },
 *   assumptions: { ... }
 * }
 * 
 * const netYield = calculateNetRentalYield(config)
 * console.log(`Net yield: ${netYield.toFixed(2)}%`) // "Net yield: 2.85%"
 * ```
 * 
 * @remarks
 * This calculation includes:
 * - Management fees as percentage of gross income
 * - Vacancy allowance as percentage of gross income  
 * - Fixed annual expenses (rates, insurance, maintenance)
 * - Body corporate fees (if applicable)
 * - Land tax (if applicable)
 * 
 * @public
 */
export function calculateNetRentalYield(config: PropertyFinancialConfig): number {
  const grossIncome = config.weeklyRent * 52
  
  // Calculate percentage-based expenses
  const managementFees = grossIncome * config.expenses.managementFees
  const vacancyLoss = grossIncome * config.expenses.vacancy
  
  // Calculate fixed expenses
  const fixedExpenses = 
    config.expenses.councilRates +
    config.expenses.waterRates +
    config.expenses.insurance +
    config.expenses.maintenance +
    (config.expenses.bodyCorporate || 0) +
    (config.expenses.landTax || 0)
  
  const totalExpenses = managementFees + vacancyLoss + fixedExpenses
  const netIncome = grossIncome - totalExpenses
  
  return (netIncome / config.purchasePrice) * 100
}

/**
 * Generate comprehensive cash flow projections
 * 
 * Creates detailed year-by-year cash flow analysis including:
 * - Rental income growth
 * - Expense inflation
 * - Loan repayments (if applicable)
 * - Net cash flow position
 * - Property value appreciation
 * 
 * This function is essential for long-term investment planning and understanding
 * the financial trajectory of a property investment.
 * 
 * @param config - Property financial configuration
 * @param projectionYears - Number of years to project (default: 10)
 * @returns Array of annual cash flow projections
 * 
 * @example
 * ```typescript
 * const config = {
 *   purchasePrice: 800000,
 *   weeklyRent: 650,
 *   expenses: { ... },
 *   loanDetails: {
 *     loanAmount: 640000,
 *     interestRate: 5.5,
 *     loanTerm: 30
 *   },
 *   assumptions: {
 *     rentalGrowth: 3.0,
 *     expenseInflation: 2.5,
 *     propertyGrowth: 4.0
 *   }
 * }
 * 
 * const projections = generateCashFlowProjections(config, 10)
 * console.log(`Year 5 cash flow: $${projections[4].netCashFlow}`)
 * ```
 * 
 * @example
 * ```typescript
 * // Generate 5-year projections for investment analysis
 * const projections = generateCashFlowProjections(config, 5)
 * 
 * // Calculate total cash flow over period
 * const totalCashFlow = projections.reduce((sum, year) => sum + year.netCashFlow, 0)
 * console.log(`Total 5-year cash flow: $${totalCashFlow}`)
 * 
 * // Find break-even year
 * const breakEvenYear = projections.findIndex(year => year.netCashFlow >= 0) + 1
 * console.log(`Property becomes cash flow positive in year ${breakEvenYear}`)
 * ```
 * 
 * @public
 */
export function generateCashFlowProjections(
  config: PropertyFinancialConfig,
  projectionYears: number = 10
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = []
  
  let currentPropertyValue = config.purchasePrice
  let currentWeeklyRent = config.weeklyRent
  
  for (let year = 1; year <= projectionYears; year++) {
    // Apply growth rates
    currentPropertyValue *= (1 + config.assumptions.propertyGrowth / 100)
    currentWeeklyRent *= (1 + config.assumptions.rentalGrowth / 100)
    
    // Calculate income and expenses for this year
    const grossIncome = currentWeeklyRent * 52
    const expenses = calculateAnnualExpenses(config.expenses, year, config.assumptions)
    const loanRepayments = config.loanDetails 
      ? calculateLoanRepayments(config.loanDetails)
      : 0
    
    const netCashFlow = grossIncome - expenses - loanRepayments
    
    projections.push({
      year,
      propertyValue: Math.round(currentPropertyValue),
      weeklyRent: Math.round(currentWeeklyRent),
      grossIncome: Math.round(grossIncome),
      totalExpenses: Math.round(expenses),
      loanRepayments: Math.round(loanRepayments),
      netCashFlow: Math.round(netCashFlow),
      yield: (grossIncome / currentPropertyValue) * 100
    })
  }
  
  return projections
}

/**
 * Custom error class for property calculation errors
 * 
 * @public
 */
export class PropertyCalculationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PropertyCalculationError'
  }
}

/**
 * Annual cash flow projection for a single year
 * 
 * @public
 */
export interface CashFlowProjection {
  /** Projection year (1-based) */
  year: number
  /** Property value at end of year */
  propertyValue: number
  /** Weekly rent at end of year */
  weeklyRent: number
  /** Total gross rental income for the year */
  grossIncome: number
  /** Total operating expenses for the year */
  totalExpenses: number
  /** Annual loan repayments (principal + interest) */
  loanRepayments: number
  /** Net cash flow (positive = cash positive, negative = cash negative) */
  netCashFlow: number
  /** Rental yield at end of year */
  yield: number
}
```

## Section 3: User Documentation

### Property Analysis User Guide

```markdown
# Property Analysis Platform User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Property Search and Selection](#property-search-and-selection)
3. [Financial Analysis](#financial-analysis)
4. [Risk Assessment](#risk-assessment)
5. [Report Generation](#report-generation)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet Connection**: Broadband required for map data and real-time updates
- **Screen Resolution**: Minimum 1024x768, optimized for 1920x1080

### Initial Setup

1. **Account Creation**
   - Navigate to the registration page
   - Provide your organization details
   - Verify your email address
   - Complete the security setup

2. **Organization Configuration**
   - Set up user roles and permissions
   - Configure data sources and integrations
   - Establish analysis parameters and assumptions

### Navigation Overview

The platform consists of five main sections:

- **Properties**: Search, view, and manage property data
- **Analysis**: Run financial and risk assessments
- **Reports**: Generate and export analysis reports
- **Data**: Import and manage property datasets
- **Settings**: Configure user preferences and organization settings

## Property Search and Selection

### Basic Property Search

1. **Location-Based Search**
   ```
   Navigate to Properties > Search
   Enter suburb, postcode, or address
   Apply additional filters as needed
   Click "Search Properties"
   ```

   **Available Filters:**
   - **Location**: Suburb, state, postcode, radius
   - **Property Type**: House, apartment, unit, townhouse, land
   - **Price Range**: Minimum and maximum values
   - **Zoning**: Residential (R1-R5), commercial (B1-B4), industrial
   - **Land Area**: Minimum and maximum lot sizes

2. **Advanced Search Criteria**

   **Financial Filters:**
   - Rental yield range (gross or net)
   - Weekly rent range
   - Last sale price and date
   - Price per square meter

   **Planning Filters:**
   - Development potential
   - Height restrictions
   - Floor space ratio (FSR)
   - Heritage listings

   **Environmental Filters:**
   - Flood risk categories
   - Contamination history
   - Bushfire risk zones
   - Noise exposure

### Map-Based Property Discovery

1. **Using the Interactive Map**
   - Navigate to Properties > Map View
   - Use zoom and pan controls to explore areas
   - Click property markers for quick details
   - Draw custom search areas using polygon tool

2. **Layer Controls**
   - **Property Markers**: Color-coded by price range
   - **Zoning Overlay**: Planning zone boundaries
   - **Infrastructure**: Schools, transport, shopping centers
   - **Environmental**: Flood zones, heritage areas

3. **Bulk Selection**
   - Hold Ctrl/Cmd and click multiple properties
   - Use the lasso tool for area selection
   - Apply bulk actions to selected properties

## Financial Analysis

### Setting Up Analysis Parameters

Before running analysis, configure your investment parameters:

1. **Purchase Details**
   ```
   Purchase Price: $850,000
   Stamp Duty: $34,000 (calculated automatically)
   Legal Fees: $1,500
   Building Inspection: $800
   Renovation Budget: $25,000 (optional)
   ```

2. **Financing Configuration**
   ```
   Loan Amount: $680,000 (80% LVR)
   Interest Rate: 5.5% p.a.
   Loan Term: 30 years
   Repayment Frequency: Monthly
   ```

3. **Income and Expenses**
   ```
   Weekly Rent: $650
   Management Fees: 8% of rental income
   Vacancy Allowance: 4% of gross income
   Council Rates: $2,500 p.a.
   Water Rates: $800 p.a.
   Insurance: $1,200 p.a.
   Maintenance Budget: $3,000 p.a.
   ```

### Running Financial Analysis

1. **Basic Yield Calculations**
   
   The system automatically calculates:
   - **Gross Rental Yield**: (Annual Rent ÷ Purchase Price) × 100
   - **Net Rental Yield**: (Net Annual Income ÷ Purchase Price) × 100
   - **Cash-on-Cash Return**: (Annual Cash Flow ÷ Cash Invested) × 100

2. **Cash Flow Projections**

   Generate 10-year projections including:
   - Annual rental income growth (default 3% p.a.)
   - Expense inflation (default 2.5% p.a.)
   - Property value appreciation (default 4% p.a.)
   - Loan principal reduction
   - Tax implications (if configured)

3. **Scenario Modeling**

   Test different scenarios:
   - **Optimistic**: Higher growth rates, lower vacancy
   - **Conservative**: Lower growth rates, higher expenses
   - **Stress Test**: Economic downturn scenarios

### Understanding Analysis Results

**Key Metrics Explained:**

- **Initial Rental Yield**: 4.23% (gross), 2.85% (net)
- **Annual Cash Flow**: -$12,500 (negative gearing)
- **Break-Even Year**: Year 7 (when property becomes cash positive)
- **Total Return (10 years)**: Capital growth + rental income - all costs
- **IRR (Internal Rate of Return)**: Annualized return including cash flows

**Warning Indicators:**

🔴 **High Risk**: Net yield below 2%, high vacancy area
🟡 **Medium Risk**: Net yield 2-4%, moderate market conditions  
🟢 **Low Risk**: Net yield above 4%, stable rental market

## Risk Assessment

### Environmental Risk Analysis

The platform automatically assesses:

1. **Flood Risk**
   - 1 in 100 year flood zones
   - Historical flood events
   - Climate change projections
   - Insurance implications

2. **Contamination Risk**
   - Contaminated sites register
   - Industrial land use history
   - Soil and groundwater issues
   - Remediation requirements

3. **Natural Hazards**
   - Bushfire risk zones
   - Earthquake potential
   - Coastal erosion
   - Landslide susceptibility

### Planning and Development Risks

1. **Zoning Changes**
   - Proposed planning amendments
   - Development application history
   - Infrastructure projects impact

2. **Development Potential**
   - Current planning controls
   - Development feasibility
   - Infrastructure capacity
   - Heritage constraints

### Market Risk Indicators

1. **Local Market Conditions**
   - Price trend analysis
   - Supply and demand indicators
   - Rental market strength
   - Economic drivers

2. **Comparable Sales Analysis**
   - Recent sale prices
   - Days on market
   - Discount to asking price
   - Market velocity

## Report Generation

### Creating Property Reports

1. **Select Report Type**
   - **Investment Analysis**: Comprehensive financial analysis
   - **Due Diligence**: Risk assessment and compliance
   - **Market Comparison**: Benchmarking against similar properties
   - **Development Feasibility**: Development potential analysis

2. **Customize Report Content**
   ```
   ✓ Executive Summary
   ✓ Property Details
   ✓ Financial Analysis
   ✓ Risk Assessment
   ✓ Market Analysis
   ✓ Maps and Images
   ✓ Assumptions and Disclaimers
   ```

3. **Export Options**
   - **PDF**: Professional formatted reports
   - **Excel**: Detailed financial models
   - **PowerPoint**: Presentation-ready slides
   - **Word**: Editable document format

### Report Customization

1. **Branding Options**
   - Company logo and colors
   - Custom headers and footers
   - Disclaimer text
   - Contact information

2. **Content Configuration**
   - Include/exclude sections
   - Chart and graph types
   - Data visualization preferences
   - Executive summary length

### Sharing and Collaboration

1. **Internal Sharing**
   - Share with team members
   - Set view/edit permissions
   - Track access and changes
   - Comment and annotation tools

2. **Client Delivery**
   - Password-protected links
   - Download tracking
   - Expiration dates
   - Watermarking options

## Advanced Features

### Bulk Property Analysis

1. **CSV Import**
   ```
   Required columns:
   - Address
   - Purchase Price (optional)
   - Weekly Rent (optional)
   ```

2. **Batch Processing**
   - Upload up to 1,000 properties
   - Automated analysis configuration
   - Progress tracking
   - Error reporting and resolution

### Custom Analysis Templates

1. **Template Creation**
   - Save analysis parameters
   - Define calculation methods
   - Set report layouts
   - Share with team

2. **Template Management**
   - Version control
   - Access permissions
   - Performance tracking
   - Update notifications

### API Integration

For advanced users with technical capabilities:

1. **REST API Access**
   - Authentication tokens
   - Rate limiting guidelines
   - Error handling
   - Documentation and examples

2. **Webhook Configuration**
   - Property update notifications
   - Analysis completion alerts
   - Market data changes
   - System maintenance notices

## Troubleshooting

### Common Issues and Solutions

**Property Not Found**
- Verify address spelling and format
- Try alternative search terms
- Check if property is in supported areas
- Contact support for manual addition

**Analysis Errors**
- Ensure all required fields are completed
- Check for reasonable value ranges
- Verify loan parameters are realistic
- Review error messages for specific issues

**Map Loading Issues**
- Check internet connection
- Disable browser ad blockers
- Clear browser cache
- Try different browser

**Report Generation Problems**
- Ensure analysis is completed
- Check file size limits
- Verify export permissions
- Try different format options

### Performance Optimization

**Slow Search Results**
- Use more specific search criteria
- Reduce result limit
- Check network connection
- Clear application cache

**Analysis Timeouts**
- Simplify analysis parameters
- Reduce projection period
- Use default assumptions
- Contact support for complex scenarios

### Getting Support

**Self-Service Resources**
- Knowledge base articles
- Video tutorials
- FAQ section
- Community forums

**Direct Support**
- Live chat (business hours)
- Email support tickets
- Phone support (enterprise plans)
- Screen sharing sessions

**Training and Onboarding**
- User training sessions
- Team workshops
- Custom training programs
- Certification courses

---

*For technical support, contact support@propertyplatform.com or use the in-app help system.*
```

## Section 4: Maintenance and Updates

### Changelog Management

```typescript
// scripts/changelog-generator.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface ChangelogEntry {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  changes: {
    added: string[]
    changed: string[]
    deprecated: string[]
    removed: string[]
    fixed: string[]
    security: string[]
  }
}

class ChangelogManager {
  private changelogPath: string
  private packagePath: string

  constructor(projectRoot: string) {
    this.changelogPath = path.join(projectRoot, 'CHANGELOG.md')
    this.packagePath = path.join(projectRoot, 'package.json')
  }

  async generateChangelog(): Promise<void> {
    console.log('📝 Generating changelog...')

    // Get git commits since last release
    const commits = this.getCommitsSinceLastRelease()
    
    // Parse commits using conventional commit format
    const changes = this.parseCommits(commits)
    
    // Get current version from package.json
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf-8'))
    const currentVersion = packageJson.version
    
    // Create changelog entry
    const entry: ChangelogEntry = {
      version: currentVersion,
      date: new Date().toISOString().split('T')[0],
      type: this.determineReleaseType(changes),
      changes
    }

    // Update changelog file
    this.updateChangelogFile(entry)
    
    console.log(`✅ Changelog updated for version ${currentVersion}`)
  }

  private getCommitsSinceLastRelease(): string[] {
    try {
      // Get latest tag
      const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim()
      
      // Get commits since latest tag
      const commitLog = execSync(`git log ${latestTag}..HEAD --pretty=format:"%H|%s|%b"`, {
        encoding: 'utf-8'
      })

      return commitLog.split('\n').filter(line => line.trim())
    } catch (error) {
      // No tags found, get all commits
      const commitLog = execSync('git log --pretty=format:"%H|%s|%b"', {
        encoding: 'utf-8'
      })

      return commitLog.split('\n').filter(line => line.trim())
    }
  }

  private parseCommits(commits: string[]): ChangelogEntry['changes'] {
    const changes: ChangelogEntry['changes'] = {
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: []
    }

    for (const commit of commits) {
      const [hash, subject, body] = commit.split('|')
      
      // Parse conventional commit format
      const conventionalMatch = subject.match(/^(feat|fix|docs|style|refactor|test|chore|security)(\(.+\))?: (.+)/)
      
      if (conventionalMatch) {
        const [, type, scope, description] = conventionalMatch
        const scopeText = scope ? scope.replace(/[()]/g, '') : ''
        const formattedDescription = scopeText 
          ? `**${scopeText}**: ${description}`
          : description

        switch (type) {
          case 'feat':
            changes.added.push(formattedDescription)
            break
          case 'fix':
            changes.fixed.push(formattedDescription)
            break
          case 'security':
            changes.security.push(formattedDescription)
            break
          case 'refactor':
          case 'style':
            changes.changed.push(formattedDescription)
            break
          default:
            // Skip documentation, test, and chore commits
            break
        }
      } else {
        // Non-conventional commits - try to categorize
        if (subject.toLowerCase().includes('fix') || subject.toLowerCase().includes('bug')) {
          changes.fixed.push(subject)
        } else if (subject.toLowerCase().includes('add') || subject.toLowerCase().includes('new')) {
          changes.added.push(subject)
        } else if (subject.toLowerCase().includes('remove') || subject.toLowerCase().includes('delete')) {
          changes.removed.push(subject)
        } else {
          changes.changed.push(subject)
        }
      }

      // Check for breaking changes in body
      if (body && body.includes('BREAKING CHANGE')) {
        const breakingChangeMatch = body.match(/BREAKING CHANGE: (.+)/)
        if (breakingChangeMatch) {
          changes.changed.push(`**BREAKING**: ${breakingChangeMatch[1]}`)
        }
      }
    }

    return changes
  }

  private determineReleaseType(changes: ChangelogEntry['changes']): 'major' | 'minor' | 'patch' {
    // Check for breaking changes
    const hasBreakingChanges = Object.values(changes).some(changeList =>
      changeList.some(change => change.includes('**BREAKING**'))
    )

    if (hasBreakingChanges) {
      return 'major'
    }

    // Check for new features
    if (changes.added.length > 0) {
      return 'minor'
    }

    // Only fixes and patches
    return 'patch'
  }

  private updateChangelogFile(entry: ChangelogEntry): void {
    let existingChangelog = ''
    
    if (fs.existsSync(this.changelogPath)) {
      existingChangelog = fs.readFileSync(this.changelogPath, 'utf-8')
    }

    const newEntry = this.formatChangelogEntry(entry)
    
    if (existingChangelog.includes('# Changelog')) {
      // Insert new entry after the header
      const lines = existingChangelog.split('\n')
      const headerIndex = lines.findIndex(line => line.startsWith('# Changelog'))
      
      if (headerIndex !== -1) {
        lines.splice(headerIndex + 1, 0, '', newEntry)
        fs.writeFileSync(this.changelogPath, lines.join('\n'))
        return
      }
    }

    // Create new changelog file
    const changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

${newEntry}

${existingChangelog}`

    fs.writeFileSync(this.changelogPath, changelog)
  }

  private formatChangelogEntry(entry: ChangelogEntry): string {
    let markdown = `## [${entry.version}] - ${entry.date}\n`

    const sections = [
      { key: 'added', title: 'Added' },
      { key: 'changed', title: 'Changed' },
      { key: 'deprecated', title: 'Deprecated' },
      { key: 'removed', title: 'Removed' },
      { key: 'fixed', title: 'Fixed' },
      { key: 'security', title: 'Security' }
    ]

    for (const section of sections) {
      const changes = entry.changes[section.key as keyof typeof entry.changes]
      if (changes.length > 0) {
        markdown += `\n### ${section.title}\n\n`
        for (const change of changes) {
          markdown += `- ${change}\n`
        }
      }
    }

    return markdown
  }

  async createRelease(version: string, notes: string): Promise<void> {
    console.log(`🚀 Creating release ${version}...`)

    try {
      // Create git tag
      execSync(`git tag -a v${version} -m "Release ${version}"`)
      
      // Push tag to remote
      execSync(`git push origin v${version}`)
      
      // Create GitHub release (if GitHub CLI is available)
      try {
        execSync(`gh release create v${version} --title "Release ${version}" --notes "${notes}"`)
        console.log('✅ GitHub release created')
      } catch (error) {
        console.log('⚠️ GitHub release creation failed (gh CLI not available or not authenticated)')
      }

      console.log(`✅ Release ${version} created successfully`)
    } catch (error) {
      console.error('❌ Release creation failed:', error)
      throw error
    }
  }
}

// Usage
const changelogManager = new ChangelogManager(process.cwd())

// Generate changelog for current version
changelogManager.generateChangelog().catch(console.error)
```

## Practical Exercises

### Exercise 1: API Documentation
Create comprehensive API documentation for a property analysis endpoint including:
- OpenAPI specification
- Usage examples
- Error handling
- Rate limiting information

### Exercise 2: Component Documentation
Document a complex React component with:
- TSDoc comments
- Usage examples
- Props documentation
- Performance considerations

### Exercise 3: User Guide Creation
Write a user guide section for:
- Property search workflows
- Analysis parameter setup
- Report generation
- Troubleshooting common issues

### Exercise 4: Maintenance Automation
Set up automated maintenance processes:
- Changelog generation
- Documentation updates
- Release management
- Link validation

## Summary

This module covered comprehensive documentation and maintenance strategies for property management platforms:

- **API Documentation**: OpenAPI specifications and automated generation
- **Code Documentation**: TSDoc standards and maintainable patterns
- **User Documentation**: Comprehensive guides for complex workflows
- **Maintenance Automation**: Changelog management and release processes
- **Knowledge Management**: Documentation organization and accessibility

These documentation and maintenance skills ensure property platforms remain usable, maintainable, and compliant throughout their lifecycle.

## Navigation
- [← Previous: Module 6.2 - Testing Infrastructure](./Module-6.2-Testing-Infrastructure.md)
- [Next: Phase 7 - Cloud Deployment and DevOps →](../Phase-7-Cloud-Deployment-and-DevOps/README.md)
- [↑ Back to Phase 6 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)