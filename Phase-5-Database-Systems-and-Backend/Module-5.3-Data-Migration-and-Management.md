# Module 5.3: Data Migration and Management

## Learning Objectives
By the end of this module, you will be able to:
- Design and implement database migration strategies
- Handle complex data transformations for property systems
- Implement backup and recovery procedures
- Manage database versioning and rollback strategies
- Handle large-scale data imports and exports
- Implement data validation and integrity checks

## Prerequisites
- Understanding of SQL and database design (Module 5.1)
- Knowledge of Supabase and PostgreSQL operations
- Familiarity with data formats (CSV, JSON, XML)
- Basic understanding of ETL (Extract, Transform, Load) processes

## Introduction

Property management platforms often deal with legacy data, external integrations, and evolving schemas. This module covers the essential skills for managing data throughout the application lifecycle: from initial migrations and imports to ongoing maintenance and disaster recovery.

**Why Data Migration Matters for Property Platforms:**
- **Legacy System Integration**: Importing from older property management systems
- **Government Data Updates**: Regular updates from planning and cadastral systems
- **Schema Evolution**: Adding new features while preserving existing data
- **Multi-source Integration**: Combining data from various property APIs
- **Compliance Requirements**: Maintaining audit trails and data integrity
- **Disaster Recovery**: Ensuring business continuity through robust backup strategies

## Section 1: Database Migration Strategies

### Migration File Structure

Supabase uses a migration system that tracks schema changes over time:

```sql
-- 20240301000000_initial_property_schema.sql
-- Initial schema creation with proper constraints and indexes

BEGIN;

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles with organization relationships
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects for organizing property analysis work
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties with flexible JSONB attributes
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    external_id TEXT, -- Reference to external property systems
    basic_info JSONB NOT NULL DEFAULT '{}',
    planning_controls JSONB DEFAULT '{}',
    environmental_factors JSONB DEFAULT '{}',
    financial_metrics JSONB DEFAULT '{}',
    spatial_attributes JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure uniqueness within project
    UNIQUE(project_id, external_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_properties_project ON properties(project_id);
CREATE INDEX idx_properties_external_id ON properties(external_id);

-- JSONB indexes for common queries
CREATE INDEX idx_properties_suburb ON properties USING GIN ((basic_info->'suburb'));
CREATE INDEX idx_properties_zoning ON properties USING GIN ((planning_controls->'zoning'));
CREATE INDEX idx_properties_value ON properties USING BTREE (((financial_metrics->>'estimated_value')::numeric));

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

COMMIT;
```

### Advanced Migration Patterns

Complex migrations often require data transformations:

```sql
-- 20240315000000_add_property_analysis_tracking.sql
-- Adding analysis tracking with data migration from existing records

BEGIN;

-- Create new analysis tracking table
CREATE TABLE property_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('financial', 'environmental', 'planning', 'development')),
    input_parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analysis_property ON property_analysis(property_id);
CREATE INDEX idx_analysis_type ON property_analysis(analysis_type);
CREATE INDEX idx_analysis_status ON property_analysis(status);
CREATE INDEX idx_analysis_created_by ON property_analysis(created_by);

-- Migrate existing financial data from properties to analysis table
INSERT INTO property_analysis (
    property_id,
    analysis_type,
    input_parameters,
    results,
    status,
    completed_at,
    created_by
)
SELECT 
    p.id,
    'financial',
    COALESCE(p.financial_metrics->'input_parameters', '{}'),
    COALESCE(p.financial_metrics->'results', '{}'),
    CASE 
        WHEN p.financial_metrics ? 'results' AND p.financial_metrics->'results' != 'null' 
        THEN 'completed' 
        ELSE 'pending' 
    END,
    CASE 
        WHEN p.financial_metrics ? 'calculated_at' 
        THEN (p.financial_metrics->>'calculated_at')::timestamptz 
        ELSE NULL 
    END,
    p.created_by
FROM properties p
WHERE p.financial_metrics IS NOT NULL AND p.financial_metrics != '{}'::jsonb;

-- Update properties table to remove migrated data
UPDATE properties 
SET financial_metrics = financial_metrics - 'input_parameters' - 'results' - 'calculated_at'
WHERE financial_metrics ? 'results';

-- Add audit trigger for property changes
CREATE OR REPLACE FUNCTION audit_property_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Record all changes to properties
    INSERT INTO property_audit (
        property_id,
        action,
        old_values,
        new_values,
        changed_by,
        changed_at
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        current_setting('request.jwt.claims', true)::jsonb->>'sub',
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER properties_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW EXECUTE FUNCTION audit_property_changes();

COMMIT;
```

