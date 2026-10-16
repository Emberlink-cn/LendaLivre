import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import CatalogPage from '../pages/CatalogPage/CatalogPage'
import CreatorPage from '../pages/CreatorPage/CreatorPage'
import HomePage from '../pages/HomePage/HomePage'
import InventoryPage from '../pages/InventoryPage/InventoryPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import ReadPage from '../pages/ReadPage/ReadPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import WorkPage from '../pages/WorkPage/WorkPage'

export function AppRoutes() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/obra/:workId" element={<WorkPage />} />
        <Route path="/ler/:workId/:chapterId" element={<ReadPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/inventario" element={<InventoryPage />} />
        <Route path="/criador" element={<Navigate to="/criador/gerir" replace />} />
        <Route path="/criador/*" element={<CreatorPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/criar-conta" element={<RegisterPage />} />
        <Route path="/login" element={<Navigate to="/entrar" replace />} />
        <Route path="/register" element={<Navigate to="/criar-conta" replace />} />
        <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
