# Mega Project Management API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-4.x-blue" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-green" alt="MongoDB">
  <img src="https://img.shields.io/badge/JWT-Auth-blueviolet" alt="JWT">
  <img src="https://img.shields.io/badge/Nodemailer-Email-yellowgreen" alt="Nodemailer">
  <img src="https://img.shields.io/badge/Mailgen-Transactional%20Email-orange" alt="Mailgen">
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange" alt="OpenAPI">
  <img src="https://img.shields.io/badge/Docker-MongoDB-blue" alt="Docker MongoDB">
  <img src="https://img.shields.io/badge/Environment-.env-informational" alt="Dotenv">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

A robust, secure, and scalable backend API for project, task, and team management. Built with Node.js, Express, and MongoDB. Features include authentication, RBAC, project/task/subtask/boards/notes management, notifications (scaffolded), and OpenAPI documentation.

---

## 🚀 Key Benefits

- **Enterprise-Ready Security:** JWT authentication, RBAC, rate limiting, CORS, and secure HTTP headers.
- **Modular & Scalable:** Clean separation of concerns, modular routes/controllers, and DRY OpenAPI docs.
- **Team Collaboration:** Projects, tasks, subtasks, boards, and notes for real-world team workflows.
- **Notifications System:** Scaffolded for in-app and email notifications (easy to enable/extend).
- **Modern API Standards:** Fully documented with OpenAPI 3.0, CI-validated, and ready for frontend or third-party integration.
- **Developer Experience:** Centralized error handling, logging, and easy local setup.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing & Linting](#testing--linting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User authentication (JWT, refresh tokens, cookies)
- Role-based access control (RBAC)
- Project, task, subtask, and note management
- Board (Kanban) support
- In-app and email notification system (scaffolded, not yet integrated)
- RESTful API with OpenAPI (Swagger) docs
- Rate limiting, CORS, security best practices
- Centralized error handling and logging
- CI for OpenAPI validation

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, cookies
- **Docs:** Swagger (OpenAPI 3.0)
- **Email:** Nodemailer, Mailgen
- **Testing:** (Add your test framework here)

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)

### Installation

```powershell
# Clone the repo
git clone <your-repo-url>
cd COHORT-TaskManager

# Install dependencies
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your environment variables:

```powershell
cp .env.example .env
```

### Running the App

```powershell
# Start the development server
npm run dev

# Or with nodemon
npx nodemon src/index.js
```

## API Documentation

- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (non-production only)
- Export OpenAPI spec: `node export-swagger.js` → `swagger.json`

## Project Structure

```
src/
  controllers/      # Route handlers
  db/               # Database connection
  middlewares/      # Express middlewares
  models/           # Mongoose models
  routes/           # Express routes
  swagger/          # OpenAPI docs (modular)
  utils/            # Utilities (logger, mail, etc.)
  validators/       # Request validation
public/             # Static assets
scripts/            # Linting, automation scripts
```

## Environment Variables

See `.env.example` for all required variables (MongoDB URI, JWT secrets, email config, etc).

## Scripts

- `npm run dev` — Start development server
- `npm run swagger:lint` — Lint and validate OpenAPI docs
- `node export-swagger.js` — Export OpenAPI spec to `swagger.json`

## Testing & Linting

- (Add your test instructions here)
- Swagger/OpenAPI linting is enforced in CI

## Contributing

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [LICENSE](LICENSE).

---

## License

This project is licensed under the MIT License.
