# Interactive Coding Curriculum App

A modern, interactive web-based learning platform for your comprehensive coding curriculum. Built with React, TypeScript, and Tailwind CSS, this app provides an engaging learning experience with progress tracking, bookmarking, and responsive design.

## Features

### 🎯 **Core Learning Features**

- **Phase-based Learning**: Organized into progressive phases from beginner to advanced
- **Module Management**: Detailed module views with topics, projects, and learning objectives
- **Progress Tracking**: Track completion status for each module and overall progress
- **Bookmarking**: Save important modules for quick access
- **Interactive Navigation**: Seamless navigation between phases and modules

### 🎨 **User Experience**

- **Modern UI**: Clean, professional design with smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Glass Morphism**: Beautiful glassmorphic cards and components
- **Smooth Animations**: Framer Motion powered transitions and interactions

### 📊 **Progress Management**

- **Local Storage**: Persistent progress tracking across sessions
- **Visual Progress Bars**: Clear visual indication of completion status
- **Statistics Dashboard**: Overview of learning progress and achievements
- **Module Status**: Clear completion indicators for each module

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: React Markdown with GFM support
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the curriculum app directory:**

   ```bash
   cd curriculum-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
curriculum-app/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard component
│   │   ├── Navigation.jsx      # Navigation header
│   │   ├── PhaseView.jsx      # Phase detail view
│   │   └── ModuleView.jsx     # Module detail view
│   ├── context/
│   │   └── ProgressContext.jsx # Progress management
│   ├── data/
│   │   └── curriculumData.js  # Curriculum structure
│   ├── App.jsx                # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Customization

### Adding New Content

1. **Add new phases or modules** by editing `src/data/curriculumData.js`
2. **Customize colors and themes** in `tailwind.config.js`
3. **Modify component styles** using Tailwind CSS classes

### Theme Customization

The app uses a custom color palette defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Custom primary color scale
  },
  navy: {
    // Custom navy color scale
  }
}
```

### Adding Interactive Content

To enhance the learning experience, you can:

1. **Add code editors** using libraries like Monaco Editor or CodeMirror
2. **Integrate video content** using React Player or similar
3. **Add quizzes and assessments** with interactive components
4. **Connect to external APIs** for dynamic content

## Features in Detail

### Progress Tracking

The app automatically tracks:

- Module completion status
- Bookmarked modules
- Overall progress percentage
- Time spent estimates

All progress is saved in browser localStorage and persists across sessions.

### Responsive Design

The app is fully responsive with:

- Mobile-first design approach
- Adaptive layouts for different screen sizes
- Touch-friendly interactions
- Optimized typography scaling

### Accessibility

Built with accessibility in mind:

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Focus management

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the browser console for errors
2. Ensure all dependencies are properly installed
3. Try clearing browser cache and localStorage
4. Verify Node.js version compatibility

## Future Enhancements

Potential features for future development:

- **User Authentication**: Multi-user support with individual progress tracking
- **Content Management**: Admin interface for adding/editing curriculum content
- **Analytics**: Detailed learning analytics and insights
- **Collaboration**: Team features and discussion forums
- **Export/Import**: Progress backup and curriculum sharing
- **Integration**: LMS integration and external tool connectivity

---

**Happy Learning! 🚀**
