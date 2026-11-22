# NextShift Client

NextShift Client is a React frontend for the NextShift campus part-time job marketplace. It connects to the NextShift backend and provides role-based interfaces for students, employers, and administrators.

## Features

- **Authentication** with email and password; the access token is stored in browser local storage.
- **Job listings** with category and location filters, keyword search, and job details.
- **Student dashboard** for viewing and managing bookings.
- **Employer dashboard** for creating jobs and reviewing applicants.
- **Admin dashboard** for reviewing pending employers and jobs.
- **Backend health status** with a connection check from the navigation bar and settings dialog.
- **API settings** for overriding the backend URL in the current browser.
- **Material UI** components, responsive layouts, and shared theme styling.

## Technology

- React 19
- Vite 8
- Material UI
- JavaScript ES modules

## Getting Started

Install Node.js and npm, then install the locked dependencies:

```bash
npm ci --legacy-peer-deps
```

The legacy peer-dependency option is needed for the current dependency versions, which declare incompatible Material UI peer ranges.

Start the development server:

```bash
npm run dev
```

Vite prints the local URL when the server starts (typically `http://localhost:5173`).

## Backend Configuration

The default backend URL is configured at the top of [`vite.config.js`](./vite.config.js):

```js
const API_BASE_URL = 'http://10.123.111.78:8080'
```

Set this to the backend origin only: do not include `/api/v1` or a trailing slash. The frontend adds `/api/v1` to API requests and uses `/health` for the health check. Vite also derives its development proxy target from this URL.

Restart the Vite development server after changing the value.

The settings dialog can save a browser-specific URL override. That saved value takes precedence over the Vite default. Select **Reset to Default** in the dialog to use the configured URL again. The override is stored in local storage under `nextshift_api_base_url`.

Because the browser connects directly to the configured backend origin, the backend must allow the frontend's origin through its CORS configuration.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for a preview. Run `npm run build` first. |
| `npm run lint` | Run Oxlint on the project. |

There is currently no test script configured in `package.json`.

## Application Structure

```text
src/
  App.jsx                 App shell, role-based navigation and page selection
  main.jsx                React entry point
  theme.js                Material UI theme
  components/
    AuthLoginPage.jsx     Sign-in page
    Navbar.jsx            Navigation, health status and settings entry
    JobsList.jsx          Published jobs
    StudentBookings.jsx  Student booking management
    EmployerDashboard.jsx Employer job and applicant tools
    AdminDashboard.jsx    Admin review tools
    SettingsModal.jsx     Backend URL and health settings
  context/
    AuthContext.jsx       Authentication, user and health state
    useAuth.js            Auth context hook
  services/
    api.js                Backend requests, token and API URL storage
  index.css               Global styles
```

## API and Authentication

The API client in [`src/services/api.js`](./src/services/api.js) sends resource requests under `/api/v1` and checks backend health at `/health`. The backend endpoint and payload contract is documented in [`ref/FRONTEND_API_HANDOFF.md`](./ref/FRONTEND_API_HANDOFF.md).

Authenticated API calls include the stored access token as a Bearer token. The token is saved in browser local storage under `nextshift_access_token`; signing out removes it. On startup, the app checks backend health and restores the current profile when a token exists.

Access to student, employer, and admin areas depends on the signed-in user's backend role. The backend remains responsible for authorization and approval rules.
