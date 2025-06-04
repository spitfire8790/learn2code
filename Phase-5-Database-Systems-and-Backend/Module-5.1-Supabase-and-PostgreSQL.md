# Module 5.1: Supabase and PostgreSQL

## Learning Objectives
By the end of this module, you will be able to:
- Design relational database schemas for property management systems
- Implement user authentication and authorization with Supabase
- Utilize advanced PostgreSQL features for property data management
- Configure Row Level Security (RLS) for multi-tenant applications
- Optimize database queries for property search and analysis

## Prerequisites
- Understanding of SQL basics (SELECT, INSERT, UPDATE, DELETE)
- Knowledge of relational database concepts
- Familiarity with JavaScript/TypeScript
- Basic understanding of authentication concepts

## Introduction

Database systems form the backbone of any property management platform. In this module, we'll explore Supabase, a modern Backend-as-a-Service (BaaS) that combines the power of PostgreSQL with real-time capabilities, authentication, and a developer-friendly API.

**Why Supabase for Property Applications?**
- **PostgreSQL Foundation**: Robust, proven database with advanced features
- **Real-time Subscriptions**: Live updates for collaborative property analysis
- **Built-in Authentication**: User management without custom backend code
- **Row Level Security**: Secure multi-tenant property data
- **Spatial Data Support**: PostGIS integration for geographic property data
- **Edge Functions**: Serverless compute for complex property calculations

## Section 1: Database Design and Schema

### Understanding Property Data Relationships

Property management systems involve complex relationships between entities:

```sql
-- Core entities and their relationships
Users ←→ Organizations ←→ Projects ←→ Properties
  ↓           ↓             ↓          ↓
Profiles    Permissions   Analysis   Attributes
  ↓           ↓             ↓          ↓
Settings    Roles      Templates   Valuations
```

### Schema Design Principles

**1. Normalization vs. Performance**
Property data often requires balancing normalization with query performance:

```sql
-- Normalized approach (better for data integrity)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    attribute_type TEXT NOT NULL,
    value JSONB NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Denormalized approach (better for read performance)
CREATE TABLE properties_full (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    zoning JSONB,
    financial_data JSONB,
    constraints JSONB,
    analysis_results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. JSONB for Flexible Property Attributes**
Property data is inherently varied. JSONB provides flexibility while maintaining query performance:

```sql
-- Flexible property attributes using JSONB
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basic_info JSONB NOT NULL DEFAULT '{}',
    planning_controls JSONB DEFAULT '{}',
    environmental_factors JSONB DEFAULT '{}',
    financial_metrics JSONB DEFAULT '{}',
    spatial_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB indexing for performance
CREATE INDEX idx_properties_zoning 
ON properties USING GIN ((planning_controls->'zoning'));

CREATE INDEX idx_properties_price_range 
ON properties USING BTREE (((financial_metrics->'estimated_value')::numeric));
```

### Real-World Schema Example

Here's a production-ready schema based on the actual property analysis platform:

```sql
-- Organizations and user management
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles with organization relationships
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    full_name TEXT,
    role TEXT DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project management
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property analysis results
CREATE TABLE property_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    property_id TEXT NOT NULL, -- External property identifier
    analysis_type TEXT NOT NULL,
    input_parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

## Section 2: Supabase Authentication

### Authentication Architecture

Supabase handles the complexity of user authentication while providing fine-grained control:

```javascript
// Authentication configuration
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

// Property platform authentication flow
export class AuthService {
  async signUpWithOrganization(email, password, organizationName) {
    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { organization_name: organizationName }
      }
    })

    if (authError) throw authError

    // 2. Create organization and profile in database trigger
    return authData
  }

  async signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Real-time auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
```

### Database Triggers for User Management

Automate user setup with PostgreSQL triggers:

