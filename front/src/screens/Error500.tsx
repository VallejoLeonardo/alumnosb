import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaHome, FaRedo } from 'react-icons/fa';

const Error500: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 text-center">
            <Card.Body className="p-5">
              <div className="mb-4">
                <FaExclamationCircle className="display-1 text-danger mb-3" />
                <h1 className="display-4 fw-bold text-muted">500</h1>
                <h3 className="text-muted mb-3">Error del Servidor</h3>
                <p className="text-muted mb-4">
                  Lo sentimos, ha ocurrido un error interno en el servidor. 
                  Nuestro equipo técnico ha sido notificado.
                </p>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="mb-2"
                  onClick={handleRefresh}
                >
                  <FaRedo className="me-2" />
                  Intentar de Nuevo
                </Button>
                
                <Link to="/" className="btn btn-outline-secondary btn-lg">
                  <FaHome className="me-2" />
                  Ir al Inicio
                </Link>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Si el problema persiste, contacta al administrador del sistema.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Error500; 