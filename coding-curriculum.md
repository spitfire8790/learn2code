# Comprehensive Coding Curriculum - Property Analysis Platform

## Overview

This curriculum is designed around a sophisticated **Property Analysis and Report Generation Platform** that combines enterprise-level web development, GIS technologies, 3D visualisation, database systems, and cloud deployment. The platform consists of two main applications: a **PowerPoint Report Generator** and a **Slide Template Management System**.

---

## [Phase 0: Absolute Beginnings](./Phase-0-Absolute-Beginnings/README.md)

### [Module 0.1: Development Environment Setup](./Phase-0-Absolute-Beginnings/Module-0.1-Development-Environment-Setup.md)

#### Computer Setup and Tools
- **Operating System**: Windows setup for development
- **Code Editor**: Visual Studio Code installation and basic usage
  - Essential extensions: Live Server, Prettier, Auto Rename Tag
  - Basic editor features: File explorer, integrated terminal, split view
- **Web Browser**: Chrome Developer Tools introduction
- **Project**: Set up VS Code and create your first HTML file

#### File System and Project Organisation
- **File/folder structure**: Understanding directories, paths, file extensions
- **Naming conventions**: File naming best practices, avoiding spaces
- **Project structure**: How to organise web development projects
- **Project**: Create a basic project folder structure

### [Module 0.2: HTML Fundamentals](./Phase-0-Absolute-Beginnings/Module-0.2-HTML-Fundamentals.md)

#### HTML Structure and Syntax
- **Document structure**: DOCTYPE, html, head, body tags
- **Essential tags**: Headings (h1-h6), paragraphs (p), divs, spans
- **Text formatting**: Bold, italic, emphasis, line breaks
- **Real Examples**: Basic property listing page structure
- **Project**: Create a simple property information page

#### HTML Elements and Attributes
- **Links and navigation**: Anchor tags, internal/external links
- **Images**: Img tags, alt text, responsive images
- **Lists**: Ordered and unordered lists, definition lists
- **Tables**: Table structure, headers, rows, cells
- **Real Examples**: Property details table, navigation menu
- **Project**: Build a multi-page property website with navigation

#### Forms and Input Elements
- **Form structure**: Form tag, input types, labels, buttons
- **Input validation**: Required fields, input types (email, number, date)
- **Form accessibility**: Proper labelling, fieldsets, accessibility
- **Real Examples**: Property search form, contact forms
- **Project**: Create a property search and contact form

#### Semantic HTML and Accessibility
- **Semantic elements**: Header, nav, main, section, article, footer
- **Accessibility basics**: Alt text, proper headings, keyboard navigation
- **SEO fundamentals**: Meta tags, title tags, heading hierarchy
- **Project**: Convert previous projects to use semantic HTML

### [Module 0.3: CSS Fundamentals](./Phase-0-Absolute-Beginnings/Module-0.3-CSS-Fundamentals.md)

#### CSS Basics and Syntax
- **CSS syntax**: Selectors, properties, values, comments
- **Connecting CSS**: Inline, internal, and external stylesheets
- **Basic selectors**: Element, class, ID selectors
- **Real Examples**: Styling property cards, navigation menus
- **Project**: Style your property website with basic CSS

#### CSS Box Model and Layout
- **Box model**: Content, padding, border, margin
- **Display properties**: Block, inline, inline-block, none
- **Positioning**: Static, relative, absolute, fixed
- **Real Examples**: Property card layouts, header positioning
- **Project**: Create responsive property card layouts

#### CSS Styling and Visual Design
- **Typography**: Font families, sizes, weights, line height
- **Colours**: Colour values (hex, rgb, hsl), background colours
- **Borders and shadows**: Border styles, border-radius, box-shadow
- **Real Examples**: Professional property listing styling
- **Project**: Style property listings with professional appearance

#### Responsive Design Basics
- **Media queries**: Breakpoints, mobile-first design
- **Flexible layouts**: Percentages, max-width, viewport units
- **Responsive images**: Max-width: 100%, object-fit
- **Real Examples**: Mobile-friendly property listings
- **Project**: Make your property website responsive

