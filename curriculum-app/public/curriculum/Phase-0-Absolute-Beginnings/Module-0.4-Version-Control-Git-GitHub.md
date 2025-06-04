# Module 0.4: Version Control with Git and GitHub

## Learning Objectives

By the end of this module, you will be able to:

- Understand version control concepts and their importance in property development projects
- Use Git effectively for tracking changes and managing project history
- Collaborate with others using GitHub workflows
- Deploy websites using GitHub Pages
- Implement best practices for professional development workflows

## Prerequisites

- Completion of previous Phase 0 modules
- Git installed on your system (from Module 0.1)
- GitHub account created
- Basic command line familiarity

## Introduction

Version control is like having an unlimited "undo" button for your entire project, combined with the ability to collaborate safely with other developers. For websites and applications, version control becomes essential as projects grow in complexity and team size.

Imagine working on a property analysis platform where you need to add new features, fix bugs, and collaborate with designers and other developers. Without version control, managing these changes would be chaotic and error-prone. Git and GitHub provide the professional workflow tools used by development teams worldwide.

This module focuses on practical Git skills that you'll use daily in property development: tracking changes, managing different versions of your code, collaborating safely, and deploying your work for others to see.

## Section 1: Understanding Version Control

### Why Version Control Matters for Property Projects

Websites and applications involve multiple types of files that change frequently:

- **HTML templates** for different property types
- **CSS stylesheets** that evolve with design requirements
- **JavaScript files** that add interactive features
- **Images and assets** that get optimised and replaced
- **Configuration files** for deployment and settings

**Problems version control solves:**

- **Accidental deletions**: Never lose work again
- **Experimental features**: Try new ideas without breaking existing functionality
- **Collaboration conflicts**: Multiple people can work on the same project safely
- **Change tracking**: See exactly what changed, when, and why
- **Release management**: Maintain stable versions while developing new features

### Git vs GitHub: Understanding the Difference

**Git** is the version control system that runs on your computer:

- Tracks all changes to your files
- Manages different versions (branches) of your project
- Works completely offline
- Stores the complete history of your project

**GitHub** is a cloud service that hosts Git repositories:

- Stores your code safely in the cloud
- Enables collaboration with other developers
- Provides project management tools
- Offers web hosting for static websites

Think of Git as a powerful filing system for your code, and GitHub as a shared workspace where teams can collaborate on projects.

## Section 2: Basic Git Workflow

### The Git Mental Model

Understanding how Git works conceptually helps you use it more effectively:

**Three States of Files:**

1. **Working Directory**: Files you're currently editing
2. **Staging Area**: Changes you've prepared to save
3. **Repository**: Permanent record of your project history

**The Basic Workflow:**

```bash
Edit Files → Stage Changes → Commit Changes → Push to GitHub
    ↓             ↓              ↓             ↓
(Working)    (git add)     (git commit)   (git push)
```

### Essential Git Commands for Property Development

**Starting a new property website project:**

```bash
git init                    # Start tracking your project
git add .                   # Stage all files for commit
git commit -m "Initial commit"   # Save the current state
```

**Daily development workflow:**

```bash
git status                  # Check what files have changed
git add filename.html       # Stage specific files
git add .                   # Stage all changes
git commit -m "Add property search feature"   # Save changes
git push                    # Upload to GitHub
```

**Checking project history:**

```bash
git log                     # See all commits
git diff                    # See what changed since last commit
git show                    # See details of the last commit
```

### Writing Effective Commit Messages

Good commit messages are crucial for property development projects because they help you and your team understand what changed and why.

**Commit message best practices:**

- Start with a brief summary (50 characters or less)
- Use the imperative mood ("Add feature" not "Added feature")
- Be specific about what changed
- Explain why the change was made if it's not obvious

**Examples for property website development:**

```bash
# Good commit messages
git commit -m "Add responsive navigation for mobile devices"
git commit -m "Fix property image loading on slow connections"
git commit -m "Update contact form validation for better UX"

# Poor commit messages
git commit -m "Fixed stuff"
git commit -m "Updates"
git commit -m "Work in progress"
```