### Rollback Strategies

Every migration should have a corresponding rollback:

```sql
-- Rollback for 20240315000000_add_property_analysis_tracking.sql
-- This restores the previous state if the migration needs to be undone

BEGIN;

-- Restore financial data to properties table from analysis table
UPDATE properties 
SET financial_metrics = financial_metrics || jsonb_build_object(
    'input_parameters', pa.input_parameters,
    'results', pa.results,
    'calculated_at', pa.completed_at
)
FROM property_analysis pa
WHERE properties.id = pa.property_id 
AND pa.analysis_type = 'financial'
AND pa.status = 'completed';

-- Drop audit trigger
DROP TRIGGER IF EXISTS properties_audit_trigger ON properties;
DROP FUNCTION IF EXISTS audit_property_changes();

-- Drop analysis table
DROP TABLE IF EXISTS property_analysis;

COMMIT;
```

## Section 2: Data Import and Transformation

### CSV Import with Validation

Property data often comes from CSV files that require extensive validation:

```typescript
// Data import service for property platforms
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'

interface PropertyImportRow {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  zoning?: string;
  landArea?: number;
  estimatedValue?: number;
  coordinates?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: ImportError[];
  importId: string;
}

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data: any;
}

export class PropertyImporter {
  private supabase: any;
  private validationRules: ValidationRule[];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.validationRules = [
      {
        field: 'address',
        required: true,
        validator: (value: string) => value && value.trim().length > 5,
        message: 'Address must be at least 5 characters long'
      },
      {
        field: 'suburb',
        required: true,
        validator: (value: string) => value && /^[a-zA-Z\s]+$/.test(value),
        message: 'Suburb must contain only letters and spaces'
      },
      {
        field: 'postcode',
        required: true,
        validator: (value: string) => /^\d{4}$/.test(value),
        message: 'Postcode must be 4 digits'
      },
      {
        field: 'estimatedValue',
        required: false,
        validator: (value: any) => !value || (Number(value) > 0 && Number(value) < 50000000),
        message: 'Estimated value must be between $1 and $50,000,000'
      },
      {
        field: 'coordinates',
        required: false,
        validator: this.validateCoordinates,
        message: 'Coordinates must be in format "latitude,longitude"'
      }
    ];
  }

  async importFromCSV(
    file: File,
    projectId: string,
    userId: string,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const importId = crypto.randomUUID();
    const errors: ImportError[] = [];
    let successfulRows = 0;

    try {
      // Parse CSV file
      const csvData = await this.parseCSVFile(file);
      
      // Create import record
      await this.createImportRecord(importId, projectId, userId, {
        fileName: file.name,
        totalRows: csvData.length,
        status: 'processing'
      });

      // Process rows in batches
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(csvData, batchSize);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchResults = await this.processBatch(
          batch,
          batchIndex * batchSize,
          projectId,
          importId,
          options
        );

        successfulRows += batchResults.successfulRows;
        errors.push(...batchResults.errors);

        // Update progress
        await this.updateImportProgress(importId, {
          processedRows: (batchIndex + 1) * batchSize,
          successfulRows,
          errorCount: errors.length
        });
      }

      // Finalize import
      await this.finalizeImport(importId, {
        status: errors.length === 0 ? 'completed' : 'completed_with_errors',
        successfulRows,
        errorCount: errors.length,
        errors: errors.slice(0, 1000) // Limit stored errors
      });

      return {
        success: true,
        totalRows: csvData.length,
        successfulRows,
        errors,
        importId
      };

    } catch (error) {
      await this.updateImportRecord(importId, {
        status: 'failed',
        errorMessage: error.message
      });
      
      throw error;
    }
  }

  private async parseCSVFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize header names
          return header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  private async processBatch(
    rows: any[],
    startIndex: number,
    projectId: string,
    importId: string,
    options: ImportOptions
  ): Promise<{ successfulRows: number; errors: ImportError[] }> {
    const errors: ImportError[] = [];
    const validRows: any[] = [];

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const rowIndex = startIndex + i;
      const row = rows[i];
      const rowErrors = this.validateRow(row, rowIndex);

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Transform and normalize data
        const transformedRow = await this.transformRow(row, projectId);
        validRows.push(transformedRow);
      }
    }

    // Bulk insert valid rows
    if (validRows.length > 0) {
      try {
        const { error } = await this.supabase
          .from('properties')
          .insert(validRows);

        if (error) {
          // Handle constraint violations and other database errors
          for (let i = 0; i < validRows.length; i++) {
            errors.push({
              row: startIndex + i,
              message: `Database error: ${error.message}`,
              data: validRows[i]
            });
          }
          return { successfulRows: 0, errors };
        }
      } catch (dbError) {
        // Handle individual row errors with retry logic
        for (let i = 0; i < validRows.length; i++) {
          try {
            await this.supabase
              .from('properties')
              .insert(validRows[i]);
          } catch (rowError) {
            errors.push({
              row: startIndex + i,
              message: `Row insert failed: ${rowError.message}`,
              data: validRows[i]
            });
          }
        }
      }
    }

    return {
      successfulRows: validRows.length - errors.filter(e => e.row >= startIndex).length,
      errors
    };
  }

  private validateRow(row: any, rowIndex: number): ImportError[] {
    const errors: ImportError[] = [];

    for (const rule of this.validationRules) {
      const value = row[rule.field];

      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push({
          row: rowIndex,
          field: rule.field,
          message: `${rule.field} is required`,
          data: row
        });
        continue;
      }

      if (value && !rule.validator(value)) {
        errors.push({
          row: rowIndex,
          field: rule.field,
          message: rule.message,
          data: row
        });
      }
    }

    // Cross-field validation
    if (row.landarea && row.estimatedvalue) {
      const pricePerSqm = Number(row.estimatedvalue) / Number(row.landarea);
      if (pricePerSqm > 10000 || pricePerSqm < 10) {
        errors.push({
          row: rowIndex,
          message: 'Price per square meter seems unrealistic',
          data: row
        });
      }
    }

    return errors;
  }

  private async transformRow(row: any, projectId: string): Promise<any> {
    // Parse coordinates if provided
    let coordinates = null;
    if (row.coordinates) {
      const [lat, lng] = row.coordinates.split(',').map(Number);
      coordinates = { type: 'Point', coordinates: [lng, lat] };
    }

    // Geocode address if coordinates not provided
    if (!coordinates && row.address) {
      coordinates = await this.geocodeAddress(`${row.address}, ${row.suburb}, ${row.state} ${row.postcode}`);
    }

    return {
      project_id: projectId,
      external_id: row.propertyid || `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      basic_info: {
        address: row.address,
        suburb: row.suburb,
        state: row.state,
        postcode: row.postcode,
        description: row.description || null
      },
      planning_controls: {
        zoning: row.zoning ? { primary: row.zoning } : null,
        landArea: row.landarea ? Number(row.landarea) : null
      },
      financial_metrics: {
        estimatedValue: row.estimatedvalue ? Number(row.estimatedvalue) : null,
        lastSalePrice: row.lastsaleprice ? Number(row.lastsaleprice) : null,
        lastSaleDate: row.lastsaledate || null
      },
      spatial_attributes: {
        coordinates: coordinates
      }
    };
  }

  private validateCoordinates(value: string): boolean {
    if (!value) return true; // Optional field
    
    const coords = value.split(',');
    if (coords.length !== 2) return false;
    
    const [lat, lng] = coords.map(Number);
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  private async geocodeAddress(address: string): Promise<any> {
    // Implementation would call geocoding service
    // This is a placeholder returning null
    return null;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

interface ValidationRule {
  field: string;
  required: boolean;
  validator: (value: any) => boolean;
  message: string;
}

interface ImportOptions {
  batchSize?: number;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}
```

## Section 3: Backup and Recovery

### Automated Backup Strategies

```sql
-- Create backup configuration table
CREATE TABLE backup_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'selective')),
    schedule_cron TEXT NOT NULL,
    retention_days INTEGER DEFAULT 30,
    tables_included TEXT[], -- Specific tables for selective backups
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup execution log
CREATE TABLE backup_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES backup_configs(id),
    backup_type TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    file_path TEXT,
    file_size BIGINT,
    records_count INTEGER,
    error_message TEXT
);

