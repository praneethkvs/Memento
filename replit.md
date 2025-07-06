# Memento

## Overview

This is a full-stack web application for tracking birthdays, anniversaries, and other important events. It uses a modern tech stack with React frontend, Express.js backend, and PostgreSQL database. The app allows users to create, read, update, and delete events, with features like search, filtering, and reminder notifications.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Data Storage**: In-memory storage for development (with database schema ready)
- **API Design**: RESTful endpoints for CRUD operations
- **Build Tool**: ESBuild for production bundling

### Database Schema
The application uses a single `events` table with the following structure:
- `id`: Primary key (serial)
- `personName`: Name of the person (required)
- `eventType`: Either 'birthday', 'anniversary', or 'other' (required)
- `eventDate`: Date of the event (required)
- `relation`: Relationship type - 'family', 'friend', 'colleague', 'partner', or 'other' (required)
- `notes`: Optional text notes
- `reminders`: Array of reminder days (e.g., ['7', '3', '1'])

## Key Components

### Frontend Components
- **Event Management**: Add, edit, and delete event modals
- **Event Display**: Card-based event listing with filtering and search
- **Calendar View**: Mini calendar showing events with visual indicators
- **UI Components**: Comprehensive shadcn/ui component library

### Backend Components
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **API Routes**: RESTful endpoints for events management
- **Data Validation**: Zod schemas for type-safe data handling
- **Development Server**: Vite integration for hot reloading

### Data Models
- **Event**: Core data structure with validation
- **InsertEvent**: Schema for creating new events
- **Form Validation**: Client-side validation matching server schema

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and validate data
3. **Data Storage**: Storage layer abstracts database operations
4. **Response Handling**: Client updates UI based on server responses
5. **State Management**: TanStack Query manages caching and synchronization

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **Styling**: Tailwind CSS, Radix UI primitives
- **State Management**: TanStack Query
- **Forms**: React Hook Form, Hookform Resolvers
- **Validation**: Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Utilities**: clsx, class-variance-authority

### Backend Dependencies
- **Server**: Express.js
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Validation**: Zod, drizzle-zod
- **Session**: connect-pg-simple
- **Development**: tsx, esbuild

### Development Dependencies
- **Build Tools**: Vite, ESBuild
- **TypeScript**: Full TypeScript support
- **Development**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Development Mode
- Frontend: Vite dev server with HMR
- Backend: tsx for TypeScript execution
- Database: In-memory storage for quick development

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild creates bundled server executable
- Database: PostgreSQL with Drizzle migrations
- Deployment: Single command builds both frontend and backend

### Environment Configuration
- `NODE_ENV`: Controls development vs production behavior
- `DATABASE_URL`: PostgreSQL connection string
- `REPL_ID`: Replit-specific environment detection

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Updated app name to "Memento" with tagline "Remember what matters!"
- July 05, 2025. Added "Other" event type option to support more than just birthdays and anniversaries
- July 05, 2025. Separated event date into Month & Day (required) and Year (optional) fields
- July 05, 2025. Added missing "Partner" option to relation filter
- July 05, 2025. Removed Quick Actions section from sidebar
- July 06, 2025. Implemented AI-powered message generation feature using Google Gemini API
- July 06, 2025. Added message storage and caching in database with event_messages table
- July 06, 2025. Fixed event card layout with vertically stacked action buttons
- July 06, 2025. Improved card spacing with separate lines for event details
- July 06, 2025. Fixed button positioning to be consistently aligned at top-right of cards
- July 06, 2025. Added helpful tooltips to action buttons (Generate Message, Edit, Delete)
- July 06, 2025. Added existing message display in Event Details Modal with copy to clipboard
- July 06, 2025. Fixed cache synchronization between modals for real-time message updates
- July 06, 2025. Updated event sorting to prioritize upcoming events (days until next occurrence)
- July 06, 2025. Implemented timezone-aware client-side sorting for global users
- July 06, 2025. Fixed statistics bug where today's events weren't counted in "This Week" and "This Month"
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```