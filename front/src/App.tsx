import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  AlumnosAgregar,
  AlumnosConsultar,
  AlumnoModificar,
  ContenidoA,
  HomeA,
  AlumnoEliminar,
} from "./screens";
import Login from "./screens/Login";
import Mensajeria from "./screens/Mensajeria";
import Error404 from "./screens/Error404";
import Error500 from "./screens/Error500";
import Navigation from "./components/Navigation";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar la aplicación
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="616551878562-vipouo08u4v2o1fasmj0tv8bjp8gqek8.apps.googleusercontent.com">
      <div className="App">
        <BrowserRouter>
          {/* Mostrar Navigation solo si está autenticado y no en /login */}
          {isAuthenticated && window.location.pathname !== '/login' && <Navigation onLogout={handleLogout} />}
          
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/error/500" element={<Error500 />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomeA />
              </ProtectedRoute>
            }>
              <Route index element={<ContenidoA />} />
              <Route path="agregar" element={<AlumnosAgregar />} />
              <Route path="consultar" element={<AlumnosConsultar />} />
              <Route path="modificar" element={<AlumnoModificar />} />
              <Route path="eliminar" element={<AlumnoEliminar />} />
              <Route path="mensajeria" element={<Mensajeria />} />
            </Route>
            
            {/* Ruta 404 - debe ir al final */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </BrowserRouter>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
