# Module 0.1: Development Environment Setup

## Learning Objectives
By the end of this module, you will be able to:
- Set up a professional Windows development environment
- Configure essential development tools for web development
- Understand the role of each tool in the development workflow
- Create and organise your first development project

## Prerequisites
- Windows computer with administrator access
- Basic computer literacy and file management skills
- Chrome browser installed

## Introduction

Setting up your development environment is like preparing a professional kitchen before cooking. Just as a chef needs sharp knives, proper cutting boards, and organised ingredients, a web developer needs the right tools configured correctly to build efficient, high-quality applications.

Your development environment consists of several key components that work together:
- **Code Editor**: Where you write and edit your code
- **Browser**: Where you test and debug your applications  
- **Version Control**: How you track changes and collaborate
- **Terminal**: Command-line interface for running tools and scripts

Think of this setup as an investment in your productivity. Spending time now to configure everything properly will save you hours of frustration later and help you develop good habits from the beginning.

## Section 1: Understanding Development Tools

### Why These Specific Tools?

Before diving into installation, it's important to understand why we choose these particular tools for property development applications:

**Visual Studio Code** is the most widely adopted code editor in the web development community. It strikes the perfect balance between simplicity and power:
- **Beginner-friendly**: Clean interface that doesn't overwhelm newcomers
- **Extensible**: Thousands of extensions for any development need
- **Industry standard**: What most professionals use, so learning resources are abundant
- **Free and reliable**: Backed by Microsoft with regular updates

**Chrome DevTools** provide the most comprehensive debugging experience:
- **Real-time editing**: See changes instantly without refreshing
- **Performance monitoring**: Essential for property applications with large datasets
- **Mobile simulation**: Test responsive designs without multiple devices
- **Network analysis**: Debug API calls and loading performance

**Git and GitHub** form the backbone of modern development workflow:
- **Version control**: Track every change to your code
- **Collaboration**: Work with teams and contribute to open source
- **Backup**: Your code is safely stored in the cloud
- **Portfolio**: Showcase your work to potential employers

### The Development Workflow

Understanding how these tools work together helps you appreciate why each is important:

```
1. Plan → 2. Code → 3. Test → 4. Debug → 5. Deploy → 6. Maintain
   ↑                                                         ↓
   ←←←←←←←←←←←← Feedback Loop ←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

- **VS Code**: Steps 1, 2, and 6 (planning, coding, maintaining)
- **Chrome DevTools**: Steps 3 and 4 (testing and debugging)
- **Git/GitHub**: All steps (version control throughout)
- **Terminal**: Steps 5 and 6 (deployment and automation)

## Section 2: Visual Studio Code Setup

### Installation Strategy

**Why the specific installation options matter:**

When installing VS Code, the context menu options we select serve specific purposes:
- **"Open with Code" in file menu**: Right-click any file to edit it instantly
- **"Open with Code" in folder menu**: Right-click any folder to open it as a project
- **Register as default editor**: Makes VS Code the default for code files
- **Add to PATH**: Allows opening VS Code from the command line

**Installation Steps:**
1. Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Run installer with administrator privileges
3. Select all context menu and PATH options
4. Restart Windows Explorer (or restart computer) to activate context menus

### Essential Extensions Explained

Extensions transform VS Code from a basic text editor into a powerful development environment. Here's why each recommended extension matters:

**Live Server**:
- **Purpose**: Creates a local web server for your HTML files
- **Why essential**: See changes instantly in the browser without manual refreshing
- **Property development use**: Test responsive layouts and interactive features

**Prettier**:
- **Purpose**: Automatically formats your code consistently
- **Why essential**: Maintains readable, professional code formatting
- **Property development use**: Keeps complex property data structures organised

**Auto Rename Tag**:
- **Purpose**: When you rename an opening HTML tag, it automatically renames the closing tag
- **Why essential**: Prevents mismatched tags that break layouts
- **Property development use**: Maintain clean HTML structure in property listing templates

### Workspace Configuration

VS Code workspaces help you organise related projects. For property development, consider this structure:

```
PropertyDevelopment/
├── learning-projects/
│   ├── html-basics/
│   ├── css-layouts/
│   └── javascript-exercises/
├── property-portfolio/
│   ├── property-cards/
│   ├── search-filters/
│   └── dashboard/
└── resources/
    ├── templates/
    ├── color-schemes/
    └── documentation/
