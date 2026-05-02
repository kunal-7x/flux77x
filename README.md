# Flux HR Platform

Enterprise HR Management Platform built with React, TypeScript, and Supabase.

## Features

- **Employee Management** - Complete employee directory with profiles
- **Attendance Tracking** - Check-in/checkout system with GPS tracking
- **Leave Management** - Request and approve leave requests
- **Project Management** - Track team projects and tasks
- **Announcements** - Company-wide announcements and updates
- **AI Chatbot** - Intelligent HR assistant powered by Groq
- **Reports & Analytics** - Dashboard with insights and charts

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Groq API (Llama 3.3 70B)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### Database Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Configure edge function environment variables

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utilities
├── data/           # Mock data
└── integrations/   # Supabase client
```

## License

MIT
