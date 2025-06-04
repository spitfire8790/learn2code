# Module 0.4: Version Control with Git and GitHub

## Learning Objectives

By the end of this module, you will be able to:

- Understand version control concepts and their importance in property development projects
- Use Git effectively for tracking changes and managing project history
- Collaborate with others using GitHub workflows
- Deploy property websites using GitHub Pages
- Implement best practices for professional development workflows

## Prerequisites

- Completion of previous Phase 0 modules
- Git installed on your system (from Module 0.1)
- GitHub account created
- Basic command line familiarity

## Introduction

Version control is like having an unlimited "undo" button for your entire project, combined with the ability to collaborate safely with other developers. For property websites and applications, version control becomes essential as projects grow in complexity and team size.

Imagine working on a property analysis platform where you need to add new features, fix bugs, and collaborate with designers and other developers. Without version control, managing these changes would be chaotic and error-prone. Git and GitHub provide the professional workflow tools used by development teams worldwide.

This module focuses on practical Git skills that you'll use daily in property development: tracking changes, managing different versions of your code, collaborating safely, and deploying your work for others to see.

## Section 1: Understanding Version Control

### Why Version Control Matters for Property Projects

Property websites and applications involve multiple types of files that change frequently:

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

```
Edit Files → Stage Changes → Commit Changes → Push to GitHub
    ↓             ↓              ↓             ↓
(Working)    (git add)     (git commit)   (git push)
```

### Essential Git Commands for Property Development

**Starting a new property website project:**

```bash
# Command 1: git init
# Purpose: Initializes a new Git repository in the current directory.
# How it works: Creates a hidden .git subfolder where Git stores all its tracking information (history, branches, etc.).
# When to use: Run this once at the very beginning of a new project, inside the project's root folder.
# Example: After creating your project folder (e.g., "my-awesome-property-site"), navigate into it in your terminal and run "git init".
git init

# Command 2: git add .
# Purpose: Stages all new or modified files in the current directory (and its subdirectories) for the next commit.
# How it works: '.' represents the current directory. Git looks for all changes and adds them to a "staging area" – a sort of waiting room for changes you intend to save together.
# When to use: After creating your initial project files, or after making a set of related changes you want to group into a single commit.
# Alternative: To stage a specific file, use "git add filename.ext" (e.g., "git add index.html").
git add .

# Command 3: git commit -m "Initial commit"
# Purpose: Saves the currently staged changes to the project's history (the local repository).
# How it works: Creates a new "commit" which is a snapshot of your project at this point in time.
#             The -m flag allows you to provide a commit message directly in the command.
#             "Initial commit" is a conventional message for the very first commit of a project.
# When to use: After staging all the changes you want to group together as a single historical point.
# Best practice: Write clear, concise commit messages describing what changed (e.g., "Create basic HTML structure", "Add property card component").
git commit -m "Initial commit"
```

**Daily development workflow:**

```bash
# Command 1: git status
# Purpose: Shows the current state of your working directory and staging area.
# How it works: Lists files that are modified, staged, or untracked (new files Git doesn't know about yet).
# When to use: Frequently! Before adding, before committing, or any time you want to understand what changes Git is aware of.
# Example output might show: "Changes not staged for commit: (use "git add <file>..." to update what will be committed)" or "nothing to commit, working tree clean".
git status

# Command 2: git add filename.html (or git add .)
# Purpose: Stages changes in specific files (or all files if using '.') for the next commit.
# How it works: Moves changes from your working directory to the staging area.
#             - "git add filename.html" stages only "filename.html".
#             - "git add ." stages all modified and new files in the current directory and subdirectories.
# When to use: After you've made a logical set of changes to one or more files that you want to group into a single commit.
git add filename.html
git add .

# Command 3: git commit -m "Add property search feature"
# Purpose: Saves the currently staged changes to your project's history (local repository).
# How it works: Takes everything in the staging area and creates a new commit (snapshot).
#             The -m flag is for the commit message.
# When to use: After you've staged all the changes for a particular feature, bug fix, or update.
# Best practice: Write a descriptive message that summarizes the changes (e.g., "Implement user login form", "Fix broken image links on homepage").
git commit -m "Add property search feature"

# Command 4: git push
# Purpose: Uploads your local commits from the current branch to a remote repository (e.g., GitHub).
# How it works: Syncs your local commit history with the remote server. If you haven't connected a remote yet, this command won't work (see 'git remote add origin ...' later).
#             If you're on a branch that has an upstream branch set (e.g., after 'git push -u origin main'), 'git push' is enough.
# When to use: Periodically, to back up your work to the remote server and to share your changes with collaborators.
# Note: If others have pushed changes to the remote since your last pull, you might need to 'git pull' first to integrate their changes before you can push.
git push
```

