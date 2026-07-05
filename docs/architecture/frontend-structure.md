# Estructura del Proyecto Frontend

El frontend de **Quiniela Mundial 2026** está construido con **React + Vite**, utilizando **Vanilla CSS + Tailwind CSS** para el diseño visual, y **Axios** para el consumo de la API REST del backend.

## 1. Arquitectura de Archivos

La estructura bajo `src/` sigue patrones modulares y limpios:

```txt
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes comunes e interactivos
│   ├── Layout.jsx           # Sidebar + BottomNavBar + Header
│   └── ProtectedRoute.jsx   # Guardián de navegación y roles
├── context/         # Estado global de React
│   └── AuthContext.jsx      # Contexto de autenticación, JWT y sesión
├── pages/           # Vistas principales ruteadas
│   ├── Admin.jsx            # Panel de control de administradores
│   ├── Dashboard.jsx        # Estadísticas y predicciones pendientes
│   ├── Fixture.jsx          # Calendario de partidos y modal de pronósticos
│   ├── Groups.jsx           # Clasificación de grupos, creación y unión
│   ├── History.jsx          # Historial de apuestas y puntos del usuario
│   ├── Login.jsx            # Formulario de inicio y registro de sesión
│   └── Map.jsx              # Mapa de Leaflet con sedes geográficas
├── services/        # Clientes de red
│   └── api.js               # Cliente Axios global con interceptores y requestId
├── App.jsx          # Enrutamiento de React Router y AuthProvider
├── index.css        # Configuración global de estilos y animaciones
└── main.jsx         # Punto de entrada de renderizado de React
```

## 2. Decisiones de Diseño y Flujo de Datos

### Enrutamiento y Seguridad (`App.jsx` + `ProtectedRoute.jsx`)
- Se utiliza `react-router-dom` para el enrutamiento del lado del cliente.
- Las rutas privadas se envuelven con `ProtectedRoute`. Este componente valida si hay una sesión activa (`user !== null`) y redirige automáticamente a `/login` si no está autenticado.
- Admite restricción por privilegios de administrador mediante el flag `adminOnly`. Si el usuario común intenta acceder a `/admin`, es redirigido a `/dashboard` de forma segura.

### Cliente Axios Centralizado (`src/services/api.js`)
- Configura una instancia global de `axios` con la URL base de la API del backend (`/api/v1`).
- **Interceptor de Peticiones:** Inyecta de manera automática la cabecera `Authorization: Bearer <token>` si existe un token JWT guardado en el `localStorage`.
- **Interceptor de Respuestas:** Si ocurre un error, intercepta y extrae el `requestId` generado por el backend y propaga el mensaje descriptivo en el objeto de error para que la UI muestre la alerta al usuario.

### Estado Global (`AuthContext.jsx`)
- Expone los métodos `login`, `register`, `logout` y el objeto `user`.
- Realiza una validación inicial al cargar la aplicación consultando `/auth/me` para verificar la validez del token en el cliente de forma proactiva.
