# Module 7.3: CI/CD and Automation

## Learning Objectives
By the end of this module, you will be able to:
- Design and implement comprehensive CI/CD pipelines for property management platforms
- Set up automated testing workflows with quality gates and deployment strategies
- Implement security scanning and compliance automation for property data applications
- Create infrastructure as code for consistent environment provisioning
- Build automated monitoring and alerting for deployment pipelines
- Design rollback and disaster recovery automation strategies

## Prerequisites
- Understanding of cloud deployment strategies (Module 7.1)
- Knowledge of testing infrastructure (Module 6.2)
- Familiarity with performance monitoring (Module 7.2)
- Basic understanding of Git workflows and branching strategies

## Introduction

Property management platforms require sophisticated CI/CD automation to ensure reliable, secure, and compliant deployments. With critical business operations depending on property valuations, government API integrations, and real-time analysis workflows, deployment automation must be robust, tested, and auditable.

**Why CI/CD Matters for Property Platforms:**
- **Compliance Requirements**: Property data often has regulatory compliance needs
- **Financial Accuracy**: Automated testing ensures calculation correctness across deployments
- **Government API Integration**: Reliable deployment of proxy services and API integrations
- **Zero Downtime**: Property professionals rely on 24/7 platform availability
- **Security**: Automated security scanning for property data protection
- **Audit Trails**: Deployment tracking for compliance and debugging

## Section 1: GitHub Actions CI/CD Pipeline

### Comprehensive Pipeline Configuration