```

**Benefits of this organisation:**
- **Logical grouping**: Related files stay together
- **Easy navigation**: Find specific components quickly
- **Version control**: Each project can have its own Git repository
- **Backup strategy**: Separate projects reduce risk of data loss

## Section 3: Chrome Browser and Developer Tools

### Why Chrome for Development

While users may prefer different browsers, developers typically standardise on Chrome for development because:

**Consistent behaviour**: Chrome's rendering engine (Blink) is widely used, making it a good testing baseline.

**Developer Tools quality**: Chrome DevTools are the most feature-rich and frequently updated.

**Extension ecosystem**: Extensive library of development-focused extensions.

**Performance monitoring**: Built-in tools for measuring application performance, crucial for property applications with complex data visualisation.

### Understanding DevTools

Chrome DevTools consist of several panels, each serving specific development needs:

**Elements Panel**: 
- Inspect and modify HTML structure
- Edit CSS styles in real-time
- Debug layout issues in property card components

**Console Panel**:
- View JavaScript errors and warnings
- Test code snippets interactively
- Debug property calculation functions

**Network Panel**:
- Monitor API requests to property databases
- Analyse loading performance
- Debug failed requests

**Performance Panel**:
- Identify slow operations in property search functionality
- Optimise rendering of large property lists
- Monitor memory usage during complex operations

### DevTools Keyboard Shortcuts

Learning these shortcuts significantly improves development efficiency:

- **F12**: Open/close DevTools
- **Ctrl+Shift+C**: Inspect element mode
- **Ctrl+Shift+J**: Jump to Console
- **Ctrl+R**: Refresh page
- **Ctrl+Shift+R**: Hard refresh (ignore cache)

## Section 4: Git and GitHub Setup

### Understanding Version Control

Version control is like having unlimited "undo" for your entire project, plus the ability to work on multiple features simultaneously without breaking anything.

**Why Git matters for property development:**
- **Backup**: Never lose work again
- **Experimentation**: Try new features safely
- **Collaboration**: Work with other developers
- **History**: See exactly what changed and when
- **Branching**: Work on multiple features simultaneously

### Git vs GitHub Distinction

**Git**: The version control system that runs on your computer
**GitHub**: A cloud service that hosts Git repositories and adds collaboration features

Think of Git as a sophisticated filing system, and GitHub as a shared online storage facility with additional tools for team collaboration.

### Installation and Configuration

**Git Installation:**
1. Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Use recommended installation settings
3. Choose "Git from the command line and also from 3rd-party software"
4. Select "Checkout Windows-style, commit Unix-style line endings"

**GitHub Account Setup:**
1. Create account at [https://github.com](https://github.com)
2. Choose a professional username (this becomes part of your developer identity)
3. Enable two-factor authentication for security
4. Set up SSH keys for secure authentication

### First Repository Workflow

Understanding the basic Git workflow is essential:

```
Working Directory → Staging Area → Local Repository → Remote Repository
      ↓                ↓               ↓                ↓
   (edit files)    (git add)      (git commit)    (git push)
```

**Practical example with property project:**
1. Create new folder: `my-property-app`
2. Initialise Git: `git init`
3. Create initial files: `index.html`, `style.css`
4. Stage files: `git add .`
5. Commit: `git commit -m "Initial property app structure"`
6. Connect to GitHub: `git remote add origin [repository-url]`
7. Push: `git push -u origin main`

## Section 5: Project Organisation and Best Practices

### Folder Structure for Property Projects

A well-organised project structure prevents confusion and scales as your application grows:

```
property-analysis-app/
├── index.html                 # Main entry point
├── README.md                  # Project documentation
├── assets/                    # Static files
│   ├── images/               # Property photos, icons
│   ├── data/                 # Sample property data
│   └── fonts/                # Custom fonts
├── css/                      # Stylesheets
│   ├── main.css             # Main styles
│   ├── components/          # Component-specific styles
│   └── utilities/           # Utility classes
├── js/                       # JavaScript files
│   ├── main.js              # Main application logic
│   ├── components/          # Reusable components
│   └── utils/               # Helper functions
└── docs/                     # Documentation
    ├── wireframes/          # Design mockups
    └── specifications/      # Technical requirements
```

### File Naming Conventions

Consistent naming prevents confusion and errors:

**Files and folders**: Use lowercase with hyphens
- ✅ `property-search.js`
- ❌ `PropertySearch.js` or `property_search.js`

**CSS classes**: Use BEM methodology (Block Element Modifier)
- ✅ `.property-card__title--featured`
- ❌ `.propertyCardTitleFeatured`

**JavaScript functions**: Use camelCase
- ✅ `calculatePropertyYield()`
- ❌ `calculate_property_yield()`

### Documentation Strategy

Good documentation is crucial for property applications due to their complexity:

**README.md structure:**
```
# Property Analysis Application

## Purpose
Brief description of what the application does

## Features
- Property search and filtering
- Financial analysis tools
- Market comparison features

## Setup Instructions
Step-by-step installation guide

## Usage Examples
Common workflows with screenshots

## Contributing
Guidelines for other developers
```

**Code comments strategy:**
- Explain **why**, not **what**
- Document complex business logic
- Include examples for property calculations
- Update comments when code changes

## Practical Exercises

### Exercise 1: Environment Verification
Complete this checklist to verify your setup:
- [ ] VS Code opens from right-click context menu
- [ ] Extensions are installed and active
- [ ] Live Server extension can serve HTML files
- [ ] Chrome DevTools can inspect elements
- [ ] Git commands work in VS Code terminal
- [ ] GitHub repository can be created and cloned

### Exercise 2: First Project Setup
Create your first property development project:
1. Create new folder structure following best practices
2. Initialise Git repository
3. Create basic HTML file with property card mockup
4. Set up GitHub repository and push initial commit
5. Open project in VS Code and test Live Server

### Exercise 3: Workflow Practice
Practice the complete development workflow:
1. Create new feature branch in Git
2. Add CSS styling to property card
3. Test changes in Chrome with DevTools
4. Commit changes with descriptive message
5. Push to GitHub and create pull request

## Summary

This module established the foundation for professional web development by setting up and configuring essential tools. You now have:

- **Professional development environment** with VS Code, extensions, and proper configuration
- **Testing and debugging capabilities** with Chrome DevTools
- **Version control workflow** with Git and GitHub
- **Project organisation skills** for scalable application development
- **Best practices understanding** for file naming, documentation, and workflow

These tools and practices form the foundation for everything you'll learn in subsequent modules. Take time to become comfortable with this environment before moving forward.

## Navigation
- [Next: Module 0.2 - HTML Fundamentals →](./Module-0.2-HTML-Fundamentals.md)
- [↑ Back to Phase 0 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)