# Module 5.4: Caching and Performance

## Learning Objectives
By the end of this module, you will be able to:
- Implement multi-level caching strategies for property data
- Optimize database queries for large-scale property datasets
- Design connection pooling and resource management
- Implement caching with Redis and application-level strategies
- Monitor and optimize database performance
- Handle high-volume property analysis workloads

## Prerequisites
- Understanding of database design and SQL optimization (Module 5.1)
- Knowledge of API development patterns (Module 5.2)
- Familiarity with JavaScript/TypeScript async patterns
- Basic understanding of memory management and data structures

## Introduction

Property management platforms deal with large datasets, complex spatial queries, and high-frequency analysis requests. This module explores performance optimization techniques essential for building responsive, scalable property analysis systems.

**Why Performance Matters for Property Platforms:**
- **Large Datasets**: Property databases can contain millions of records
- **Complex Queries**: Spatial analysis and multi-criteria searches are computationally expensive
- **Real-time Requirements**: Users expect instant property search and analysis results
- **Concurrent Users**: Multiple analysts working simultaneously on large datasets
- **Cost Optimization**: Efficient queries reduce database compute costs
- **User Experience**: Fast response times directly impact user satisfaction

## Section 1: Database Query Optimization

### Index Strategy for Property Data

Property searches involve multiple criteria that require carefully designed indexes:

```sql
-- Comprehensive indexing strategy for property queries
-- 1. Single-column indexes for exact matches
CREATE INDEX idx_properties_status ON properties(status) WHERE status = 'active';
CREATE INDEX idx_properties_project_id ON properties(project_id);
CREATE INDEX idx_properties_created_at ON properties(created_at);

-- 2. JSONB indexes for flexible property attributes
CREATE INDEX idx_properties_suburb ON properties USING GIN ((basic_info->'suburb'));
CREATE INDEX idx_properties_zoning ON properties USING GIN ((planning_controls->'zoning'));
CREATE INDEX idx_properties_property_type ON properties USING GIN ((basic_info->'property_type'));

-- 3. Expression indexes for calculated values
CREATE INDEX idx_properties_price_per_sqm ON properties (
    ((financial_metrics->>'estimated_value')::numeric / 
     NULLIF((planning_controls->>'land_area')::numeric, 0))
) WHERE 
    financial_metrics ? 'estimated_value' 
    AND planning_controls ? 'land_area'
    AND (financial_metrics->>'estimated_value')::numeric > 0
    AND (planning_controls->>'land_area')::numeric > 0;

-- 4. Composite indexes for common query patterns
CREATE INDEX idx_properties_suburb_zoning_price ON properties (
    (basic_info->>'suburb'),
    (planning_controls->'zoning'->>'primary'),
    ((financial_metrics->>'estimated_value')::numeric)
) WHERE status = 'active';

-- 5. Partial indexes for filtered queries
CREATE INDEX idx_properties_high_value ON properties (
    (basic_info->>'suburb'),
    ((financial_metrics->>'estimated_value')::numeric)
) WHERE 
    (financial_metrics->>'estimated_value')::numeric > 1000000
    AND status = 'active';

-- 6. Spatial indexes for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE properties ADD COLUMN geom GEOMETRY(POINT, 4326);
CREATE INDEX idx_properties_geom ON properties USING GIST(geom);

-- Update geom column from spatial_attributes
UPDATE properties 
SET geom = ST_GeomFromGeoJSON(spatial_attributes->'coordinates')
WHERE spatial_attributes ? 'coordinates';
```

### Query Optimization Techniques

Transform expensive queries into efficient ones:

```sql
-- Before: Inefficient property search
-- This query scans all properties and evaluates JSON for each row
SELECT * FROM properties 
WHERE basic_info->>'suburb' ILIKE '%sydney%'
AND (financial_metrics->>'estimated_value')::numeric BETWEEN 500000 AND 1500000
AND planning_controls->'zoning'->>'primary' IN ('R1', 'R2', 'R3');

-- After: Optimized with proper indexing and query structure
WITH filtered_properties AS (
    SELECT id, basic_info, financial_metrics, planning_controls
    FROM properties 
    WHERE status = 'active'  -- Use partial index
    AND basic_info->>'suburb' = ANY(ARRAY['Sydney', 'North Sydney', 'South Sydney'])  -- Exact matches
    AND (financial_metrics->>'estimated_value')::numeric BETWEEN 500000 AND 1500000
)
SELECT * FROM filtered_properties
WHERE planning_controls->'zoning'->>'primary' = ANY(ARRAY['R1', 'R2', 'R3']);

-- Advanced: Materialized view for expensive aggregations
CREATE MATERIALIZED VIEW property_market_summary AS
SELECT 
    basic_info->>'suburb' as suburb,
    basic_info->>'state' as state,
    planning_controls->'zoning'->>'primary' as zoning,
    COUNT(*) as property_count,
    AVG((financial_metrics->>'estimated_value')::numeric) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY (financial_metrics->>'estimated_value')::numeric
    ) as median_price,
    MIN((financial_metrics->>'estimated_value')::numeric) as min_price,
    MAX((financial_metrics->>'estimated_value')::numeric) as max_price,
    STDDEV((financial_metrics->>'estimated_value')::numeric) as price_stddev
FROM properties 
WHERE 
    status = 'active'
    AND basic_info ? 'suburb'
    AND basic_info ? 'state'
    AND financial_metrics ? 'estimated_value'
    AND (financial_metrics->>'estimated_value')::numeric > 0
GROUP BY 
    basic_info->>'suburb',
    basic_info->>'state',
    planning_controls->'zoning'->>'primary';

-- Create index on materialized view
CREATE INDEX idx_market_summary_suburb ON property_market_summary(suburb);
CREATE INDEX idx_market_summary_state_zoning ON property_market_summary(state, zoning);

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_market_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY property_market_summary;
    PERFORM pg_notify('market_summary_refreshed', NOW()::text);
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires external scheduler or cron job)
-- This would typically be called from application or cron
-- SELECT refresh_market_summary();
```

### Spatial Query Optimization

Property platforms heavily rely on geographic queries:

```sql
-- Efficient proximity searches
-- Create function for nearby properties with caching support
CREATE OR REPLACE FUNCTION find_nearby_properties(
    center_lat NUMERIC,
    center_lng NUMERIC,
    radius_meters INTEGER DEFAULT 1000,
    property_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    property_id UUID,
    distance_meters NUMERIC,
    basic_info JSONB,
    financial_metrics JSONB
) AS $$
DECLARE
    center_point GEOMETRY;
BEGIN
    -- Create center point
    center_point := ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857);
    
    RETURN QUERY
    SELECT 
        p.id,
        ST_Distance(ST_Transform(p.geom, 3857), center_point) as distance,
        p.basic_info,
        p.financial_metrics
    FROM properties p
    WHERE 
        p.status = 'active'
        AND p.geom IS NOT NULL
        AND ST_DWithin(ST_Transform(p.geom, 3857), center_point, radius_meters)
    ORDER BY ST_Distance(ST_Transform(p.geom, 3857), center_point)
    LIMIT property_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Polygon intersection queries for area analysis
CREATE OR REPLACE FUNCTION properties_in_polygon(
    polygon_geojson JSONB
)
RETURNS TABLE (
    property_id UUID,
    basic_info JSONB,
    financial_metrics JSONB,
    intersection_area NUMERIC
) AS $$
DECLARE
    search_polygon GEOMETRY;
BEGIN
    -- Convert GeoJSON to PostGIS geometry
    search_polygon := ST_GeomFromGeoJSON(polygon_geojson::text);
    
    RETURN QUERY
    SELECT 
        p.id,
        p.basic_info,
        p.financial_metrics,
        ST_Area(ST_Intersection(p.geom, search_polygon)) as intersection_area
    FROM properties p
    WHERE 
        p.status = 'active'
        AND p.geom IS NOT NULL
        AND ST_Intersects(p.geom, search_polygon)
    ORDER BY intersection_area DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Section 2: Application-Level Caching

### Redis Caching Implementation

Implement sophisticated caching for property data:

```typescript
// Redis caching service for property platform
import Redis from 'ioredis'
import { createHash } from 'crypto'

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large objects
  version?: string; // Cache version for invalidation
}

interface PropertySearchParams {
  suburb?: string;
  minPrice?: number;
  maxPrice?: number;
  zoning?: string[];
  radius?: number;
  coordinates?: [number, number];
  limit?: number;
  offset?: number;
}