#### CSS Layout Systems
- **Flexbox**: Flex containers, flex items, alignment, distribution
- **CSS Grid**: Grid containers, grid items, areas, responsive grids
- **Layout patterns**: Navigation bars, card grids, sidebar layouts
- **Real Examples**: Property grid layouts, responsive navigation
- **Project**: Create complex layouts using Flexbox and Grid

### [Module 0.4: Version Control with Git and GitHub](./Phase-0-Absolute-Beginnings/Module-0.4-Version-Control-Git-GitHub.md)

#### Git Fundamentals
- **Git concepts**: Repository, commits, branches, history
- **Git installation**: Command line setup on Windows, GUI options
- **Basic commands**: init, add, commit, status, log
- **Project**: Initialise git repository for your property website

#### Working with Local Repositories
- **Staging area**: Understanding git add and staging
- **Commit messages**: Writing clear, descriptive commit messages
- **Branching**: Creating branches, switching, merging
- **Project**: Create feature branches for different website sections

#### GitHub Integration
- **GitHub account**: Creating account, SSH keys, authentication
- **Remote repositories**: Clone, push, pull, fetch
- **GitHub features**: Issues, pull requests, README files
- **Project**: Push your property website to GitHub

#### Collaboration Workflows
- **Forking**: Contributing to other projects
- **Pull requests**: Code review, collaboration
- **Conflict resolution**: Merge conflicts, resolution strategies
- **GitHub Pages**: Free hosting for static websites
- **Project**: Deploy your property website using GitHub Pages

#### Best Practices and Workflow
- **Commit frequency**: When and how often to commit
- **Branch naming**: Feature branches, bug fixes, releases
- **Documentation**: README files, code comments
- **Project**: Create comprehensive documentation for your property website

---

## [Phase 1: Foundation Technologies](./Phase-1-Foundation-Technologies/README.md)

### [Module 1.1: Core Web Development Stack](./Phase-1-Foundation-Technologies/Module-1.1-Core-Web-Development-Stack.md)

#### JavaScript/ES6+ Fundamentals
- **Topics**: Arrow functions, destructuring, modules, async/await, promises
- **Real Examples**: Property data fetching, map event handling
- **Project**: Build a simple property search interface

#### React.js Ecosystem
- **Core React**: Hooks (useState, useEffect, useContext), component lifecycle
- **Advanced Patterns**: Custom hooks, context providers, ref management
- **Real Examples**: `useUserStatus.js`, property selection state management
- **Project**: Create a property dashboard with interactive components

#### Modern JavaScript Tooling
- **Node.js & NPM**: Package management, scripts, dependency handling
- **ES Modules**: Import/export patterns, dynamic imports
- **Real Examples**: Module organisation in `src/components/`, utility functions
- **Project**: Set up a modular application structure

### [Module 1.2: Styling and UI Framework](./Phase-1-Foundation-Technologies/Module-1.2-Styling-and-UI-Framework.md)

#### Tailwind CSS
- **Utility-first approach**: Responsive design, dark mode, custom themes
- **Configuration**: `tailwind.config.js` customisation, design tokens
- **Real Examples**: Navy colour scheme, responsive layouts, animation classes
- **Project**: Build a responsive property listing interface

#### UI Component Libraries
- **Radix UI**: Headless components, accessibility, keyboard navigation
- **shadcn/ui**: Pre-built component system, customisation patterns
- **Real Examples**: Dialogue modals, select components, tooltip systems
- **Project**: Create a complete design system

#### CSS-in-JS and Animations
- **Framer Motion**: Page transitions, component animations, gesture handling
- **Emotion**: Styled components, dynamic styling
- **Real Examples**: Map transitions, modal animations, loading states
- **Project**: Add smooth animations to property interactions

### [Module 1.3: TypeScript Integration](./Phase-1-Foundation-Technologies/Module-1.3-TypeScript-Integration.md)

#### TypeScript Fundamentals
- **Type system**: Interfaces, types, generics, union types
- **React with TypeScript**: Props typing, event handlers, refs
- **Real Examples**: Common types in `src/constants/common.ts`
- **Project**: Convert JavaScript components to TypeScript