**Checking project history:**

```bash
# Command 1: git log
# Purpose: Displays the commit history of the current branch.
# How it works: Lists commits in reverse chronological order (newest first). Each entry shows the commit hash (a unique ID), author, date, and commit message.
# When to use: When you want to review past changes, find a specific commit, or understand the project's evolution.
# Useful options:
#   `git log --oneline` (shows a compact, one-line summary of each commit)
#   `git log -n 5` (shows the last 5 commits)
#   `git log --graph` (shows a text-based graph of branches and merges)
#   `git log --author="Your Name"` (shows commits by a specific author)
#   `git log --grep="keyword"` (shows commits where the message contains "keyword")
git log

# Command 2: git diff
# Purpose: Shows the differences between various states in your Git repository.
# How it works (common uses):
#   - `git diff` (with no arguments): Shows changes in your working directory that are *not yet staged*. Compares your current unstaged files against the last commit (or the staging area if files are staged).
#   - `git diff --staged` (or `git diff --cached`): Shows changes that are staged but *not yet committed*. Compares the staging area against the last commit.
#   - `git diff HEAD`: Shows all changes in your working directory (staged or unstaged) since the last commit.
#   - `git diff <commit-hash>`: Shows changes between your working directory and a specific commit.
#   - `git diff <commit1-hash> <commit2-hash>`: Shows changes between two specific commits.
# When to use: To review your changes before committing, to compare different versions of files, or to understand what has changed between commits.
git diff

# Command 3: git show
# Purpose: Shows detailed information about a specific Git object, most commonly a commit.
# How it works:
#   - `git show` (with no arguments): Shows details of the most recent commit (HEAD). This includes the commit author, date, full commit message, and the actual changes (diff) introduced by that commit.
#   - `git show <commit-hash>`: Shows details for a specific commit.
#   - `git show <branch-name>:<file-path>`: Shows the content of a file as it existed in a specific commit on a given branch (e.g., `git show main:index.html`).
# When to use: To inspect the details of a particular commit, including the exact changes made.
git show
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

**Branch strategy for property websites:**

- **main branch**: Stable, deployable code
- **feature branches**: New features under development
- **bugfix branches**: Fixes for specific issues
- **experimental branches**: Testing new ideas

### Basic Branching Workflow

**Creating and working with branches:**

```bash
# Command 1: git branch feature/property-search
# Purpose: Creates a new branch with the specified name.
# How it works: A branch is essentially a movable pointer to a commit. This command creates a new pointer named "feature/property-search" that points to the same commit as your current branch (e.g., main).
#            It does NOT switch you to the new branch.
# When to use: When you want to start working on a new feature, bug fix, or experiment without affecting the main codebase.
# Best practice: Use a consistent naming convention for branches (e.g., feature/name, bugfix/issue-number, hotfix/description).
git branch feature/property-search

# Command 2: git checkout feature/property-search
# Purpose: Switches your working directory to the specified branch.
# How it works: Updates the files in your working directory to match the snapshot of the commit that the "feature/property-search" branch points to.
#            Your HEAD (current position in the project history) now points to this branch.
# When to use: After creating a new branch, or when you want to switch to an existing branch to work on it.
git checkout feature/property-search