-- Function to create organization-specific backup
CREATE OR REPLACE FUNCTION create_organization_backup(org_id UUID, backup_type TEXT)
RETURNS UUID AS $$
DECLARE
    execution_id UUID;
    table_name TEXT;
    backup_query TEXT;
    backup_file TEXT;
    record_count INTEGER;
BEGIN
    -- Create execution record
    INSERT INTO backup_executions (config_id, backup_type)
    VALUES ((SELECT id FROM backup_configs WHERE organization_id = org_id LIMIT 1), backup_type)
    RETURNING id INTO execution_id;
    
    -- Generate backup file path
    backup_file := format('backup_%s_%s_%s.sql', org_id, backup_type, 
                         to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS'));
    
    -- Perform backup based on type
    IF backup_type = 'full' THEN
        -- Full organization backup
        EXECUTE format('
            COPY (
                SELECT * FROM properties WHERE project_id IN (
                    SELECT id FROM projects WHERE organization_id = %L
                )
            ) TO %L WITH CSV HEADER',
            org_id, backup_file
        );
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        
    ELSIF backup_type = 'incremental' THEN
        -- Incremental backup (changes since last backup)
        EXECUTE format('
            COPY (
                SELECT * FROM properties 
                WHERE project_id IN (
                    SELECT id FROM projects WHERE organization_id = %L
                )
                AND updated_at > (
                    SELECT COALESCE(MAX(completed_at), NOW() - INTERVAL ''7 days'')
                    FROM backup_executions 
                    WHERE status = ''completed''
                )
            ) TO %L WITH CSV HEADER',
            org_id, backup_file
        );
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
    END IF;
    
    -- Update execution record
    UPDATE backup_executions 
    SET completed_at = NOW(),
        status = 'completed',
        file_path = backup_file,
        records_count = record_count
    WHERE id = execution_id;
    
    RETURN execution_id;
    
EXCEPTION WHEN OTHERS THEN
    -- Update execution record with error
    UPDATE backup_executions 
    SET completed_at = NOW(),
        status = 'failed',
        error_message = SQLERRM
    WHERE id = execution_id;
    
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Point-in-Time Recovery

```typescript
// Recovery service for property data
export class RecoveryService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async restoreFromBackup(
    organizationId: string,
    backupExecutionId: string,
    options: RecoveryOptions = {}
  ): Promise<RecoveryResult> {
    try {
      // Get backup execution details
      const { data: backupExecution, error: backupError } = await this.supabase
        .from('backup_executions')
        .select('*, backup_configs!inner(*)')
        .eq('id', backupExecutionId)
        .single();

      if (backupError || !backupExecution) {
        throw new Error('Backup execution not found');
      }

      // Verify organization access
      if (backupExecution.backup_configs.organization_id !== organizationId) {
        throw new Error('Access denied to backup');
      }

      // Create recovery execution record
      const recoveryId = crypto.randomUUID();
      await this.createRecoveryRecord(recoveryId, backupExecutionId, organizationId, options);

      // Perform recovery based on strategy
      let result: RecoveryResult;
      
      switch (options.strategy) {
        case 'replace_all':
          result = await this.performFullReplace(organizationId, backupExecution, recoveryId);
          break;
        case 'merge':
          result = await this.performMergeRestore(organizationId, backupExecution, recoveryId);
          break;
        case 'selective':
          result = await this.performSelectiveRestore(organizationId, backupExecution, recoveryId, options);
          break;
        default:
          throw new Error('Invalid recovery strategy');
      }

      // Update recovery record
      await this.updateRecoveryRecord(recoveryId, {
        status: 'completed',
        restoredRecords: result.restoredRecords,
        completedAt: new Date()
      });

      return result;

    } catch (error) {
      // Update recovery record with error
      await this.updateRecoveryRecord(recoveryId, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date()
      });
      
      throw error;
    }
  }

  private async performFullReplace(
    organizationId: string,
    backupExecution: any,
    recoveryId: string
  ): Promise<RecoveryResult> {
    // Create temporary table for staging
    const tempTableName = `temp_restore_${recoveryId.replace(/-/g, '_')}`;
    
    // Create temporary table with same structure as properties
    await this.supabase.rpc('create_temp_restore_table', {
      table_name: tempTableName
    });

    try {
      // Load backup data into temporary table
      await this.loadBackupData(backupExecution.file_path, tempTableName);

      // Begin transaction for atomic replacement
      const { error: beginError } = await this.supabase.rpc('begin_transaction');
      if (beginError) throw beginError;

      try {
        // Delete existing properties for organization
        const { error: deleteError } = await this.supabase
          .from('properties')
          .delete()
          .in('project_id', 
            this.supabase
              .from('projects')
              .select('id')
              .eq('organization_id', organizationId)
          );

        if (deleteError) throw deleteError;

        // Copy data from temporary table to properties
        const { data: restoredData, error: copyError } = await this.supabase.rpc(
          'copy_from_temp_table',
          {
            source_table: tempTableName,
            target_table: 'properties',
            organization_id: organizationId
          }
        );

        if (copyError) throw copyError;

        // Commit transaction
        await this.supabase.rpc('commit_transaction');

        return {
          success: true,
          restoredRecords: restoredData.count,
          strategy: 'replace_all',
          recoveryId
        };

      } catch (transactionError) {
        // Rollback transaction
        await this.supabase.rpc('rollback_transaction');
        throw transactionError;
      }

    } finally {
      // Clean up temporary table
      await this.supabase.rpc('drop_temp_table', { table_name: tempTableName });
    }
  }

  async createRecoveryPoint(
    organizationId: string,
    description: string
  ): Promise<string> {
    const recoveryPointId = crypto.randomUUID();

    // Create full backup for recovery point
    const { data: backupExecution } = await this.supabase.rpc(
      'create_organization_backup',
      {
        org_id: organizationId,
        backup_type: 'full'
      }
    );

    // Create recovery point record
    await this.supabase
      .from('recovery_points')
      .insert({
        id: recoveryPointId,
        organization_id: organizationId,
        backup_execution_id: backupExecution,
        description,
        created_at: new Date()
      });

    return recoveryPointId;
  }

  async listRecoveryPoints(organizationId: string): Promise<RecoveryPoint[]> {
    const { data, error } = await this.supabase
      .from('recovery_points')
      .select(`
        *,
        backup_executions!inner(
          id,
          started_at,
          completed_at,
          file_size,
          records_count
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data;
  }
}

