# F1 Pulse

A modern Formula 1 dashboard application built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard** - Overview of current season statistics
- **Driver Standings** - Real-time driver rankings and points
- **Team Standings** - Constructor championship standings
- **Race Schedule** - Upcoming and past races with results
- **AI Predictions** - Machine learning-powered race predictions

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router v7
- Recharts
- Lucide React Icons

## Project Structure

```
src/
├── components/       # Reusable UI components
├── layout/          # Layout components (Sidebar, MainLayout)
├── pages/           # Page components (Dashboard, Drivers, etc)
├── services/        # API services and utilities
├── App.jsx          # Main app component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Mohammad-Adnan-Shakil/F1-Pulse.git
cd F1-Pulse
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5174`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## License

MIT
