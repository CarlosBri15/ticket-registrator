# Ticket registrator


# Concept

The business idea is to create an app, or better said, an integrated workflow where the employees can upload a photo of a ticket in any language and capture the data in a uniform way

## MVP

- [ ] Image processing
  - [ ] Uniform image preprocessing
  - [ ] Use already existing OCR model, such as ChatGPT, deepseek (even easyOCR, tesseract...)
  - [ ] Uniform data structure for output
- [ ] Hosting
  - [ ] Deploy image processing in the Lambda server
- [ ] Frontend
  - [ ] User can configure the pipeline
  - [ ] User can upload photos
  - [ ] User can see the caught data
- [ ] Integration
  - [ ] Adapt output data to SAP

## Nice to have
- [ ] Image processing
  - [ ] Complete database with ticket photos in many languages
  - [ ] Fine-tuned model expert in ticket OCR
- [ ] Agent
  - [ ] LLM agent pipeline to classify each item in the ticket
  - [ ] LLM agent judges the belonging of the item to the company
- [ ] Hosting
  - [ ] Split environments
  - [ ] Computing resources for training
  - [ ] Computing resources for inference
- [ ] Integration
  - [ ] WhatsApp, telegram bot for image uploading
  - [ ] Integrate with more popular HR applications
  - [ ] Automatically add data to system database (ask)

# How to Run

## Requirements
- **Docker Desktop** (Recommended for Backend + DB)
- Node.js (v24.13.0) https://nodejs.org/en/download
- npm (comes with Node)

## Install NestJS CLI (once)
To create and run NestJS projects, install the Nest CLI globally:
  - npm install -g @nestjs/cli@latest

## Setup Secrets
1. Create a .env file in the root of the backend folder (same level as docker-compose.yml) with your configuration
2. Define JWT_SECRET, GEMINI_API_KEY, DATABASE_URL=postgres://root:rootpassword@localhost:5432/ticket_registrator and DB_PASSWORD
3. Create a .env file in the root of the frontend folder (same level as package.json) with your configuration
4. Define VITE_API_URL=http://localhost:8080

## Docker Workflow (DB)
This method runs the Database (PostgreSQL) together in containers.
1. Start Database
  - Run: ```docker-compose up -d postgres```
2. Connect to Database (using pgAdmin, DBeaver, or another client)
  - Use connection string: postgres://root:rootpassword@localhost:5432/ticket_registrator
  - (Replace rootpassword with the value from your .env file)
3. Run Database Migrations (Drizzle ORM)
  - From the `backend` folder, run: `npx drizzle-kit push`
  
## Manual Backend Setup (NestJS) (More information on the README.md file in the backend folder)
1. Open a terminal
2. Go to the backend folder:
```bash
cd backend
```
4. Install dependencies (this will install everything listed in package.json):
```bash
npm install
```
4. Start backend server (backend runs on port 4000):
```bash
npm run start:dev
```

## Frontend (React + Vite + Typescript) (More information on the README.md file in the frontend folder)
1. Open a new terminal
2. Go to the frontend folder:
```bash
cd frontend
```
3. Install dependencies (this will install everything listed in package.json):
```bash
npm install
```
4. Start frontend (frontend runs on port 4001):
```bash
npm run dev
```

## Shared
1. Open a new terminal
2. Go to the frontend folder:
```bash
cd shared
```
3. Install dependencies (this will install everything listed in package.json):
```bash
npm install
```
4. Start frontend (frontend runs on port 4001):
```bash
npm run build
```

## Why React, Vite, and TypeScript?

- **React** is used for building the user interface because it makes it easy to create reusable components and manage UI state efficiently.
- **Vite** is used as the development server and build tool because it is fast, modern, and optimized for React. It provides instant reloads and quick builds.
- **TypeScript** is used to add type safety to JavaScript. It helps catch bugs early, improves code readability, and makes the codebase easier to maintain as the project grows.

## Notes
Make sure the backend is running before starting the frontend
The frontend calls the backend at http://localhost:4000

# Backend Architecture (NestJS)

The backend is built with **NestJS**, which follows a **modular architecture**.  
Each feature (domain) is composed of **modules, controllers, and services**.

## Creating a New Feature (Domain)

To generate a new feature (example: `test`), use the NestJS CLI:
  - nest generate module test
  - nest generate controller test
  - nest generate service test
Or all at once using nest generate resource test

## Files that are generated
src/test/
  test.module.ts (groups controllers and services together, registers dependencies, and every feature must have a module)
  test.controller.ts (defines the HTTP routes, handles requests and responses)
  test.service.ts (defines business logic, handles database calls, and it is reused by controllers)
  test.controller.spec.ts   (optional) 
  test.service.spec.ts      (optional)
  These files are used for automated unit tests. Not required to run the app. We can delete these files if we are not doing unit tests

NestJS may also generate :
test/
  app.e2e-spec.ts (optional)
  jest-e2e.json (optional)
These files are used for end-to-end testing (not sure what this means), and we can remove them if needed it.

# Gemini API integration
This project integrates Google Gemini API for AI-powered features.
The Gemini API key is loaded from .env files and MUST NOT BE HARD-CODED OR PUSHED TO VERSION CONTROL
Create .env file in the backend folder

# Authenticcation & security (JWT + Passport + Bcrypt)

## Authentication overview
This project uses JWT (JSON Web Tokens) for authentication and Passport.js for validating user requests.

### Why JWT?
JWT allows the API to verify that a user is logged in and authorized to access protected routes. When user logs in, the API issues a token that is used in every subsequent request (with a duration of a day)

### Technologies used
  - Passport JWT: Handles authentication strategy
  - JWT: Creates secure tokens
  - Bcrypt: Hashes passwords
  - NestJS Guards: Protects routes

## User Flow

### 1.Sign up
  - User creates an account
  - Password is hashed with bcrypt before saving to the database
  - User is saved in PostgreSQL Database
  - Password is never returned in API responses
### 2.Login
  - User logs in using email (or username we need to decide on this) and password
  - Password is compared using bcrypt.
  - If valid, the API returns a JWT token.
### 3.Authentication requests
  - Every protected endpoint requires the token in the Authorization header: Bearer    <JWT_TOKEN>
  - Passport validates the token using the JWT strategy.
  - If valid, the request proceeds.
  - If invalid or expired, the request is rejected with 401 Unauthorized.

## How JWT works
A JWT consists of three parts:
  - header: algorithm + token type.
  - payload: user data
  - signature: ensures token integrity
Token duration configured to 1 day.

## Why authentication is required for each request?
Without authentication, anyone could:
  - read user data.
  - modify user profiles.
  - delete accounts.
  - access sensitive information.
By requiring JWT for every request:
  - Only valid users can access protected endpoints.
  - Each request is verified independently.
  - Sessions are stateless and scalable.