```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Create organization if specified
    IF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
        INSERT INTO organizations (name, slug)
        VALUES (
            NEW.raw_user_meta_data->>'organization_name',
            lower(replace(NEW.raw_user_meta_data->>'organization_name', ' ', '-'))
        )
        RETURNING id INTO org_id;
    END IF;

    -- Create user profile
    INSERT INTO profiles (id, organization_id, full_name, role)
    VALUES (
        NEW.id,
        org_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE WHEN org_id IS NOT NULL THEN 'admin' ELSE 'user' END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Row Level Security (RLS)

Implement secure multi-tenant access control:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analysis ENABLE ROW LEVEL SECURITY;

-- Organization access policy
CREATE POLICY "Users can access their organization"
ON organizations FOR ALL
TO authenticated
USING (
    id IN (
        SELECT organization_id 
        FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Project access policy with role-based permissions
CREATE POLICY "Project access by organization and role"
ON projects FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT p.organization_id 
        FROM profiles p 
        WHERE p.id = auth.uid()
        AND (
            p.role IN ('admin', 'manager') 
            OR projects.created_by = auth.uid()
        )
    )
);

-- Property analysis access
CREATE POLICY "Property analysis access"
ON property_analysis FOR ALL
TO authenticated
USING (
    project_id IN (
        SELECT pr.id
        FROM projects pr
        JOIN profiles p ON p.organization_id = pr.organization_id
        WHERE p.id = auth.uid()
    )
);
```

## Section 3: Advanced PostgreSQL Features

### JSONB Operations for Property Data

PostgreSQL's JSONB support is ideal for flexible property attributes:

```sql
-- Complex property queries using JSONB
SELECT 
    id,
    basic_info->>'address' as address,
    (financial_metrics->>'estimated_value')::numeric as value,
    planning_controls->'zoning'->>'primary' as zoning
FROM properties
WHERE 
    -- Properties in specific zoning categories
    planning_controls->'zoning'->>'primary' = ANY(ARRAY['R1', 'R2', 'R3'])
    -- Within price range
    AND (financial_metrics->>'estimated_value')::numeric BETWEEN 500000 AND 1000000
    -- With specific environmental constraints
    AND environmental_factors ? 'flood_risk'
    AND environmental_factors->>'flood_risk' != 'high'
ORDER BY (financial_metrics->>'estimated_value')::numeric DESC;

-- Aggregation queries for property analysis
SELECT 
    planning_controls->'zoning'->>'primary' as zoning,
    COUNT(*) as property_count,
    AVG((financial_metrics->>'estimated_value')::numeric) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY (financial_metrics->>'estimated_value')::numeric
    ) as median_value
FROM properties
WHERE environmental_factors->>'flood_risk' != 'high'
GROUP BY planning_controls->'zoning'->>'primary'
ORDER BY avg_value DESC;
```

### Full-Text Search for Property Attributes

Implement sophisticated search capabilities:

```sql
-- Add full-text search columns
ALTER TABLE properties 
ADD COLUMN search_vector tsvector;

-- Create search index
CREATE INDEX idx_properties_search 
ON properties USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'address', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'suburb', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.planning_controls->>'zoning'->>'primary', '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.basic_info->>'description', '')), 'C');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain search vector
CREATE TRIGGER update_properties_search_vector
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_property_search_vector();

-- Search query example
SELECT 
    id,
    basic_info->>'address' as address,
    ts_rank(search_vector, plainto_tsquery('english', 'residential sydney harbor')) as rank
FROM properties
WHERE search_vector @@ plainto_tsquery('english', 'residential sydney harbor')
ORDER BY rank DESC, (financial_metrics->>'estimated_value')::numeric DESC
LIMIT 20;
```

### Spatial Data with PostGIS

Leverage PostgreSQL's spatial capabilities for geographic property analysis:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial columns
ALTER TABLE properties 
ADD COLUMN location_point GEOMETRY(POINT, 4326),
ADD COLUMN boundary_polygon GEOMETRY(POLYGON, 4326);

-- Spatial index for performance
CREATE INDEX idx_properties_location_point 
ON properties USING GIST(location_point);

-- Proximity queries
SELECT 
    p1.id,
    p1.basic_info->>'address' as address,
    ST_Distance(
        ST_Transform(p1.location_point, 3857),
        ST_Transform(p2.location_point, 3857)
    ) as distance_meters
FROM properties p1
CROSS JOIN (
    SELECT location_point 
    FROM properties 
    WHERE id = 'target-property-id'
) p2
WHERE ST_DWithin(
    ST_Transform(p1.location_point, 3857),
    ST_Transform(p2.location_point, 3857),
    1000  -- 1km radius
)
ORDER BY distance_meters;

