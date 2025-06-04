# Module 6.1: Modern Build Tools

## Learning Objectives
By the end of this module, you will be able to:
- Configure and optimize Vite for property application development
- Implement advanced build configurations for production deployments
- Set up efficient development workflows with hot module replacement
- Configure proxy settings for government API integration
- Optimize bundle size and performance for property data applications
- Implement code splitting and lazy loading strategies

## Prerequisites
- Understanding of JavaScript modules and import/export
- Familiarity with Node.js and npm package management
- Basic knowledge of React development patterns
- Understanding of HTTP protocols and CORS concepts

## Introduction

Modern property management platforms require sophisticated build tools to handle complex requirements: large datasets, government API integrations, real-time updates, and performance optimization. This module explores advanced build tool configuration using Vite, the modern build tool that powers our property analysis platform.

**Why Vite for Property Applications?**
- **Lightning Fast Development**: Hot Module Replacement (HMR) for instant updates
- **Modern JavaScript Support**: Native ES modules, TypeScript, and JSX
- **Optimized Production Builds**: Tree shaking and code splitting out of the box
- **Plugin Ecosystem**: Rich ecosystem for React, TypeScript, and specialized tools
- **Proxy Configuration**: Essential for government API integration and CORS handling
- **Performance Focus**: Optimized for large applications with complex asset management

## Section 1: Vite Configuration and Setup

### Advanced Vite Configuration

The property platform requires sophisticated build configuration to handle multiple environments and integrations:

```typescript
// vite.config.ts - Production-ready configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'

export default defineConfig({
  plugins: [
    react({
      // React Fast Refresh for optimal development experience
      fastRefresh: true,
      // Babel configuration for property-specific optimizations
      babel: {
        plugins: [
          // Optimize emotion CSS-in-JS for property styling
          ['@emotion/babel-plugin'],
          // Optimize Mapbox GL imports
          ['babel-plugin-transform-imports', {
            'mapbox-gl': {
              'transform': 'mapbox-gl/dist/mapbox-gl.js',
              'preventFullImport': true
            }
          }]
        ]
      }
    }),
    
    // Vendor chunk splitting for optimal caching
    splitVendorChunkPlugin(),
    
    // Bundle analyzer for production builds
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],

  // Path resolution for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow network access for mobile testing
    
    // Proxy configuration for government APIs and services
    proxy: {
      // NSW ePlanning API proxy
      '/api/eplanning': {
        target: 'https://api.planning.nsw.gov.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eplanning/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('ePlanning proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to ePlanning:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from ePlanning:', proxyRes.statusCode, req.url);
          });
        }
      },

      // Supabase functions proxy for development
      '/functions': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/functions/, '/functions/v1')
      },

      // Property data services proxy
      '/api/property': {
        target: 'https://property-api.nsw.gov.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/property/, '/api/v1'),
        headers: {
          'X-API-Key': process.env.VITE_NSW_API_KEY || ''
        }
      },

      // Spatial data services proxy
      '/api/spatial': {
        target: 'https://maps.six.nsw.gov.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spatial/, '/arcgis/rest/services')
      }
    }
  },

  // Build configuration for production
  build: {
    target: 'es2020', // Modern JavaScript for better performance
    sourcemap: true,  // Enable source maps for debugging
    
    // Optimize chunk size limits
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Custom chunk splitting strategy
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // UI framework
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            'framer-motion'
          ],
          
          // Mapping libraries
          'map-vendor': [
            'mapbox-gl',
            'react-map-gl',
            '@turf/turf'
          ],
          
          // Charting and visualization
          'chart-vendor': [
            'chart.js',
            'react-chartjs-2',
            'recharts'
          ],
          
          // Property analysis utilities
          'property-utils': [
            './src/utils/propertyCalculations',
            './src/utils/spatialAnalysis',
            './src/utils/financialModels'
          ]
        }
      }
    },

    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets as base64
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: 'esbuild'
  },

  // CSS configuration
  css: {
    modules: {
      // CSS modules configuration for component isolation
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      }
    }
  },

  // Environment variables configuration
  envPrefix: ['VITE_', 'REACT_APP_'],

  // Optimization settings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'mapbox-gl',
      '@supabase/supabase-js'
    ],
    exclude: ['@mapbox/node-pre-gyp']
  },

  // Enable advanced features
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
```

### Environment-Specific Configuration

Different environments require different build strategies:

