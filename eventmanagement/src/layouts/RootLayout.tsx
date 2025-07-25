import { Outlet } from 'react-router-dom'
import { Header } from '@/components/organisms/Header/Header'
import { Footer } from '@/components/organisms/Footer/Footer'
import { useLogoutMutation } from '@/features/auth/api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { clearAuth } from '@/app/slices/authSlice'

export const RootLayout = () => {
  const dispatch = useAppDispatch()
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      dispatch(clearAuth())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}