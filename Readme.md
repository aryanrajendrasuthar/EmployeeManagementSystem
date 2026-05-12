# Employee Management System

A full-stack Employee Management System built with Spring Boot 3.2, React 18, PostgreSQL, and Redis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security 6, Spring Data JPA |
| Auth | JWT (JJWT 0.12.3), Role-based Access Control |
| Cache | Redis (Spring Cache, 10-min TTL) |
| Database | PostgreSQL 15 |
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS |
| Charts | Recharts (analytics), D3.js (org chart) |
| PDF/CSV | jsPDF + jspdf-autotable, OpenCSV |

## Features

- **Authentication**: JWT login with 3 roles (HR_ADMIN, MANAGER, EMPLOYEE)
- **Employee Directory**: Search, filter by department/status, CRUD operations
- **Leave Management**: Apply, approve/reject with manager remarks, leave types
- **Payroll**: Monthly payroll records, PDF + CSV export
- **Performance Reviews**: Quarterly reviews with star ratings
- **Org Chart**: Interactive D3.js hierarchical visualization
- **Analytics**: Department headcount, leave distribution, salary distribution
- **Caching**: Redis caching on employee list with auto-eviction

## Roles & Permissions

| Feature | HR_ADMIN | MANAGER | EMPLOYEE |
|---------|----------|---------|----------|
| Manage employees | Full CRUD | Read + Edit | Own data |
| Leave management | All | Team | Own |
| Payroll | Full | View | Own |
| Reviews | Full CRUD | Create/Edit | View own |
| Reports/Export | Yes | Limited | No |

## Setup

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 15
- Redis 7

### Local Development

**1. Database Setup**
```sql
CREATE DATABASE ems_db;
CREATE USER ems_user WITH PASSWORD 'ems_password';
GRANT ALL PRIVILEGES ON DATABASE ems_db TO ems_user;
```

**2. Backend**
```bash
cd backend
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on `http://localhost:5173`

### Docker (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:8080

## Default Credentials

After first startup, seed an HR Admin via the API or directly in the database.

Default password for all new employees: `Employee@123`

## API Endpoints

| Resource | Endpoint | Roles |
|----------|---------|-------|
| Auth | POST /api/auth/login | Public |
| Employees | GET/POST/PUT/DELETE /api/employees | HR_ADMIN, MANAGER |
| Departments | GET/POST/PUT/DELETE /api/departments | HR_ADMIN |
| Leaves | GET/POST /api/leaves | All |
| Leave approve | PUT /api/leaves/{id}/approve | HR_ADMIN, MANAGER |
| Payroll | GET/POST /api/payroll | HR_ADMIN |
| Reviews | GET/POST/PUT/DELETE /api/reviews | HR_ADMIN, MANAGER |
| Reports | GET /api/reports/employees/export | HR_ADMIN, MANAGER |
| Org stats | GET /api/reports/department-stats | All |

## Project Structure

```
EmployeeManagement/
├── backend/
│   ├── src/main/java/com/ems/
│   │   ├── config/          # Security, Redis, CORS config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/response DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Global exception handler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT provider, filter, user details
│   │   └── service/         # Business logic services
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Route-level pages
│   │   ├── services/        # Axios API services
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Git Commit History

- `feat: initialize spring boot project with dependencies and base config`
- `feat: add employee, department entities with jwt security and redis caching`
- `feat: add leave, payroll, and performance review apis with csv export`
- `feat: add react frontend with employee directory, leave management, payroll and org chart`
- `feat: add analytics dashboard, pdf export, docker compose and readme`
