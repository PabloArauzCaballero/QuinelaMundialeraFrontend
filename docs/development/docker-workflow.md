# Flujo de Trabajo con Docker y Repositorios Múltiples

## 1. Contexto Multi-Repositorio
En un entorno real, el backend (`QuinelaMundialeraBackend`) y el frontend (`QuinelaMundialeraFrontend`) residen en repositorios de Git remotos independientes. Esto es el estándar de desarrollo para permitir ciclos de lanzamiento autónomos.

Para facilitar la vida del desarrollador, orquestamos todo en un único **Docker Compose** ubicado en la raíz del espacio de trabajo compartido.

## 2. Docker Compose de Desarrollo vs Producción

### En Desarrollo Local (Recomendado para Codificar)
No es recomendable correr el frontend y el backend dentro de contenedores de Docker durante el desarrollo activo. ¿Por qué?
- **Recompilación lenta:** Modificar código obliga a Docker a reinstalar o sincronizar archivos dentro del volumen, lo cual rompe o ralentiza el HMR (Hot Module Replacement) nativo de Vite.
- **Dificultad de Depuración:** Adjuntar debuggers (breakpoints) a procesos dentro de Docker requiere configuraciones de puertos extras complejas.

**Flujo Híbrido Recomendado:**
1. Levanta únicamente la base de datos PostgreSQL en Docker:
   ```bash
   docker compose up db -d
   ```
2. Corre el backend localmente en tu terminal:
   ```bash
   yarn start:dev
   ```
3. Corre el frontend localmente en otra terminal:
   ```bash
   npm run dev
   ```

### En Integración Continua (CI/CD) y Pruebas
Cuando quieras emular el comportamiento final en producción o correr pruebas automatizadas E2E:
1. Asegúrate de detener los procesos locales de los puertos 3000 y 5173.
2. Construye e inicializa todo el stack orquestado:
   ```bash
   docker compose up --build -d
   ```
3. Docker Compose compilará el frontend estático, lo inyectará en Nginx, y correrá el NestJS apuntando al contenedor de base de datos en la red interna (`db:5432`).
4. Para apagar todo el stack y limpiar volúmenes:
   ```bash
   docker compose down -v
   ```