export class PropertyCacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  }

  // Generate cache key from search parameters
  private generateCacheKey(prefix: string, params: any): string {
    const normalized = this.normalizeParams(params);
    const hash = createHash('md5').update(JSON.stringify(normalized)).digest('hex');
    return `${prefix}:${hash}`;
  }

  private normalizeParams(params: any): any {
    // Sort object keys and handle undefined values for consistent hashing
    if (typeof params !== 'object' || params === null) return params;
    
    const sorted: any = {};
    Object.keys(params).sort().forEach(key => {
      if (params[key] !== undefined) {
        sorted[key] = typeof params[key] === 'object' 
          ? this.normalizeParams(params[key])
          : params[key];
      }
    });
    return sorted;
  }

  async cachePropertySearch(
    searchParams: PropertySearchParams,
    results: any[],
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.generateCacheKey('property_search', searchParams);
    const ttl = options.ttl || this.defaultTTL;
    
    const cacheData = {
      results,
      cachedAt: new Date().toISOString(),
      searchParams,
      version: options.version || '1.0'
    };

    try {
      // Store main cache entry
      await this.redis.setex(key, ttl, JSON.stringify(cacheData));
      
      // Store cache tags for invalidation
      if (options.tags) {
        const multi = this.redis.multi();
        options.tags.forEach(tag => {
          multi.sadd(`tag:${tag}`, key);
          multi.expire(`tag:${tag}`, ttl + 300); // Tags expire slightly later
        });
        await multi.exec();
      }

      // Track cache statistics
      await this.redis.hincrby('cache_stats', 'property_search_writes', 1);
      
    } catch (error) {
      console.error('Cache write error:', error);
      // Don't throw - caching failures shouldn't break the application
    }
  }

  async getCachedPropertySearch(
    searchParams: PropertySearchParams
  ): Promise<any[] | null> {
    const key = this.generateCacheKey('property_search', searchParams);
    
    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        await this.redis.hincrby('cache_stats', 'property_search_misses', 1);
        return null;
      }

      const data = JSON.parse(cached);
      
      // Check cache version compatibility
      if (data.version !== '1.0') {
        await this.redis.del(key);
        return null;
      }

      await this.redis.hincrby('cache_stats', 'property_search_hits', 1);
      return data.results;
      
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  // Cache property analysis results
  async cacheAnalysisResult(
    propertyId: string,
    analysisType: string,
    parameters: any,
    result: any,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = `analysis:${propertyId}:${analysisType}:${createHash('md5').update(JSON.stringify(parameters)).digest('hex')}`;
    const ttl = options.ttl || 86400; // Analysis results cached for 24 hours
    
    const cacheData = {
      result,
      parameters,
      cachedAt: new Date().toISOString(),
      propertyId,
      analysisType
    };

    try {
      await this.redis.setex(key, ttl, JSON.stringify(cacheData));
      
      // Add to property-specific cache list for invalidation
      await this.redis.sadd(`property_cache:${propertyId}`, key);
      await this.redis.expire(`property_cache:${propertyId}`, ttl + 300);
      
      await this.redis.hincrby('cache_stats', 'analysis_writes', 1);
      
    } catch (error) {
      console.error('Analysis cache write error:', error);
    }
  }

  async getCachedAnalysisResult(
    propertyId: string,
    analysisType: string,
    parameters: any
  ): Promise<any | null> {
    const key = `analysis:${propertyId}:${analysisType}:${createHash('md5').update(JSON.stringify(parameters)).digest('hex')}`;
    
    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        await this.redis.hincrby('cache_stats', 'analysis_misses', 1);
        return null;
      }

      const data = JSON.parse(cached);
      await this.redis.hincrby('cache_stats', 'analysis_hits', 1);
      return data.result;
      
    } catch (error) {
      console.error('Analysis cache read error:', error);
      return null;
    }
  }

  // Invalidate cache by tags
  async invalidateByTag(tag: string): Promise<number> {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length === 0) return 0;

      const multi = this.redis.multi();
      keys.forEach(key => multi.del(key));
      multi.del(`tag:${tag}`);
      
      const results = await multi.exec();
      const deletedCount = results?.filter(([err, result]) => !err && result === 1).length || 0;
      
      await this.redis.hincrby('cache_stats', 'invalidations', deletedCount);
      return deletedCount;
      
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  // Invalidate all cache for a specific property
  async invalidateProperty(propertyId: string): Promise<number> {
    try {
      const keys = await this.redis.smembers(`property_cache:${propertyId}`);
      if (keys.length === 0) return 0;

      const multi = this.redis.multi();
      keys.forEach(key => multi.del(key));
      multi.del(`property_cache:${propertyId}`);
      
      const results = await multi.exec();
      const deletedCount = results?.filter(([err, result]) => !err && result === 1).length || 0;
      
      return deletedCount;
      
    } catch (error) {
      console.error('Property cache invalidation error:', error);
      return 0;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<any> {
    try {
      const stats = await this.redis.hgetall('cache_stats');
      const memory = await this.redis.memory('usage');
      const info = await this.redis.info('memory');
      
      return {
        hitRates: {
          propertySearch: this.calculateHitRate(
            parseInt(stats.property_search_hits || '0'),
            parseInt(stats.property_search_misses || '0')
          ),
          analysis: this.calculateHitRate(
            parseInt(stats.analysis_hits || '0'),
            parseInt(stats.analysis_misses || '0')
          )
        },
        operations: {
          propertySearchWrites: parseInt(stats.property_search_writes || '0'),
          analysisWrites: parseInt(stats.analysis_writes || '0'),
          invalidations: parseInt(stats.invalidations || '0')
        },
        memory: {
          used: memory,
          info: info
        }
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  }
}

// Usage in property service
export class PropertyService {
  private cache: PropertyCacheService;
  private supabase: any;

  constructor(supabaseClient: any, cacheService: PropertyCacheService) {
    this.supabase = supabaseClient;
    this.cache = cacheService;
  }

  async searchProperties(params: PropertySearchParams): Promise<any[]> {
    // Try cache first
    const cached = await this.cache.getCachedPropertySearch(params);
    if (cached) {
      return cached;
    }

    // Execute database query
    let query = this.supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');

    if (params.suburb) {
      query = query.eq('basic_info->>suburb', params.suburb);
    }

    if (params.minPrice || params.maxPrice) {
      if (params.minPrice) {
        query = query.gte('financial_metrics->>estimated_value', params.minPrice);
      }
      if (params.maxPrice) {
        query = query.lte('financial_metrics->>estimated_value', params.maxPrice);
      }
    }

    if (params.zoning?.length) {
      query = query.in('planning_controls->zoning->>primary', params.zoning);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Cache the results with appropriate tags
    const tags = [];
    if (params.suburb) tags.push(`suburb:${params.suburb}`);
    if (params.zoning?.length) tags.push(...params.zoning.map(z => `zoning:${z}`));

    await this.cache.cachePropertySearch(params, data, {
      ttl: 1800, // 30 minutes for search results
      tags
    });

    return data;
  }
}
```

## Section 3: Connection Pooling and Resource Management

### Database Connection Optimization

```typescript
// Advanced connection pooling for Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

interface PoolConfig {
  connectionString: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statementTimeout: number;
}

export class DatabaseManager {
  private supabase: SupabaseClient;
  private readPool: Pool;
  private writePool: Pool;
  private analyticsPool: Pool;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    dbConfig: PoolConfig
  ) {
    // Supabase client for auth and realtime
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Dedicated connection pools for different workloads
    this.readPool = new Pool({
      connectionString: dbConfig.connectionString,
      max: 20,                    // Max connections for read operations
      min: 5,                     // Keep minimum connections open
      idleTimeoutMillis: 30000,   // Close idle connections after 30s
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,   // 30s statement timeout
      application_name: 'property_platform_read'
    });

    this.writePool = new Pool({
      connectionString: dbConfig.connectionString,
      max: 10,                    // Fewer connections for writes
      min: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 60000,   // Longer timeout for complex writes
      application_name: 'property_platform_write'
    });

    this.analyticsPool = new Pool({
      connectionString: dbConfig.connectionString,
      max: 5,                     // Limited connections for heavy analytics
      min: 1,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 300000,  // 5 minutes for complex analytics
      application_name: 'property_platform_analytics'
    });

    // Monitor connection health
    this.setupHealthMonitoring();
  }

  // Execute read queries with automatic retry
  async executeRead<T>(
    query: string,
    params: any[] = [],
    retries: number = 3
  ): Promise<T[]> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const client = await this.readPool.connect();
      
      try {
        const result = await client.query(query, params);
        return result.rows;
      } catch (error) {
        lastError = error as Error;
        console.error(`Read query attempt ${attempt} failed:`, error);
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 100);
        }
      } finally {
        client.release();
      }
    }

    throw lastError!;
  }

  // Execute write queries with transaction support
  async executeWrite<T>(
    operations: Array<{ query: string; params: any[] }>,
    isolationLevel: string = 'READ COMMITTED'
  ): Promise<T[]> {
    const client = await this.writePool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
      
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await client.query(operation.query, operation.params);
        results.push(result.rows);
      }
      
      await client.query('COMMIT');
      return results;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Execute analytics queries with timeout handling
  async executeAnalytics<T>(
    query: string,
    params: any[] = [],
    timeoutMs: number = 300000
  ): Promise<T[]> {
    const client = await this.analyticsPool.connect();
    
    try {
      // Set query timeout
      await client.query(`SET statement_timeout = ${timeoutMs}`);
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  // Health monitoring and metrics
  private setupHealthMonitoring(): void {
    setInterval(async () => {
      try {
        const readStats = {
          total: this.readPool.totalCount,
          idle: this.readPool.idleCount,
          waiting: this.readPool.waitingCount
        };

        const writeStats = {
          total: this.writePool.totalCount,
          idle: this.writePool.idleCount,
          waiting: this.writePool.waitingCount
        };

        const analyticsStats = {
          total: this.analyticsPool.totalCount,
          idle: this.analyticsPool.idleCount,
          waiting: this.analyticsPool.waitingCount
        };

        // Log or send metrics to monitoring service
        console.log('Connection Pool Stats:', {
          read: readStats,
          write: writeStats,
          analytics: analyticsStats,
          timestamp: new Date().toISOString()
        });

        // Alert if connection pools are under stress
        if (readStats.waiting > 5 || writeStats.waiting > 3) {
          console.warn('High connection pool contention detected');
        }

      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown(): Promise<void> {
    await Promise.all([
      this.readPool.end(),
      this.writePool.end(),
      this.analyticsPool.end()
    ]);
  }
}

// Query builder with automatic pool selection
export class PropertyQueryBuilder {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // Simple property search (uses read pool)
  async searchProperties(filters: PropertySearchParams): Promise<any[]> {
    const conditions: string[] = ['status = $1'];
    const params: any[] = ['active'];
    let paramIndex = 2;

    if (filters.suburb) {
      conditions.push(`basic_info->>'suburb' = $${paramIndex}`);
      params.push(filters.suburb);
      paramIndex++;
    }

    if (filters.minPrice) {
      conditions.push(`(financial_metrics->>'estimated_value')::numeric >= $${paramIndex}`);
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice) {
      conditions.push(`(financial_metrics->>'estimated_value')::numeric <= $${paramIndex}`);
      params.push(filters.maxPrice);
      paramIndex++;
    }

    const query = `
      SELECT id, basic_info, financial_metrics, planning_controls
      FROM properties 
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ${filters.limit || 50}
    `;

    return this.dbManager.executeRead(query, params);
  }

  // Complex market analysis (uses analytics pool)
  async getMarketAnalysis(suburb: string, zoning: string[]): Promise<any> {
    const query = `
      WITH property_stats AS (
        SELECT 
          (financial_metrics->>'estimated_value')::numeric as value,
          (planning_controls->>'land_area')::numeric as land_area,
          EXTRACT(YEAR FROM created_at) as year
        FROM properties 
        WHERE basic_info->>'suburb' = $1
        AND planning_controls->'zoning'->>'primary' = ANY($2)
        AND financial_metrics ? 'estimated_value'
        AND (financial_metrics->>'estimated_value')::numeric > 0
      ),
      yearly_trends AS (
        SELECT 
          year,
          COUNT(*) as sales_count,
          AVG(value) as avg_price,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_price,
          AVG(value / NULLIF(land_area, 0)) as avg_price_per_sqm
        FROM property_stats
        WHERE land_area > 0
        GROUP BY year
        ORDER BY year
      )
      SELECT 
        *,
        LAG(avg_price) OVER (ORDER BY year) as prev_avg_price,
        (avg_price - LAG(avg_price) OVER (ORDER BY year)) / 
        NULLIF(LAG(avg_price) OVER (ORDER BY year), 0) * 100 as price_growth_pct
      FROM yearly_trends
    `;

    return this.dbManager.executeAnalytics(query, [suburb, zoning]);
  }

  // Property update (uses write pool)
  async updateProperty(
    propertyId: string,
    updates: any,
    userId: string
  ): Promise<void> {
    const operations = [
      {
        query: `
          UPDATE properties 
          SET 
            basic_info = basic_info || $2,
            financial_metrics = financial_metrics || $3,
            planning_controls = planning_controls || $4,
            updated_at = NOW()
          WHERE id = $1
        `,
        params: [
          propertyId,
          updates.basicInfo || {},
          updates.financialMetrics || {},
          updates.planningControls || {}
        ]
      },
      {
        query: `
          INSERT INTO property_audit (
            property_id, action, new_values, changed_by, changed_at
          ) VALUES ($1, 'UPDATE', $2, $3, NOW())
        `,
        params: [propertyId, updates, userId]
      }
    ];

    await this.dbManager.executeWrite(operations);
  }
}
```

## Section 4: Performance Monitoring and Analysis

### Query Performance Monitoring

```sql
-- Create performance monitoring tables
CREATE TABLE query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    execution_time_ms NUMERIC NOT NULL,
    rows_examined INTEGER,
    rows_returned INTEGER,
    index_usage JSONB,
    user_id UUID,
    organization_id UUID,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_perf_hash ON query_performance_log(query_hash);
CREATE INDEX idx_query_perf_execution_time ON query_performance_log(execution_time_ms);
CREATE INDEX idx_query_perf_executed_at ON query_performance_log(executed_at);

-- Function to analyze slow queries
CREATE OR REPLACE FUNCTION analyze_slow_queries(
    time_threshold_ms NUMERIC DEFAULT 1000,
    time_period_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    query_hash TEXT,
    avg_execution_time NUMERIC,
    max_execution_time NUMERIC,
    execution_count BIGINT,
    total_time NUMERIC,
    sample_query TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qpl.query_hash,
        AVG(qpl.execution_time_ms) as avg_execution_time,
        MAX(qpl.execution_time_ms) as max_execution_time,
        COUNT(*) as execution_count,
        SUM(qpl.execution_time_ms) as total_time,
        MIN(qpl.query_text) as sample_query
    FROM query_performance_log qpl
    WHERE 
        qpl.executed_at > NOW() - INTERVAL '1 hour' * time_period_hours
        AND qpl.execution_time_ms > time_threshold_ms
    GROUP BY qpl.query_hash
    ORDER BY total_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE WHEN idx_scan > 0 
         THEN round(idx_tup_fetch::numeric / idx_scan, 2)
         ELSE 0 
    END as avg_tuples_per_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Identify unused indexes
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Application Performance Monitoring

```typescript
// Performance monitoring service
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // Wrap database queries with performance monitoring
  async monitorQuery<T>(
    queryName: string,
    queryFunc: () => Promise<T>,
    context: QueryContext = {}
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await queryFunc();
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      const metric: PerformanceMetric = {
        queryName,
        executionTime: endTime - startTime,
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        timestamp: new Date(),
        success: true,
        context
      };

      this.recordMetric(metric);
      
      // Log slow queries
      if (metric.executionTime > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${metric.executionTime}ms`);
      }

      return result;
      
    } catch (error) {
      const endTime = Date.now();
      
      const metric: PerformanceMetric = {
        queryName,
        executionTime: endTime - startTime,
        memoryDelta: { rss: 0, heapUsed: 0, heapTotal: 0 },
        timestamp: new Date(),
        success: false,
        error: error.message,
        context
      };

      this.recordMetric(metric);
      throw error;
    }
  }

  private recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.queryName)) {
      this.metrics.set(metric.queryName, []);
    }

    const metrics = this.metrics.get(metric.queryName)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per query type
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Persist critical metrics to database
    if (metric.executionTime > 5000 || !metric.success) {
      this.persistMetric(metric);
    }
  }

  private async persistMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const query = `
        INSERT INTO query_performance_log (
          query_hash, query_text, execution_time_ms, 
          user_id, organization_id
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      await this.dbManager.executeWrite([{
        query,
        params: [
          this.hashString(metric.queryName),
          metric.queryName,
          metric.executionTime,
          metric.context.userId || null,
          metric.context.organizationId || null
        ]
      }]);
    } catch (error) {
      console.error('Failed to persist performance metric:', error);
    }
  }

  // Generate performance report
  getPerformanceReport(timeWindow: number = 3600000): PerformanceReport {
    const now = Date.now();
    const cutoff = new Date(now - timeWindow);
    
    const report: PerformanceReport = {
      timeWindow,
      queries: {},
      summary: {
        totalQueries: 0,
        avgExecutionTime: 0,
        slowQueries: 0,
        errors: 0
      }
    };

    for (const [queryName, metrics] of this.metrics.entries()) {
      const recentMetrics = metrics.filter(m => m.timestamp >= cutoff);
      
      if (recentMetrics.length === 0) continue;

      const executionTimes = recentMetrics.map(m => m.executionTime);
      const successCount = recentMetrics.filter(m => m.success).length;
      const errorCount = recentMetrics.length - successCount;

      report.queries[queryName] = {
        count: recentMetrics.length,
        avgTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        minTime: Math.min(...executionTimes),
        maxTime: Math.max(...executionTimes),
        p95Time: this.percentile(executionTimes, 0.95),
        successRate: (successCount / recentMetrics.length) * 100,
        errorCount
      };

      report.summary.totalQueries += recentMetrics.length;
      report.summary.slowQueries += recentMetrics.filter(m => m.executionTime > 1000).length;
      report.summary.errors += errorCount;
    }

    if (report.summary.totalQueries > 0) {
      const allExecutionTimes = Array.from(this.metrics.values())
        .flat()
        .filter(m => m.timestamp >= cutoff)
        .map(m => m.executionTime);
      
      report.summary.avgExecutionTime = 
        allExecutionTimes.reduce((a, b) => a + b, 0) / allExecutionTimes.length;
    }

    return report;
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  private hashString(str: string): string {
    return createHash('md5').update(str).digest('hex');
  }
}

interface PerformanceMetric {
  queryName: string;
  executionTime: number;
  memoryDelta: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  timestamp: Date;
  success: boolean;
  error?: string;
  context: QueryContext;
}

interface QueryContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  parameters?: any;
}

interface PerformanceReport {
  timeWindow: number;
  queries: Record<string, QueryMetrics>;
  summary: {
    totalQueries: number;
    avgExecutionTime: number;
    slowQueries: number;
    errors: number;
  };
}

interface QueryMetrics {
  count: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  successRate: number;
  errorCount: number;
}
```

