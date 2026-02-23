# ERP System - Local Development Setup

## Prerequisites

Before running this project, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for version control)

## Installation & Setup Commands

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vite_react_shadcn_ts
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

## Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
```

### Production Build
```bash
npm run build        # Build for production
npm run build:dev    # Build in development mode
```

### Preview Production Build
```bash
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint to check code quality
```

## Quick Start Guide

1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Open Terminal/Command Prompt**
3. **Navigate to project directory**
4. **Run installation command**: `npm install`
5. **Start development server**: `npm run dev`
6. **Open browser**: Go to `http://localhost:5173`

## Troubleshooting

### Common Issues:

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

**Dependencies issues:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Permission errors (Windows):**
```bash
# Run as administrator or use:
npx --yes create-vite@latest
```

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── lib/           # Utility functions
├── contexts/      # React contexts
└── main.tsx       # Application entry point
```

## Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - UI Components
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

## Support

If you encounter any issues, please check:
1. Node.js version compatibility
2. Network connectivity for package installation
3. System permissions for file operations

For additional help, refer to the project documentation or contact the development team.