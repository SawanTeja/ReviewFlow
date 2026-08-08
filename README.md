# ReviewFlow

A modern, multi-tenant Performance Evaluation Tool where managers can give monthly feedback to their teams across customizable parameters.

## Features

- **Multi-Tenant Architecture**: Supports multiple isolated companies using a single deployment.
- **Dynamic Manager Workflows**: The system infers management structure directly from the database hierarchy. Managers can proactively view their direct reports via the **My Team** dashboard and instantly initiate feedback without waiting for HR provisioning.
- **HR Dashboard & Compliance Tracking**: HR leads can view company-wide statistics, drill down into grouped historical performance data (grouped by employee and review period), and track **Manager Completion Rates** to see exactly which managers have not completed their team evaluations.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `EMPLOYEE`, `HR`, and `ADMIN` users.

## Tech Stack

- **Frontend**: React + Vite (hosted on Vercel)
- **Backend**: Node.js + Express (hosted on Vercel)
- **Database**: PostgreSQL (hosted on Neon), accessed via Knex.js

## Running Locally

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `npm install`
3. Setup your `.env` file with `DATABASE_URL` (Neon Postgres).
4. Run `npm run migrate` to build the schema.
5. Run `npm run seed` to populate the database with test data.
6. Run `npm run dev` to start the server.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install`
3. Run `npm run dev` to start the local Vite server.

## Seed Data & Test Accounts

The seed script (`backend/src/db/seeds/seed.js`) automatically populates two client companies with active users, completed historical feedback, and pending current cycles.

**Universal Password for all accounts**: `password123`

### Ashoka Textiles
- **COO (Admin)**: `coo@ashoka.com`
- **Rohan (HR / Manager)**: `rohan@ashoka.com`
- **Priya (Manager / Employee)**: `priya@ashoka.com`
- **Employees**: `emp1@ashoka.com` through `emp6@ashoka.com`

### Bright Path Consulting
- **Founder (Admin / Manager)**: `founder@brightpath.com`
- **Kavita (HR)**: `kavita@brightpath.com`
- **Employees**: `emp1@brightpath.com` through `emp8@brightpath.com`

*Tip: You can use the Quick Login dropdown on the login page to easily switch between test accounts without typing credentials.*

## Assumptions Made

1. **Implicit Management Hierarchy**: Instead of creating a dedicated `MANAGER` role, management structure is inferred via a self-referential `manager_id` foreign key on the `users` table. Anyone who has direct reports is inherently treated as a manager by the system (e.g., Rohan, Priya, Founder), allowing for infinite layers of hierarchy without complex role management.
2. **Monthly Review Cycle**: Feedback is assigned on a monthly cadence tied to explicit "Review Periods" in the database (e.g. 8/2026). This allows HR to query completion rates for a specific month and ensures historical feedback is immutably snapshotted.
3. **Multi-Tenant Isolation**: The system assumes strict data segregation per company for this SaaS pilot. Users, review periods, and feedback assignments are strictly scoped by `company_id`.
4. **All HR are Employees**: HR personnel (like Kavita) or Admins (like the COO) are inherently part of the company. The UI layout treats them as regular employees first (granting them access to give/receive feedback and view performance history) while granting them additional elevated tabs (HR/Admin) on the sidebar for company management.
