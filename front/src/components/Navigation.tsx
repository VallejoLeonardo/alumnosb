import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Breadcrumb, Button, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';

interface NavigationProps {
  onLogout: () => void;
}

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ReactElement | null;
}

const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  /**
   * Genera breadcrumbs basados en la ruta actual
   */
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Inicio', path: '/', icon: <FaHome /> }
    ];

    let currentPath = '';
    pathnames.forEach((name) => {
      currentPath += `/${name}`;
      
      // Mapear rutas a nombres legibles
      const routeNames: { [key: string]: string } = {
        'agregar': 'Agregar Alumno',
        'consultar': 'Consultar Alumnos',
        'modificar': 'Modificar Alumno',
        'eliminar': 'Eliminar Alumno',
        'mensajeria': 'Mensajería',
        'login': 'Iniciar Sesión',
        'register': 'Registro'
      };

      breadcrumbs.push({
        name: routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1),
        path: currentPath,
        icon: null
      });
    });

    return breadcrumbs;
  };

  /**
   * Maneja el logout
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    onLogout();
    navigate('/login');
  };

  /**
   * Cierra el menú móvil
   */
  const closeMobileMenu = () => {
    setExpanded(false);
  };

  const breadcrumbs = generateBreadcrumbs();

  if (!isAuthenticated) {
    return null; // No mostrar navegación si no está autenticado
  }

  return (
    <>
      {/* Navegación principal */}
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        className="shadow-sm"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            <FaUser className="me-2" />
            AlumnosB
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav">
            {expanded ? <FaTimes /> : <FaBars />}
          </Navbar.Toggle>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" onClick={closeMobileMenu}>
                <FaHome className="me-1" />
                Inicio
              </Nav.Link>
              
              <NavDropdown 
                title="Gestión Alumnos" 
                id="basic-nav-dropdown"
                className="dropdown-menu-dark"
              >
                <NavDropdown.Item as={Link} to="/agregar" onClick={closeMobileMenu}>
                  Agregar Alumno
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/consultar" onClick={closeMobileMenu}>
                  Consultar Alumnos
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/modificar" onClick={closeMobileMenu}>
                  Modificar Alumno
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/eliminar" onClick={closeMobileMenu}>
                  Eliminar Alumno
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/mensajeria" onClick={closeMobileMenu}>
                  <FaEnvelope className="me-2" />
                  Mensajería
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Nav className="ms-auto">
              {user && (
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user.nombre}
                    </span>
                  } 
                  id="user-nav-dropdown"
                  className="dropdown-menu-dark"
                >
                  <NavDropdown.Header>
                    <div className="small">
                      <strong>{user.nombre} {user.apellidos}</strong><br />
                      <span className="text-muted">{user.matricula}</span>
                    </div>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Breadcrumbs */}
      <Container fluid className="bg-light py-2 border-bottom">
        <Breadcrumb className="mb-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <Breadcrumb.Item
              key={index}
              linkAs={Link}
              linkProps={{ to: breadcrumb.path }}
              active={index === breadcrumbs.length - 1}
            >
              {breadcrumb.icon && <span className="me-1">{breadcrumb.icon}</span>}
              {breadcrumb.name}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </Container>
    </>
  );
};

export default Navigation; 