# Revisión contrato Backend ↔ Frontend Quiniela Mundial 2026

## Alcance aplicado

Se ajustó únicamente la capa de consumo de datos/autenticación del frontend, sin tocar vistas, estilos, layout ni componentes visuales.

Archivos incluidos para reemplazar:

- `src/services/api.js`
- `src/services/useAutoRefresh.js`
- `src/utils/formatters.js`
- `src/context/AuthContext.jsx`

## Problema corregido

El frontend podía quedar sin datos aunque el backend respondiera correctamente porque distintas pantallas esperaban arrays directos, mientras el contrato real del backend devuelve listas bajo `items`.

También se blindó la compatibilidad de campos de pronóstico porque el contrato nuevo usa `homeScore` y `awayScore`, mientras algunas pantallas internas todavía trabajan con `predictedHomeScore` y `predictedAwayScore`.

## Correcciones aplicadas

1. Base URL normalizada para evitar duplicar o perder `/api/v1`.
2. JWT leído principalmente desde `accessToken`, manteniendo compatibilidad con `token`.
3. Login/register no envían token viejo.
4. Todas las respuestas de listas con `{ items: [...] }` se adaptan a arrays para no tocar vistas.
5. Se normalizan predicciones entrantes para que el UI pueda leer tanto:
   - `homeScore` / `awayScore`
   - `predictedHomeScore` / `predictedAwayScore`
6. Las predicciones salientes se envían primero con el contrato nuevo:
   - `homeScore`
   - `awayScore`
7. Si el backend instalado todavía usa el contrato legacy, se hace retry automático con:
   - `predictedHomeScore`
   - `predictedAwayScore`
8. `/leaderboard/me` se resuelve con `/groups` + `/groups/:groupId/my-position` porque el backend real no expone ranking global personal directo.
9. `/groups/:groupId/predictions` se redirige a `/predictions/me/groups/:groupId`.
10. `/sportsdb/events` acepta `mode`, `leagueId`, `season`, `date`, `sport` y `leagueName` según el contrato.
11. `/admin/sync/import-league` acepta `day`, `next`, `past` y `season`.
12. Recarga automática cada 20 minutos mediante `useAutoRefresh`.
13. Si llega `401`, se limpia sesión y se dispara evento interno para mandar al usuario a login.
14. Los errores del backend se normalizan con `message`, `requestId`, `code` y `details`.

## Validación realizada

En instalación local del frontend:

```bash
npm run lint
npm run build
npm run lint
npm run build
```

Resultado:

- Lint: 0 errores, 0 warnings.
- Build: correcto dos veces.

Nota: en este contenedor no está instalado `yarn`, por eso la validación se ejecutó con `npm run`. El proyecto declara Yarn 1.22.22, así que en tu equipo puedes correr los mismos scripts con `yarn lint` y `yarn build`.

## Revisión final si todavía ves listas vacías

Si después de reemplazar estos archivos el frontend sigue mostrando vacío, abre DevTools → Network y revisa una llamada como:

- `/api/v1/matches`
- `/api/v1/groups`
- `/api/v1/predictions/me`

Si el JSON es:

```json
{ "items": [] }
```

entonces el frontend ya está leyendo bien, y el problema es que la base local todavía no tiene datos importados/sembrados.

Para quiniela real, los pronósticos deben usar partidos persistidos de:

```txt
GET /api/v1/matches
```

No eventos externos de:

```txt
GET /api/v1/sportsdb/events
```
