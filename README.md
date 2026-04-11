# GovAssist AI

GovAssist AI is a full-stack platform for managing digital public service workflows. It enables citizens to browse services, submit requests, upload documents, and track progress, while also providing dedicated workflows for officers and administrators.

## Tech Stack

**Backend**
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- Maven

**Frontend**
- React
- TypeScript
- Vite
- Material UI
- React Router

## Implemented Functionality

### Citizen
- Registration and login
- Dashboard
- Service catalog and service details
- Request submission
- Request history and status tracking
- Document upload
- Profile settings
- Notifications

### Officer
- Officer dashboard
- Request queue overview
- Request status updates
- Comments and additional document requests
- Review of uploaded documents

### Administrator
- Admin dashboard
- Service management
- Create, edit, and delete services

### AI Assistant
- Frontend assistant interface is implemented
- Current version is UI-only and not yet connected to a backend AI service

## Local Development

### Ports
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8081`
- PostgreSQL: `localhost:5433`

### Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## Database Defaults

- URL: `jdbc:postgresql://localhost:5433/postgres`
- Username: `postgres`
- Password: `postgres`

## Notes

- New registrations are created with the `CITIZEN` role by default
- The backend seeds roles and one sample service
- Demo users are not pre-seeded
