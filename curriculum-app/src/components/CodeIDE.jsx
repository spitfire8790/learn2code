import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCcw, 
  Download, 
  Upload,
  Maximize2,
  Minimize2,
  Code
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

const CodeIDE = () => {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 600px;
            margin: 0 auto;
        }
        .highlight { color: #3b82f6; font-weight: bold; }
        .button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            margin: 10px 5px;
        }
        .button:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Live Code Editor!</h1>
        <p>This is a live preview of your <span class="highlight">HTML/CSS/JavaScript</span> code.</p>
        <p>Edit the code on the left and see changes instantly!</p>
        <button class="button" onclick="showMessage()">Try Interactive JS</button>
        <button class="button" onclick="changeBackground()">Change Colors</button>
        <div id="output"></div>
    </div>
    
    <script>
        function showMessage() {
            document.getElementById('output').innerHTML = 
                '<p style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 5px;">Hello! This is interactive JavaScript running in the live preview.</p>';
        }
        
        function changeBackground() {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.background = randomColor;
        }
    </script>
</body>
</html>`);

  const [language, setLanguage] = useState('html');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  
  const codeRef = useRef(null);
  const previewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Language templates
  const templates = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 600px;
            margin: 0 auto;
        }
        .highlight { color: #3b82f6; font-weight: bold; }
        .button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            margin: 10px 5px;
        }
        .button:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Live Code Editor!</h1>
        <p>This is a live preview of your <span class="highlight">HTML/CSS/JavaScript</span> code.</p>
        <p>Edit the code on the left and see changes instantly!</p>
        <button class="button" onclick="showMessage()">Try Interactive JS</button>
        <button class="button" onclick="changeBackground()">Change Colors</button>
        <div id="output"></div>
    </div>
    
    <script>
        function showMessage() {
            document.getElementById('output').innerHTML = 
                '<p style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 5px;">Hello! This is interactive JavaScript running in the live preview.</p>';
        }
        
        function changeBackground() {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.background = randomColor;
        }
    </script>
</body>
</html>`,
    
    javascript: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Playground</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            background: #1a1a1a;
            color: white;
        }
        .container {
            background: #2d2d2d;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-width: 600px;
            margin: 0 auto;
        }
        #console {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            margin-top: 20px;
            min-height: 100px;
            border: 1px solid #444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JavaScript Console</h1>
        <p>Write JavaScript below and see the results:</p>
        <div id="console"></div>
    </div>
    
    <script>
        // Clear previous console content
        document.getElementById('console').innerHTML = '';
        
        // Override console.log to display in our custom console
        if (!window.customConsoleSetup) {
            window.customConsoleSetup = true;
            window.customConsoleElement = document.getElementById('console');
            window.originalLog = console.log;
            console.log = function(...args) {
                window.customConsoleElement.innerHTML += args.join(' ') + '<br>';
                window.originalLog.apply(console, args);
            };
        }
        
        // Example code - edit this!
        function greetUser(name) {
            return \`Hello, \${name}! Welcome to JavaScript.\`;
        }
        
        console.log(greetUser("Developer"));
        
        const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(n => n * 2);
        console.log("Doubled numbers:", doubled);
        
        // Try adding your own code here:
        
    </script>
</body>
</html>`,
    
    css: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Playground</title>
    <style>
        /* Edit these styles and see live changes! */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px;
            min-height: 100vh;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }

        .title {
            color: #333;
            margin-bottom: 20px;
            font-size: 2.5em;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .card {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            margin: 10px;
        }

        .button:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">CSS Playground</h1>
        <div class="card">
            <h3>Edit the CSS and see live changes!</h3>
            <p>Try changing colors, fonts, animations, or layouts.</p>
        </div>
        <div class="card">
            <h3>Interactive Elements</h3>
            <button class="button">Hover me!</button>
            <button class="button">Click me!</button>
        </div>
    </div>
</body>
</html>`
  };

  // Auto-update preview with debouncing
  const updatePreview = useCallback(() => {
    if (previewRef.current) {
      try {
        const iframe = previewRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    }
  }, [code]);

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(updatePreview, 300);
  }, [updatePreview]);

  const resetCode = () => {
    setCode(templates[language]);
  };

  const downloadCode = () => {
    const extensions = {
      javascript: 'html',
      html: 'html',
      css: 'html'
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Update preview when code changes
  useEffect(() => {
    debouncedUpdate();
  }, [code, debouncedUpdate]);

  // Update code when language changes
  useEffect(() => {
    setCode(templates[language]);
  }, [language]);

  // Handle code changes
  const handleCodeChange = (value) => {
    setCode(value);
  };

  // Get language extension for CodeMirror
  const getLanguageExtension = () => {
    switch (language) {
      case 'html':
        return [html()];
      case 'javascript':
        return [html()]; // JavaScript mode still uses HTML wrapper
      case 'css':
        return [html()]; // CSS mode still uses HTML wrapper
      default:
        return [html()];
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className={`${isFullscreen ? 'h-screen p-0' : 'max-w-7xl mx-auto p-4'}`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Live Code Editor
                </h1>
              </div>
              
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="html">HTML + CSS + JS</option>
                <option value="javascript">JavaScript Console</option>
                <option value="css">CSS Playground</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={resetCode}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={downloadCode}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <label className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept=".html,.js,.css"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Split View: Code Editor + Live Preview */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-x border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className={`grid grid-cols-1 lg:grid-cols-2 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'}`}>
            
            {/* Code Editor */}
            <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 relative z-10">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 relative z-20">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code Editor - {language.toUpperCase()}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[30px] text-center">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden relative z-10" style={{ position: 'relative' }}>
                <CodeMirror
                  value={code}
                  onChange={handleCodeChange}
                  extensions={getLanguageExtension()}
                  theme={oneDark}
                  height="100%"
                  style={{
                    fontSize: `${fontSize}px`,
                    position: 'relative',
                    zIndex: 10,
                  }}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBrackets: true,
                    autocompletion: true,
                    bracketMatching: true,
                    indentOnInput: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    searchKeymap: true,
                  }}
                  placeholder="Start coding here..."
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col relative z-0">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 relative z-10">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Live Preview - Auto-updates as you type
                </span>
              </div>
              <div className="flex-1 overflow-hidden relative z-0">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-none bg-white"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ position: 'relative', zIndex: 0 }}
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live Preview Active</span>
              </span>
              <span>•</span>
              <span>Mode: {language.toUpperCase()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Lines: {code.split('\n').length}</span>
              <span>•</span>
              <span>Characters: {code.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeIDE; 