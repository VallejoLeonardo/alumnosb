import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configuración de la base de datos MySQL
 * Utiliza variables de entorno para mayor seguridad
 */
export const db = mysql.createPool({
  host: process.env.DB_HOST || "189.197.187.187",
  user: process.env.DB_USER || "umoodle",
  password: process.env.DB_PASSWORD || "Umoodl@2024$",
  database: process.env.DB_NAME || "alumnos",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Función para probar la conexión a la base de datos
 */
export const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("❌ Error al conectar con la base de datos:", err.message);
        reject(err);
      } else {
        console.log("✅ Conexión a la base de datos establecida exitosamente.");
        connection.release();
        resolve(true);
      }
    });
  });
};

/**
 * Función para ejecutar consultas con promesas
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 */
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}; 