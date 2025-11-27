# Exam Hall Management System

A comprehensive exam hall seating management system built with React, Node.js, MongoDB, and Docker.

## Features

- **No Authentication Required**: Direct access to the system
- **Hall Management**: Create and manage multiple exam halls
- **Dynamic Seat Sizing**: Seats automatically resize to fit all assigned information
- **Department Display**: Shows department at the start of each row
- **Flexible Assignment**: Choose horizontal or vertical sequence for seat assignments
- **Complete Information Display**: Shows register number, semester, and department on each seat
- **Print Layouts**: Generate printable seating arrangements
- **MongoDB Storage**: All data stored in local MongoDB via Docker
- **CSV Export**: Export seating arrangements for reporting

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Node.js 18+ (for local development)

## Quick Start with Docker

1. **Clone the repository**

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

```bash
npm install
npm run dev
```

The frontend will run on http://localhost:5173

### MongoDB Setup

Make sure MongoDB is running locally on port 27017, or update the connection string in `backend/.env`:

```
MONGODB_URI=mongodb://admin:examhall123@localhost:27017/examhall?authSource=admin
```

## Docker Commands

### Start services
```bash
docker-compose up
```

### Stop services
```bash
docker-compose down
```

### Rebuild services
```bash
docker-compose up --build
```

### View logs
```bash
docker-compose logs -f
```

### Remove all data (including MongoDB volumes)
```bash
docker-compose down -v
```

## Features Guide

### Creating a Hall

1. Click "Create Hall" in the sidebar
2. Enter hall name (e.g., "CSE Block – Hall 101")
3. Set rows, columns, and seats per bench
4. Click "Create Hall"

### Assigning Seats

1. Select a hall from the dashboard
2. Click on seats to select them
3. Choose sequence: **Horizontal** (row by row) or **Vertical** (column by column)
4. Click "Assign" button
5. Enter:
   - Starting register number (e.g., 23001)
   - Student name (optional)
   - Department (e.g., Computer Science)
   - Semester (e.g., Semester 5)
6. Click "Assign" to confirm

### Seat Display

- Each seat shows:
  - Position (Row, Column, Seat number)
  - Full register number
  - Semester
  - Department
- Seats automatically resize to fit all information
- Department is displayed at the start of each row

### Printing

1. Open a hall layout
2. Click the "Print" button
3. Use browser print dialog (Ctrl+P / Cmd+P)

### Exporting Data

1. Go to "Reports" section
2. Click "Export CSV" for any hall
3. CSV includes all seat assignments with full details

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)
```
MONGODB_URI=mongodb://admin:examhall123@mongodb:27017/examhall?authSource=admin
PORT=5000
```

## MongoDB Collections

- **halls**: Stores hall configurations
- **seats**: Stores individual seat data and assignments

## API Endpoints

- `GET /api/halls` - Get all halls
- `POST /api/halls` - Create a new hall
- `DELETE /api/halls/:id` - Delete a hall
- `GET /api/halls/:id/seats` - Get seats for a hall
- `PUT /api/halls/:id/seats` - Update seat assignments
- `POST /api/halls/:id/seats/clear` - Clear all assignments

## Project Structure

```
exam-hall/
├── backend/
│   ├── server.js          # Express server
│   ├── Dockerfile         # Backend container
│   └── package.json
├── src/
│   ├── components/        # React components
│   ├── lib/              # API client
│   └── App.tsx
├── docker-compose.yml    # Docker orchestration
├── Dockerfile           # Frontend container
├── mongo-init.js        # MongoDB initialization
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`

### Port Conflicts
- Frontend (3000), Backend (5000), or MongoDB (27017) ports may be in use
- Update `docker-compose.yml` to use different ports

### Data Persistence
- MongoDB data is stored in a Docker volume named `mongodb_data`
- To reset data: `docker-compose down -v`

## License

MIT
