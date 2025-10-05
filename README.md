# Task Management App – Backend & Frontend

## Overview
A scalable Task Management application with **authentication**, **role-based access**, and **CRUD operations** on tasks. Built with **Node.js**, **Express**, **Prisma**, **PostgreSQL**, and **React.js**.

---

## Features

### Backend
- **User Registration & Login** with JWT authentication
- **Role-Based Access**
  - `USER`: Can create, edit, and delete their own tasks
  - `ADMIN`: Can edit/delete all tasks
- **CRUD APIs for Tasks**
- Task ownership and “edited by admin” tracking
- **Password Hashing** (bcrypt)
- **JWT Token Handling** (stored in HTTP-only cookies)
- **Error Handling** with proper status codes
- **Input Validation** (username, email, password, confirm password)

### Frontend
- Built with **React.js**
- Register & login forms with **validation**
- Protected Dashboard (requires JWT)
- Create, edit, delete tasks
- Users see their own edit/delete buttons; admin sees all
- “Edited by admin” info displayed when admin modifies tasks
- Success & error messages from API responses

---

## API Documentation
- **Postman Collection** included in `/docs/TaskManagement.postman_collection.json`
- Base URL: `http://localhost:4000`
- Example endpoints:
  - `POST /register` – Register a new user
  - `POST /login` – Login
  - `GET /tasks` – Get all tasks
  - `POST /tasks` – Create a new task
  - `PUT /tasks/:id` – Edit a task
  - `DELETE /tasks/:id` – Delete a task
  - `GET /me` – Get current logged-in user

---

## Scalability Notes
- **Modular Project Structure** – easy to extend with new modules or APIs
- **Role-based access** simplifies permission management
- **Database** – PostgreSQL supports large datasets and can scale vertically/horizontally
- **Optional Enhancements**
  - **Caching** (Redis) for frequently accessed endpoints like `/tasks`
  - **Logging & Monitoring** (Winston, Morgan)
  - **Docker Deployment** for consistent environments
  - Microservices architecture for task management, user management, and notifications

---

## Installation & Setup

### Backend
```bash
git clone <repo-url>
cd backend
npm install

# Run Prisma migration
npx prisma migrate dev --name init

# Start backend
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Visit **http://localhost:3000** for the frontend dashboard.

### Default Admin User

***For testing purposes, you can create a default admin:***
Prisma Script
```javascript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created/exists");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

```bash
Username: admin

Password: Admin@123
```
**Admin can edit/delete all tasks. Users will see “edited by admin” if admin modifies a task.**