#### Advanced TypeScript Patterns
- **Utility types**: Pick, Omit, Partial, Record
- **Generic constraints**: Type-safe API calls, form handling
- **Real Examples**: Property data types, GIS feature interfaces
- **Project**: Build type-safe data fetching utilities

---

## [Phase 2: React Development Mastery](./Phase-2-React-Development-Mastery/README.md)

### [Module 2.1: Advanced React Patterns](./Phase-2-React-Development-Mastery/Module-2.1-Advanced-React-Patterns.md)

#### Context and State Management
- **React Context**: Provider patterns, context composition
- **Custom Hooks**: Data fetching, local storage, websocket connections
- **Real Examples**: `OpenSpaceContext.jsx`, `TriageContext.jsx`, `GPFContext.jsx`
- **Project**: Build a multi-feature application with shared state

#### Component Architecture
- **Composition patterns**: Higher-order components, render props
- **Performance optimisation**: Memoisation, lazy loading, code splitting
- **Real Examples**: Feature-based organisation in `Utilities/`
- **Project**: Create a scalable component architecture

#### Form Handling and Validation
- **Controlled components**: Input management, validation patterns
- **Complex forms**: Multi-step forms, dynamic fields, file uploads
- **Real Examples**: Property criteria forms, Excel import components
- **Project**: Build a comprehensive property analysis form

### Module 2.2: Data Management and APIs

#### REST API Integration
- **Fetch patterns**: Error handling, loading states, retry logic
- **Authentication**: Token management, protected routes
- **Real Examples**: ArcGIS service integration, property data fetching
- **Project**: Create a data management service layer

#### Real-time Data with WebSockets
- **WebSocket connections**: Real-time updates, connection management
- **User status tracking**: Online/offline states, collaborative features
- **Real Examples**: `userStatusService.js`, real-time user tracking
- **Project**: Build a collaborative property analysis tool

#### Data Processing and Transformation
- **CSV/Excel handling**: Papa Parse, ExcelJS integration
- **GeoJSON processing**: Turf.js for spatial operations
- **Real Examples**: Property import/export, spatial calculations
- **Project**: Create data import/export workflows

### Module 2.3: Advanced UI Patterns

#### Complex Interactive Components
- **Data tables**: ag-Grid integration, sorting, filtering, pagination
- **Charts and visualisation**: Chart.js, Recharts, ApexCharts
- **Real Examples**: Property triage tables, analytics dashboards
- **Project**: Build comprehensive data visualisation dashboards

#### Modal and Dialogue Systems
- **Modal management**: Dialogue state, overlay handling, focus management
- **Multi-step workflows**: Wizard patterns, progress tracking
- **Real Examples**: Development modals, land use analysis workflows
- **Project**: Create complex multi-step analysis workflows

#### Drag and Drop Interfaces
- **DnD Kit**: Sortable lists, drag handles, collision detection
- **Template management**: Slide ordering, layout customisation
- **Real Examples**: Template slide organisation, property prioritisation
- **Project**: Build a template management interface

### Module 2.4: Testing and Quality Assurance

#### Unit and Integration Testing
- **Testing frameworks**: Jest, React Testing Library
- **Component testing**: Props, events, state changes
- **API testing**: Mock services, error scenarios
- **Project**: Add comprehensive test coverage

#### Code Quality and Linting
- **ESLint configuration**: React rules, TypeScript integration
- **Code formatting**: Prettier, consistent styling
- **Real Examples**: `eslint.config.js` setup
- **Project**: Establish development workflow standards

---

## Phase 3: Geographic Information Systems (GIS)

### Module 3.1: Mapping Technologies

#### Mapbox GL JS
- **Map initialisation**: Styles, layers, sources
- **User interactions**: Click events, hover states, feature selection
- **Real Examples**: `MapView.jsx`, property selection system
- **Project**: Build an interactive property mapping interface

