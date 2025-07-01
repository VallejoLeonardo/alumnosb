import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/database.js';

const router = express.Router();

/**
 * @route POST /messages/send
 * @desc Enviar un mensaje a otro alumno
 * @access Private
 */
router.post('/send', authenticateToken, (req, res) => {
  const { destinatarioMatricula, contenido } = req.body;
  const remitenteMatricula = req.user.id;

  if (!destinatarioMatricula || !contenido) {
    return res.status(400).json({
      status: 400,
      message: 'Destinatario y contenido son requeridos'
    });
  }

  // Verificar que el destinatario existe
  const checkDestinatario = 'SELECT matricula FROM alumnos WHERE matricula = ?';
  db.query(checkDestinatario, [destinatarioMatricula], (err, result) => {
    if (err) {
      console.error('Error al verificar destinatario:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor'
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Destinatario no encontrado'
      });
    }

    // Insertar mensaje
    const sql = `INSERT INTO mensajes (remitente_matricula, destinatario_matricula, contenido, fecha_envio) 
                 VALUES (?, ?, ?, NOW())`;

    db.query(sql, [remitenteMatricula, destinatarioMatricula, contenido], (err, result) => {
      if (err) {
        console.error('Error al enviar mensaje:', err);
        return res.status(500).json({
          status: 500,
          message: 'Error al enviar el mensaje'
        });
      }

      res.status(201).json({
        status: 201,
        message: 'Mensaje enviado exitosamente',
        messageId: result.insertId
      });
    });
  });
});

/**
 * @route GET /messages/conversation/:destinatarioMatricula
 * @desc Obtener historial de conversación con un alumno específico
 * @access Private
 */
router.get('/conversation/:destinatarioMatricula', authenticateToken, (req, res) => {
  const { destinatarioMatricula } = req.params;
  const remitenteMatricula = req.user.id;

  const sql = `
    SELECT 
      m.*,
      r.nombre as remitente_nombre,
      r.aPaterno as remitente_apellido,
      d.nombre as destinatario_nombre,
      d.aPaterno as destinatario_apellido
    FROM mensajes m
    JOIN alumnos r ON m.remitente_matricula = r.matricula
    JOIN alumnos d ON m.destinatario_matricula = d.matricula
    WHERE (m.remitente_matricula = ? AND m.destinatario_matricula = ?)
       OR (m.remitente_matricula = ? AND m.destinatario_matricula = ?)
    ORDER BY m.fecha_envio ASC
  `;

  db.query(sql, [remitenteMatricula, destinatarioMatricula, destinatarioMatricula, remitenteMatricula], (err, result) => {
    if (err) {
      console.error('Error al obtener conversación:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener la conversación'
      });
    }

    res.json({
      status: 200,
      conversation: result
    });
  });
});

/**
 * @route GET /messages/inbox
 * @desc Obtener bandeja de entrada del usuario autenticado
 * @access Private
 */
router.get('/inbox', authenticateToken, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const destinatarioMatricula = req.user.id;

  const sql = `
    SELECT 
      m.*,
      r.nombre as remitente_nombre,
      r.aPaterno as remitente_apellido,
      r.aMaterno as remitente_apellido_materno
    FROM mensajes m
    JOIN alumnos r ON m.remitente_matricula = r.matricula
    WHERE m.destinatario_matricula = ?
    ORDER BY m.fecha_envio DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [destinatarioMatricula, parseInt(limit), offset], (err, result) => {
    if (err) {
      console.error('Error al obtener bandeja de entrada:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener la bandeja de entrada'
      });
    }

    // Obtener total de mensajes para paginación
    const countSql = 'SELECT COUNT(*) as total FROM mensajes WHERE destinatario_matricula = ?';
    db.query(countSql, [destinatarioMatricula], (err, countResult) => {
      if (err) {
        console.error('Error al contar mensajes:', err);
        return res.status(500).json({
          status: 500,
          message: 'Error al obtener información de paginación'
        });
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        status: 200,
        messages: result,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

/**
 * @route GET /messages/sent
 * @desc Obtener mensajes enviados por el usuario autenticado
 * @access Private
 */
router.get('/sent', authenticateToken, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const remitenteMatricula = req.user.id;

  const sql = `
    SELECT 
      m.*,
      d.nombre as destinatario_nombre,
      d.aPaterno as destinatario_apellido,
      d.aMaterno as destinatario_apellido_materno
    FROM mensajes m
    JOIN alumnos d ON m.destinatario_matricula = d.matricula
    WHERE m.remitente_matricula = ?
    ORDER BY m.fecha_envio DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [remitenteMatricula, parseInt(limit), offset], (err, result) => {
    if (err) {
      console.error('Error al obtener mensajes enviados:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error al obtener los mensajes enviados'
      });
    }

    // Obtener total de mensajes enviados
    const countSql = 'SELECT COUNT(*) as total FROM mensajes WHERE remitente_matricula = ?';
    db.query(countSql, [remitenteMatricula], (err, countResult) => {
      if (err) {
        console.error('Error al contar mensajes enviados:', err);
        return res.status(500).json({
          status: 500,
          message: 'Error al obtener información de paginación'
        });
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        status: 200,
        messages: result,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMessages: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

/**
 * @route DELETE /messages/:messageId
 * @desc Eliminar un mensaje (solo el remitente puede eliminarlo)
 * @access Private
 */
router.delete('/:messageId', authenticateToken, (req, res) => {
  const { messageId } = req.params;
  const remitenteMatricula = req.user.id;

  const sql = 'DELETE FROM mensajes WHERE id = ? AND remitente_matricula = ?';

  db.query(sql, [messageId, remitenteMatricula], (err, result) => {
    if (err) {
      console.error('Error al eliminar mensaje:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error al eliminar el mensaje'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Mensaje no encontrado o no tienes permisos para eliminarlo'
      });
    }

    res.json({
      status: 200,
      message: 'Mensaje eliminado exitosamente'
    });
  });
});

export default router; 