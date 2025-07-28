import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Pages
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventRegistrationPage } from '@/pages/EventRegistrationPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MyRegistrationsPage } from '@/pages/MyRegistrationsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventManagementPage } from '@/pages/EventManagementPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route 
            path="events/:id/register" 
            element={
              <ProtectedRoute>
                <EventRegistrationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="registrations" 
            element={
              <ProtectedRoute>
                <MyRegistrationsPage />
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
          <Route path="events" element={<EventManagementPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}