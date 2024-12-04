# BeatForge

A modern desktop application for organizing and managing your beat library. BeatForge helps music producers keep their beats organized, tagged, and easily accessible.

## Features

- Organize and manage your beat collection
- Tag and categorize your beats
- Quick search and filter functionality
- Preview beats directly in the app
- Modern and intuitive user interface
- Cross-platform desktop application
- Fast performance with Rust backend
- Clean, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React + TypeScript
- **Desktop Framework**: Tauri (Rust)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/tools/install)
- [VS Code](https://code.visualstudio.com/) (recommended)

### Recommended VS Code Extensions

- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [TypeScript and JavaScript Language Features](https://marketplace.visualstudio.com/items?itemName=vscode.typescript-language-features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run tauri dev
   ```

## Building for Production

To create a production build:

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

## Project Structure

- `/src` - React frontend source code
- `/src-tauri` - Tauri/Rust backend code
- `/public` - Static assets
- `/dist` - Build output directory