#### Leaflet Integration
- **React Leaflet**: Map components, marker management
- **Layer management**: WMS layers, vector data, clustering
- **Real Examples**: Alternative mapping solutions, specialised use cases
- **Project**: Create multiple mapping interfaces for different use cases

#### Coordinate Systems and Projections
- **Proj4 integration**: Coordinate transformations, spatial reference systems
- **Geographic calculations**: Distance, area, buffering
- **Real Examples**: Property boundary calculations, spatial analysis
- **Project**: Build coordinate transformation utilities

### Module 3.2: Spatial Data Processing

#### Turf.js for Spatial Analysis
- **Geometry operations**: Intersection, union, difference, buffer
- **Measurement functions**: Area calculation, distance measurement
- **Spatial relationships**: Point-in-polygon, overlays, nearest features
- **Real Examples**: Developable area calculations, proximity analysis
- **Project**: Create spatial analysis tools

#### GeoJSON and Vector Data
- **Data formats**: GeoJSON, KML, Shapefile processing
- **Feature collections**: Properties, geometry, styling
- **Real Examples**: Property boundaries, zoning data, infrastructure layers
- **Project**: Build vector data processing pipeline

#### ArcGIS Services Integration
- **REST API**: Feature services, map services, query operations
- **Authentication**: Token-based access, service security
- **Real Examples**: Government data integration, property lookups
- **Project**: Create ArcGIS service abstraction layer

### Module 3.3: Web Mapping Services (WMS/WFS)

#### WMS Layer Integration
- **Layer management**: Multiple WMS sources, layer ordering
- **Styling**: SLD styles, dynamic styling, transparency
- **Real Examples**: Planning layers, environmental data, infrastructure
- **Project**: Build multi-source mapping application

#### Government Data Integration
- **NSW government APIs**: ePlanning, property data, zoning information
- **Data standardisation**: Format conversion, schema mapping
- **Real Examples**: `eplanning` proxy integration, property schema
- **Project**: Create government data integration system

#### Proxy Services and CORS
- **Cross-origin requests**: Proxy server setup, CORS handling
- **Authentication**: API key management, secure proxying
- **Real Examples**: `proxy-server/` setup, Cloudflare Workers deployment
- **Project**: Build secure data proxy infrastructure

### Module 3.4: Advanced GIS Features

#### Screenshot and Image Generation
- **Map screenshots**: Automated capture, layer composition
- **HTML to canvas**: html2canvas, image export functionality
- **Real Examples**: Report generation, property imagery
- **Project**: Create automated map reporting system

#### Spatial Querying and Analysis
- **Buffer analysis**: Distance-based queries, service area analysis
- **Overlay operations**: Multi-layer analysis, suitability modelling
- **Real Examples**: Transport accessibility, environmental constraints
- **Project**: Build comprehensive spatial analysis tools

---

## Phase 4: 3D Visualisation and Graphics

### Module 4.1: Three.js Fundamentals

#### 3D Scene Setup
- **Scene, camera, renderer**: Basic 3D environment setup
- **Lighting systems**: Directional, ambient, point lights
- **Materials and textures**: PBR materials, texture loading
- **Real Examples**: Building visualisation setup, lighting configuration
- **Project**: Create basic 3D property visualisation

#### Geometry and Mesh Creation
- **Buffer geometry**: Efficient geometry creation, vertex manipulation
- **Extrusion**: 2D to 3D conversion, building footprint extrusion
- **Real Examples**: Building generation from GeoJSON polygons
- **Project**: Build 3D building generator from property data

#### Camera Controls and Interaction
- **Orbit controls**: Mouse/touch navigation, zoom limits
- **Raycasting**: Object selection, hover effects
- **Real Examples**: Interactive 3D property exploration
- **Project**: Create interactive 3D navigation system

### Module 4.2: React Three Fiber

#### React Integration
- **Component approach**: JSX for 3D scenes, hooks integration
- **State management**: React state in 3D context
- **Real Examples**: Integration patterns with existing React components
- **Project**: Convert Three.js scenes to React Three Fiber

#### Animation and Performance
- **useFrame hook**: Animation loops, performance optimisation
- **Suspense and loading**: Async resource loading, fallbacks
- **Project**: Create smooth 3D animations and transitions

