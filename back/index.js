import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Importar configuraciones y rutas
import { db, testConnection } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";

// Configurar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      frameSrc: ["'self'", "https://www.google.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    status: 429,
    message: "Demasiadas solicitudes, intenta de nuevo más tarde"
  }
});
app.use(limiter);

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rutas de autenticación
app.use("/auth", authRoutes);

// Rutas de mensajería
app.use("/messages", messageRoutes);

//Rutas existentes
app.get("/", (req, res) => {
  res.send("¡Hola, mundoo!");
});

// Ruta para obtener todos los alumnos con paginación y filtros
app.get("/alumno", (req, res) => {
  const { page = 1, limit = 20, search = "", carrera = "", estado = "", añoIngreso = "" } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = "SELECT * FROM alumnos WHERE 1=1";
  let params = [];
  
  // Aplicar filtros
  if (search) {
    sql += " AND (nombre LIKE ? OR aPaterno LIKE ? OR aMaterno LIKE ? OR matricula LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (carrera) {
    sql += " AND carrera = ?";
    params.push(carrera);
  }
  
  if (estado) {
    sql += " AND estado = ?";
    params.push(estado);
  }
  
  if (añoIngreso) {
    sql += " AND YEAR(fecha_ingreso) = ?";
    params.push(añoIngreso);
  }
  
  // Agregar paginación
  sql += " ORDER BY nombre ASC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);
  
  db.query(sql, params, (err, result) => {
    if (!err) {
      // Obtener total de registros para paginación
      let countSql = "SELECT COUNT(*) as total FROM alumnos WHERE 1=1";
      let countParams = [];
      
      if (search) {
        countSql += " AND (nombre LIKE ? OR aPaterno LIKE ? OR aMaterno LIKE ? OR matricula LIKE ?)";
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (carrera) {
        countSql += " AND carrera = ?";
        countParams.push(carrera);
      }
      
      if (estado) {
        countSql += " AND estado = ?";
        countParams.push(estado);
      }
      
      if (añoIngreso) {
        countSql += " AND YEAR(fecha_ingreso) = ?";
        countParams.push(añoIngreso);
      }
      
      db.query(countSql, countParams, (err, countResult) => {
        if (!err) {
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
          
          res.send({
            status: 200,
            result,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalRecords: total,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            }
          });
        } else {
          res.send({
            status: 100,
            err: countResult
          });
        }
      });
    } else {
      res.send({
        status: 100,
        err,
      });
    }
  });
});

// Ruta para obtener un alumno por matrícula
app.get("/alumno/traer/:matricula", (req, res) => {
  const { matricula } = req.params;
  const sqlGet = "SELECT * FROM alumnos WHERE matricula = ?";
  db.query(sqlGet, [matricula], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        errNo: err.errno,
        mensaje: err.message,
        codigo: err.code,
      });
    }
  });
});

//Ruta para traer alumnos por nombre
app.get("/alumnos/traer/:nombre", (req, res) => {
  const nombre = req.params.nombre.trim();
  const sqlGet = "SELECT * FROM alumnos WHERE nombre LIKE ?";
  db.query(sqlGet, [`%${nombre}%`], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        err,
      });
    }
  });
});

// Ruta para agregar un nuevo alumno
app.post("/alumno/agregar", (req, res) => {
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
    contraseña,
    foto = null, // Asignar null por defecto si no se proporciona
  } = req.body;

  const sql = `INSERT INTO alumnos (matricula, aPaterno, aMaterno, nombre, sexo, dCalle, dNumero, dColonia, dCodigoPostal, aTelefono, aCorreo, aFacebook, aInstagram, tipoSangre, nombreContacto, telefonoContacto, contrasenha, foto) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
      contraseña,
      foto,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al insertar el alumno:", err);
        res.send({
          status: 100,
          errNo: err.errno,
          mensaje: err.message,
          codigo: err.code,
        });
      } else {
        res.send({
          status: 200,
          result,
        });
      }
    }
  );
});

app.post("/alumno/modificar", (req, res) => {
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
    contraseña,
  } = req.body;

  const sql = `UPDATE alumnos SET aPaterno = ?, aMaterno = ?, nombre = ?, sexo = ?, dCalle = ?, dNumero = ?, dColonia = ?, dCodigoPostal = ?, aTelefono = ?, aCorreo = ?, aFacebook = ?, aInstagram = ?, aTipoSangre = ?, nombreContacto = ?, telefonoContacto = ?, contraseña = ? WHERE matricula = ?`;
  db.query(
    sql,
    [
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
      contraseña,
      matricula,
    ],
    (err, result) => {
      if (err) {
        res.send({
          status: 100,
          errNo: err.errno,
          mensaje: err.message,
          codigo: err.code,
        });
      } else {
        res.send({
          status: 200,
          result,
        });
      }
    }
  );
});

// Ruta para eliminar un alumno por matrícula
app.delete("/alumno/eliminar", (req, res) => {
  const { matricula } = req.body;
  const sql = "DELETE FROM alumnos WHERE matricula = ?";
  db.query(sql, [matricula], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        errNo: err.errno,
        mensaje: err.message,
        codigo: err.code,
      });
    }
  });
});

// Ruta para obtener estadísticas
app.get("/stats", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_alumnos,
      COUNT(CASE WHEN sexo = '1' THEN 1 END) as total_mujeres,
      COUNT(CASE WHEN sexo = '2' THEN 1 END) as total_hombres,
      COUNT(CASE WHEN aTipoSangre = 'O+' THEN 1 END) as tipo_o_positivo,
      COUNT(CASE WHEN aTipoSangre = 'A+' THEN 1 END) as tipo_a_positivo
    FROM alumnos
  `;
  
  db.query(sql, (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        stats: result[0]
      });
    } else {
      res.send({
        status: 100,
        err
      });
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "La ruta no existe"
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: "Error interno del servidor"
  });
});

//Iniciar servidor
app.listen(port, async () => {
  try {
    await testConnection();
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    console.log("⚠️  El servidor se iniciará sin conexión a la base de datos");
    console.log("🔧 Para resolver el problema de conexión:");
    console.log("   1. Verifica que el servidor MySQL esté ejecutándose");
    console.log("   2. Ejecuta: mysqladmin flush-hosts");
    console.log("   3. Verifica las credenciales en config.env");
    console.log(`🚀 Servidor escuchando en http://localhost:${port} (modo limitado)`);
  }
});
