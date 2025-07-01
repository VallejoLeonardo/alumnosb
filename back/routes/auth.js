import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/database.js';
import axios from 'axios';

dotenv.config();

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route POST /auth/login
 * @desc Autenticación con email y contraseña
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { matricula, contraseña, recaptchaToken } = req.body;

    // Validación de datos
    if (!matricula || !contraseña) {
      return res.status(400).json({
        status: 400,
        message: 'Matrícula y contraseña son requeridas'
      });
    }

    // Validar reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({
        status: 400,
        message: 'Token de reCAPTCHA requerido'
      });
    }
    const recaptchaSecret = process.env.RECAPTCHA_SECRET;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;
    const recaptchaRes = await axios.post(verifyUrl);
    if (!recaptchaRes.data.success) {
      return res.status(401).json({
        status: 401,
        message: 'Falló la verificación de reCAPTCHA'
      });
    }

    // Buscar alumno por matrícula
    const sql = 'SELECT * FROM alumnos WHERE matricula = ?';
    db.query(sql, [matricula], async (err, result) => {
      if (err) {
        console.error('Error en consulta:', err);
        return res.status(500).json({
          status: 500,
          message: 'Error interno del servidor'
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          status: 401,
          message: 'Matrícula o contraseña incorrectas'
        });
      }

      const alumno = result[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(contraseña, alumno.contrasenha);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: 'Matrícula o contraseña incorrectas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id: alumno.matricula,
          nombre: alumno.nombre,
          email: alumno.aCorreo,
          role: 'alumno'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 200,
        message: 'Login exitoso',
        token,
        user: {
          matricula: alumno.matricula,
          nombre: alumno.nombre,
          apellidos: `${alumno.aPaterno} ${alumno.aMaterno}`,
          email: alumno.aCorreo
        }
      });
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /auth/google
 * @desc Autenticación con Google OAuth
 * @access Public
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 400,
        message: 'Token de Google requerido'
      });
    }

    // Verificar token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Buscar alumno por email
    const sql = 'SELECT * FROM alumnos WHERE aCorreo = ?';
    db.query(sql, [email], async (err, result) => {
      if (err) {
        console.error('Error en consulta:', err);
        return res.status(500).json({
          status: 500,
          message: 'Error interno del servidor'
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'No se encontró un alumno registrado con este email'
        });
      }

      const alumno = result[0];

      // Generar token JWT
      const jwtToken = jwt.sign(
        {
          id: alumno.matricula,
          nombre: alumno.nombre,
          email: alumno.aCorreo,
          role: 'alumno'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 200,
        message: 'Login con Google exitoso',
        token: jwtToken,
        user: {
          matricula: alumno.matricula,
          nombre: alumno.nombre,
          apellidos: `${alumno.aPaterno} ${alumno.aMaterno}`,
          email: alumno.aCorreo
        }
      });
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /auth/register
 * @desc Registro de nuevo alumno con contraseña encriptada
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const {
      matricula,
      aPaterno,
      aMaterno,
      nombre,
      sexo,
      dCalle,
      dNumero,
      dColonia,
      dCodigoPostal,
      aTelefono,
      aCorreo,
      aFacebook,
      aInstagram,
      aTipoSangre,
      nombreContacto,
      telefonoContacto,
      contraseña
    } = req.body;

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    const sql = `INSERT INTO alumnos (matricula, aPaterno, aMaterno, nombre, sexo, dCalle, dNumero, dColonia, dCodigoPostal, aTelefono, aCorreo, aFacebook, aInstagram, tipoSangre, nombreContacto, telefonoContacto, contrasenha) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db.query(
      sql,
      [
        matricula,
        aPaterno,
        aMaterno,
        nombre,
        sexo,
        dCalle,
        dNumero,
        dColonia,
        dCodigoPostal,
        aTelefono,
        aCorreo,
        aFacebook,
        aInstagram,
        aTipoSangre,
        nombreContacto,
        telefonoContacto,
        hashedPassword
      ],
      (err, result) => {
        if (err) {
          console.error('Error al registrar:', err);
          return res.status(500).json({
            status: 500,
            message: 'Error al registrar el alumno',
            error: err.message
          });
        }

        res.status(201).json({
          status: 201,
          message: 'Alumno registrado exitosamente'
        });
      }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /auth/me
 * @desc Obtener información del usuario autenticado
 * @access Private
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    status: 200,
    user: req.user
  });
});

export default router; 