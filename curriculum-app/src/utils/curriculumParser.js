// Utility to parse curriculum markdown files and extract structured data
import fs from 'fs';
import path from 'path';

// Parse a markdown file to extract module information
export function parseModuleMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let title = '';
    let description = '';
    let learningObjectives = [];
    let prerequisites = [];
    let sections = [];
    let topics = [];
    let projects = [];
    
    let currentSection = '';
    let inLearningObjectives = false;
    let inPrerequisites = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract title (first h1)
      if (line.startsWith('# ') && !title) {
        title = line.substring(2).trim();
        continue;
      }
      
      // Extract learning objectives
      if (line === '## Learning Objectives') {
        inLearningObjectives = true;
        continue;
      }
      
      // Extract prerequisites
      if (line === '## Prerequisites') {
        inPrerequisites = true;
        inLearningObjectives = false;
        continue;
      }
      
      // Stop collecting objectives/prerequisites when hitting new section
      if (line.startsWith('## ') && line !== '## Learning Objectives' && line !== '## Prerequisites') {
        inLearningObjectives = false;
        inPrerequisites = false;
        currentSection = line.substring(3).trim();
        sections.push(currentSection);
        continue;
      }
      
      // Collect learning objectives
      if (inLearningObjectives && line.startsWith('- ')) {
        learningObjectives.push(line.substring(2).trim());
      }
      
      // Collect prerequisites
      if (inPrerequisites && line.startsWith('- ')) {
        prerequisites.push(line.substring(2).trim());
      }
      
      // Extract topics (look for bold items or bullet points in sections)
      if (line.startsWith('- **') && line.includes('**:')) {
        const topic = line.substring(4, line.indexOf('**:'));
        topics.push(topic);
      }
      
      // Extract project references
      if (line.toLowerCase().includes('project') && (line.startsWith('- ') || line.startsWith('**Project'))) {
        projects.push(line.replace(/^\- \*\*Project.*?\*\*:?\s*/, '').replace(/^\*\*Project.*?\*\*:?\s*/, ''));
      }
    }
    
    // Extract description from the first paragraph after the title
    const descriptionStart = content.indexOf('\n\n') + 2;
    const descriptionEnd = content.indexOf('\n## ');
    if (descriptionStart > 1 && descriptionEnd > descriptionStart) {
      description = content.substring(descriptionStart, descriptionEnd).trim();
      // Clean up description - take first sentence or paragraph
      description = description.split('\n')[0] || description.substring(0, 200) + '...';
    }
    
    return {
      title: title || path.basename(filePath, '.md'),
      description: description || 'Comprehensive module covering essential development concepts.',
      learningObjectives,
      prerequisites,
      sections,
      topics: topics.length > 0 ? topics : sections,
      projects: projects.length > 0 ? projects : [],
      difficulty: determineDifficulty(filePath, content)
    };
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}


// Determine difficulty based on phase and content
function determineDifficulty(filePath, content) {
  if (filePath.includes('Phase-0')) return 'Beginner';
  if (filePath.includes('Phase-1')) return 'Beginner';
  if (filePath.includes('Phase-2') || filePath.includes('Phase-3')) return 'Intermediate';
  if (filePath.includes('Phase-4') || filePath.includes('Phase-5')) return 'Intermediate';
  return 'Advanced';
}

// Generate curriculum data from actual files
export function generateCurriculumData(rootPath = '../..') {
  const phases = [];
  
  // Phase directories in order
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
  
  const phaseColors = [
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600'
  ];
  
  phaseDirectories.forEach((dirName, index) => {
    const phasePath = path.join(rootPath, dirName);
    
    if (!fs.existsSync(phasePath)) {
      return; // Skip if directory doesn't exist
    }
    
    const modules = [];
    
    try {
      const files = fs.readdirSync(phasePath);
      const moduleFiles = files
        .filter(file => (file.startsWith('Module-') || file === 'Core-Syntax-Overview.md') && file.endsWith('.md'))
        .sort(); // Sort to maintain order
      
      moduleFiles.forEach(fileName => {
        const modulePath = path.join(phasePath, fileName);
        const moduleData = parseModuleMarkdown(modulePath);
        
        if (moduleData) {
          // Generate module ID from filename
          let moduleId;
          if (fileName === 'Core-Syntax-Overview.md') {
            moduleId = 'core-syntax-overview';
          } else {
            moduleId = fileName.replace('.md', '').toLowerCase().replace(/\./g, '-');
          }
          
          modules.push({
            id: moduleId,
            ...moduleData
          });
        }
      });
      
      // Read phase README for description
      let phaseDescription = '';
      const readmePath = path.join(phasePath, 'README.md');
      if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        const descMatch = readmeContent.match(/## Overview\s*\n\n(.*?)(?=\n##|\n\n##|$)/s);
        if (descMatch) {
          phaseDescription = descMatch[1].trim().split('\n')[0];
        }
      }
      
      // Generate phase title and description
      const phaseTitle = dirName.replace(/-/g, ' ').replace(/Phase (\d+)/, 'Phase $1:');
      
      phases.push({
        id: `phase-${index}`,
        title: phaseTitle,
        description: phaseDescription || `Advanced curriculum phase covering ${dirName.replace(/Phase-\d+-/, '').replace(/-/g, ' ').toLowerCase()}`,
        color: phaseColors[index],
        modules
      });
      
    } catch (error) {
      console.error(`Error processing phase ${dirName}:`, error);
    }
  });
  
  return {
    title: "Comprehensive Coding Curriculum - Property Analysis Platform",
    description: "A sophisticated curriculum designed around enterprise-level web development, GIS technologies, 3D visualisation, database systems, and cloud deployment.",
    phases
  };
}

// For use in Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseModuleMarkdown, generateCurriculumData };
} 