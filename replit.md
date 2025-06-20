# Cosmofy - Space Exploration App

## Overview

Cosmofy is a modern web application that provides an immersive space exploration experience by integrating real-time data from various NASA and space APIs. The application features a cosmic-themed design with animated elements, real-time space tracking, and educational content about space phenomena.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Build System**: Vite for frontend bundling, esbuild for server compilation

### Architectural Pattern
The application follows a monorepo structure with shared TypeScript types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common types, schemas, and utilities

## Key Components

### Frontend Architecture
- **Component Library**: Custom UI components built on Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Animations**: GSAP for advanced animations and scroll-triggered effects
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom cosmic color palette and design system

### Backend Architecture
- **API Layer**: RESTful API endpoints organized in `/api` routes
- **Data Access**: Drizzle ORM with PostgreSQL for structured data storage
- **External Integrations**: NASA API services for real-time space data
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations

### Database Schema
The application tracks various space-related entities:
- **APOD Images**: Astronomy Picture of the Day data
- **ISS Tracking**: Position, passes, and crew information
- **Aurora Forecasts**: Geomagnetic activity and visibility predictions
- **Asteroids**: Near-Earth object tracking
- **Space Missions**: Active mission information

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data from API endpoints
2. **API Layer**: Express routes handle requests and coordinate with external APIs
3. **External APIs**: NASA APIs and space weather services provide real-time data
4. **Data Persistence**: Structured data is cached in PostgreSQL via Drizzle ORM
5. **Real-time Updates**: Polling intervals ensure fresh data for dynamic content

## External Dependencies

### NASA and Space APIs
- NASA APOD API for daily astronomy images
- ISS tracking APIs for position and pass predictions
- NOAA Space Weather API for aurora forecasting
- NASA NEO API for asteroid tracking

### Key Libraries
- **UI Framework**: React 18 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless
- **Animations**: GSAP with ScrollTrigger plugin
- **HTTP Client**: TanStack Query for API state management
- **Validation**: Zod for schema validation
- **Icons**: Lucide React and React Icons

## Deployment Strategy

### Development Environment
- Replit integration with hot reload via Vite dev server
- PostgreSQL database provisioned through Replit modules
- Environment variables for API keys and database URLs

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild compiles TypeScript server code
- Deployment: Configured for Replit's autoscale deployment target

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- NASA API key via `NASA_API_KEY` or `VITE_NASA_API_KEY`
- Development/production mode switching via `NODE_ENV`

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
- June 20, 2025. Complete multi-page application with award-winning design
  * Split into dedicated pages: Gallery, ISS Tracker, Aurora, Asteroids, Missions
  * Enhanced navigation system with proper routing
  * Fixed background gradient issues across mobile and desktop
  * Implemented NASA API integration with fallback systems
  * Added real-time ISS tracking with pass predictions
  * Created manual coordinate input for location-based features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```