-- Area calculations and buffer analysis
SELECT 
    id,
    basic_info->>'address' as address,
    ST_Area(ST_Transform(boundary_polygon, 3857)) as area_sqm,
    ST_Intersects(
        boundary_polygon,
        ST_Buffer(ST_GeomFromText('POINT(151.2093 -33.8688)', 4326), 0.01)
    ) as near_sydney_cbd
FROM properties
WHERE boundary_polygon IS NOT NULL;
```

## Section 4: Performance Optimization

### Indexing Strategies

Design indexes for common property search patterns:

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_properties_zoning_value 
ON properties USING BTREE (
    (planning_controls->'zoning'->>'primary'),
    ((financial_metrics->>'estimated_value')::numeric)
);

-- Partial indexes for specific conditions
CREATE INDEX idx_properties_available 
ON properties (created_at)
WHERE status = 'available'
AND (financial_metrics->>'estimated_value')::numeric > 0;

-- Expression indexes for computed values
CREATE INDEX idx_properties_yield 
ON properties (
    ((financial_metrics->>'rental_income')::numeric / 
     (financial_metrics->>'estimated_value')::numeric * 100)
)
WHERE 
    financial_metrics ? 'rental_income' 
    AND financial_metrics ? 'estimated_value';
```

### Query Optimization Techniques

```sql
-- Explain analyze for query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    id,
    basic_info->>'address',
    (financial_metrics->>'estimated_value')::numeric
FROM properties
WHERE 
    planning_controls->'zoning'->>'primary' = 'R2'
    AND (financial_metrics->>'estimated_value')::numeric > 800000
ORDER BY (financial_metrics->>'estimated_value')::numeric DESC
LIMIT 50;

-- Materialized views for complex aggregations
CREATE MATERIALIZED VIEW property_summary_by_suburb AS
SELECT 
    basic_info->>'suburb' as suburb,
    planning_controls->'zoning'->>'primary' as zoning,
    COUNT(*) as property_count,
    AVG((financial_metrics->>'estimated_value')::numeric) as avg_value,
    MIN((financial_metrics->>'estimated_value')::numeric) as min_value,
    MAX((financial_metrics->>'estimated_value')::numeric) as max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY (financial_metrics->>'estimated_value')::numeric
    ) as median_value
FROM properties
WHERE 
    basic_info ? 'suburb'
    AND financial_metrics ? 'estimated_value'
    AND (financial_metrics->>'estimated_value')::numeric > 0
GROUP BY 
    basic_info->>'suburb',
    planning_controls->'zoning'->>'primary';

-- Refresh materialized view
CREATE OR REPLACE FUNCTION refresh_property_summaries()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY property_summary_by_suburb;
END;
$$ LANGUAGE plpgsql;
```

## Practical Exercises

### Exercise 1: Database Schema Design
Design a complete database schema for a property analysis platform including:
- User management with organizations
- Project and property tracking
- Analysis results storage
- Audit logging

### Exercise 2: Authentication Implementation
Implement a complete authentication system using Supabase:
- User registration with organization creation
- Email verification workflow
- Password reset functionality
- Role-based access control

### Exercise 3: Advanced Queries
Write complex queries for property analysis:
- Property search with multiple filters
- Market analysis aggregations
- Spatial proximity queries
- Performance comparison reports

### Exercise 4: RLS Implementation
Configure Row Level Security for a multi-tenant property platform:
- Organization-based data isolation
- Role-based access permissions
- Audit trail for data access

## Summary

This module covered the foundational database concepts and Supabase implementation for property management systems:

- **Database Design**: Relational schema design with JSONB flexibility
- **Authentication**: Comprehensive user management with Supabase Auth
- **PostgreSQL Features**: Advanced SQL operations for property data
- **Security**: Row Level Security for multi-tenant applications
- **Performance**: Indexing and optimization strategies
- **Spatial Data**: PostGIS integration for geographic analysis

These database skills form the foundation for building scalable, secure property analysis platforms.

## Navigation
- [Next: Module 5.2 - API Development →](./Module-5.2-API-Development.md)
- [← Previous: Phase 4 Overview](../Phase-4-3D-Visualisation-and-Graphics/README.md)
- [↑ Back to Phase 5 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)