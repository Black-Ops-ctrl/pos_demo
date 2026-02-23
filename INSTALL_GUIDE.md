# ERP Business Modules - Installation Guide

## Prerequisites

Before installing this project, ensure you have the following installed on your system:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn**
- **Git** (for cloning the repository)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd erp-business-modules
```

### Step 2: Install Dependencies

Due to ESLint version conflicts, use one of the following commands:

#### Option 1: Force Install (Recommended)
```bash
npm install --force
```

#### Option 2: Legacy Peer Dependencies
```bash
npm install --legacy-peer-deps
```

#### Option 3: Clean Install
```bash
# Delete node_modules and package-lock.json if they exist
rm -rf node_modules package-lock.json
npm install --force
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### If you encounter ERESOLVE errors:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --force
   ```

3. **Use yarn instead of npm:**
   ```bash
   yarn install
   yarn dev
   ```

### Common Issues:

- **ESLint version conflicts**: Fixed in package.json with compatible versions
- **TypeScript errors**: Run `npm run build` to check for type errors
- **Port already in use**: Change port in vite.config.ts or kill process using port 5173

## Project Structure

```
erp-business-modules/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   └── contexts/      # React contexts
├── public/            # Static assets
└── dist/             # Production build
```

## Environment Setup

Create a `.env` file in the root directory if needed:

```env
VITE_API_URL=your_api_url_here
```

## Support

If you continue to experience issues, please:

1. Ensure Node.js version is 18+
2. Try using yarn instead of npm
3. Check for any global npm packages that might conflict
4. Clear all caches and reinstall dependencies

## Success Indicators

You'll know the installation was successful when:

- `npm install --force` completes without errors
- `npm run dev` starts the development server
- The application loads at `http://localhost:5173`
- No console errors in the browser developer tools