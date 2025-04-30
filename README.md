# 🖼️ Image Zoom Selector

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.4.4-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.11-purple.svg)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-✓-yellow.svg)](https://pnpm.io/)

> A powerful React-based image viewer with zoom, drag, and selection capabilities

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Language**: TypeScript 4.4.4
- **Canvas Library**: Konva/React-Konva
- **Build Tool**: Vite
- **UI Components**: Lucide React

## ⚙️ Prerequisites

- Node.js (version specified in `.node-version`)
- Package Manager:
  - pnpm (recommended)
  - npm (alternative)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd image-zoom-selector
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Start the development server:
```bash
pnpm dev
```
The application will be available at `http://localhost:5173`

### Production

Build for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## 🌐 Deploy to GitHub Pages

1. Make sure your repository is on GitHub and you have write access.

2. Install the `gh-pages` dependency:
```bash
pnpm add -D gh-pages
```

3. Add the following scripts to your `package.json`:
```json
{
  "scripts": {
    "predeploy": "pnpm build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Configure the `homepage` field in your `package.json`:
```json
{
  "homepage": "https://[your-username].github.io/image-zoom-selector/"
}
```

5. Deploy to GitHub Pages:
```bash
pnpm deploy
```

6. Go to your repository settings on GitHub:
   - Navigate to Settings > Pages
   - Under "Source", select "gh-pages" branch
   - Save the changes

Your application will be available at: `https://[your-username].github.io/image-zoom-selector/`

> Note: Make sure the `base` value in `vite.config.ts` matches your repository name.