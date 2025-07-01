# AlumnosB - Sistema de Gestión Universitaria

Sistema completo de gestión de alumnos para instituciones educativas con funcionalidades avanzadas de autenticación, mensajería y administración de datos.

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- **Login tradicional** con matrícula y contraseña
- **Autenticación con Google OAuth 2.0**
- **reCAPTCHA** para verificación de usuario humano
- **JWT (JSON Web Tokens)** para gestión de sesiones
- **Contraseñas encriptadas** con bcrypt
- **Rate limiting** para prevenir ataques
- **Helmet** para headers de seguridad

### 💬 Sistema de Mensajería
- **Bandeja de entrada** con paginación
- **Envío de mensajes** entre alumnos
- **Historial de conversaciones** completo
- **Búsqueda de mensajes** en tiempo real
- **Eliminación de mensajes** con confirmación

### 🎨 Interfaz de Usuario
- **Diseño responsive** para móviles y escritorio
- **Navegación adaptativa** con menú hamburguesa
- **Breadcrumbs** para navegación contextual
- **Páginas de error personalizadas** (404, 500)
- **Accesibilidad WCAG 2.1** implementada

### 📊 Gestión de Alumnos
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Búsqueda avanzada** con filtros múltiples
- **Paginación** para grandes volúmenes de datos
- **Validación de formularios** en cliente y servidor
- **Optimización de consultas** para rendimiento

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **MySQL** como base de datos
- **JWT** para autenticación
- **bcryptjs** para encriptación
- **Google Auth Library** para OAuth
- **Helmet** para seguridad
- **Rate Limiting** para protección

### Frontend
- **React 19** con TypeScript
- **React Bootstrap** para UI
- **React Router** para navegación
- **React Hook Form** para formularios
- **Yup** para validación
- **Axios** para HTTP requests
- **SweetAlert2** para notificaciones
- **React Icons** para iconografía

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **MySQL** (versión 8.0 o superior)
- **Git**

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/AlumnosB.git
cd AlumnosB
```

### 2. Configurar Base de Datos

```sql
-- Ejecutar en MySQL
CREATE DATABASE alumnos;
USE alumnos;

-- Ejecutar el script de la tabla de mensajes
SOURCE back/database/messages_table.sql;
```

### 3. Configurar Variables de Entorno

#### Backend (back/config.env)
```env
# Configuración de Base de Datos
DB_HOST=189.197.187.187
DB_USER=umoodle
DB_PASSWORD=Umoodl@2024$
DB_NAME=alumnos

# Configuración JWT
JWT_SECRET=AlumnosB_SuperSecretKey_2024_$#@!%^&*()
JWT_EXPIRES_IN=24h

# Google OAuth
GOOGLE_CLIENT_ID=tu clave
GOOGLE_CLIENT_SECRET=tu clave

# reCAPTCHA
RECAPTCHA_SITE_KEY=tu clave
RECAPTCHA_SECRET_KEY=tu clave

# Configuración del Servidor
PORT=5000
NODE_ENV=development
```

### 4. Instalar Dependencias

#### Backend
```bash
cd back
npm install
```

#### Frontend
```bash
cd front
npm install
```

## 🚀 Ejecución

### Desarrollo

#### Terminal 1 - Backend
```bash
cd back
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd front
npm start
```

### Producción

#### Backend
```bash
cd back
npm run prod
```

#### Frontend
```bash
cd front
npm run build
```

## 📱 Uso de la Aplicación

### 1. Acceso
- Abrir navegador en `http://localhost:3000`
- Serás redirigido a la página de login

### 2. Autenticación
- **Login tradicional**: Usar matrícula y contraseña
- **Google OAuth**: Hacer clic en "Continuar con Google"
- **reCAPTCHA**: Completar la verificación

### 3. Funcionalidades Principales

#### Gestión de Alumnos
- **Agregar**: Formulario completo con validación
- **Consultar**: Lista con búsqueda y filtros
- **Modificar**: Edición de datos existentes
- **Eliminar**: Eliminación con confirmación

#### Mensajería
- **Bandeja de entrada**: Ver mensajes recibidos
- **Enviar mensaje**: Seleccionar destinatario y escribir
- **Conversaciones**: Historial completo de chat
- **Búsqueda**: Filtrar mensajes por contenido

## 🔒 Configuración de Seguridad

### Google OAuth
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar Google+ API
3. Crear credenciales OAuth 2.0
4. Configurar URIs autorizados

### reCAPTCHA
1. Registrar sitio en [Google reCAPTCHA](https://www.google.com/recaptcha/)
2. Obtener claves pública y privada
3. Configurar en variables de entorno

## 📊 Estructura del Proyecto

```
AlumnosB/
├── back/                          # Backend Node.js
│   ├── config/                    # Configuraciones
│   │   ├── database.js           # Configuración BD
│   │   └── config.env            # Variables de entorno
│   ├── middleware/               # Middlewares
│   │   └── auth.js              # Autenticación JWT
│   ├── routes/                   # Rutas API
│   │   ├── auth.js              # Rutas de autenticación
│   │   └── messages.js          # Rutas de mensajería
│   ├── database/                 # Scripts SQL
│   │   └── messages_table.sql   # Tabla de mensajes
│   ├── index.js                  # Servidor principal
│   └── package.json             # Dependencias backend
├── front/                        # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   └── Navigation.tsx   # Navegación principal
│   │   ├── screens/             # Páginas/Componentes
│   │   │   ├── Login.tsx        # Página de login
│   │   │   ├── Mensajeria.tsx   # Sistema de mensajería
│   │   │   ├── Error404.tsx     # Página error 404
│   │   │   └── Error500.tsx     # Página error 500
│   │   ├── App.tsx              # Componente principal
│   │   └── index.tsx            # Punto de entrada
│   └── package.json             # Dependencias frontend
└── README.md                    # Este archivo
```

## 🧪 Testing

### Backend
```bash
cd back
npm test
```

### Frontend
```bash
cd front
npm test
```

## 📝 API Endpoints

### Autenticación
- `POST /auth/login` - Login tradicional
- `POST /auth/google` - Login con Google
- `POST /auth/register` - Registro de alumno
- `GET /auth/me` - Obtener usuario actual

### Mensajería
- `POST /messages/send` - Enviar mensaje
- `GET /messages/inbox` - Bandeja de entrada
- `GET /messages/sent` - Mensajes enviados
- `GET /messages/conversation/:id` - Conversación específica
- `DELETE /messages/:id` - Eliminar mensaje

### Alumnos
- `GET /alumno` - Listar alumnos (con filtros)
- `GET /alumno/traer/:id` - Obtener alumno específico
- `POST /alumno/agregar` - Agregar alumno
- `POST /alumno/modificar` - Modificar alumno
- `DELETE /alumno/eliminar` - Eliminar alumno

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar configuración en config.env
# Asegurar que MySQL esté ejecutándose
# Verificar credenciales de acceso
```

### Error de CORS
```bash
# Verificar configuración en index.js
# Asegurar que las URLs estén correctas
```

### Error de Autenticación Google
```bash
# Verificar claves OAuth en Google Cloud Console
# Asegurar que las URIs estén configuradas
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- Bootstrap por el framework CSS
- React por la librería de UI
- Node.js por el runtime de JavaScript
- MySQL por el sistema de base de datos

## 📞 Soporte

Para soporte técnico, contacta a:
- Email: soporte@alumnosb.com
- Teléfono: +52 618 123 4567
- Documentación: [docs.alumnosb.com](https://docs.alumnosb.com)

---

**AlumnosB** - Sistema de Gestión Universitaria Moderno y Seguro 🎓 