```typescript
// vite.config.development.ts
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'

export default mergeConfig(baseConfig, defineConfig({
  mode: 'development',
  
  define: {
    __DEV__: true,
    __PROD__: false,
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  server: {
    // Enhanced development features
    hmr: {
      overlay: true // Show errors in overlay
    },
    
    // Additional development proxies
    proxy: {
      ...baseConfig.server?.proxy,
      
      // Mock API for offline development
      '/api/mock': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      
      // Development analytics
      '/api/analytics': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  build: {
    // Development build optimizations
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [], // Don't externalize anything in development
    }
  }
}))

// vite.config.production.ts
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'
import { compression } from 'vite-plugin-compression'

export default mergeConfig(baseConfig, defineConfig({
  mode: 'production',
  
  define: {
    __DEV__: false,
    __PROD__: true,
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  plugins: [
    // Add production-specific plugins
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],

  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 8192,
    
    rollupOptions: {
      output: {
        // Optimize file naming for caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
}))
```

## Section 2: Package Management and Dependencies

### Advanced NPM Configuration

Property applications require careful dependency management:

```json
{
  "name": "property-analysis-platform",
  "version": "2.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.development.ts",
    "dev:mock": "concurrently \"npm run dev\" \"npm run mock-server\"",
    "build": "tsc && vite build --config vite.config.production.ts",
    "build:analyze": "ANALYZE=true npm run build",
    "build:staging": "NODE_ENV=staging vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "prepare": "husky install",
    "mock-server": "json-server --watch mock-data/db.json --port 3001",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "mapbox-gl": "^2.15.0",
    "react-map-gl": "^7.1.0",
    "@turf/turf": "^6.5.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "framer-motion": "^10.16.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/mapbox-gl": "^2.7.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.0",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vitest": "^0.34.6",
    "@vitest/ui": "^0.34.6",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "playwright": "^1.40.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "prettier": "^3.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.0",
    "concurrently": "^8.2.0",
    "json-server": "^0.17.4",
    "rollup-plugin-visualizer": "^5.9.2",
    "vite-plugin-compression": "^0.5.1"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Dependency Optimization Strategies

```typescript
// scripts/analyze-dependencies.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface DependencyAnalysis {
  name: string;
  version: string;
  size: number;
  dependencies: string[];
  isUsed: boolean;
  importPaths: string[];
}

class DependencyAnalyzer {
  private projectRoot: string;
  private packageJson: any;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.packageJson = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    );
  }

  // Analyze bundle impact of dependencies
  async analyzeBundleImpact(): Promise<DependencyAnalysis[]> {
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    const analysis: DependencyAnalysis[] = [];

    for (const [name, version] of Object.entries(dependencies)) {
      const depAnalysis = await this.analyzeDependency(name, version as string);
      analysis.push(depAnalysis);
    }

    return analysis.sort((a, b) => b.size - a.size);
  }

  private async analyzeDependency(name: string, version: string): Promise<DependencyAnalysis> {
    // Get package size
    const size = await this.getPackageSize(name);
    
    // Find actual usage in codebase
    const importPaths = await this.findImports(name);
    
    // Get sub-dependencies
    const dependencies = await this.getSubDependencies(name);

    return {
      name,
      version,
      size,
      dependencies,
      isUsed: importPaths.length > 0,
      importPaths
    };
  }

  private async getPackageSize(packageName: string): Promise<number> {
    try {
      const result = execSync(`npm list ${packageName} --depth=0 --json`, {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      });
      
      const packageInfo = JSON.parse(result);
      // This is a simplified size calculation
      // In reality, you'd use tools like bundlephobia API
      return this.estimatePackageSize(packageName);
    } catch (error) {
      return 0;
    }
  }

  private estimatePackageSize(packageName: string): number {
    // Rough size estimates for common property platform dependencies
    const sizeMap: Record<string, number> = {
      'react': 45000,
      'react-dom': 130000,
      'mapbox-gl': 800000,
      '@turf/turf': 150000,
      'chart.js': 200000,
      '@supabase/supabase-js': 100000,
      'framer-motion': 180000
    };

    return sizeMap[packageName] || 50000; // Default estimate
  }

  private async findImports(packageName: string): Promise<string[]> {
    const imports: string[] = [];
    
    try {
      // Use grep to find imports
      const result = execSync(
        `grep -r "from '${packageName}'" src/ --include="*.ts" --include="*.tsx" || true`,
        { cwd: this.projectRoot, encoding: 'utf-8' }
      );
      
      const lines = result.split('\n').filter(line => line.trim());
      imports.push(...lines);
    } catch (error) {
      // Handle error
    }

    return imports;
  }

  private async getSubDependencies(packageName: string): Promise<string[]> {
    try {
      const packagePath = path.join(this.projectRoot, 'node_modules', packageName, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        return Object.keys(pkg.dependencies || {});
      }
    } catch (error) {
      // Handle error
    }
    
    return [];
  }

  // Generate optimization recommendations
  generateOptimizationReport(analysis: DependencyAnalysis[]): string {
    let report = '# Dependency Optimization Report\n\n';
    
    // Unused dependencies
    const unused = analysis.filter(dep => !dep.isUsed);
    if (unused.length > 0) {
      report += '## Unused Dependencies\n';
      unused.forEach(dep => {
        report += `- ${dep.name} (${dep.size} bytes) - Consider removing\n`;
      });
      report += '\n';
    }

    // Large dependencies
    const large = analysis.filter(dep => dep.size > 100000).slice(0, 10);
    report += '## Largest Dependencies\n';
    large.forEach(dep => {
      report += `- ${dep.name}: ${Math.round(dep.size / 1000)}KB\n`;
    });
    report += '\n';

    // Optimization suggestions
    report += '## Optimization Suggestions\n';
    report += this.generateOptimizationSuggestions(analysis);

    return report;
  }

  private generateOptimizationSuggestions(analysis: DependencyAnalysis[]): string {
    let suggestions = '';

    const mapboxDep = analysis.find(dep => dep.name === 'mapbox-gl');
    if (mapboxDep) {
      suggestions += '- Consider lazy loading Mapbox GL for non-map pages\n';
      suggestions += '- Use dynamic imports for map-related components\n';
    }

    const chartDep = analysis.find(dep => dep.name === 'chart.js');
    if (chartDep) {
      suggestions += '- Consider using react-chartjs-2 with selective chart type imports\n';
    }

    suggestions += '- Implement code splitting for route-based chunks\n';
    suggestions += '- Use tree shaking to eliminate unused code\n';
    suggestions += '- Consider using lighter alternatives for large dependencies\n';

    return suggestions;
  }
}

