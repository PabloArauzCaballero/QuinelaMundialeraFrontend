# Guía de Desarrollo Local

Esta sección detalla cómo preparar y ejecutar el entorno de desarrollo local del frontend sin Docker.

## 1. Prerrequisitos
- Node.js (versión 20.x recomendada)
- npm (incluido con Node.js)
- Servidor Backend NestJS activo en `http://localhost:3000`

## 2. Instalación de Dependencias
Ejecuta el siguiente comando dentro de la carpeta `QuinelaMundialeraFrontend`:

```bash
npm install
```

## 3. Comandos de Desarrollo

### Iniciar Servidor de Desarrollo (con HMR)
Inicia el servidor local de Vite en `http://localhost:5173`:

```bash
npm run dev
```

### Compilar para Producción
Compila la aplicación en un paquete estático optimizado y minificado dentro de la carpeta `dist/`:

```bash
npm run build
```

## 4. Ejecución de Pruebas con Playwright
El flujo e interfaces pueden ser testeados de manera automática utilizando `playwright-cli`.

1. Asegúrate de tener el dev server del frontend y backend activos.
2. Inicia el navegador simulado:
   ```bash
   playwright-cli open http://localhost:5173/login
   ```
3. Ejecuta comandos interactivos o inspecciona la consola y red para verificar la salud del cliente.
