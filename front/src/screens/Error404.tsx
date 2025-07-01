import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

const Error404: React.FC = () => {
  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 text-center">
            <Card.Body className="p-5">
              <div className="mb-4">
                <FaExclamationTriangle className="display-1 text-warning mb-3" />
                <h1 className="display-4 fw-bold text-muted">404</h1>
                <h3 className="text-muted mb-3">Página no encontrada</h3>
                <p className="text-muted mb-4">
                  Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
              </div>

              <div className="d-grid gap-2">
                <Link to="/" className="btn btn-primary btn-lg mb-2">
                  <FaHome className="me-2" />
                  Ir al Inicio
                </Link>
                
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => window.history.back()}
                >
                  <FaArrowLeft className="me-2" />
                  Volver Atrás
                </Button>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Si crees que esto es un error, contacta al administrador.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Error404; 