### Module 4.3: Realistic 3D Environments

#### Terrain Generation
- **Elevation data**: DEM processing, height map creation
- **Texture mapping**: Aerial imagery application, terrain realism
- **Water bodies**: Lake and ocean rendering
- **Real Examples**: `terrain.js` implementation, geographic accuracy
- **Project**: Create realistic terrain from geographic data

#### Building and Urban Visualisation
- **Building footprint extrusion**: Accurate height and geometry
- **Material systems**: Different building types, realistic textures
- **Urban features**: Roads, infrastructure, environment
- **Real Examples**: `buildings.js`, `roads.js`, urban rendering
- **Project**: Build comprehensive urban visualisation system

#### Environmental Effects
- **Sky rendering**: Atmospheric scattering, day/night cycles
- **Shadow mapping**: Realistic shadows, shadow cascades
- **Weather effects**: Fog, atmospheric particles
- **Real Examples**: `environment.js`, `lighting.js` systems
- **Project**: Create dynamic environmental simulation

### Module 4.4: Integration with GIS Data

#### Coordinate System Integration
- **Lat/lon to scene coordinates**: Accurate positioning, scale management
- **Multi-level detail**: Performance optimisation for large areas
- **Real Examples**: Geographic coordinate conversion utilities
- **Project**: Integrate 3D visualisation with mapping data

#### Real-time Data Visualisation
- **Dynamic geometry updates**: Real-time building generation
- **Data-driven styling**: Property values affecting visualisation
- **Performance optimisation**: LOD systems, geometry pooling
- **Project**: Create real-time 3D property analysis tools

---

## Phase 5: Database Systems and Backend

### Module 5.1: Supabase and PostgreSQL

#### Database Design and Schema
- **Relational design**: Normalisation, foreign keys, constraints
- **PostgreSQL features**: JSONB, arrays, full-text search
- **Real Examples**: Comprehensive schema in `20250126_create_slider_app_schema.sql`
- **Project**: Design complete application database schema

#### Supabase Authentication
- **User management**: Registration, login, password reset
- **Row Level Security (RLS)**: Data access control, user isolation
- **Real Examples**: Organisation-based access control, user profiles
- **Project**: Implement secure user authentication system

#### Advanced PostgreSQL Features
- **JSONB operations**: Complex data queries, indexing strategies
- **Full-text search**: Property search, content indexing
- **Triggers and functions**: Automated workflows, data validation
- **Real Examples**: Audit logging, automatic timestamps
- **Project**: Build advanced data processing pipelines

### Module 5.2: API Development

#### Supabase Edge Functions
- **Deno runtime**: TypeScript functions, modern JavaScript features
- **HTTP handling**: Request/response processing, CORS management
- **Real Examples**: User status tracking, email services
- **Project**: Create serverless API endpoints

#### Real-time Subscriptions
- **PostgreSQL triggers**: Real-time data updates, change notifications
- **WebSocket integration**: Live updates, collaborative features
- **Real Examples**: User status updates, collaborative editing
- **Project**: Build real-time collaborative features

### Module 5.3: Data Migration and Management

#### Database Migrations
- **Schema versioning**: Migration files, rollback strategies
- **Data seeding**: Initial data setup, test data generation
- **Real Examples**: Migration files in `supabase/migrations/`
- **Project**: Create complete migration system

#### Backup and Recovery
- **Data backup**: Automated backups, point-in-time recovery
- **Monitoring**: Performance monitoring, error tracking
- **Project**: Implement database monitoring and backup systems

### Module 5.4: Caching and Performance

#### Query Optimisation
- **Index strategies**: Performance tuning, query analysis
- **Connection pooling**: Efficient database connections
- **Caching strategies**: Redis integration, application-level caching
- **Project**: Optimise application performance

---

## Phase 6: Build Tools and Development Workflow

### Module 6.1: Modern Build Tools