// Usage
const analyzer = new DependencyAnalyzer(process.cwd());
analyzer.analyzeBundleImpact().then(analysis => {
  const report = analyzer.generateOptimizationReport(analysis);
  fs.writeFileSync('dependency-analysis.md', report);
  console.log('Dependency analysis complete. Check dependency-analysis.md');
});
```

## Section 3: Code Quality and Automation

### ESLint Configuration for Property Platforms

```javascript
// eslint.config.js - Comprehensive linting for property applications
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  { ignores: ['dist', 'node_modules', '.git'] },
  
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      }
    },
    
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': typescript
    },
    
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],

      // TypeScript specific rules for property applications
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Property application specific rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      
      // React specific rules
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      // Import rules for clean architecture
      'sort-imports': ['error', {
        'ignoreCase': false,
        'ignoreDeclarationSort': true,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }],

      // Property data handling rules
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
        enforceConst: true
      }]
    }
  },

  // Specific rules for utility functions
  {
    files: ['src/utils/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-magic-numbers': 'off' // Allow magic numbers in utility calculations
    }
  },

  // Test file rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-magic-numbers': 'off'
    }
  }
]
```

### Prettier Configuration

```javascript
// .prettierrc.js
export default {
  // Code formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // JSX formatting
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Property-specific formatting
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript'
      }
    }
  ]
}
```

### Automated Quality Checks

```yaml
# .github/workflows/quality-checks.yml
name: Quality Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Linting
        run: npm run lint
      
      - name: Format checking
        run: npm run format:check
      
      - name: Unit tests
        run: npm run test:coverage
      
      - name: Build
        run: npm run build
      
      - name: Bundle size analysis
        run: npm run build:analyze
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Comment bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level moderate
      
      - name: Check for vulnerable dependencies
        run: npx audit-ci --moderate
```

## Section 4: Development Workflow Optimization

### Hot Module Replacement for Property Components

```typescript
// src/utils/hmr.ts - Enhanced HMR for property components
interface HMRData {
  propertyData?: any;
  mapState?: any;
  analysisResults?: any;
}

export class PropertyHMRManager {
  private static instance: PropertyHMRManager;
  private preservedState: Map<string, any> = new Map();

  static getInstance(): PropertyHMRManager {
    if (!PropertyHMRManager.instance) {
      PropertyHMRManager.instance = new PropertyHMRManager();
    }
    return PropertyHMRManager.instance;
  }

  // Preserve property analysis state during HMR
  preserveAnalysisState(componentId: string, state: any): void {
    this.preservedState.set(`analysis_${componentId}`, {
      ...state,
      timestamp: Date.now()
    });
  }

  // Restore property analysis state after HMR
  restoreAnalysisState(componentId: string): any {
    const key = `analysis_${componentId}`;
    const state = this.preservedState.get(key);
    
    if (state && Date.now() - state.timestamp < 30000) { // 30 second limit
      return state;
    }
    
    this.preservedState.delete(key);
    return null;
  }

  // Preserve map viewport during HMR
  preserveMapState(mapId: string, viewport: any): void {
    this.preservedState.set(`map_${mapId}`, viewport);
  }

  restoreMapState(mapId: string): any {
    return this.preservedState.get(`map_${mapId}`);
  }

