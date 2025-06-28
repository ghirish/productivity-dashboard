# CS Productivity Dashboard

A comprehensive productivity dashboard designed for computer science majors in their job search journey. This project combines LeetCode tracking, GitHub integration, Spotify controls, job search management, and productivity tools in one unified platform.

## 🎯 Features

### ✅ Phase 1 - Foundation (COMPLETED)
- **Modern React Dashboard**: Built with TypeScript and shadcn/ui components
- **Professional UI**: Responsive design with sidebar navigation and card-based layout
- **Express API Backend**: TypeScript-based REST API with MongoDB integration
- **Authentication Ready**: JWT setup and user management structure
- **AWS S3 Integration**: File upload and storage capabilities (structure ready)

### 🚧 Upcoming Phases
- **Phase 2**: LeetCode Tracking System with analytics
- **Phase 3**: Pomodoro Timer and Weekly Todo Lists
- **Phase 4**: GitHub and Spotify API integrations
- **Phase 5**: Job Scraping and Application Tracking
- **Phase 6**: Deployment and Polish

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **shadcn/ui** for modern, accessible components
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **AWS S3** for file storage
- **Helmet** and CORS for security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and setup the project:**
   ```bash
   cd productivity_dashboard
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3000

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create environment file (copy from .env.example if available)
   # Add your MongoDB URI and other configs
   
   npm run dev
   ```
   Backend will run on http://localhost:5000

### Environment Variables

Create `backend/.env` with:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/productivity_dashboard
JWT_SECRET=your_secret_key_here
```

## 📁 Project Structure

```
productivity_dashboard/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # shadcn/ui components
│   │   │   ├── ui/         # Base UI components
│   │   │   └── DashboardLayout.tsx
│   │   ├── lib/            # Utility functions
│   │   └── index.tsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Express TypeScript API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   │   ├── leetcode.ts
│   │   │   ├── github.ts
│   │   │   ├── spotify.ts
│   │   │   ├── jobs.ts
│   │   │   ├── pomodoro.ts
│   │   │   └── todos.ts
│   │   └── index.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── shared/                  # Shared types and utilities
└── cursorrules             # Development planning and progress
```

## 🎨 Dashboard Features

### Current Implementation
- **Sidebar Navigation**: Clean, modern navigation between different sections
- **Overview Dashboard**: Summary cards showing key metrics
- **Responsive Design**: Works on desktop and mobile devices
- **Professional Styling**: Modern UI with proper spacing and typography

### Dashboard Sections
1. **Overview**: Main dashboard with key metrics and today's tasks
2. **LeetCode**: Problem tracking and analytics (Phase 2)
3. **Pomodoro**: Focus timer with break reminders (Phase 3)
4. **Todo Lists**: Weekly task management (Phase 3)
5. **GitHub**: Contribution charts and stats (Phase 4)
6. **Job Search**: Application tracking and new postings (Phase 5)
7. **Analytics**: Progress insights and charts (Phase 6)
8. **Music**: Spotify integration for productivity (Phase 4)

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon
npm run build      # Compile TypeScript
npm start          # Run production build
```

### API Endpoints (Phase 1)
- `GET /api/health` - API health check
- `GET /api/leetcode` - LeetCode problems (placeholder)
- `GET /api/github/*` - GitHub integration (placeholder)
- `GET /api/spotify/*` - Spotify controls (placeholder)
- `GET /api/jobs/*` - Job management (placeholder)
- `GET /api/pomodoro/*` - Timer sessions (placeholder)
- `GET /api/todos/*` - Task management (placeholder)

## 📈 Progress Tracking

Check `cursorrules` file for detailed phase-by-phase progress and planning.

**Phase 1 Status**: ✅ **COMPLETED**
- Complete frontend and backend foundation
- Professional dashboard UI ready
- API structure established
- Ready for feature development

## 🎯 Next Steps (Phase 2)

1. Implement LeetCode tracking database schema
2. Create problem entry forms and analytics
3. Add charts for difficulty distribution and progress
4. Implement time tracking and success rate calculations

## 🤝 Contributing

This is a personal productivity project, but feel free to:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is for educational and personal use.

---

**Built with ❤️ for CS job seekers everywhere!** 