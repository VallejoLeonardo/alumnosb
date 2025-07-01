import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Outlet } from "react-router-dom";

function HomeA() {
  return (
    <>
      <Container fluid>
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container>
            <Navbar.Brand href="/">Alumnos B</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <NavDropdown title="Acciones" id="basic-nav-dropdown">
                  <NavDropdown.Item href="agregar">Agregar</NavDropdown.Item>
                  <NavDropdown.Item href="modificar">
                    Modificar
                  </NavDropdown.Item>
                  <NavDropdown.Item href="eliminar">Eliminar</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="consultar">
                    Consultar
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Outlet />
      </Container>
    </>
  );
}

export default HomeA;
