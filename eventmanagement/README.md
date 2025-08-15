# EventHub — Modern Event Management Platform

A **production-ready**, **TypeScript-first** React application for creating, discovering, and managing events.  
EventHub delivers a polished user experience with a modular component system, admin capabilities, role/permission-driven UI, real-time notifications, and a modern Vite build powered by **Tailwind CSS** and **Radix UI**.

---

## 📚 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Pages & Flows](#key-pages--flows)
- [State, Data, and API](#state-data-and-api)
- [UI System](#ui-system)
- [Styling & Theming](#styling--theming)
- [Routing, Auth, & Permissions](#routing-auth--permissions)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Useful Scripts](#useful-scripts)
- [Linting & Code Quality](#linting--code-quality)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 📝 Overview
EventHub is a professional platform to:
- Discover featured events and categories
- Register and manage participation
- Create/manage events and categories (**admin**)
- Manage users & view analytics (**admin**)
- Maintain user profiles & view activity
- Receive real-time notifications

The UI is built with **reusable atomic components**, **Radix primitives**, and **consistent design tokens** to ensure **accessibility**, **responsiveness**, and **performance**.

---

## ✨ Features
- ⚛ **React 19 + Vite 7**
- 🛡 **Type-safe data, forms, and UI**
- 🔒 Declarative routing & protected routes
- 🧩 Role- & permission-aware rendering
- 🔔 Real-time notifications (SignalR)
- 📊 Admin dashboard & management pages
- 🎨 Rich UI components (cards, tables, forms)
- 🌀 Animations & micro-interactions
- ☁ Azure Static Web Apps workflow

**Key Entry Points**
- App shell & layouts: `src/layouts/RootLayout.tsx`, `DashboardLayout.tsx`, `src/layouts/AuthLayout.tsx`
- Router: `src/router/AppRouter.tsx`, `src/router/ProtectedRoute.tsx`, `src/router/routeConfig.ts`

---

## 🛠 Tech Stack
| Frontend | Styling | State & API | Utilities |
|----------|---------|-------------|-----------|
| React 19 | Tailwind CSS 4 | Redux Toolkit + RTK Query | Zod + React Hook Form |
| TypeScript | Radix UI | Microsoft SignalR | lucide-react icons |
| Vite 7 | Custom Design Tokens | | |

---

## 📂 Project Structure

```bash
src/
  app/ # App-wide store, API base, providers, slices
  assets/ # Static assets
  components/ # Atomic design: atoms, molecules, organisms, UI
  features/ # Domain modules (events, categories, auth, etc.)
  layouts/ # App, dashboard, auth layouts
  lib/ # Shared utilities
  pages/ # Route pages
  router/ # Router setup & guards
  shared/ # Shared components, hooks, types, utils
```  
---

## 📄 Key Pages & Flows

### Public
- **Home:** `HomePage.tsx`
- **Events:** `src/pages/EventsPage.tsx`
- **Event Details:** `EventDetailPage.tsx`
- **Categories:** `src/pages/CategoriesPage.tsx`

### Auth
- **Login:** `src/pages/LoginPage.tsx`
- **Register:** `src/pages/RegisterPage.tsx`
- **Unauthorized:** `src/pages/UnauthorizedPage.tsx`

### User
- **Profile:** `ProfilePage.tsx`
- **My Registrations:** `src/pages/MyRegistrationsPage.tsx`

### Admin
- **Dashboard:** `src/pages/DashboardPage.tsx`
- **Event Management:** `src/pages/EventManagementPage.tsx`, `src/pages/CreateEventPage.tsx`, `src/pages/EventEditPage.tsx`
- **Category Management:** `src/pages/CategoriesManagementPage.tsx`, `src/pages/CreateCategoryPage.tsx`
- **User Management:** `src/pages/UserManagementPage.tsx`

### Fallback
- **Not Found:** `src/pages/NotFoundPage.tsx`

---

## 🔗 State, Data, and API
- **RTK Query base API:** `src/app/api/baseApi.ts`
- **Redux store setup:** `src/app/store/store.ts`
- **Authentication state:** `src/app/slices/authSlice.ts`
- **Notifications state:** `src/app/slices/notificationSlice.ts`

**Domain APIs**
- Events: `src/features/events/api`
- Categories: `src/features/categories/api`
- Registrations: `src/features/registrations/api`
- Auth: `src/features/auth/api`

**Real-Time Notifications**
- SignalR integration with notifications store & dropdown:  
  `src/components/organisms/NotificationDropdown.tsx`

---

## 🎨 UI System
- **Design tokens & CSS variables:** `index.css`
- **Atomic components:** atoms, molecules, organisms in `src/components`
- **UI primitives:** Radix UI components in `src/components/ui`
- **Icons:** via `lucide-react`
- **Animations:** Tailwind + custom utilities

---

## 🎨 Styling & Theming
- Tailwind CSS v4 with layered styles:
  - **Base tokens & themes:** `index.css`
  - **Components layer:** `@layer components`
  - **Utilities & animations:** `@layer utilities`
- Light/dark-friendly tokens
- Consistent spacing, shadows, gradients

---

## 🔐 Routing, Auth, & Permissions
- Router: `src/router/AppRouter.tsx`
- Protected routes: `src/router/ProtectedRoute.tsx`
- Role-based UI rendering:
  - Footer admin links via `PermissionGuard`
  - Admin Sidebar in `Sidebar.tsx`
  - Auth actions & notifications in `Header.tsx`
- `useAuth` hook in `src/shared/hooks`

---

## 🚀 Getting Started

### Prerequisites
- Node.js **20+**
- npm **9+** (or compatible)

### Installation
```bash
npm install
```
### Development
```bash
npm run dev
```
### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## ⚙ Environment Variables
Create a .env.local at the root:
```bash
# API base URL
VITE_API_BASE_URL=http://localhost:5000/api

# SignalR hub URL
VITE_SIGNALR_URL=http://localhost:5000/hubs/notifications
```
## 📜 Useful Scripts
| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start Vite dev server                |
| `npm run build`         | Type-check & build production bundle |
| `npm run build:check`   | Build & run post-build check         |
| `npm run build:analyze` | Analyze bundle size                  |
| `npm run preview`       | Preview production build             |
| `npm run lint`          | Run ESLint                           |

## Linting & Code Quality
- ESLint config: `eslint.config.js`
- Type-aware rules
- TypeScript strict mode: `tsconfig.app.json`

## Deployment
Azure Static Web Apps CI/CD
Workflow: .github/workflows/azure-static-web-apps-yellow-river-07f5f4e00.yml

Steps:
1. Configure Azure resources (Static Web App, API if applicable)
2. Set repo secrets (deployment tokens, etc.)
3. Push to the configured branch to trigger CI/CD

Production build option: `dist/`

## 🤝 Contributing
- Use feature branches & conventional commits
- Ensure `npm run lint` passes
- Follow existing UI/UX design patterns
- Use RTK Query endpoints & existing slices
- Update/add types in `src/shared/types`