# Command 3 (Alternative to 1 & 2): git checkout -b feature/property-search
# Purpose: Creates a new branch AND immediately switches to it.
# How it works: Combines the functionality of `git branch <branch-name>` and `git checkout <branch-name>` into a single command.
#            The -b flag stands for "branch".
# When to use: This is often the most common way to create and switch to a new branch quickly.
git checkout -b feature/property-search

# --- Now you are on the 'feature/property-search' branch --- #
# Make your changes to the files for the new feature.
# For example, edit HTML, CSS, and JavaScript files.

# Command 4: git add .
# Purpose: Stages all changes in your current branch's working directory.
# (Same as explained in the "Daily development workflow" section)
git add .

# Command 5: git commit -m "Add property search functionality"
# Purpose: Saves the staged changes as a new commit on the current branch (feature/property-search).
# (Same as explained in the "Daily development workflow" section)
#            Commits made on this branch are isolated from the 'main' branch until you merge them.
git commit -m "Add property search functionality"

# --- To integrate the feature back into the main codebase --- #

# Command 6: git checkout main
# Purpose: Switches your working directory back to the 'main' branch.
# When to use: Before merging a feature branch, you typically switch back to the branch you want to merge INTO (e.g., main).
git checkout main

# Command 7: git merge feature/property-search
# Purpose: Integrates changes from the specified feature branch (feature/property-search) into the current branch (main).
# How it works: Git attempts to combine the histories of the two branches.
#            - If the branches have diverged without conflicting changes on the same lines, Git creates a new "merge commit" that has both branches as parents.
#            - If there are conflicts (e.g., the same lines of a file were changed differently on both branches), Git will pause the merge and ask you to resolve them manually.
# When to use: When a feature is complete and tested, and you want to incorporate it into the main line of development.
# Note: After a successful merge, the 'feature/property-search' branch still exists. You can delete it if it's no longer needed (`git branch -d feature/property-search`).
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
# Command 1: git clone https://github.com/username/property-website.git
# Purpose: Creates a local copy of a remote repository that exists on GitHub (or another Git server).
# How it works: Downloads the entire project history and all its files into a new folder on your computer.
#            The new folder will be named after the repository (e.g., "property-website").
#            It also automatically sets up a remote named "origin" pointing to the URL you cloned from.
# When to use: When you want to start working on an existing project that is hosted remotely, or to get your own copy of someone else's public project.
# Replace "https://github.com/username/property-website.git" with the actual URL of the repository you want to clone.
git clone https://github.com/username/property-website.git

# --- The following commands are used if you started a project locally (with git init) --- #
# --- and now want to connect it to a NEW EMPTY repository on GitHub.         --- #

# Command 2: git remote add origin https://github.com/username/property-website.git
# Purpose: Connects your local Git repository to a remote repository.
# How it works:
#   - `git remote add`: This is the base command for adding a new remote connection.
#   - `origin`: This is a conventional shorthand name for your primary remote repository. You could name it something else, but `origin` is standard.
#   - `https://github.com/username/property-website.git`: This is the URL of your remote repository (e.g., the one you created on GitHub).
# When to use: After initializing a Git repository locally (`git init`) and you now want to link it to a remote server to push your changes to.
# Prerequisite: You should have already created an empty repository on GitHub (or your chosen Git hosting service) to get this URL.
git remote add origin https://github.com/username/property-website.git

# Command 3: git push -u origin main
# Purpose: Pushes your local `main` branch to the `origin` remote and sets up upstream tracking.
# How it works:
#   - `git push`: The base command to send commits from your local repository to a remote repository.
#   - `-u` (or `--set-upstream`): This flag establishes a link between your local `main` branch and the `main` branch on the `origin` remote.
#     Once this upstream tracking is set, you can simply use `git push` (without `origin main`) from your local `main` branch in the future, and Git will know where to send the changes.
#   - `origin`: The name of your remote repository (as defined in the `git remote add` command).
#   - `main`: The name of the local branch you want to push. This also specifies the name of the branch to create on the remote if it doesn't exist.
# When to use: The first time you push a new local branch to a remote repository, or when you want to explicitly set the upstream tracking relationship.
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
# Step 1: Make changes to your property website files locally.
# For example, edit index.html, style.css, or add new images.