```yaml
# .github/workflows/property-platform-cicd.yml - Complete CI/CD pipeline
name: Property Platform CI/CD

on:
  push:
    branches: [main, develop, staging]
  pull_request:
    branches: [main, develop]
  release:
    types: [published]
  schedule:
    # Run security scans daily at 2 AM UTC
    - cron: '0 2 * * *'

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Quality Checks and Testing
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest
    strategy:
      matrix:
        check: [lint, type-check, test, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        if: matrix.check == 'lint'
        run: |
          npm run lint
          npm run format:check

      - name: Run type checking
        if: matrix.check == 'type-check'
        run: npm run type-check

      - name: Run unit tests
        if: matrix.check == 'test'
        run: |
          npm run test:coverage
          
      - name: Upload test coverage
        if: matrix.check == 'test'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Run security scan
        if: matrix.check == 'security-scan'
        run: |
          npm audit --audit-level=moderate
          npx audit-ci --moderate

  # Property-specific validations
  property-validations:
    name: Property Data Validations
    runs-on: ubuntu-latest
    needs: quality-checks
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate property calculation accuracy
        run: |
          npm run test:calculations
          npm run test:property-validation

      - name: Test government API integrations
        env:
          TEST_EPLANNING_API_KEY: ${{ secrets.TEST_EPLANNING_API_KEY }}
          TEST_SPATIAL_API_KEY: ${{ secrets.TEST_SPATIAL_API_KEY }}
        run: |
          npm run test:api-integration

      - name: Validate data migration scripts
        run: |
          npm run test:migrations

  # Build and Bundle Analysis
  build-and-analyze:
    name: Build and Analyze
    runs-on: ubuntu-latest
    needs: [quality-checks, property-validations]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        env:
          NODE_ENV: production
        run: |
          npm run build
          npm run build:analyze

      - name: Analyze bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            dist/
            stats.html
          retention-days: 7

  # End-to-End Testing
  e2e-testing:
    name: End-to-End Testing
    runs-on: ubuntu-latest
    needs: build-and-analyze
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: property_platform_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/property_platform_test
        run: |
          npm run db:migrate
          npm run db:seed:test

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/property_platform_test
          TEST_BASE_URL: http://localhost:3000
        run: |
          npm run start:test &
          sleep 30
          npm run test:e2e

      - name: Upload E2E test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-test-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7

  # Security and Compliance Scanning
  security-compliance:
    name: Security and Compliance
    runs-on: ubuntu-latest
    needs: quality-checks
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: typescript, javascript

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Property Platform'
          path: '.'
          format: 'ALL'
          
      - name: Upload OWASP results
        uses: actions/upload-artifact@v4
        with:
          name: owasp-dependency-check-results
          path: reports/

  # Performance Testing
  performance-testing:
    name: Performance Testing
    runs-on: ubuntu-latest
    needs: build-and-analyze
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Run Lighthouse CI
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
        run: |
          npm install -g @lhci/cli
          lhci autorun

      - name: Run load testing
        run: |
          # Install k6 for load testing
          curl -s https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz | tar xvz --strip-components 1
          
          # Run property search load test
          ./k6 run --vus 10 --duration 30s tests/load/property-search.js
          
          # Run analysis calculation load test
          ./k6 run --vus 5 --duration 60s tests/load/property-analysis.js

  # Deployment Jobs
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [e2e-testing, security-compliance]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://staging.propertyplatform.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--env NODE_ENV=staging'
          alias-domains: staging.propertyplatform.com

      - name: Run staging smoke tests
        env:
          STAGING_BASE_URL: https://staging.propertyplatform.com
        run: |
          npm run test:smoke -- --baseURL=$STAGING_BASE_URL

      - name: Update Supabase staging environment
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.STAGING_SUPABASE_PROJECT_ID }}
        run: |
          npx supabase db push --linked --include-seed
          npx supabase functions deploy --project-ref $SUPABASE_PROJECT_ID

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              attachments: [{
                color: 'good',
                title: 'Staging Deployment Successful',
                text: 'Property Platform staging environment has been updated',
                fields: [{
                  title: 'Branch',
                  value: '${{ github.ref }}',
                  short: true
                }, {
                  title: 'Commit',
                  value: '${{ github.sha }}',
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [e2e-testing, security-compliance, performance-testing]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://propertyplatform.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Pre-deployment health check
        env:
          PROD_BASE_URL: https://propertyplatform.com
        run: |
          npm run test:health-check -- --baseURL=$PROD_BASE_URL

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --env NODE_ENV=production'
          alias-domains: |
            propertyplatform.com
            www.propertyplatform.com

      - name: Update Supabase production environment
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.PROD_SUPABASE_PROJECT_ID }}
        run: |
          npx supabase db push --linked
          npx supabase functions deploy --project-ref $SUPABASE_PROJECT_ID

      - name: Deploy Cloudflare Workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          npm install -g wrangler
          wrangler deploy --env production

      - name: Post-deployment verification
        env:
          PROD_BASE_URL: https://propertyplatform.com
        run: |
          sleep 60  # Wait for deployment to propagate
          npm run test:smoke -- --baseURL=$PROD_BASE_URL
          npm run test:api-health -- --baseURL=$PROD_BASE_URL

      - name: Update monitoring and alerting
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
        run: |
          # Update deployment markers in monitoring
          curl -X POST "https://api.datadoghq.com/api/v1/events" \
            -H "Content-Type: application/json" \
            -H "DD-API-KEY: $DATADOG_API_KEY" \
            -d '{
              "title": "Property Platform Production Deployment",
              "text": "Deployment completed successfully",
              "tags": ["environment:production", "service:property-platform"],
              "alert_type": "info"
            }'

      - name: Create GitHub release
        if: startsWith(github.ref, 'refs/tags/')
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

      - name: Notify successful deployment
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              attachments: [{
                color: 'good',
                title: 'Production Deployment Successful 🚀',
                text: 'Property Platform production environment has been updated',
                fields: [{
                  title: 'Version',
                  value: '${{ github.sha }}',
                  short: true
                }, {
                  title: 'Deployed by',
                  value: '${{ github.actor }}',
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # Rollback Job
  rollback-production:
    name: Rollback Production
    runs-on: ubuntu-latest
    if: failure() && github.ref == 'refs/heads/main'
    needs: [deploy-production]
    environment:
      name: production-rollback
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Rollback Vercel deployment
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          # Get previous deployment
          PREV_DEPLOYMENT=$(vercel ls --token $VERCEL_TOKEN | grep 'propertyplatform.com' | head -2 | tail -1 | awk '{print $1}')
          
          # Promote previous deployment
          vercel promote $PREV_DEPLOYMENT --token $VERCEL_TOKEN

      - name: Notify rollback
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              attachments: [{
                color: 'danger',
                title: 'Production Rollback Executed 🚨',
                text: 'Property Platform has been rolled back due to deployment failure',
                fields: [{
                  title: 'Failed Commit',
                  value: '${{ github.sha }}',
                  short: true
                }, {
                  title: 'Triggered by',
                  value: 'Automated failure detection',
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Infrastructure as Code with Terraform

```hcl
# infrastructure/terraform/main.tf - Infrastructure as Code for property platform
terraform {
  required_version = ">= 1.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
  
  backend "s3" {
    bucket = "property-platform-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "ap-southeast-2"
    
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

# Variables
variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "propertyplatform.com"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "supabase_access_token" {
  description = "Supabase access token"
  type        = string
  sensitive   = true
}

# Cloudflare Configuration
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Get Cloudflare zone
data "cloudflare_zones" "main" {
  filter {
    name = var.domain_name
  }
}

locals {
  zone_id = data.cloudflare_zones.main.zones[0].id
  
  # Environment-specific configuration
  env_config = {
    staging = {
      subdomain = "staging"
      workers_subdomain = "staging-api"
      supabase_project_id = "staging-project-id"
    }
    production = {
      subdomain = null
      workers_subdomain = "api"
      supabase_project_id = "prod-project-id"
    }
  }
  
  current_env = local.env_config[var.environment]
}

# DNS Records
resource "cloudflare_record" "main" {
  count = var.environment == "production" ? 1 : 0
  
  zone_id = local.zone_id
  name    = var.domain_name
  value   = "76.76.19.61" # Vercel's IP
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "www" {
  count = var.environment == "production" ? 1 : 0
  
  zone_id = local.zone_id
  name    = "www"
  value   = var.domain_name
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_record" "staging" {
  count = var.environment == "staging" ? 1 : 0
  
  zone_id = local.zone_id
  name    = "staging"
  value   = "76.76.19.61" # Vercel's IP
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "api" {
  zone_id = local.zone_id
  name    = local.current_env.workers_subdomain
  value   = var.domain_name
  type    = "CNAME"
  proxied = true
}

# Cloudflare Page Rules for API routing
resource "cloudflare_page_rule" "api_routing" {
  zone_id  = local.zone_id
  target   = "${local.current_env.workers_subdomain}.${var.domain_name}/*"
  priority = 1
  
  actions {
    cache_level = "bypass"
    
    forwarding_url {
      status_code = 200
      url         = "https://property-platform-proxy-${var.environment}.workers.dev/$1"
    }
  }
}

# Security Settings
resource "cloudflare_zone_settings_override" "security" {
  zone_id = local.zone_id
  
  settings {
    ssl                      = "full"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    opportunistic_encryption = "on"
    tls_1_3                  = "zrt"
    automatic_https_rewrites = "on"
    security_level           = "medium"
    challenge_ttl            = 1800
    
    # Bot management
    bot_management {
      enable_js_detection = true
    }
    
    # DDoS protection
    security_header {
      enabled = true
    }
  }
}

# Rate Limiting for API endpoints
resource "cloudflare_rate_limit" "api_rate_limit" {
  zone_id   = local.zone_id
  threshold = 100
  period    = 60
  
  match {
    request {
      url_pattern = "${local.current_env.workers_subdomain}.${var.domain_name}/api/*"
      schemes     = ["HTTPS"]
      methods     = ["GET", "POST", "PUT", "DELETE"]
    }
  }
  
  action {
    mode         = "challenge"
    timeout      = 60
    response {
      content_type = "application/json"
      body         = jsonencode({
        error = "Rate limit exceeded. Please try again later."
        code  = "RATE_LIMIT_EXCEEDED"
      })
    }
  }
  
  correlate {
    by = "nat"
  }
  
  disabled    = false
  description = "Rate limit for Property Platform API endpoints"
}

# Cloudflare Workers KV for caching
resource "cloudflare_workers_kv_namespace" "property_cache" {
  account_id = var.cloudflare_account_id
  title      = "property-cache-${var.environment}"
}

# Vercel Configuration
provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "property_platform" {
  name      = "property-platform-${var.environment}"
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "your-org/property-platform"
  }
  
  environment = [
    {
      key    = "NODE_ENV"
      value  = var.environment == "production" ? "production" : "staging"
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SUPABASE_URL"
      value  = "https://${local.current_env.supabase_project_id}.supabase.co"
      target = ["production", "preview"]
    },
    {
      key    = "VITE_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview"]
      type   = "secret"
    }
  ]
  
  domains = var.environment == "production" ? [
    var.domain_name,
    "www.${var.domain_name}"
  ] : [
    "staging.${var.domain_name}"
  ]
}

# Supabase Configuration
provider "supabase" {
  access_token = var.supabase_access_token
}

resource "supabase_project" "property_platform" {
  organization_id   = var.supabase_organization_id
  name             = "Property Platform ${title(var.environment)}"
  database_password = var.supabase_db_password
  region           = "ap-southeast-1"
  
  plan = var.environment == "production" ? "pro" : "free"
}

# Monitoring and Alerting
resource "cloudflare_notification_policy" "security_events" {
  account_id = var.cloudflare_account_id
  name       = "Property Platform Security Events"
  description = "Notifications for security events on property platform"
  enabled    = true
  
  alert_type = "zone_aop_custom_certificate_expiration_type"
  
  filters {
    zones = [local.zone_id]
  }
  
  email_integration {
    id = var.notification_email
  }
  
  slack_integration {
    id = var.slack_webhook_url
  }
}

# Outputs
output "domain_name" {
  description = "Primary domain name for the environment"
  value       = var.environment == "production" ? var.domain_name : "staging.${var.domain_name}"
}

output "api_domain" {
  description = "API domain name for the environment"
  value       = "${local.current_env.workers_subdomain}.${var.domain_name}"
}

output "supabase_url" {
  description = "Supabase URL for the environment"
  value       = supabase_project.property_platform.api_url
}

output "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  value       = local.zone_id
}
```

## Section 2: Advanced Deployment Strategies

### Blue-Green Deployment Implementation

```typescript
// scripts/blue-green-deployment.ts - Blue-green deployment automation
import { execSync } from 'child_process'
import fetch from 'node-fetch'

interface DeploymentEnvironment {
  name: string
  url: string
  vercelProjectId: string
  supabaseProjectId: string
  cloudflareZoneId: string
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: {
    database: boolean
    api: boolean
    frontend: boolean
    cache: boolean
  }
  responseTime: number
  errors: string[]
}

class BlueGreenDeployer {
  private environments: {
    blue: DeploymentEnvironment
    green: DeploymentEnvironment
  }
  
  private currentActive: 'blue' | 'green' = 'blue'
  private healthCheckTimeout = 300000 // 5 minutes
  private healthCheckInterval = 10000 // 10 seconds

  constructor() {
    this.environments = {
      blue: {
        name: 'production-blue',
        url: 'https://blue.propertyplatform.com',
        vercelProjectId: process.env.VERCEL_BLUE_PROJECT_ID!,
        supabaseProjectId: process.env.SUPABASE_BLUE_PROJECT_ID!,
        cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID!
      },
      green: {
        name: 'production-green',
        url: 'https://green.propertyplatform.com',
        vercelProjectId: process.env.VERCEL_GREEN_PROJECT_ID!,
        supabaseProjectId: process.env.SUPABASE_GREEN_PROJECT_ID!,
        cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID!
      }
    }
  }

  async deploy(): Promise<void> {
    console.log('🚀 Starting blue-green deployment...')

    try {
      // Determine target environment (opposite of current active)
      const targetEnv = this.currentActive === 'blue' ? 'green' : 'blue'
      const target = this.environments[targetEnv]

      console.log(`📋 Deploying to ${targetEnv} environment...`)

      // Step 1: Deploy to target environment
      await this.deployToEnvironment(target)

      // Step 2: Run comprehensive health checks
      console.log('🔍 Running health checks...')
      const healthCheck = await this.runHealthChecks(target)

      if (healthCheck.status === 'unhealthy') {
        throw new Error(`Health checks failed: ${healthCheck.errors.join(', ')}`)
      }

      // Step 3: Run smoke tests
      console.log('🧪 Running smoke tests...')
      await this.runSmokeTests(target)

      // Step 4: Gradually switch traffic
      console.log('🔄 Switching traffic...')
      await this.switchTraffic(targetEnv)

      // Step 5: Monitor new environment
      console.log('📊 Monitoring new environment...')
      await this.monitorDeployment(target)

      // Step 6: Update active environment
      this.currentActive = targetEnv

      console.log(`✅ Blue-green deployment completed. Active environment: ${targetEnv}`)

    } catch (error) {
      console.error('❌ Deployment failed:', error)
      
      // Automatic rollback
      console.log('🔄 Starting automatic rollback...')
      await this.rollback()
      
      throw error
    }
  }

  private async deployToEnvironment(env: DeploymentEnvironment): Promise<void> {
    console.log(`📦 Deploying application to ${env.name}...`)

    // Deploy frontend to Vercel
    const vercelDeployment = execSync(
      `vercel deploy --prod --token ${process.env.VERCEL_TOKEN} --scope ${env.vercelProjectId}`,
      { encoding: 'utf-8' }
    ).trim()

    console.log(`🌐 Frontend deployed: ${vercelDeployment}`)

    // Update Supabase functions
    console.log('🗄️ Updating Supabase functions...')
    execSync(
      `supabase functions deploy --project-ref ${env.supabaseProjectId}`,
      { stdio: 'inherit' }
    )

    // Deploy Cloudflare Workers
    console.log('⚡ Deploying Cloudflare Workers...')
    execSync(
      `wrangler deploy --env ${env.name}`,
      { stdio: 'inherit' }
    )

    // Update database schema
    console.log('🗃️ Updating database schema...')
    execSync(
      `supabase db push --linked --project-ref ${env.supabaseProjectId}`,
      { stdio: 'inherit' }
    )
  }

  private async runHealthChecks(env: DeploymentEnvironment): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const timeout = Date.now() + this.healthCheckTimeout
    const errors: string[] = []

    while (Date.now() < timeout) {
      try {
        const checks = await Promise.all([
          this.checkDatabase(env),
          this.checkAPI(env),
          this.checkFrontend(env),
          this.checkCache(env)
        ])

        const allHealthy = checks.every(check => check)
        
        if (allHealthy) {
          return {
            status: 'healthy',
            checks: {
              database: checks[0],
              api: checks[1],
              frontend: checks[2],
              cache: checks[3]
            },
            responseTime: Date.now() - startTime,
            errors: []
          }
        }

        // Log failed checks
        if (!checks[0]) errors.push('Database health check failed')
        if (!checks[1]) errors.push('API health check failed')
        if (!checks[2]) errors.push('Frontend health check failed')
        if (!checks[3]) errors.push('Cache health check failed')

        console.log(`⏳ Health checks not passed yet, retrying in ${this.healthCheckInterval / 1000}s...`)
        await this.sleep(this.healthCheckInterval)

      } catch (error) {
        errors.push(`Health check error: ${error.message}`)
        await this.sleep(this.healthCheckInterval)
      }
    }

    return {
      status: 'unhealthy',
      checks: {
        database: false,
        api: false,
        frontend: false,
        cache: false
      },
      responseTime: Date.now() - startTime,
      errors
    }
  }

  private async checkDatabase(env: DeploymentEnvironment): Promise<boolean> {
    try {
      const response = await fetch(`${env.url}/api/health/database`, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async checkAPI(env: DeploymentEnvironment): Promise<boolean> {
    try {
      const response = await fetch(`${env.url}/api/health`, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async checkFrontend(env: DeploymentEnvironment): Promise<boolean> {
    try {
      const response = await fetch(env.url, {
        method: 'GET',
        timeout: 10000
      })
      
      if (!response.ok) return false
      
      const html = await response.text()
      return html.includes('Property Platform') // Check for expected content
    } catch {
      return false
    }
  }

  private async checkCache(env: DeploymentEnvironment): Promise<boolean> {
    try {
      const response = await fetch(`${env.url}/api/health/cache`, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async runSmokeTests(env: DeploymentEnvironment): Promise<void> {
    console.log('🧪 Running smoke tests...')

    try {
      // Run critical path tests
      execSync(
        `npm run test:smoke -- --baseURL=${env.url}`,
        { stdio: 'inherit' }
      )

      console.log('✅ Smoke tests passed')
    } catch (error) {
      throw new Error(`Smoke tests failed: ${error.message}`)
    }
  }

  private async switchTraffic(targetEnv: 'blue' | 'green'): Promise<void> {
    const target = this.environments[targetEnv]
    
    console.log('🔄 Implementing gradual traffic switch...')

    // Gradual traffic switching percentages
    const trafficPercentages = [10, 25, 50, 75, 100]

    for (const percentage of trafficPercentages) {
      console.log(`📊 Switching ${percentage}% of traffic to ${targetEnv}...`)

      // Update Cloudflare traffic routing
      await this.updateCloudflareRouting(target, percentage)

      // Wait and monitor for issues
      await this.sleep(60000) // Wait 1 minute between switches

      // Check for increased error rates
      const errorRate = await this.checkErrorRate(target)
      if (errorRate > 0.05) { // 5% error rate threshold
        throw new Error(`High error rate detected: ${errorRate * 100}%`)
      }

      console.log(`✅ ${percentage}% traffic switch successful`)
    }

    console.log('🎯 Traffic switch completed')
  }

  private async updateCloudflareRouting(
    target: DeploymentEnvironment,
    percentage: number
  ): Promise<void> {
    // This would use Cloudflare's Load Balancer API
    // Simplified implementation for demonstration
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${target.cloudflareZoneId}/load_balancers`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'property-platform-lb',
          fallback_pool: 'blue-pool',
          default_pools: ['green-pool'],
          region_pools: {
            WEU: ['green-pool'],
            ENAM: ['green-pool']
          },
          pop_pools: {},
          proxied: true,
          enabled: true,
          description: `Traffic split: ${percentage}% to green`,
          ttl: 30,
          steering_policy: 'dynamic_latency',
          session_affinity: 'cookie',
          session_affinity_ttl: 5000,
          session_affinity_attributes: {
            samesite: 'Strict',
            secure: 'Always',
            drain_duration: 100
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update Cloudflare routing: ${response.statusText}`)
    }
  }

  private async checkErrorRate(env: DeploymentEnvironment): Promise<number> {
    try {
      const response = await fetch(`${env.url}/api/metrics/error-rate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
        }
      })

      if (!response.ok) return 0

      const data = await response.json()
      return data.errorRate || 0
    } catch {
      return 0
    }
  }

  private async monitorDeployment(env: DeploymentEnvironment): Promise<void> {
    console.log('📊 Monitoring deployment for 5 minutes...')

    const monitoringDuration = 5 * 60 * 1000 // 5 minutes
    const checkInterval = 30 * 1000 // 30 seconds
    const startTime = Date.now()

    while (Date.now() - startTime < monitoringDuration) {
      try {
        // Check key metrics
        const [errorRate, responseTime, memoryUsage] = await Promise.all([
          this.checkErrorRate(env),
          this.checkResponseTime(env),
          this.checkMemoryUsage(env)
        ])

        console.log(`📈 Metrics - Error Rate: ${(errorRate * 100).toFixed(2)}%, Response Time: ${responseTime}ms, Memory: ${(memoryUsage * 100).toFixed(1)}%`)

        // Alert thresholds
        if (errorRate > 0.02) { // 2% error rate
          throw new Error(`High error rate detected: ${(errorRate * 100).toFixed(2)}%`)
        }

        if (responseTime > 3000) { // 3 second response time
          throw new Error(`High response time detected: ${responseTime}ms`)
        }

        if (memoryUsage > 0.9) { // 90% memory usage
          throw new Error(`High memory usage detected: ${(memoryUsage * 100).toFixed(1)}%`)
        }

        await this.sleep(checkInterval)

      } catch (error) {
        throw new Error(`Monitoring failed: ${error.message}`)
      }
    }

    console.log('✅ Monitoring completed successfully')
  }

  private async checkResponseTime(env: DeploymentEnvironment): Promise<number> {
    const startTime = Date.now()
    try {
      await fetch(`${env.url}/api/health`, { method: 'GET' })
      return Date.now() - startTime
    } catch {
      return 999999 // Return high value on error
    }
  }

  private async checkMemoryUsage(env: DeploymentEnvironment): Promise<number> {
    try {
      const response = await fetch(`${env.url}/api/metrics/memory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
        }
      })

      if (!response.ok) return 0

      const data = await response.json()
      return data.memoryUsage || 0
    } catch {
      return 0
    }
  }

  async rollback(): Promise<void> {
    console.log('🚨 Executing rollback...')

    try {
      // Switch traffic back to previous active environment
      const previousEnv = this.currentActive
      const previous = this.environments[previousEnv]

      await this.updateCloudflareRouting(previous, 100)

      console.log(`✅ Rollback completed. Active environment: ${previousEnv}`)
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      throw error
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI usage
if (require.main === module) {
  const deployer = new BlueGreenDeployer()
  
  deployer.deploy().catch((error) => {
    console.error('Deployment failed:', error)
    process.exit(1)
  })
}

export { BlueGreenDeployer }
```

## Section 3: Monitoring and Alerting Integration

### Deployment Monitoring and Alerting

```typescript
// scripts/deployment-monitoring.ts - Comprehensive deployment monitoring
import { WebClient } from '@slack/web-api'
import { createProbot } from 'probot'

interface DeploymentMetrics {
  deploymentId: string
  environment: string
  startTime: number
  endTime?: number
  status: 'pending' | 'success' | 'failure' | 'rollback'
  metrics: {
    buildTime: number
    testDuration: number
    deploymentDuration: number
    healthCheckDuration: number
  }
  artifacts: {
    buildSize: number
    testCoverage: number
    securityScanResults: any
    performanceResults: any
  }
}

interface AlertConfig {
  channels: {
    slack: {
      webhook: string
      channels: string[]
    }
    email: {
      smtp: any
      recipients: string[]
    }
    pagerDuty: {
      integrationKey: string
    }
  }
  thresholds: {
    buildTime: number
    testDuration: number
    deploymentDuration: number
    failureRate: number
  }
}

class DeploymentMonitor {
  private slack: WebClient
  private deploymentMetrics: Map<string, DeploymentMetrics> = new Map()
  private alertConfig: AlertConfig

  constructor(alertConfig: AlertConfig) {
    this.alertConfig = alertConfig
    this.slack = new WebClient(process.env.SLACK_BOT_TOKEN)
  }

  async startDeploymentTracking(
    deploymentId: string,
    environment: string
  ): Promise<void> {
    const metrics: DeploymentMetrics = {
      deploymentId,
      environment,
      startTime: Date.now(),
      status: 'pending',
      metrics: {
        buildTime: 0,
        testDuration: 0,
        deploymentDuration: 0,
        healthCheckDuration: 0
      },
      artifacts: {
        buildSize: 0,
        testCoverage: 0,
        securityScanResults: {},
        performanceResults: {}
      }
    }

    this.deploymentMetrics.set(deploymentId, metrics)

    // Send deployment started notification
    await this.sendDeploymentStartedAlert(metrics)
  }

  async updateDeploymentMetrics(
    deploymentId: string,
    updates: Partial<DeploymentMetrics>
  ): Promise<void> {
    const existing = this.deploymentMetrics.get(deploymentId)
    if (!existing) return

    const updated = { ...existing, ...updates }
    this.deploymentMetrics.set(deploymentId, updated)

    // Check for threshold violations
    await this.checkThresholds(updated)
  }

  async completeDeployment(
    deploymentId: string,
    status: 'success' | 'failure' | 'rollback',
    finalMetrics?: Partial<DeploymentMetrics>
  ): Promise<void> {
    const metrics = this.deploymentMetrics.get(deploymentId)
    if (!metrics) return

    const completedMetrics: DeploymentMetrics = {
      ...metrics,
      ...finalMetrics,
      endTime: Date.now(),
      status
    }

    completedMetrics.metrics.deploymentDuration = 
      completedMetrics.endTime - completedMetrics.startTime

    this.deploymentMetrics.set(deploymentId, completedMetrics)

    // Send completion notification
    await this.sendDeploymentCompletedAlert(completedMetrics)

    // Store metrics for analysis
    await this.storeDeploymentMetrics(completedMetrics)
  }

  private async sendDeploymentStartedAlert(metrics: DeploymentMetrics): Promise<void> {
    const message = {
      channel: '#deployments',
      text: `🚀 Deployment Started`,
      attachments: [
        {
          color: 'warning',
          title: `Property Platform Deployment - ${metrics.environment}`,
          fields: [
            {
              title: 'Environment',
              value: metrics.environment,
              short: true
            },
            {
              title: 'Deployment ID',
              value: metrics.deploymentId,
              short: true
            },
            {
              title: 'Started',
              value: new Date(metrics.startTime).toISOString(),
              short: true
            }
          ],
          footer: 'Property Platform CI/CD',
          ts: Math.floor(metrics.startTime / 1000)
        }
      ]
    }

    try {
      await this.slack.chat.postMessage(message)
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  private async sendDeploymentCompletedAlert(metrics: DeploymentMetrics): Promise<void> {
    const duration = (metrics.endTime! - metrics.startTime) / 1000 // seconds
    const color = metrics.status === 'success' ? 'good' : 
                  metrics.status === 'failure' ? 'danger' : 'warning'
    
    const emoji = metrics.status === 'success' ? '✅' : 
                  metrics.status === 'failure' ? '❌' : '🔄'

    const message = {
      channel: '#deployments',
      text: `${emoji} Deployment ${metrics.status.toUpperCase()}`,
      attachments: [
        {
          color,
          title: `Property Platform Deployment - ${metrics.environment}`,
          fields: [
            {
              title: 'Environment',
              value: metrics.environment,
              short: true
            },
            {
              title: 'Status',
              value: metrics.status.toUpperCase(),
              short: true
            },
            {
              title: 'Duration',
              value: `${duration.toFixed(0)}s`,
              short: true
            },
            {
              title: 'Build Time',
              value: `${(metrics.metrics.buildTime / 1000).toFixed(0)}s`,
              short: true
            },
            {
              title: 'Test Duration',
              value: `${(metrics.metrics.testDuration / 1000).toFixed(0)}s`,
              short: true
            },
            {
              title: 'Test Coverage',
              value: `${metrics.artifacts.testCoverage.toFixed(1)}%`,
              short: true
            }
          ],
          footer: 'Property Platform CI/CD',
          ts: Math.floor(metrics.endTime! / 1000)
        }
      ]
    }

    // Add failure-specific information
    if (metrics.status === 'failure') {
      message.attachments[0].fields!.push({
        title: 'Action Required',
        value: 'Check deployment logs and consider rollback if necessary',
        short: false
      })

      // Send to critical alerts channel
      await this.slack.chat.postMessage({
        ...message,
        channel: '#critical-alerts'
      })

      // Trigger PagerDuty if configured
      if (this.alertConfig.channels.pagerDuty) {
        await this.triggerPagerDutyAlert(metrics)
      }
    }

    try {
      await this.slack.chat.postMessage(message)
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  private async checkThresholds(metrics: DeploymentMetrics): Promise<void> {
    const alerts: string[] = []

    // Check build time threshold
    if (metrics.metrics.buildTime > this.alertConfig.thresholds.buildTime) {
      alerts.push(
        `Build time exceeded threshold: ${(metrics.metrics.buildTime / 1000).toFixed(0)}s > ${(this.alertConfig.thresholds.buildTime / 1000).toFixed(0)}s`
      )
    }

    // Check test duration threshold
    if (metrics.metrics.testDuration > this.alertConfig.thresholds.testDuration) {
      alerts.push(
        `Test duration exceeded threshold: ${(metrics.metrics.testDuration / 1000).toFixed(0)}s > ${(this.alertConfig.thresholds.testDuration / 1000).toFixed(0)}s`
      )
    }

    // Check overall deployment duration
    const currentDuration = Date.now() - metrics.startTime
    if (currentDuration > this.alertConfig.thresholds.deploymentDuration) {
      alerts.push(
        `Deployment duration exceeded threshold: ${(currentDuration / 1000).toFixed(0)}s > ${(this.alertConfig.thresholds.deploymentDuration / 1000).toFixed(0)}s`
      )
    }

    // Send threshold violation alerts
    if (alerts.length > 0) {
      await this.sendThresholdAlert(metrics, alerts)
    }
  }

  private async sendThresholdAlert(
    metrics: DeploymentMetrics,
    alerts: string[]
  ): Promise<void> {
    const message = {
      channel: '#deployment-alerts',
      text: '⚠️ Deployment Threshold Violation',
      attachments: [
        {
          color: 'warning',
          title: `Threshold Violations - ${metrics.environment}`,
          text: alerts.join('\n'),
          fields: [
            {
              title: 'Deployment ID',
              value: metrics.deploymentId,
              short: true
            },
            {
              title: 'Environment',
              value: metrics.environment,
              short: true
            }
          ],
          footer: 'Property Platform CI/CD',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    try {
      await this.slack.chat.postMessage(message)
    } catch (error) {
      console.error('Failed to send threshold alert:', error)
    }
  }

  private async triggerPagerDutyAlert(metrics: DeploymentMetrics): Promise<void> {
    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routing_key: this.alertConfig.channels.pagerDuty.integrationKey,
          event_action: 'trigger',
          payload: {
            summary: `Property Platform deployment failed - ${metrics.environment}`,
            source: 'property-platform-cicd',
            severity: 'critical',
            custom_details: {
              deploymentId: metrics.deploymentId,
              environment: metrics.environment,
              duration: (metrics.endTime! - metrics.startTime) / 1000,
              buildTime: metrics.metrics.buildTime / 1000,
              testDuration: metrics.metrics.testDuration / 1000
            }
          }
        })
      })

      if (!response.ok) {
        console.error('Failed to send PagerDuty alert:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending PagerDuty alert:', error)
    }
  }

  private async storeDeploymentMetrics(metrics: DeploymentMetrics): Promise<void> {
    try {
      // Store in database for analytics
      const response = await fetch('/api/analytics/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
        },
        body: JSON.stringify(metrics)
      })

      if (!response.ok) {
        console.error('Failed to store deployment metrics:', response.statusText)
      }
    } catch (error) {
      console.error('Error storing deployment metrics:', error)
    }
  }

  async generateDeploymentReport(timeRange: { start: Date, end: Date }): Promise<any> {
    const deployments = Array.from(this.deploymentMetrics.values())
      .filter(m => 
        m.startTime >= timeRange.start.getTime() && 
        m.startTime <= timeRange.end.getTime()
      )

    const report = {
      timeRange,
      totalDeployments: deployments.length,
      successfulDeployments: deployments.filter(d => d.status === 'success').length,
      failedDeployments: deployments.filter(d => d.status === 'failure').length,
      rollbacks: deployments.filter(d => d.status === 'rollback').length,
      averageBuildTime: this.calculateAverage(deployments, 'buildTime'),
      averageTestDuration: this.calculateAverage(deployments, 'testDuration'),
      averageDeploymentDuration: this.calculateAverage(deployments, 'deploymentDuration'),
      deploymentFrequency: deployments.length / this.daysBetween(timeRange.start, timeRange.end),
      trends: this.calculateTrends(deployments)
    }

    return report
  }

  private calculateAverage(deployments: DeploymentMetrics[], metric: keyof DeploymentMetrics['metrics']): number {
    if (deployments.length === 0) return 0
    
    const sum = deployments.reduce((acc, d) => acc + d.metrics[metric], 0)
    return sum / deployments.length
  }

  private daysBetween(start: Date, end: Date): number {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  private calculateTrends(deployments: DeploymentMetrics[]): any {
    // Calculate daily deployment trends
    const dailyDeployments = new Map<string, number>()
    
    deployments.forEach(deployment => {
      const date = new Date(deployment.startTime).toISOString().split('T')[0]
      dailyDeployments.set(date, (dailyDeployments.get(date) || 0) + 1)
    })

    return Array.from(dailyDeployments.entries()).map(([date, count]) => ({
      date,
      deployments: count
    }))
  }
}

// Usage example
const alertConfig: AlertConfig = {
  channels: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL!,
      channels: ['#deployments', '#critical-alerts']
    },
    email: {
      smtp: {}, // SMTP configuration
      recipients: ['devops@propertyplatform.com']
    },
    pagerDuty: {
      integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY!
    }
  },
  thresholds: {
    buildTime: 300000, // 5 minutes
    testDuration: 600000, // 10 minutes
    deploymentDuration: 900000, // 15 minutes
    failureRate: 0.1 // 10%
  }
}

const monitor = new DeploymentMonitor(alertConfig)

export { DeploymentMonitor, AlertConfig }
```

## Practical Exercises

### Exercise 1: CI/CD Pipeline Setup
Create a complete CI/CD pipeline including:
- Automated testing and quality checks
- Security scanning and compliance
- Multi-environment deployment
- Rollback strategies

### Exercise 2: Blue-Green Deployment
Implement blue-green deployment automation:
- Traffic switching strategies
- Health check automation
- Monitoring and alerting
- Rollback procedures

### Exercise 3: Infrastructure as Code
Build infrastructure automation using:
- Terraform for cloud resources
- Environment-specific configurations
- Automated provisioning
- State management

### Exercise 4: Monitoring Integration
Set up comprehensive monitoring for:
- Deployment metrics tracking
- Automated alerting systems
- Performance threshold monitoring
- Failure detection and response

## Summary

This module covered comprehensive CI/CD and automation strategies for property management platforms:

- **CI/CD Pipelines**: Complete GitHub Actions workflows with quality gates and security scanning
- **Deployment Strategies**: Blue-green deployment automation with traffic switching and monitoring
- **Infrastructure as Code**: Terraform automation for consistent environment provisioning
- **Monitoring and Alerting**: Comprehensive deployment monitoring with automated notifications
- **Quality Assurance**: Automated testing, security scanning, and performance validation

These CI/CD and automation skills ensure reliable, secure, and efficient deployment processes for critical property management applications.

## Navigation
- [← Previous: Module 7.2 - Performance and Monitoring](./Module-7.2-Performance-and-Monitoring.md)
- [Next: Phase 8 - Advanced Integration Patterns →](../Phase-8-Advanced-Integration-Patterns/README.md)
- [↑ Back to Phase 7 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)