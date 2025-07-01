import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { FaEnvelope, FaPaperPlane, FaSearch, FaTrash, FaUser } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';

interface Message {
  id: number;
  remitente_matricula: string;
  destinatario_matricula: string;
  contenido: string;
  fecha_envio: string;
  leido: boolean;
  remitente_nombre?: string;
  remitente_apellido?: string;
  destinatario_nombre?: string;
  destinatario_apellido?: string;
}

interface Conversation {
  id: number;
  remitente_matricula: string;
  destinatario_matricula: string;
  contenido: string;
  fecha_envio: string;
  remitente_nombre: string;
  remitente_apellido: string;
  destinatario_nombre: string;
  destinatario_apellido: string;
}

const Mensajeria: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Configurar axios con token
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    loadInbox();
  }, [currentPage]);

  /**
   * Carga la bandeja de entrada
   */
  const loadInbox = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/messages/inbox?page=${currentPage}&limit=10`);
      if (response.data.status === 200) {
        setMessages(response.data.messages);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error al cargar bandeja de entrada:', error);
      setError('Error al cargar los mensajes');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carga una conversación específica
   */
  const loadConversation = async (destinatarioMatricula: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/messages/conversation/${destinatarioMatricula}`);
      if (response.data.status === 200) {
        setConversation(response.data.conversation);
        setSelectedUser(destinatarioMatricula);
        setShowConversation(true);
      }
    } catch (error: any) {
      console.error('Error al cargar conversación:', error);
      setError('Error al cargar la conversación');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envía un nuevo mensaje
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setIsLoading(true);
    try {
      const response = await api.post('/messages/send', {
        destinatarioMatricula: selectedUser,
        contenido: newMessage
      });

      if (response.data.status === 201) {
        setNewMessage('');
        // Recargar conversación
        await loadConversation(selectedUser);
        
        Swal.fire({
          title: '¡Mensaje enviado!',
          text: 'Tu mensaje se ha enviado exitosamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      setError('Error al enviar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Elimina un mensaje
   */
  const deleteMessage = async (messageId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/messages/${messageId}`);
        if (response.data.status === 200) {
          // Recargar mensajes
          await loadInbox();
          
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El mensaje ha sido eliminado',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error: any) {
        console.error('Error al eliminar mensaje:', error);
        setError('Error al eliminar el mensaje');
      }
    }
  };

  /**
   * Maneja el cambio de página
   */
  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Filtra mensajes por término de búsqueda
   */
  const filteredMessages = messages.filter(message => 
    message.remitente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.remitente_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">
            <FaEnvelope className="me-2" />
            Mensajería
          </h2>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        {/* Bandeja de entrada */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Bandeja de Entrada</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={loadInbox}
                  disabled={isLoading}
                >
                  <FaSearch className="me-1" />
                  Actualizar
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {filteredMessages.map((message) => (
                    <ListGroup.Item
                      key={message.id}
                      action
                      onClick={() => loadConversation(message.remitente_matricula)}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">
                          {message.remitente_nombre} {message.remitente_apellido}
                        </div>
                        <div className="text-muted small">
                          {message.contenido.substring(0, 50)}...
                        </div>
                        <small className="text-muted">
                          {formatDate(message.fecha_envio)}
                        </small>
                      </div>
                      <div>
                        {!message.leido && (
                          <Badge bg="primary" className="me-2">
                            Nuevo
                          </Badge>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <ReactPaginate
                    previousLabel="Anterior"
                    nextLabel="Siguiente"
                    pageCount={totalPages}
                    onPageChange={handlePageChange}
                    containerClassName="pagination"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    activeClassName="active"
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Conversación */}
        <Col lg={8}>
          {showConversation ? (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Conversación con {conversation[0]?.remitente_nombre} {conversation[0]?.remitente_apellido}
                  </h5>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowConversation(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="conversation-container" style={{ height: '400px', overflowY: 'auto' }}>
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 ${
                        msg.remitente_matricula === user.matricula ? 'text-end' : 'text-start'
                      }`}
                    >
                      <div
                        className={`d-inline-block p-3 rounded ${
                          msg.remitente_matricula === user.matricula
                            ? 'bg-primary text-white'
                            : 'bg-light'
                        }`}
                        style={{ maxWidth: '70%' }}
                      >
                        <div className="small mb-1">
                          {msg.remitente_matricula === user.matricula ? 'Tú' : `${msg.remitente_nombre} ${msg.remitente_apellido}`}
                        </div>
                        <div>{msg.contenido}</div>
                        <div className="small mt-1 opacity-75">
                          {formatDate(msg.fecha_envio)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Escribe tu mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                  >
                    <FaPaperPlane className="me-2" />
                    Enviar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center py-5">
                <FaUser className="display-1 text-muted mb-3" />
                <h5>Selecciona una conversación</h5>
                <p className="text-muted">
                  Haz clic en un mensaje de la bandeja de entrada para ver la conversación
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Mensajeria; 