interface RecoveryOptions {
  strategy: 'replace_all' | 'merge' | 'selective';
  selectedTables?: string[];
  conflictResolution?: 'skip' | 'overwrite' | 'rename';
  dryRun?: boolean;
}

interface RecoveryResult {
  success: boolean;
  restoredRecords: number;
  strategy: string;
  recoveryId: string;
  conflicts?: ConflictRecord[];
}

interface RecoveryPoint {
  id: string;
  organizationId: string;
  description: string;
  createdAt: Date;
  backupExecution: {
    id: string;
    startedAt: Date;
    completedAt: Date;
    fileSize: number;
    recordsCount: number;
  };
}
```

## Section 4: Data Integrity and Monitoring

### Automated Data Validation

```sql
-- Data integrity check functions
CREATE OR REPLACE FUNCTION check_property_data_integrity()
RETURNS TABLE (
    check_name TEXT,
    severity TEXT,
    issue_count INTEGER,
    sample_records JSONB
) AS $$
BEGIN
    -- Check for missing required fields
    RETURN QUERY
    SELECT 
        'Missing Address' as check_name,
        'ERROR' as severity,
        COUNT(*)::INTEGER as issue_count,
        jsonb_agg(jsonb_build_object('id', id, 'basic_info', basic_info) ORDER BY created_at DESC LIMIT 5) as sample_records
    FROM properties 
    WHERE basic_info->>'address' IS NULL OR basic_info->>'address' = ''
    HAVING COUNT(*) > 0;

    -- Check for invalid coordinates
    RETURN QUERY
    SELECT 
        'Invalid Coordinates' as check_name,
        'WARNING' as severity,
        COUNT(*)::INTEGER as issue_count,
        jsonb_agg(jsonb_build_object('id', id, 'coordinates', spatial_attributes->'coordinates') ORDER BY created_at DESC LIMIT 5) as sample_records
    FROM properties 
    WHERE spatial_attributes->'coordinates' IS NOT NULL
    AND (
        (spatial_attributes->'coordinates'->>'coordinates'->1)::NUMERIC NOT BETWEEN -90 AND 90
        OR (spatial_attributes->'coordinates'->>'coordinates'->0)::NUMERIC NOT BETWEEN -180 AND 180
    )
    HAVING COUNT(*) > 0;

    -- Check for unrealistic property values
    RETURN QUERY
    SELECT 
        'Unrealistic Property Values' as check_name,
        'WARNING' as severity,
        COUNT(*)::INTEGER as issue_count,
        jsonb_agg(jsonb_build_object('id', id, 'value', financial_metrics->>'estimated_value') ORDER BY created_at DESC LIMIT 5) as sample_records
    FROM properties 
    WHERE (financial_metrics->>'estimated_value')::NUMERIC > 50000000 
    OR (financial_metrics->>'estimated_value')::NUMERIC < 1000
    HAVING COUNT(*) > 0;

    -- Check for orphaned analysis records
    RETURN QUERY
    SELECT 
        'Orphaned Analysis Records' as check_name,
        'ERROR' as severity,
        COUNT(*)::INTEGER as issue_count,
        jsonb_agg(jsonb_build_object('id', id, 'property_id', property_id) ORDER BY created_at DESC LIMIT 5) as sample_records
    FROM property_analysis pa
    WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = pa.property_id)
    HAVING COUNT(*) > 0;

    -- Check for duplicate external IDs within projects
    RETURN QUERY
    SELECT 
        'Duplicate External IDs' as check_name,
        'ERROR' as severity,
        COUNT(*)::INTEGER as issue_count,
        jsonb_agg(jsonb_build_object('external_id', external_id, 'project_id', project_id, 'count', cnt) ORDER BY cnt DESC LIMIT 5) as sample_records
    FROM (
        SELECT external_id, project_id, COUNT(*) as cnt
        FROM properties 
        WHERE external_id IS NOT NULL
        GROUP BY external_id, project_id
        HAVING COUNT(*) > 1
    ) duplicates
    HAVING COUNT(*) > 0;