## Practical Exercises

### Exercise 1: Query Optimization
Optimize property search queries for:
- Multi-criteria property searches
- Spatial proximity queries
- Market analysis aggregations
- Performance benchmarking

### Exercise 2: Caching Strategy
Implement comprehensive caching for:
- Property search results
- Analysis calculations
- User-specific data
- Cache invalidation strategies

### Exercise 3: Connection Management
Build connection pooling for:
- Read/write operation separation
- Analytics workload isolation
- Connection health monitoring
- Failover strategies

### Exercise 4: Performance Monitoring
Create monitoring systems for:
- Query performance tracking
- Resource utilization
- Alert systems
- Performance dashboards

## Summary

This module covered comprehensive performance optimization strategies for property platforms:

- **Query Optimization**: Advanced indexing and query techniques for property data
- **Caching Strategies**: Multi-level caching with Redis and application patterns
- **Connection Management**: Sophisticated pooling for different workload types
- **Performance Monitoring**: Comprehensive metrics and analysis systems
- **Resource Management**: Efficient handling of database connections and memory

These performance optimization skills ensure property platforms can handle large datasets and high user loads while maintaining responsive user experiences.

## Navigation
- [← Previous: Module 5.3 - Data Migration and Management](./Module-5.3-Data-Migration-and-Management.md)
- [Next: Phase 6 - Build Tools and Development Workflow →](../Phase-6-Build-Tools-and-Development-Workflow/README.md)
- [↑ Back to Phase 5 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)