#### Vite Development Environment
- **Fast development**: Hot module replacement, fast builds
- **Plugin ecosystem**: React plugin, proxy configuration
- **Build optimisation**: Tree shaking, code splitting, asset optimisation
- **Real Examples**: `vite.config.js` setup, proxy configuration
- **Project**: Optimise development and build processes

#### Package Management
- **NPM ecosystem**: Dependency management, security auditing
- **Lock files**: Reproducible builds, dependency resolution
- **Scripts**: Development workflow automation
- **Real Examples**: `package.json` scripts, concurrency management
- **Project**: Create robust development workflow

#### Code Quality Tools
- **ESLint**: Code linting, TypeScript integration
- **Prettier**: Code formatting, consistent style
- **Pre-commit hooks**: Automated quality checks
- **Real Examples**: `eslint.config.js` configuration
- **Project**: Establish code quality standards

### Module 6.2: Testing Infrastructure

#### Unit and Integration Testing
- **Jest**: Test runner, mocking, coverage reporting
- **React Testing Library**: Component testing, user interaction testing
- **API testing**: Service mocking, integration testing
- **Project**: Implement comprehensive testing strategy

#### End-to-End Testing
- **Playwright/Cypress**: Browser automation, user workflow testing
- **Visual regression**: Screenshot comparison, UI consistency
- **Project**: Create end-to-end testing suite

### Module 6.3: Documentation and Maintenance

#### API Documentation
- **TypeDoc**: Code documentation generation
- **API documentation**: Service documentation, usage examples
- **Real Examples**: GiraffeSDK documentation structure
- **Project**: Create comprehensive project documentation

---

## Phase 7: Cloud Deployment and DevOps

### Module 7.1: Cloud Platforms

#### Vercel Deployment
- **Static site deployment**: Build optimisation, CDN integration
- **Serverless functions**: API endpoints, proxy services
- **Environment management**: Configuration, secrets management
- **Real Examples**: `vercel.json` configuration, proxy routing
- **Project**: Deploy complete application to Vercel

#### Cloudflare Workers
- **Edge computing**: Distributed proxy services, global deployment
- **Performance optimisation**: Caching strategies, edge processing
- **Real Examples**: `wrangler.toml` configuration, proxy server deployment
- **Project**: Create global proxy infrastructure

#### Supabase Cloud
- **Managed database**: Production database setup, scaling
- **Edge functions**: Global serverless deployment
- **Authentication**: Production user management
- **Project**: Deploy complete backend infrastructure

### Module 7.2: Performance and Monitoring

#### Application Performance
- **Bundle analysis**: Code splitting, lazy loading
- **Image optimisation**: Asset optimisation, CDN integration
- **Real Examples**: Vercel Analytics integration, performance tracking
- **Project**: Optimise application performance

#### Error Tracking and Monitoring
- **Error boundaries**: React error handling, user experience
- **Performance monitoring**: Core Web Vitals, user experience metrics
- **Logging**: Application logging, debugging strategies
- **Project**: Implement comprehensive monitoring

### Module 7.3: CI/CD and Automation

#### Continuous Integration
- **GitHub Actions**: Automated testing, build processes
- **Quality gates**: Testing requirements, deployment criteria
- **Project**: Create automated deployment pipeline

#### Security and Compliance
- **Environment security**: Secret management, access control
- **Data protection**: User privacy, data encryption
- **Project**: Implement security best practices

---

## Phase 8: Advanced Integration Patterns

### Module 8.1: Government Data Integration

#### NSW Government APIs
- **ePlanning integration**: Property planning data, zoning information
- **Spatial data services**: Cadastre, boundaries, infrastructure
- **Authentication**: Government API authentication, token management
- **Real Examples**: `vite.config.js` proxy setup, government data workflows
- **Project**: Create comprehensive government data integration

#### Data Standardisation
- **Schema mapping**: Different data formats, standardisation
- **Error handling**: Service reliability, fallback strategies
- **Real Examples**: Property schema standardisation, data validation
- **Project**: Build robust data integration pipeline

### Module 8.2: Document Generation

#### PowerPoint Generation
- **PptxGenJS**: Slide creation, template systems, dynamic content
- **Layout systems**: Responsive layouts, content positioning
- **Real Examples**: Slide generation system, template management
- **Project**: Create automated report generation system