END;
$$ LANGUAGE plpgsql;

-- Schedule regular integrity checks
CREATE TABLE data_integrity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    check_results JSONB NOT NULL,
    total_issues INTEGER NOT NULL DEFAULT 0,
    severity_breakdown JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to run and store integrity check
CREATE OR REPLACE FUNCTION run_data_integrity_check(org_id UUID)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
    check_results JSONB;
    total_issues INTEGER := 0;
    severity_counts JSONB := '{"ERROR": 0, "WARNING": 0}';
    check_result RECORD;
BEGIN
    report_id := gen_random_uuid();
    check_results := '[]'::jsonb;
    
    -- Run integrity checks for organization's data
    FOR check_result IN 
        SELECT * FROM check_property_data_integrity()
    LOOP
        check_results := check_results || jsonb_build_array(
            jsonb_build_object(
                'check_name', check_result.check_name,
                'severity', check_result.severity,
                'issue_count', check_result.issue_count,
                'sample_records', check_result.sample_records
            )
        );
        
        total_issues := total_issues + check_result.issue_count;
        severity_counts := jsonb_set(
            severity_counts,
            ARRAY[check_result.severity],
            ((severity_counts->>check_result.severity)::INTEGER + check_result.issue_count)::TEXT::jsonb
        );
    END LOOP;
    
    -- Store report
    INSERT INTO data_integrity_reports (
        id, organization_id, check_results, total_issues, severity_breakdown
    ) VALUES (
        report_id, org_id, check_results, total_issues, severity_counts
    );
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql;
```

## Practical Exercises

### Exercise 1: Migration Strategy
Design and implement a migration strategy for:
- Adding new property attribute categories
- Migrating from flat file structure to relational
- Handling backward compatibility
- Testing rollback procedures

### Exercise 2: Data Import Pipeline
Build a complete data import system for:
- CSV property data with validation
- Government API data synchronization
- Error handling and reporting
- Progress tracking and recovery

### Exercise 3: Backup and Recovery
Implement comprehensive backup/recovery for:
- Automated daily backups
- Point-in-time recovery
- Cross-region backup replication
- Disaster recovery testing

### Exercise 4: Data Monitoring
Create monitoring systems for:
- Data quality metrics
- Performance monitoring
- Integrity check automation
- Alert systems for critical issues

## Summary

This module covered comprehensive data migration and management strategies for property platforms:

- **Migration Strategies**: Version-controlled schema evolution with rollback capabilities
- **Data Import**: Robust import pipelines with validation and error handling
- **Backup and Recovery**: Automated backup systems and point-in-time recovery
- **Data Integrity**: Monitoring and validation for data quality assurance
- **Performance**: Optimization strategies for large-scale data operations

These data management skills ensure reliable, scalable property platforms that can handle evolving requirements while maintaining data integrity.

## Navigation
- [Next: Module 5.4 - Caching and Performance →](./Module-5.4-Caching-and-Performance.md)
- [← Previous: Module 5.2 - API Development](./Module-5.2-API-Development.md)
- [↑ Back to Phase 5 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)