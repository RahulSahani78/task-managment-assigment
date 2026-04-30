# Team Task Management Web Application

A full-stack collaborative task manager (think simplified Trello / Asana). Users sign up, create projects, invite teammates, assign tasks, and track progress. Project creators are Admins; they can manage members and tasks. Members can view their projects and update tasks assigned to them.

## Stack

- **Frontend** — React 18 + Vite + React Router + Axios (vanilla CSS, no UI lib)
- **Backend** — Node.js + Express + Mongoose
- **Database** — MongoDB Atlas
- **Auth** — JWT (Bearer tokens, bcrypt-hashed passwords)
- **Deployment** — Railway (backend + frontend as separate services)

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/db.js               # MongoDB connection
│   │   ├── models/                    # User, Project, Task
│   │   ├── controllers/               # auth, project, task, dashboard
│   │   ├── middleware/                # auth, role, validate, error
│   │   ├── routes/                    # /api/auth, /api/projects, /api/tasks, /api/dashboard
│   │   ├── utils/generateToken.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── railway.json
└── frontend/
    ├── src/
    │   ├── api/client.js              # axios instance + interceptors
    │   ├── context/AuthContext.jsx
    │   ├── components/                # Navbar, ProtectedRoute, Modal, TaskForm, TaskRow
    │   ├── pages/                     # Login, Signup, Dashboard, Projects, ProjectDetail, MyTasks
    │   ├── styles/global.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── railway.json
```

## Features

### Authentication
- Signup (name, email, password) — passwords hashed with bcrypt
- Login returns a JWT (default expiry 7d)
- Bearer-token-protected routes; token stored in `localStorage`
- 401 responses auto-redirect to `/login`

### Projects
- Any logged-in user can create a project (creator becomes Admin)
- Admins can edit/delete the project, add/remove members, change member roles
- Members appear in projects they belong to and can view all project data
- The original creator cannot be removed or demoted

### Tasks
- Title, description, due date, priority (Low/Medium/High), status (To Do / In Progress / Done)
- Created by Admins only; assignable to any project member
- Filtering by status / priority / assignee
- Members can update **status** of their own assigned tasks
- Admins can edit any field on any task and delete tasks
- Overdue tasks (past due date and not Done) are highlighted

### Dashboard
- Total tasks across the user's projects
- Counts per status, overdue count, project count
- Tasks-per-user breakdown (assignee vs. unassigned, total + done)

### Role-based access
- `protect` middleware verifies JWT
- `loadProject` + `requireProjectMember` / `requireProjectAdmin` enforce per-project roles
- Task update logic in the controller enforces "members can only update assigned tasks"

## API reference

All routes are JSON. Authenticated routes need `Authorization: Bearer <token>`.

### Auth
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/api/auth/signup` | – | `{ name, email, password }` | Returns `{ user, token }` |
| POST | `/api/auth/login` | – | `{ email, password }` | Returns `{ user, token }` |
| GET | `/api/auth/me` | ✓ | – | Current user |
| GET | `/api/auth/users?q=` | ✓ | – | List users (member picker) |

### Projects
| Method | Path | Role |
|---|---|---|
| GET | `/api/projects` | member |
| POST | `/api/projects` | any |
| GET | `/api/projects/:projectId` | member |
| PUT | `/api/projects/:projectId` | admin |
| DELETE | `/api/projects/:projectId` | admin |
| POST | `/api/projects/:projectId/members` | admin |
| PATCH | `/api/projects/:projectId/members/:userId` | admin |
| DELETE | `/api/projects/:projectId/members/:userId` | admin |

### Tasks
| Method | Path | Role |
|---|---|---|
| GET | `/api/projects/:projectId/tasks` | member |
| POST | `/api/projects/:projectId/tasks` | admin |
| GET | `/api/tasks/mine` | auth |
| GET | `/api/tasks/:id` | member of project |
| PUT | `/api/tasks/:id` | admin OR assignee (status only) |
| DELETE | `/api/tasks/:id` | admin |

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard?projectId=` | Aggregated stats; defaults to all the user's projects |

### Health
- `GET /api/health` — uptime check (no auth)

## Local development

### 1. Backend
```bash
cd backend
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                 # nodemon, port 5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # vite, port 5173
```

Open http://localhost:5173.

## Deployment on Railway

Deploy the backend and frontend as **two separate services** in the same Railway project.

### Backend service
- **Root directory**: `backend`
- **Build command**: (auto — Nixpacks runs `npm install`)
- **Start command**: `npm start`
- **Environment variables**:
  ```
  NODE_ENV=production
  MONGO_URI=<your MongoDB Atlas connection string>
  JWT_SECRET=<long random string>
  JWT_EXPIRES_IN=7d
  CLIENT_ORIGIN=https://<your-frontend-domain>.up.railway.app
  ```
- **Generate domain** in Railway → note the public URL (e.g. `https://team-task-api.up.railway.app`).

### Frontend service
- **Root directory**: `frontend`
- **Build command**: `npm install && npm run build`
- **Start command**: `npm run preview -- --port $PORT --host 0.0.0.0`
- **Environment variables**:
  ```
  VITE_API_URL=https://<your-backend-domain>.up.railway.app/api
  ```
- **Generate domain**.
- After deploying, copy this domain back into the backend's `CLIENT_ORIGIN` so CORS allows it.

> Vite reads `VITE_*` vars at **build time**, so set `VITE_API_URL` *before* the first build (or trigger a redeploy after changing it).

### MongoDB Atlas
- Create a cluster, add a database user, and in **Network Access** allow `0.0.0.0/0` (Railway's egress IPs are dynamic).
- The connection string goes into `MONGO_URI`.

## Security notes
- Always rotate any database credentials that have been shared publicly.
- Use a strong `JWT_SECRET` (e.g. `openssl rand -hex 32`) in production.
- Restrict `CLIENT_ORIGIN` to your actual frontend domain — leaving it empty allows any origin.
- The backend uses `helmet` for sensible default headers and `express.json` with a 1MB limit.

## Testing the flow
1. Sign up two users in different browsers/sessions.
2. User A creates a project — they're the Admin.
3. User A adds User B by email.
4. User A creates a task and assigns it to User B.
5. User B sees the task in **My Tasks** and changes its status to *In Progress* / *Done*.
6. Both users see counts update on the **Dashboard**.