#### PDF and Document Export
- **jsPDF**: PDF generation, vector graphics, text rendering
- **HTML to PDF**: html2pdf integration, print optimisation
- **Real Examples**: Export functionality, document formatting
- **Project**: Build multi-format export system

### Module 8.3: Advanced Analytics and Reporting

#### Data Visualisation
- **Chart.js ecosystem**: Interactive charts, real-time updates
- **Custom visualisations**: D3.js integration, specialised charts
- **Real Examples**: Property analytics, performance dashboards
- **Project**: Create comprehensive analytics dashboard

#### Reporting Workflows
- **Template systems**: Dynamic report generation, content management
- **User customisation**: Personalised reports, saved configurations
- **Real Examples**: Template library, user preferences
- **Project**: Build flexible reporting system

### Module 8.4: Collaboration Features

#### Real-time Collaboration
- **WebSocket implementation**: Real-time updates, user presence
- **Conflict resolution**: Concurrent editing, data synchronisation
- **Real Examples**: User status tracking, collaborative editing
- **Project**: Implement collaborative features

---

## Capstone Projects

### Option 1: Enterprise Property Analysis Platform
Build a complete property analysis platform with:
- Interactive mapping with multiple data sources
- 3D building visualisation and massing
- Automated report generation
- Real-time collaboration features
- Government data integration

### Option 2: GIS Data Management System
Create a comprehensive GIS platform featuring:
- Multi-source data integration
- Spatial analysis tools
- Custom visualisation components
- Performance-optimised rendering
- Cloud-based processing

### Option 3: Template-Based Reporting Engine
Develop a flexible reporting system with:
- Visual template builder
- Dynamic content generation
- Multi-format export (PPT, PDF, Word)
- User customisation and sharing
- Analytics and tracking

---

## Learning Resources and Prerequisites

### Prerequisites
- **Basic Programming**: Variables, functions, control structures
- **HTML/CSS Fundamentals**: DOM manipulation, responsive design
- **Basic Mathematics**: Coordinate systems, basic trigonometry

### Development Environment Setup for Windows
1. **Node.js** (v20+ recommended) - Download from nodejs.org
2. **Visual Studio Code** with extensions:
   - ES7+ React/Redux/React-Native snippets
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - GitLens
3. **Git for Windows** - Download from git-scm.com
4. **Google Chrome** with Developer Tools for debugging
5. **Windows Terminal** for improved command line experience

### Key Learning Platforms
- **Documentation**: MDN Web Docs, React documentation
- **Practice**: CodeSandbox, GitHub Codespaces
- **Community**: Stack Overflow, React community forums
- **Advanced Topics**: Three.js documentation, Supabase guides

### Assessment Methods
- **Hands-on Projects**: Implementation of concepts through practical work
- **Code Reviews**: Peer review and instructor feedback
- **Portfolio Development**: Building a comprehensive project portfolio
- **Real-world Integration**: Contributing to open-source projects

---

## Timeline Summary

This curriculum provides a comprehensive path from absolute beginner to advanced developer, using real-world, enterprise-level applications as learning vehicles. Each phase builds upon previous knowledge whilst introducing increasingly sophisticated concepts and technologies.

**Learning Path Structure:**
- **Absolute Beginnings**: HTML, CSS, Git fundamentals
- **Foundation Technologies**: JavaScript, React, TypeScript basics
- **React Mastery**: Advanced patterns, state management, testing
- **GIS Technologies**: Mapping, spatial analysis, government data
- **3D Visualisation**: Three.js, realistic environments, graphics
- **Backend/Database**: Supabase, PostgreSQL, API development
- **Build Tools/DevOps**: Vite, testing, code quality
- **Cloud Deployment**: Vercel, monitoring, CI/CD
- **Advanced Integration**: Government APIs, document generation
- **Capstone Project**: Complete application development

The curriculum emphasises practical, hands-on learning through property-themed projects that gradually build complexity whilst maintaining relevance to real-world development scenarios.