# Step 2: Stage your changes.
# Purpose: Prepares all modified and new files for committing.
# (Same as explained in the "Daily development workflow" section)
git add .

# Step 3: Commit your changes with a descriptive message.
# Purpose: Saves a snapshot of your staged changes to your local repository's history.
# (Same as explained in the "Daily development workflow" section)
# Example message: "Update property details for MLS#12345" or "Add new photo gallery to homepage"
git commit -m "Update property listings page"

# Step 4: Push your commits to the main branch on GitHub.
# Purpose: Uploads your local commits from the current branch (assumed to be 'main' or the branch configured for GitHub Pages) to the 'origin' remote.
# How it works: If GitHub Pages is configured to build from this branch, GitHub will automatically detect the new commits and trigger a new build and deployment of your site.
# (Assumes 'origin' is your remote for GitHub and 'main' is your deployment branch)
git push origin main

# Step 5: GitHub automatically rebuilds and deploys your site.
# Verification: After a minute or two, visit your GitHub Pages URL (e.g., username.github.io/repository-name) to see the live updates.
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

### .gitignore for Property Websites

Certain files shouldn't be tracked in version control:

```gitignore
# Operating system files
# These files are specific to an individual's OS and don't belong in the project repository.
.DS_Store  # macOS specific
Thumbs.db  # Windows specific (image thumbnail cache)

# Editor files and temporary files
# These are generated by code editors or are temporary working files.
# They are user-specific or transient and not part of the source code.
.vscode/   # VS Code editor configuration folder (user-specific settings, workspace history)
*.swp      # Vim editor swap files
*.tmp      # General temporary files
*.bak      # Backup files often created by editors

# Build files and compiled output
# These are files generated by build processes. They should be regenerated from source, not stored in Git.
dist/      # Common directory for distribution/production build output
build/     # Another common directory for build output

# Dependencies (managed by package managers)
# These are typically installed via a package manager (like npm or yarn) based on a manifest file (like package.json).
# Storing them in Git bloats the repository and can lead to version conflicts.
node_modules/ # Directory where Node.js/npm installs packages

# Sensitive information
# NEVER commit API keys, passwords, or other sensitive credentials.
# Store these in environment variables or secure vaults, and provide a template/example file instead.
config.json       # Often contains environment-specific settings or credentials (use config.example.json instead)
.env              # Common file for environment variables (especially with tools like dotenv)
*.key             # Private keys (e.g., SSH keys, API keys)
*.pem             # Certificate files, often private
credentials.json  # Generic name for files holding credentials

# Large media files (consider Git LFS for these if they MUST be in the repo)
# Standard Git is not optimized for very large binary files. This can bloat the repo and slow down operations.
# If you need to version large files, look into Git Large File Storage (LFS).
*.mov
*.mp4
*.avi
*.psd      # Large Photoshop files
*.ai       # Large Illustrator files
videos/
large-images/

# Log files
# Log files are typically generated at runtime and can become very large.
*.log
logs/
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
# Scenario: You accidentally made one or more commits on 'wrong-branch'
#           but they should have been on 'correct-branch'.

# Step 1: Find the commit hash(es) of the commit(s) you want to move.
#         '--oneline' gives a compact view. '-n 5' shows the last 5 commits.
git log --oneline -n 5
# (Identify the hash of the first commit you want to move, let's say it's 'abcdef1')

# Step 2: Switch to the branch where the commits *should* have been.
#         If 'correct-branch' doesn't exist, create it first: git checkout -b correct-branch
git checkout correct-branch

# Step 3: Cherry-pick the commit(s) onto the correct branch.
#         'git cherry-pick' applies a specific commit from another branch onto the current branch.
#         If you have multiple commits to move, cherry-pick them in chronological order.
git cherry-pick abcdef1 # Replace abcdef1 with the actual commit hash
# (If you had more commits, e.g., 'ghijkl2', then: git cherry-pick ghijkl2)

# Step 4: Switch back to the branch where the commits were mistakenly made.
git checkout wrong-branch

# Step 5: Remove the commit(s) from the wrong branch.
#         'git reset --hard HEAD~1' will remove the most recent commit from 'wrong-branch'
#         and discard its changes from the working directory.
#         If you moved multiple commits, you might use HEAD~N where N is the number of commits to remove.
#         BE CAREFUL: '--hard' discards changes. Ensure the commits are safely on 'correct-branch'.
git reset --hard HEAD~1 # Removes the last commit. Use HEAD~2 to remove last two, etc.
```

