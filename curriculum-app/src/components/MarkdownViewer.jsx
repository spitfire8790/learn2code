import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Book
} from 'lucide-react';

const MarkdownViewer = ({ phaseId, moduleId, title }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Map phase IDs to directory names
  const getPhaseDirectory = (phaseId) => {
    const phaseMap = {
      'phase-0': 'Phase-0-Absolute-Beginnings',
      'phase-1': 'Phase-1-Foundation-Technologies',
      'phase-2': 'Phase-2-React-Development-Mastery',
      'phase-3': 'Phase-3-Geographic-Information-Systems',
      'phase-4': 'Phase-4-3D-Visualisation-and-Graphics',
      'phase-5': 'Phase-5-Database-Systems-and-Backend',
      'phase-6': 'Phase-6-Build-Tools-and-Development-Workflow',
      'phase-7': 'Phase-7-Cloud-Deployment-and-DevOps',
      'phase-8': 'Phase-8-Advanced-Integration-Patterns'
    };
    return phaseMap[phaseId];
  };

  // Convert module ID back to filename
  const getModuleFileName = (moduleId) => {
    // Handle special case for Core Syntax Overview
    if (moduleId === 'core-syntax-overview') {
      return 'Core-Syntax-Overview.md';
    }
    
    // moduleId format: "module-0-1-development-environment-setup"
    // filename format: "Module-0.1-Development-Environment-Setup.md"
    
    if (moduleId.startsWith('module-')) {
      // Remove 'module-' prefix
      const withoutPrefix = moduleId.substring(7);
      
      // Split by hyphens
      const parts = withoutPrefix.split('-');
      
      // First two parts are the module number (e.g., "0", "1")
      const moduleNumber = `${parts[0]}.${parts[1]}`;
      
      // Remaining parts are the title, capitalize each word with special handling
      const titleParts = parts.slice(2).map(part => {
        // Special cases for proper nouns/abbreviations
        if (part.toLowerCase() === 'typescript') return 'TypeScript';
        if (part.toLowerCase() === 'javascript') return 'JavaScript';
        if (part.toLowerCase() === 'html') return 'HTML';
        if (part.toLowerCase() === 'css') return 'CSS';
        if (part.toLowerCase() === 'api') return 'API';
        if (part.toLowerCase() === 'ui') return 'UI';
        if (part.toLowerCase() === 'gis') return 'GIS';
        if (part.toLowerCase() === 'ci') return 'CI';
        if (part.toLowerCase() === 'cd') return 'CD';
        if (part.toLowerCase() === 'devops') return 'DevOps';
        if (part.toLowerCase() === 'nodejs') return 'NodeJS';
        if (part.toLowerCase() === 'npm') return 'NPM';
        
        // Default capitalization
        return part.charAt(0).toUpperCase() + part.slice(1);
      });
      
      return `Module-${moduleNumber}-${titleParts.join('-')}.md`;
    }
    
    // Fallback for unexpected formats
    return moduleId + '.md';
  };

  useEffect(() => {
    const loadMarkdownContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const phaseDir = getPhaseDirectory(phaseId);
        const fileName = getModuleFileName(moduleId);
        
        if (!phaseDir) {
          throw new Error('Phase not found');
        }

        // Try to fetch the markdown file from the public directory
        // We'll need to copy the markdown files to public for this to work
        const response = await fetch(`/curriculum/${phaseDir}/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load module content: ${response.status}`);
        }

        const markdownContent = await response.text();
        setContent(markdownContent);
      } catch (err) {
        console.error('Error loading markdown:', err);
        const fileName = getModuleFileName(moduleId);
        setError(`Unable to load ${fileName}. The file may not exist or the server may not be serving static files correctly.`);
        // Set fallback content
        setContent(`# ${title}\n\nThe full content for this module should be loaded from the curriculum files. If you're seeing this message, it means the markdown file couldn't be loaded.\n\n**File being requested:** \`${fileName}\`\n\n**Suggested solutions:**\n- Ensure the file exists in the curriculum directory\n- Restart the development server\n- Check that the file naming matches exactly\n\nFor now, you can refer to the original curriculum files in your project directory.`);
      } finally {
        setLoading(false);
      }
    };

    if (phaseId && moduleId) {
      loadMarkdownContent();
    }
  }, [phaseId, moduleId, title]);

  const customComponents = {
    // Custom heading renderer with better styling
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-3 border-b border-gray-200 dark:border-gray-600">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 mt-4">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2 mt-3">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 mt-3">
        {children}
      </h6>
    ),
    // Better paragraph spacing
    p: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed text-base">
        {children}
      </p>
    ),
    // Enhanced list styling
    ul: ({ children }) => (
      <ul className="space-y-2 mb-4 pl-6 text-gray-700 dark:text-gray-200">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2 mb-4 pl-6 list-decimal text-gray-700 dark:text-gray-200">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-700 dark:text-gray-200 relative leading-relaxed">
        <span className="absolute -left-6 text-primary-400 dark:text-primary-400">•</span>
        {children}
      </li>
    ),
    // Code blocks with syntax highlighting
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        return (
          <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono font-semibold" {...props}>
            {children}
          </code>
        );
      }
      
      return (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          {language && (
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-gray-600">
              {language.toUpperCase()}
            </div>
          )}
          <SyntaxHighlighter
            language={language || 'text'}
            style={isDarkMode ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            showLineNumbers={true}
            wrapLines={true}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500 dark:border-primary-400 pl-4 italic text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-r-lg">
        {children}
      </blockquote>
    ),
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
        {children}
      </td>
    ),
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 underline underline-offset-2 font-medium inline-flex items-center gap-1"
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </a>
    ),
    // Strong/Bold text
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),
    // Emphasis/Italic text
    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">
        {children}
      </em>
    )
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:bg-white/50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Module Content
            </span>
            {error && (
              <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded">
                Preview Mode
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900">
          {error && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 text-sm">
                <Book className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-200">
            <ReactMarkdown 
              components={customComponents}
              remarkPlugins={[remarkGfm]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownViewer; 