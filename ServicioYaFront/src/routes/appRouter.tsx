import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/Landing/HomePage'
import ServicesCategoryPage from '../pages/ServiciosPage/Serviciocategoriapage'
import RegisterPage from '../pages/Bussiness/registro/Registrobussiness'
import LoginPage from '../pages/Bussiness/Login/login'
import ProtectedRoute from './RutaProtegida'
import DashboardPage from '../pages/Bussiness/Admin/dashboard'
import { AuthProvider } from '../context/AuthContext';
import ServiceDetailPage from '../pages/ServiciosPage/Serviciodetalle'
import ServicesExplorePage from '../pages/Users/Servicios/ServiciosExplorar'

const AppRouter = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios/:categoria" element={<ServicesCategoryPage />} />
        <Route path="/servicio/:id" element={<ServiceDetailPage />} />  {/* <- CAMBIADO */}
        <Route path="/servicios" element={<ServicesExplorePage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/panel" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<div style={{ padding: 32 }}>Página no encontrada</div>} />
      </Routes>


    </AuthProvider>
  )
}

export default AppRouter