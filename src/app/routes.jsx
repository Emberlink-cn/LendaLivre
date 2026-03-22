import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import HomePage from '../pages/HomePage/HomePage'
import CatalogPage from '../pages/CatalogPage/CatalogPage'
import ReadPage from '../pages/ReadPage/ReadPage'
import StorePage from '../pages/StorePage/StorePage'
import PremiumPage from '../pages/PremiumPage/PremiumPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/read/:workId"
        element={
          <ProtectedRoute>
            <ReadPage />
          </ProtectedRoute>
        }
      />
      <Route path="/store" element={<StorePage />} />
      <Route path="/premium" element={<PremiumPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

