# Quiniela Mundial 2026 - Cliente Frontend

Este es el cliente web de la **Quiniela Mundial 2026**, una Single Page Application (SPA) moderna, responsiva e interactiva construida con **React** y **Vite**. Permite a los usuarios registrarse, unirse a grupos de apuestas privados, pronosticar marcadores de partidos de la Copa Mundial, consultar clasificaciones en tiempo real y explorar las sedes oficiales en un mapa interactivo.

---

## 🚀 Características Clave

*   **Panel de Control Personal (Bento Grid):** Resumen visual de puntos acumulados, cantidad de grupos, apuestas pendientes y clasificaciones de grupo en tiempo real.
*   **Calendario Dinámico (Fixture):** Consulta y filtrado de partidos por fase, fecha o estado, con modal dinámico para guardar o modificar apuestas con cierre automático al iniciar el juego.
*   **Gestión de Grupos Privados:** Creación de grupos, copia de código de invitación al portapapeles y sistema de clasificación (Leaderboard) ordenado por puntos.
*   **Mapa de Sedes Interactivo:** Renderizado geográfico con **Leaflet** y **OpenStreetMap** (100% gratuito) de los estadios oficiales de USA, México y Canadá con listas de partidos por sede.
*   **Diseño Premium y Responsivo:** Menú lateral inteligente en computadoras de escritorio y barra inferior optimizada para celulares.
*   **Guardián de Rutas (`ProtectedRoute`):** Protección robusta de rutas privadas por token JWT y restricción especial para el rol de administrador (`adminOnly`).
*   **Conexión Centralizada:** Cliente de Axios con interceptor automático para inyectar cabeceras `Authorization` y gestión unificada de alertas mediante `requestId` del backend.
*   **Optimización en Docker:** Configuración de compilación multietapa (*multi-stage*) servida a través de **Nginx** con soporte para redireccionamiento de SPA.

---

## 🛠️ Stack Tecnológico

*   **Núcleo:** React (v18.x) + JavaScript (ES6+)
*   **Herramienta de Construcción:** Vite (v5.x/v8.x)
*   **Enrutamiento:** React Router Dom (v6.x)
*   **Consumo de API:** Axios
*   **Mapa Interactivo:** Leaflet & React Leaflet (OpenStreetMap)
*   **Estilos:** Vanilla CSS + Tailwind CSS
*   **Banderas de Países:** Mapeador dinámico integrado hacia la API gratuita de **FlagCDN**
*   **Pruebas:** Playwright (E2E y pruebas de flujo)

---

## 📁 Estructura del Proyecto

La estructura de archivos de código fuente sigue patrones modulares y ordenados:

```txt
src/
├── assets/          # Imágenes estáticas y logos oficiales
├── components/      # Componentes compartidos y layouts
│   ├── Layout.jsx           # Sidebar lateral, cabecera y barra móvil
│   ├── ProtectedRoute.jsx   # Control de acceso por sesión y roles
│   └── TeamBadge.jsx        # Badge visual con bandera y código de país
├── context/         # Estados globales
│   └── AuthContext.jsx      # Autenticación, JWT, registro y logout
├── pages/           # Vistas principales ruteadas
│   ├── Admin.jsx            # Consola de administración y sincronización
│   ├── Dashboard.jsx        # Bento grid de resumen y predicciones rápidas
│   ├── Fixture.jsx          # Calendario de partidos y modal de apuestas
│   ├── Groups.jsx           # Clasificación de grupos y miembros
│   ├── History.jsx          # Historial comparativo de marcadores y puntos
│   ├── Login.jsx            # Vista unificada de Login y Registro
│   ├── Map.jsx              # Mapa Leaflet de sedes oficiales
│   └── Profile.jsx          # Edición de información del perfil de usuario
├── services/        # Clientes de red y utilidades de terceros
│   ├── api.js               # Cliente Axios configurado con interceptores
│   └── flags.js             # Mapeador de códigos FIFA a códigos ISO de banderas
├── App.jsx          # Declaración de rutas del sistema
├── index.css        # Declaración global de tokens de diseño y tipografías
└── main.jsx         # Punto de entrada de renderizado de React
```

---

## 💻 Configuración de Desarrollo Local

### Prerrequisitos
*   **Node.js** (versión 20.x o superior)
*   **Servidor Backend NestJS** corriendo en `http://localhost:3000`

### 1. Instalación de Dependencias
Ejecuta el siguiente comando dentro del directorio del frontend:
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo (HMR)
Arranca el servidor local de Vite en el puerto `5173`:
```bash
npm run dev
```
Abre en tu navegador `http://localhost:5173/` e inicia sesión.

### 3. Compilación para Producción
Para generar el compilado final optimizado y minificado de producción dentro del directorio `dist/`:
```bash
npm run build
```

---

## 🐳 Despliegue con Docker

Este frontend cuenta con soporte nativo para correr en contenedores Docker de manera aislada o acoplado mediante Docker Compose.

### Ejecución con Docker Compose (Recomendado)
Para levantar todo el ecosistema (PostgreSQL, NestJS y Frontend Nginx) desde la raíz del espacio de trabajo común:
```bash
docker compose up --build -d
```
El frontend se compilará y será expuesto automáticamente en el puerto local **`http://localhost:5173`**.

### ¿Cómo funciona el Dockerfile del Frontend?
El despliegue en contenedores utiliza un archivo `Dockerfile` multietapa:
1.  **Etapa de Construcción (Builder):** Utiliza una imagen ligera de Node para descargar dependencias limpias e implementar la compilación de Vite (`npm run build`).
2.  **Etapa de Servidor (Production):** Utiliza una imagen ligera de **Nginx Alpine**, copia el compilado de la etapa anterior a `/usr/share/nginx/html` y carga el archivo de configuración personalizado `nginx.conf`.
3.  **Soporte SPA:** El archivo `nginx.conf` incluye la regla `try_files $uri /index.html;`, la cual redirige cualquier sub-ruta (como `/dashboard` o `/fixture`) al punto de entrada de React Router, solucionando el bug de error 404 al refrescar pantallas en contenedores.

---

## 🧪 Pruebas con Playwright

Las interfaces y flujos de lógica del frontend pueden verificarse de forma interactiva ejecutando:
```bash
playwright-cli open http://localhost:5173/login
```
Esto abrirá un navegador virtual controlado para que puedas inspeccionar los llamados de red, verificar el estado de localStorage o testear validaciones.

---

## 📄 Documentación Adicional
Para más detalles sobre la arquitectura de datos y los flujos técnicos, consulta los siguientes archivos en la carpeta del espacio de trabajo:
*   [Estructura y Flujos Técnicos (Full-Stack)](../docs/functional-flows.md): Detalla el paso a paso técnico (Trigger ➔ API ➔ Backend ➔ DB ➔ UI) de cada una de las 19 funcionalidades del brief.
*   [Arquitectura del Frontend](./docs/architecture/frontend-structure.md): Decisiones de desarrollo del lado del cliente.
*   [Guía de Flujos de UI](./docs/architecture/user-flows.md): Diagramas de secuencia y Mermaid de los casos de uso implementados.
