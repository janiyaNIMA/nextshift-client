# NextShift Client

A modern Material-UI (MUI) frontend for the **NextShift** Campus Part-time Job Marketplace, built strictly according to the API specification in [`ref/FRONTEND_API_HANDOFF.md`](./ref/FRONTEND_API_HANDOFF.md).

## Features

- **MUI Component System**: Built with `@mui/material` and `@mui/icons-material`, themed with responsive layouts, styled cards, modals, and snackbar notifications.
- **Role-Based Experience**:
  - **Public / Unauthenticated**: Browse published shifts, filter by category/location, search by keywords, view job details.
  - **Student**: Sign up (instant approval), book open shifts, manage confirmed bookings under "My Bookings".
  - **Employer**: Register (requires admin approval), view approval banner, create shift vacancies, view applicants/bookings per job.
  - **Admin**: Review & approve pending employers and job vacancies in real-time.
- **Backend Health & Diagnostics**:
  - Live backend health indicator (`GET /health`) in the navigation bar.
  - Configurable API Base URL modal (`http://localhost:8000/api/v1` default).
- **FastAPI / Pydantic Error Handling**: Formats both custom domain errors (`detail: string`) and schema validation error arrays (`detail: [{loc, msg}]`).

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

## Quick Test Credentials

The Sign-In dialog includes one-click autofill shortcuts for quick testing:
- **Admin**: `admin@example.com` / `AdminSecurePassword123!`
- **Student**: `student@example.com` / `Student1234!`
- **Employer**: `employer@example.com` / `Employer1234!`