**Problem: Accidentally committed sensitive information**

```bash
# Scenario: You committed a file (e.g., 'sensitive-file.txt') that contains passwords or API keys.
# IMPORTANT: If you've already pushed this to a remote (like GitHub), this process only removes it
#            from future history. The sensitive data might still be in the remote's history.
#            You may need to take additional steps like force-pushing (risky for shared repos)
#            or using specialized tools like 'git filter-repo' or BFG Repo-Cleaner for thorough cleaning,
#            and immediately invalidate the leaked credentials.

# Step 1: Remove the file from Git's tracking, but keep the actual file on your local disk.
#         `--cached` means it will be deleted from the index (staging area) but not from your working directory.
git rm --cached sensitive-file.txt

# Step 2: Add the file (or a pattern for it) to your .gitignore file to prevent it from being committed again.
#         This creates/updates .gitignore to include 'sensitive-file.txt'.
echo "sensitive-file.txt" >> .gitignore

# Step 3: Commit the removal of the file from tracking and the .gitignore update.
git commit -m "Remove sensitive file from tracking and add to .gitignore"

# Step 4 (If already pushed and need to rewrite history - ADVANCED & potentially DANGEROUS for shared repos):
# Consider using 'git filter-repo' or BFG Repo-Cleaner for this. This is a complex topic.
# A simpler, but still history-rewriting, approach for very recent commits NOT on a shared/protected branch:
# `git commit --amend` (if it was the very last commit and not pushed, you can `git rm --cached file`, then `git commit --amend`)
# `git rebase -i HEAD~N` (to find and edit/remove the commit from recent history)
# Then, you might need to `git push --force`. Again, be very careful with force pushing.
```

**Problem: Need to undo last commit**

```bash
# Scenario 1: You want to undo the last commit, but KEEP the changes it introduced in your working directory
#             (e.g., you committed too early and want to add more changes to that same commit, or change the message).
# `--soft HEAD~1`: Resets HEAD to the commit *before* the last one (HEAD~1).
#                  The changes from the undone commit will be in your staging area as if you just `git add`ed them.
#                  The commit itself is removed from the history of the current branch.
git reset --soft HEAD~1
# Now you can modify files, `git add .`, and `git commit -m "New improved commit message"` or `git commit --amend` if you want to combine with previous staged changes.

# Scenario 2: You want to completely DISCARD the last commit AND all changes it introduced.
#             (e.g., the last commit was a mistake and you want to permanently remove it and its work).
# `--hard HEAD~1`: Resets HEAD to the commit *before* the last one AND discards all changes
#                  from the undone commit from both your working directory and staging area.
#                  BE VERY CAREFUL: This is destructive. Uncommitted local changes might also be lost if they overlap.
git reset --hard HEAD~1
# The last commit is gone, and your files are reverted to their state before that commit.
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
- **Deployment practices** using GitHub Pages for hosting property websites
- **Best practices** for repository organisation, documentation, and team collaboration

These Git and GitHub skills form the foundation for professional development workflows and enable effective collaboration on property development projects of any size.

## Navigation

- [← Previous: Module 0.3 - CSS Fundamentals](./Module-0.3-CSS-Fundamentals.md)
- [Next: Phase 1 - Foundation Technologies →](../Phase-1-Foundation-Technologies/README.md)
- [↑ Back to Phase 0 Overview](./README.md)
- [↑ Back to Main Curriculum](../coding-curriculum.md)