## Section 3: Branching and Collaboration

### Understanding Branches

Branches allow you to work on different features simultaneously without affecting your main codebase. This is essential for property development where you might be:

- Adding a new property search feature
- Fixing bugs in the contact form
- Experimenting with a new design
- Preparing a new release

**Branch strategy for websites:**

- **main branch**: Stable, deployable code
- **feature branches**: New features under development
- **bugfix branches**: Fixes for specific issues
- **experimental branches**: Testing new ideas

### Basic Branching Workflow

**Creating and working with branches:**

```bash
git branch feature/property-search    # Create new branch
git checkout feature/property-search  # Switch to new branch
# Or combine both commands:
git checkout -b feature/property-search

# Work on your feature, make commits
git add .
git commit -m "Add property search functionality"

# Switch back to main branch
git checkout main

# Merge your feature when ready
git merge feature/property-search
```

### Handling Merge Conflicts

Merge conflicts occur when Git can't automatically combine changes. This commonly happens in property development when multiple people edit the same files.

**Common conflict scenarios:**

- Two developers modifying the same CSS rules
- Updating the same HTML template simultaneously
- Changing the same JavaScript function

**Resolving conflicts:**

1. Git will mark conflicted files
2. Open the files and look for conflict markers
3. Choose which changes to keep
4. Remove the conflict markers
5. Commit the resolved changes

**Prevention strategies:**

- Communicate with team members about what you're working on
- Keep branches small and focused
- Merge changes frequently
- Use consistent code formatting

## Section 4: GitHub Collaboration

### Repository Management

**Creating a property website repository:**

1. Create repository on GitHub
2. Choose descriptive name (e.g., "luxury-properties-website")
3. Add meaningful description
4. Include README file with project information
5. Choose appropriate licence for your project

**Cloning and connecting repositories:**

```bash
# Clone existing repository
git clone https://github.com/username/property-website.git

# Connect local project to GitHub
git remote add origin https://github.com/username/property-website.git
git push -u origin main
```

### Pull Requests and Code Review

Pull requests are GitHub's way of proposing changes to a project. They're essential for team collaboration and maintaining code quality.

**Pull request workflow:**

1. Create feature branch
2. Make your changes and commit them
3. Push branch to GitHub
4. Create pull request from your branch
5. Team members review the changes
6. Address feedback and make improvements
7. Merge when approved

**Writing effective pull request descriptions:**

- Explain what the changes do
- Include screenshots for visual changes
- List any breaking changes
- Mention related issues or requirements

### Issues and Project Management

GitHub Issues help track bugs, feature requests, and project tasks:

**Property website issue examples:**

- Bug: "Property images not loading on mobile Safari"
- Feature: "Add advanced property filtering options"
- Enhancement: "Improve contact form validation"
- Documentation: "Update README with setup instructions"

**Issue management best practices:**

- Use descriptive titles
- Provide steps to reproduce bugs
- Include screenshots when relevant
- Label issues by type and priority
- Assign issues to team members

## Section 5: Deployment with GitHub Pages

### Setting Up GitHub Pages

GitHub Pages provides free hosting for static websites, perfect for property portfolio sites and project demonstrations.

**Enabling GitHub Pages:**

1. Go to repository Settings
2. Scroll to Pages section
3. Choose source branch (usually main)
4. Select folder (root or /docs)
5. Your site will be available at username.github.io/repository-name

**Deployment considerations:**

- Only static files (HTML, CSS, JavaScript)
- No server-side processing
- Custom domains supported
- HTTPS enabled by default

### Continuous Deployment Workflow

With GitHub Pages, your property website automatically updates when you push changes:

**Automated deployment process:**

```bash
# Make changes to your property website
git add .
git commit -m "Update property listings page"
git push origin main
# GitHub automatically rebuilds and deploys your site
```

**Benefits of this workflow:**

- Always-current website reflecting your latest changes
- No manual deployment steps
- Easy rollback if problems occur
- Team members can see changes immediately

