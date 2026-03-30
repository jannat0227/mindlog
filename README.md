# MindLog

A mental health tracking web application built as an Honours Computer Science final year project. MindLog allows users to log daily mood and anxiety check-ins, write journal entries, and visualise trends over time through an analytics dashboard.

## Features

- **Daily Check-ins** — record mood (1–10) and anxiety (1–10) scores with optional notes
- **Journal** — create, read, update, and delete private journal entries
- **Dashboard** — visualise mood/anxiety trends, day-of-week patterns, and scatter plots
- **Crisis Banner** — automatic safe-messaging banner when scores fall below a threshold
- **Authentication** — JWT-based login and registration with protected routes
- **Seed Data** — one-command demo data loader for development/demo purposes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts |
| Backend | Django 4.2, Django REST Framework |
| Auth | SimpleJWT |
| Database | PostgreSQL 15 |
| Containerisation | Docker, Docker Compose |

## Project Structure

```
.
├── backend/
│   ├── analytics/        # Dashboard aggregation API
│   ├── checkins/         # Mood & anxiety check-in API
│   ├── journal/          # Journal entries API
│   ├── users/            # Registration & profile API
│   └── mindlog/          # Django project settings
├── frontend/
│   ├── src/
│   │   ├── pages/        # CheckIn, Dashboard, Journal, Login, Register, Settings
│   │   ├── components/   # Navbar, Layout, CrisisBanner, ProtectedRoute
│   │   ├── api/          # Axios API client
│   │   ├── context/      # Auth context
│   │   └── hooks/        # Custom React hooks
│   └── index.html
├── docker-compose.yml
└── files/                # Project documentation
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Running the application

1. Clone the repository:
   ```bash
   git clone https://github.com/jannat0227/mindlog.git
   cd mindlog
   ```

2. Create the backend environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your settings (a working default is provided for local development).

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. The application is now available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Loading demo data

To populate the database with sample users, check-ins, and journal entries:

```bash
docker compose exec backend python manage.py seed_data
```

Demo credentials after seeding:

| Username | Password |
|----------|----------|
| demo | demo1234 |

## Running Tests

```bash
docker compose exec backend pytest
```

All 43 backend tests (unit + integration) should pass.

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register/` | Create a new account |
| `POST /api/auth/token/` | Obtain JWT tokens |
| `POST /api/auth/token/refresh/` | Refresh access token |
| `GET/POST /api/checkins/` | List or create check-ins |
| `GET/PUT/DELETE /api/checkins/<id>/` | Retrieve, update, or delete a check-in |
| `GET/POST /api/journal/` | List or create journal entries |
| `GET/PUT/DELETE /api/journal/<id>/` | Retrieve, update, or delete an entry |
| `GET /api/analytics/dashboard/` | Aggregated stats for the dashboard |

## Licence

This project was submitted as part of an Honours Computer Science degree. All rights reserved.
