# CS Career Productivity Dashboard

## Project Overview

As a computer science major navigating the competitive job market, I recognized the need to systematically track and optimize multiple career-oriented responsibilities. Rather than juggling scattered tools and spreadsheets, I leveraged my software development skills to create a unified productivity dashboard that consolidates leetcode practice, job applications, coding contributions, and daily productivity into a single, intelligent platform.

## Motivation

This project emerged from a practical need to optimize my career preparation workflow. As a CS student, I was managing:
- LeetCode problem-solving practice and progress analytics
- GitHub contribution tracking and repository activity
- Job application monitoring across multiple platforms
- Daily productivity through Pomodoro techniques and task management
- Music integration for focused coding sessions

By building this dashboard, I demonstrate both my technical capabilities and my approach to solving real-world productivity challenges through software engineering.

## Technical Architecture

### Frontend Technology Stack
- **React 19** with TypeScript for type-safe, modern component development
- **shadcn/ui** component library built on Radix UI primitives for accessible, professional UI
- **Tailwind CSS** for utility-first styling and responsive design
- **React Hook Form** with Zod validation for robust form handling
- **Recharts** for data visualization and analytics dashboards
- **React Router** for client-side navigation
- **Axios** for HTTP client communication

### Backend Technology Stack
- **Node.js** with Express and TypeScript for scalable API development
- **MongoDB** with Mongoose ODM for flexible document-based data storage
- **JWT** authentication for secure user sessions
- **AWS S3** integration for file storage and management
- **Web scraping** with Cheerio for automated job posting collection
- **Node-cron** for scheduled background tasks
- **RESTful API** design with proper HTTP status codes and error handling

## Core Features Implementation

### LeetCode Progress Tracking
- **Comprehensive Problem Database**: Store and categorize problems by difficulty, topic, and completion time
- **Analytics Dashboard**: Visual representation of solving patterns, difficulty distribution, and progress trends
- **Performance Metrics**: Success rate calculations, time tracking, and pattern analysis
- **Smart Filtering**: Sort and filter problems by multiple criteria for targeted practice

### Integrated Development Workflow
- **GitHub API Integration**: Real-time contribution charts, repository activity, and commit streak tracking
- **Spotify Web API**: Seamless music control integration for focused coding sessions
- **Mini Player**: Embedded Spotify controls without leaving the productivity environment

### Productivity Management System
- **Pomodoro Timer**: Customizable work/break intervals with browser notifications
- **Weekly Todo System**: Drag-and-drop task management across daily schedules
- **Session Tracking**: Historical data on productivity patterns and completion rates

### Job Search Automation
- **Automated Web Scraping**: Daily monitoring of job posting platforms with deduplication logic
- **Application Tracking**: Status management from initial interest through application completion
- **Filtering System**: Advanced search and categorization by company, location, and posting date

## Technical Implementation Highlights

### Data Management
- **Schema Design**: Optimized MongoDB collections for user data, problems, tasks, and job postings
- **API Architecture**: RESTful endpoints with consistent error handling and response formatting
- **Real-time Updates**: Dynamic UI updates reflecting backend state changes

### User Experience
- **Responsive Design**: Mobile-first approach ensuring functionality across all device sizes
- **Professional Interface**: Clean, modern design suitable for daily professional use
- **Performance Optimization**: Efficient data loading and caching strategies

### Security and Best Practices
- **Authentication**: JWT-based session management with secure token handling
- **Data Validation**: Comprehensive input validation using Zod schemas
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Configuration**: Secure environment variable management

## Development and Deployment

### Local Development Setup
```bash
# Clone repository
git clone [repository-url]
cd productivity_dashboard

# Frontend setup
cd frontend
npm install
npm start              # Runs on localhost:3000

# Backend setup (separate terminal)
cd backend
npm install
npm run dev            # Runs on localhost:5000
```

### Environment Configuration
```bash
# Backend environment variables
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/productivity_dashboard
JWT_SECRET=[secure-random-string]
SPOTIFY_CLIENT_ID=[spotify-app-id]
SPOTIFY_CLIENT_SECRET=[spotify-app-secret]
GITHUB_TOKEN=[github-personal-access-token]
```

