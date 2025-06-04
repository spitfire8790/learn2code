#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyCurriculumFiles() {
  const sourceRoot = path.join(__dirname, '../..');
  const destRoot = path.join(__dirname, '../public/curriculum');
  
  // Phase directories to copy
  const phaseDirectories = [
    'Phase-0-Absolute-Beginnings',
    'Phase-1-Foundation-Technologies',
    'Phase-2-React-Development-Mastery',
    'Phase-3-Geographic-Information-Systems',
    'Phase-4-3D-Visualisation-and-Graphics',
    'Phase-5-Database-Systems-and-Backend',
    'Phase-6-Build-Tools-and-Development-Workflow',
    'Phase-7-Cloud-Deployment-and-DevOps',
    'Phase-8-Advanced-Integration-Patterns'
  ];

  console.log('Copying curriculum files to public directory...');

  // Create curriculum directory in public
  if (!fs.existsSync(destRoot)) {
    fs.mkdirSync(destRoot, { recursive: true });
  }

  phaseDirectories.forEach(phaseDir => {
    const sourcePath = path.join(sourceRoot, phaseDir);
    const destPath = path.join(destRoot, phaseDir);

    if (fs.existsSync(sourcePath)) {
      console.log(`Copying ${phaseDir}...`);
      
      // Create phase directory
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      // Copy all markdown files
      const files = fs.readdirSync(sourcePath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      markdownFiles.forEach(file => {
        const sourceFilePath = path.join(sourcePath, file);
        const destFilePath = path.join(destPath, file);
        fs.copyFileSync(sourceFilePath, destFilePath);
        console.log(`  - ${file}`);
      });
    } else {
      console.log(`Skipping ${phaseDir} - directory not found`);
    }
  });

  console.log('✅ Curriculum files copied successfully!');
}

// Run the copy operation
copyCurriculumFiles(); 