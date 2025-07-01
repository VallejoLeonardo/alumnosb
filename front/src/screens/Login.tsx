import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaShieldAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ReCAPTCHA from 'react-google-recaptcha';

// Esquema de validación con Yup
const loginSchema = yup.object({
  matricula: yup
    .string()
    .required('La matrícula es requerida')
    .min(5, 'La matrícula debe tener al menos 5 caracteres')
    .max(20, 'La matrícula no puede exceder 20 caracteres'),
  contraseña: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
}).required();

type LoginFormData = {
  matricula: string;
  contraseña: string;
};

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    if (!recaptchaToken) {
      setError('Por favor, verifica el reCAPTCHA.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { ...data, recaptchaToken });
      
      if (response.data.status === 200) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/auth/google', {
        token: credentialResponse.credential
      });
      
      if (response.data.status === 200) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Inicio de sesión con Google exitoso',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Error al iniciar sesión con Google');
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <FaUser className="text-primary mb-3" size={48} />
                <h2 className="fw-bold text-dark">Iniciar Sesión</h2>
                <p className="text-muted">Accede a tu cuenta de AlumnosB</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Matrícula
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu matrícula"
                    {...register('matricula')}
                    isInvalid={!!errors.matricula}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.matricula?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    {...register('contraseña')}
                    isInvalid={!!errors.contraseña}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contraseña?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="mb-3 d-flex justify-content-center">
                  <ReCAPTCHA
                    sitekey="6Le8z3ErAAAAACvsZixJp1oOOFUbJyrTsjAJ0UlL"
                    onChange={(token: string | null) => setRecaptchaToken(token)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <FaUser className="me-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mb-3">
                <span className="text-muted">o</span>
              </div>

              <div className="d-grid mb-3">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>

              <div className="text-center">
                <small className="text-muted">
                  <FaShieldAlt className="me-1" />
                  Tus datos están protegidos con encriptación SSL
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 