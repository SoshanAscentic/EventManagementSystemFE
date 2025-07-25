import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { routes } from './routeConfig'

// Pages
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path={routes.events.list} element={<EventsPage />} />
          <Route path={routes.events.detail} element={<EventDetailPage />} />
          <Route path={routes.categories} element={<div>Categories Page (Phase 2)</div>} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<div>Forgot Password (Phase 2)</div>} />
          <Route path="reset-password" element={<div>Reset Password (Phase 2)</div>} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route 
            path={routes.profile.view} 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={routes.profile.edit} 
            element={
              <ProtectedRoute>
                <div>Edit Profile (Phase 2)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path={routes.profile.registrations} 
            element={
              <ProtectedRoute>
                <div>My Registrations (Phase 2)</div>
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="events" element={<div>Admin Events (Phase 2)</div>} />
          <Route path="users" element={<div>Admin Users (Phase 2)</div>} />
          <Route path="categories" element={<div>Admin Categories (Phase 2)</div>} />
        </Route>

        {/* Error Routes */}
        <Route path={routes.unauthorized} element={<UnauthorizedPage />} />
        <Route path={routes.notFound} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={routes.notFound} replace />} />
      </Routes>
    </BrowserRouter>
  )
}