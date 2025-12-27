# GearGuard - Maintenance Management System

Full-stack maintenance management system for industrial equipment tracking with SLA monitoring, preventive maintenance scheduling, and team-based workflow.

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + React Router  
**Backend:** Node.js + Express  
**Database:** PostgreSQL

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gearguard;
\q

# Run schema
cd server
psql -U postgres -d gearguard -f src/database/schema.sql

# Load seed data
psql -U postgres -d gearguard -f src/database/seed.sql
```

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on: `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Default Login

**Email:** `admin@gearguard.in`  
**Password:** `password123`

## Project Structure

```
GearGuard/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   └── config/       # API configuration
│   └── package.json
└── server/               # Express backend
    ├── src/
    │   ├── modules/      # Feature modules
    │   ├── database/     # Schema & seed files
    │   └── config/       # DB configuration
    └── package.json
```

## Features

- Equipment management with team assignment
- Maintenance request tracking (Corrective/Preventive)
- Kanban board with drag-drop status changes
- Calendar view for scheduled maintenance
- SLA tracking with breach indicators
- Role-based access (Admin, Manager, Technician, User)
- Audit trail for all actions

## Database Configuration

Default settings in `server/src/config/db.js`:

```
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: gearguard
```

Update with environment variables if needed.

## API Endpoints

- `GET /api/equipment` - List all equipment
- `GET /api/requests/views/kanban` - Kanban board data
- `GET /api/requests/views/calendar` - Calendar events
- `GET /api/teams` - List teams
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

Full API documentation available at backend routes.

## Troubleshooting

**Port already in use:**

```bash
# Kill process on port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Database connection failed:**

- Verify PostgreSQL is running
- Check credentials in `server/src/config/db.js`
- Ensure database 'gearguard' exists

**Schema errors:**

- Drop and recreate database
- Re-run schema.sql and seed.sql

## Development

**Backend restart:** Changes auto-reload with nodemon  
**Frontend hot reload:** Vite handles HMR automatically

## Production Build

```bash
# Frontend build
cd frontend
npm run build

# Serve with backend or static server
```

## License

MIT