## Section 6: Best Practices for Property Development

### Repository Organisation

**Recommended structure for property website repositories:**

```
property-website/
├── README.md              # Project documentation
├── index.html             # Main page
├── css/                   # Stylesheets
├── js/                    # JavaScript files
├── images/                # Property images and assets
├── docs/                  # Documentation
├── .gitignore            # Files to ignore
└── LICENSE               # Legal information
```

### .gitignore for Websites

Certain files shouldn't be tracked in version control:

```gitignore
# Operating system files
.DS_Store
Thumbs.db

# Editor files
.vscode/
*.swp
*.tmp

# Build files
dist/
build/
node_modules/

# Sensitive information
config.json
.env
*.key

# Large media files (use Git LFS instead)
*.mov
*.mp4
videos/
```

### Documentation Best Practices

Good documentation is crucial for property development projects:

**Essential README sections:**

- Project description and purpose
- Setup and installation instructions
- Usage examples and screenshots
- Contributing guidelines
- Contact information
- License information

**README example for property website:**

```markdown
# Luxury Properties Website

A responsive website showcasing luxury properties with advanced search and filtering capabilities.

## Features

- Responsive design for all devices
- Advanced property search
- Interactive image galleries
- Contact forms with validation

## Setup

1. Clone the repository
2. Open index.html in your browser
3. For development, use Live Server extension

## Contributing

Please read CONTRIBUTING.md for guidelines on contributing to this project.
```

## Section 7: Troubleshooting Common Issues

### Common Git Problems and Solutions

**Problem: Commit to wrong branch**

```bash
# Move commits to correct branch
git log --oneline -n 5    # Find commit hash
git checkout correct-branch
git cherry-pick commit-hash
git checkout wrong-branch
git reset --hard HEAD~1   # Remove from wrong branch
```

**Problem: Accidentally committed sensitive information**

```bash
# Remove file from tracking but keep locally
git rm --cached sensitive-file.txt
echo "sensitive-file.txt" >> .gitignore
git commit -m "Remove sensitive file from tracking"
```

**Problem: Need to undo last commit**

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and lose changes
git reset --hard HEAD~1
```

### GitHub-Specific Issues

**Problem: Repository too large**

- Use Git LFS for large files
- Remove unnecessary files
- Consider separate repositories for large assets

**Problem: Deployment not working**

- Check GitHub Pages settings
- Verify file paths are correct
- Ensure HTML files are in correct location
- Check for build errors in repository actions

## Practical Exercises

### Exercise 1: Property Website Version Control

Set up version control for a property website project:

1. Create new repository on GitHub
2. Clone to your local machine
3. Add HTML, CSS, and image files
4. Make several commits with good messages
5. Push changes to GitHub

### Exercise 2: Collaborative Development

Practice collaboration workflow:

1. Create feature branch for new property listing page
2. Make changes and commit them
3. Push branch to GitHub
4. Create pull request with description
5. Merge the pull request

### Exercise 3: GitHub Pages Deployment

Deploy a property website using GitHub Pages:

1. Prepare static website files
2. Configure GitHub Pages in repository settings
3. Test deployment and functionality
4. Make updates and verify automatic deployment

## Summary

This module established essential version control skills for professional property development. You now understand:

- **Version control concepts** and their importance for managing property development projects
- **Basic Git workflow** for tracking changes and managing project history
- **Branching strategies** for safely developing features and fixing bugs
- **GitHub collaboration** using pull requests, issues, and code review
- **Deployment practices** using GitHub Pages for hosting websites
- **Best practices** for repository organisation, documentation, and team collaboration

These Git and GitHub skills form the foundation for professional development workflows and enable effective collaboration on property development projects of any size.

## Navigation

- [← Previous: Module 0.3 - CSS Fundamentals](./Module-0.3-CSS-Fundamentals.md)
- [Next: Phase 1 - Foundation Technologies →](../Phase-1-Foundation-Technologies/README.md)
- [↑ Back to Phase 0 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)