### Production Deployment
- **Frontend**: Deployed on Vercel with automatic CI/CD from Git repository
- **Backend**: Deployed on Railway/Render with environment variable configuration
- **Database**: MongoDB Atlas for production data persistence
- **File Storage**: AWS S3 for static asset management

## Project Structure
```
productivity_dashboard/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/         # Feature-specific React components
│   │   │   ├── ui/            # Reusable shadcn/ui components
│   │   │   ├── LeetCodeSection.tsx
│   │   │   ├── GitHubSection.tsx
│   │   │   ├── SpotifyPlayer.tsx
│   │   │   ├── JobsSection.tsx
│   │   │   ├── PomodoroTimer.tsx
│   │   │   └── WeeklyTodos.tsx
│   │   ├── services/          # API communication layer
│   │   ├── types/             # TypeScript type definitions
│   │   └── hooks/             # Custom React hooks
├── backend/                    # Express TypeScript API
│   ├── src/
│   │   ├── routes/           # API endpoint implementations
│   │   │   ├── leetcode.ts   # Problem tracking endpoints
│   │   │   ├── github.ts     # GitHub integration API
│   │   │   ├── spotify.ts    # Spotify Web API integration
│   │   │   ├── jobs.ts       # Job scraping and management
│   │   │   ├── pomodoro.ts   # Timer session management
│   │   │   └── todos.ts      # Task management endpoints
│   │   ├── models/           # MongoDB schema definitions
│   │   ├── services/         # Business logic layer
│   │   └── scripts/          # Automation and maintenance scripts
└── shared/                    # Common TypeScript interfaces
```

## API Documentation

### Core Endpoints
- `POST /api/leetcode/problems` - Add new problem entry
- `GET /api/leetcode/analytics` - Retrieve progress analytics
- `GET /api/github/contributions` - Fetch contribution data
- `POST /api/spotify/play` - Control music playback
- `GET /api/jobs/scrape` - Trigger job posting collection
- `POST /api/pomodoro/session` - Start productivity timer
- `PUT /api/todos/:id` - Update task status

## Skills Demonstrated

### Technical Proficiencies
- **Full-Stack Development**: Complete application architecture from database to user interface
- **TypeScript Expertise**: Type-safe development across both frontend and backend
- **API Integration**: Multiple third-party service integrations (GitHub, Spotify)
- **Database Design**: Efficient schema design and query optimization
- **Web Scraping**: Automated data collection with error handling and rate limiting
- **Modern React Patterns**: Hooks, context, and component composition
- **Responsive Design**: Mobile-first CSS and cross-browser compatibility

### Software Engineering Practices
- **Clean Code Architecture**: Modular, maintainable codebase with clear separation of concerns
- **Error Handling**: Comprehensive error boundaries and graceful failure management
- **Performance Optimization**: Efficient data loading and rendering strategies
- **Security Implementation**: Authentication, input validation, and secure data handling
- **Version Control**: Git workflow with meaningful commits and branch management

## Future Enhancements

### Planned Features
- **Data Export**: CSV/PDF report generation for progress tracking
- **Calendar Integration**: Google Calendar API for deadline management
- **Advanced Analytics**: Machine learning insights for productivity patterns
- **Team Collaboration**: Shared workspaces for study groups
- **Mobile Application**: React Native implementation for mobile productivity

### Technical Improvements
- **Microservices Architecture**: Service decomposition for enhanced scalability
- **Real-time Updates**: WebSocket implementation for live collaboration
- **Automated Testing**: Comprehensive unit and integration test coverage
- **Performance Monitoring**: Application performance management and logging
- **Docker Containerization**: Simplified deployment and development environment setup

## Conclusion

This productivity dashboard represents a practical application of full-stack development skills to solve a genuine career preparation challenge. The project demonstrates proficiency in modern web technologies, API integration, database design, and user experience considerations while addressing the real-world need for systematic career management in the competitive computer science field.

The codebase showcases clean architecture, scalable design patterns, and professional development practices that would be valuable in any software engineering role. 