  // Clean up old state
  cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    this.preservedState.forEach((value, key) => {
      if (value.timestamp && now - value.timestamp > 60000) { // 1 minute
        expired.push(key);
      }
    });
    
    expired.forEach(key => this.preservedState.delete(key));
  }
}

// Enhanced HMR for property components
export function withPropertyHMR<T extends object>(
  Component: React.ComponentType<T>,
  componentId: string
) {
  const WrappedComponent = (props: T) => {
    const hmrManager = PropertyHMRManager.getInstance();
    
    // Restore state on mount
    React.useEffect(() => {
      const restoredState = hmrManager.restoreAnalysisState(componentId);
      if (restoredState) {
        // Apply restored state logic here
        console.log(`Restored HMR state for ${componentId}`, restoredState);
      }
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `PropertyHMR(${Component.displayName || Component.name})`;
  
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
      // Preserve state before disposal
      PropertyHMRManager.getInstance().cleanup();
    });
  }

  return WrappedComponent;
}
```

### Development Scripts and Automation

```typescript
// scripts/dev-server.ts - Enhanced development server
import { spawn } from 'child_process'
import { watch } from 'chokidar'
import WebSocket from 'ws'

class PropertyDevServer {
  private viteProcess: any;
  private mockServer: any;
  private wss: WebSocket.Server;
  
  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });
    this.setupWebSocketServer();
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Property Analysis Platform development server...');
    
    // Start Vite dev server
    this.viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Start mock API server
    this.mockServer = spawn('npm', ['run', 'mock-server'], {
      stdio: 'inherit',
      shell: true
    });

    // Watch for configuration changes
    this.watchConfig();
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    console.log('✅ Development server started');
    console.log('📊 Main app: http://localhost:3000');
    console.log('🔧 Mock API: http://localhost:3001');
    console.log('📡 WebSocket: ws://localhost:8080');
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'PROPERTY_UPDATE':
            // Broadcast property updates to all connected clients
            this.broadcast({
              type: 'PROPERTY_UPDATED',
              propertyId: data.propertyId,
              changes: data.changes
            });
            break;
            
          case 'ANALYSIS_COMPLETE':
            // Broadcast analysis completion
            this.broadcast({
              type: 'ANALYSIS_COMPLETED',
              analysisId: data.analysisId,
              results: data.results
            });
            break;
        }
      });
    });
  }

  private broadcast(message: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private watchConfig(): void {
    // Watch for configuration file changes
    const watcher = watch([
      'vite.config.ts',
      'package.json',
      'tsconfig.json',
      '.env*'
    ]);

    watcher.on('change', (path) => {
      console.log(`📝 Configuration file changed: ${path}`);
      console.log('🔄 Restart may be required for changes to take effect');
      
      this.broadcast({
        type: 'CONFIG_CHANGED',
        file: path,
        timestamp: new Date().toISOString()
      });
    });
  }

  private shutdown(): void {
    console.log('\n🛑 Shutting down development server...');
    
    if (this.viteProcess) {
      this.viteProcess.kill();
    }
    
    if (this.mockServer) {
      this.mockServer.kill();
    }
    
    this.wss.close();
    process.exit(0);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new PropertyDevServer();
  server.start().catch(console.error);
}
```

## Practical Exercises

### Exercise 1: Vite Configuration
Set up a complete Vite configuration for a property platform including:
- Multi-environment support
- Proxy configuration for government APIs
- Advanced build optimizations
- Bundle analysis and reporting

### Exercise 2: Development Workflow
Create an automated development workflow with:
- Hot module replacement for property components
- Automated testing and linting
- Mock API integration
- Real-time development notifications

### Exercise 3: Bundle Optimization
Implement bundle optimization strategies:
- Code splitting for different features
- Lazy loading for heavy components
- Tree shaking optimization
- Performance monitoring

### Exercise 4: Quality Automation
Set up automated quality checks:
- Pre-commit hooks
- Continuous integration
- Security auditing
- Dependency analysis

## Summary

This module covered comprehensive build tool configuration and development workflow optimization for property platforms:

- **Vite Configuration**: Advanced setup for development and production environments
- **Package Management**: Dependency optimization and analysis strategies
- **Code Quality**: ESLint, Prettier, and automated quality checks
- **Development Workflow**: HMR, automation, and productivity tools
- **Performance**: Bundle optimization and monitoring techniques

These build tool skills enable efficient development of complex property management platforms with optimal performance and maintainability.

## Navigation
- [Next: Module 6.2 - Testing Infrastructure →](./Module-6.2-Testing-Infrastructure.md)
- [← Previous: Phase 5 - Database Systems and Backend](../Phase-5-Database-Systems-and-Backend/README.md)
- [↑ Back to Phase 6 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)