QTAX Client Portal – Dev Setup (MVP)

This repo contains the client portal app (separate from the brochure site).
It has:

backend/ – Node/Express + Prisma + Postgres

frontend/ – React + Vite

docker-compose.yml – Postgres for local dev

The main site (static HTML/CSS/JS) lives outside this folder. The “Client Portal” button on the main site points to the portal login.

1) Prerequisites

Node.js 18+

Docker Desktop (recommended)
Or install Postgres locally if you don’t want Docker.

PowerShell is used below. In Git Bash/macOS/Linux, replace copy with cp and backticks with \.

2) Start Postgres (Docker)

From the client-portal folder:

docker compose up -d


Default DB creds (from docker-compose.yml):

user: qtax

pass: qtaxpass

db: qtax_portal

port: 5432

If port 5432 is busy, change it to "5433:5432" in docker-compose.yml and use that port in DATABASE_URL.

3) Backend setup
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev


You should see:

API on http://localhost:4000

Seed the first SUPER_ADMIN (one-time)

Open a new PowerShell window:

Invoke-RestMethod -Method Post http://localhost:4000/auth/seed-super-admin `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"super@qtax1.net","password":"ChangeMe123!"}'


After you confirm you can log in, remove the seed-super-admin route from backend/src/auth/routes.ts so no one can create admins in prod.

4) Frontend setup
cd ../frontend
copy .env.example .env   # make sure it contains:
# VITE_API_BASE_URL=http://localhost:4000

npm install
npm run dev


Vite will print a local URL, typically:

http://localhost:5173/


Open http://localhost:5173/login
 and log in with:

Email: super@qtax1.net

Password: ChangeMe123!

You’ll be redirected to the Admin dashboard (/admin).



7) Common issues & fixes

Docker not found
Install Docker Desktop, restart PowerShell, run docker --version.

docker compose warns “version is obsolete”
Safe to ignore, or remove the version line in docker-compose.yml.

Prisma: schema not found
Ensure the file exists at backend/prisma/schema.prisma.

Prisma relation error
Use the provided schema.prisma with the User.resetTokens and User.businessRoles back-relations.

Port 5432 in use
Change to "5433:5432" in docker-compose.yml and update DATABASE_URL port if needed.

White page at http://localhost:5173/
Ensure frontend/index.html exists and vite.config.ts includes the React plugin:

import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });


Login fails / CORS / 404
Check frontend/.env has VITE_API_BASE_URL=http://localhost:4000 and restart npm run dev.









-------------------------------------------

FOR CLIENT PORTAL TESTING: 
0) Prereqs check (one time)

Docker Desktop is running.

DB is up:

cd client-portal
docker compose up -d


Migrations up to date:

cd backend
npm run prisma:generate
npm run prisma:migrate -- --name add_invite_token

1) Start the backend API
cd client-portal/backend
npm run dev


You should see: API on http://localhost:4000

Leave this terminal open.

2) Start the frontend

Open a new terminal:

cd client-portal/frontend
copy .env.example .env  # if you haven’t
# ensure the file contains: VITE_API_BASE_URL=http://localhost:4000
npm run dev


Vite prints a URL like http://localhost:5173/.

3) Log in as SUPER_ADMIN

Visit http://localhost:5173/login

Email: super@qtax1.net

Password: ChangeMe123!

You should land on /admin.