# Vistas implementadas - Quiniela Mundialera Frontend

Este ajuste incorpora las vistas solicitadas desde los trackers de Stitch, manteniendo la aplicación en React + Vite y conectada al cliente Axios centralizado.

## Rutas públicas

- `/login`: inicio de sesión.
- `/register`: registro de usuario.

## Rutas de jugador

- `/dashboard`: panel principal estilo Command Center.
- `/groups`: mis grupos.
- `/groups/new`: crear grupo o unirse por código.
- `/groups/:groupId`: detalle de grupo.
- `/groups/:groupId/ranking`: clasificación del grupo.
- `/groups/:groupId/predictions`: pronósticos del grupo.
- `/fixture`: calendario de partidos.
- `/calendar`: alias hacia calendario.
- `/matches/:matchId`: detalle de partido.
- `/matches/:matchId/predict`: registrar o modificar pronóstico.
- `/matches/next/predict`: abrir el próximo partido programado para pronosticar.
- `/predictions`: mis pronósticos.
- `/history`: alias hacia mis pronósticos.
- `/ranking`: ranking general por grupos.
- `/map`: mapa de sedes.
- `/profile`: perfil del usuario.

## Rutas administrativas

- `/admin`: panel de administración.
- `/admin/matches`: administración de partidos.
- `/admin/matches/:matchId`: detalle administrativo de partido.
- `/admin/sync-history`: historial de sincronización.

## Consideraciones técnicas

- El diseño se alineó al estilo oscuro/neón tipo Apex Pitch/World Cup 2026 de los prototipos.
- Se agregó `VITE_API_BASE_URL` como variable opcional para configurar la API sin tocar código fuente.
- Se mantienen las rutas existentes para no romper navegación previa.
- `npm run build` y `npm run lint` ejecutan correctamente sin errores ni warnings.
