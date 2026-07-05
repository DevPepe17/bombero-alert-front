# 🚒 Bombero Alert

**Bombero Alert** es una plataforma web académica orientada a la gestión y atención de emergencias del Cuerpo General de Bomberos del Perú.

El sistema permite que los ciudadanos reporten emergencias indicando el tipo de incidente, ubicación exacta, descripción y evidencia fotográfica. Los operadores pueden visualizar los reportes recibidos, asignar unidades y gestionar el ciclo de atención. El administrador dispone de métricas y estadísticas generales del sistema.

---

## 📌 Objetivo del proyecto

Facilitar la comunicación entre los ciudadanos y una central de emergencias, permitiendo registrar incidentes de manera rápida y proporcionar al operador información útil para coordinar la atención y el despacho de unidades.

---

## 👥 Roles del sistema

| Rol | Funciones principales |
|---|---|
| Ciudadano | Registra emergencias y consulta su historial |
| Operador | Gestiona reportes y asigna unidades |
| Administrador | Consulta métricas generales del sistema |

---

## 🧑‍🚒 Funcionalidades del ciudadano

- Registro de una nueva cuenta.
- Verificación de cuenta mediante correo electrónico.
- Inicio y cierre de sesión.
- Recuperación y restablecimiento de contraseña.
- Registro de emergencias.
- Selección del tipo de incidente.
- Obtención de ubicación mediante GPS.
- Ajuste manual de la ubicación desde el mapa.
- Registro de una descripción del incidente.
- Carga de evidencia fotográfica mediante Cloudinary.
- Visualización del historial de reportes.
- Consulta del estado de cada emergencia.
- Visualización del reporte seleccionado en el mapa.
- Visualización de estaciones de bomberos cercanas.
- Interfaz adaptable para computadora, tablet y celular.

---

## 🎧 Funcionalidades del operador

- Monitor de emergencias mediante mapa interactivo.
- Visualización de estaciones de bomberos.
- Bandeja de reportes pendientes.
- Búsqueda de reportes por tipo o descripción.
- Filtrado de emergencias por estado y prioridad.
- Consulta del detalle completo de un ticket.
- Visualización de evidencia fotográfica.
- Asignación de una o varias unidades.
- Cambio del estado de atención.
- Registro del progreso de una emergencia.
- Liberación automática de unidades al resolver o cancelar un reporte.
- Actualización periódica de la bandeja de reportes.

---

## 📊 Funcionalidades del administrador

- Panel de métricas generales.
- Cantidad total de reportes.
- Cantidad de reportes en cola.
- Cantidad de reportes activos.
- Cantidad de reportes pendientes.
- Cantidad de reportes resueltos.
- Cantidad de reportes cancelados.
- Consulta de unidades disponibles.
- Gráfico de reportes por tipo de incidente.
- Distribución de reportes por estado.
- Distribución de reportes por prioridad.
- Visualización de actividad reciente.
- Actualización manual y automática de estadísticas.

---

## 🗺️ Mapas y geolocalización

El proyecto utiliza **Leaflet** y **React Leaflet** para mostrar:

- Ubicación seleccionada por el ciudadano.
- Emergencias registradas.
- Reporte seleccionado en el historial.
- Estaciones del Cuerpo General de Bomberos.
- Información de cada estación mediante ventanas emergentes.
- Monitor operativo de emergencias.

---

## 🖼️ Gestión de imágenes

Las evidencias fotográficas se almacenan mediante **Cloudinary**.

El ciudadano puede:

- Seleccionar una imagen desde su dispositivo.
- Tomar una fotografía desde un celular compatible.
- Visualizar una vista previa.
- Cambiar la evidencia antes de enviar el reporte.
- Enviar la URL de la imagen al backend.

---

## ✉️ Correos electrónicos

El sistema utiliza Gmail SMTP para:

- Verificación de cuentas nuevas.
- Recuperación de contraseña.
- Envío de enlaces temporales.
- Validación de tokens de recuperación.

Los enlaces de restablecimiento tienen un tiempo limitado de validez.

---

## 🛠️ Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Leaflet
- React Leaflet
- Recharts
- Lucide React
- CSS
- Cloudinary

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Gmail SMTP

### Servicios externos

- Vercel
- Render
- Neon PostgreSQL
- Cloudinary
- Gmail

---

## 📁 Repositorios

### Frontend

https://github.com/DevPepe17/bombero-alert-front

### Backend

https://github.com/DevPepe17/bombero-alert-api

---

## ⚙️ Ejecución local del frontend

### Requisitos

- Node.js
- npm
- Backend de Bombero Alert en ejecución

### Clonar el repositorio

```bash
git clone https://github.com/DevPepe17/bombero-alert-front.git
cd bombero-alert-front
```

### Instalar dependencias

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

### Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

---

## ⚙️ Ejecución local del backend

### Requisitos

- Java 21
- Maven
- PostgreSQL

### Clonar el repositorio

```bash
git clone https://github.com/DevPepe17/bombero-alert-api.git
cd bombero-alert-api
```

### Configuración

Configura las variables necesarias para:

- Conexión a PostgreSQL.
- Generación y validación de JWT.
- Envío de correos.
- URL del frontend.
- Credenciales de los servicios externos.

No se deben publicar claves, contraseñas ni secretos dentro del repositorio.

### Ejecutar en Windows

```powershell
.\mvnw.cmd spring-boot:run
```

También se puede ejecutar con:

```bash
mvn spring-boot:run
```

El backend estará disponible normalmente en:

```text
http://localhost:8080
```

---

## 🔐 Seguridad

El sistema cuenta con:

- Autenticación mediante JWT.
- Contraseñas protegidas mediante BCrypt.
- Control de acceso por roles.
- Rutas protegidas en frontend y backend.
- Verificación de correo electrónico.
- Tokens temporales de recuperación.
- Cierre automático de sesión ante respuestas no autorizadas.
- Validación de formularios.
- Protección de variables sensibles mediante archivos de entorno.

---

## 🌐 Despliegue

- **Frontend:** agregar aquí el enlace de Vercel.
- **Backend:** https://bombero-alert-api.onrender.com
- **Base de datos:** Neon PostgreSQL.
- **Almacenamiento de imágenes:** Cloudinary.

---

## 🧪 Pruebas realizadas

Se realizaron pruebas funcionales sobre los siguientes flujos:

- Registro de ciudadanos.
- Verificación de correo.
- Inicio de sesión.
- Recuperación de contraseña.
- Registro de emergencias.
- Carga de evidencia fotográfica.
- Consulta del historial.
- Visualización de estaciones.
- Recepción del reporte en la bandeja del operador.
- Asignación de unidades.
- Cambio de estados.
- Resolución y cancelación de emergencias.
- Liberación de unidades.
- Actualización de estadísticas del administrador.
- Cierre de sesión y protección de rutas.
- Interfaz responsive del módulo ciudadano.

---

## 🚀 Posibles mejoras futuras

- Gestión de operadores desde el panel administrador.
- Actualización en tiempo real mediante WebSocket.
- Notificaciones automáticas para ciudadanos y operadores.
- Paginación de la bandeja de reportes.
- Optimización del endpoint de reportes pendientes.
- Pruebas automatizadas.
- Registro de auditoría.
- Aplicación móvil.
- Seguimiento en tiempo real de unidades.

---

## 👨‍💻 Integrantes

- **Andre** — Desarrollo frontend, integración, mapas, autenticación, mejoras visuales y funcionalidades.
- **Pepe** — Desarrollo y configuración inicial del proyecto.

---

## 📦 Versión

**Bombero Alert v1.0.0**

