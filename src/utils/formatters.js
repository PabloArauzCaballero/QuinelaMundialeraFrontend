const normalizeArrayItem = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item;

  const homeScore = item.predictedHomeScore ?? item.homeScore;
  const awayScore = item.predictedAwayScore ?? item.awayScore;

  if (homeScore !== undefined || awayScore !== undefined) {
    return {
      ...item,
      homeScore,
      awayScore,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    };
  }

  return item;
};

export const asArray = (value) => {
  if (Array.isArray(value)) return value.map(normalizeArrayItem);
  if (!value || typeof value !== 'object') return [];

  const keys = [
    'items',
    'data',
    'results',
    'rows',
    'matches',
    'predictions',
    'groups',
    'groupPositions',
    'members',
    'leaderboard',
    'rankings',
    'runs',
    'teams',
    'stadiums',
  ];

  for (const key of keys) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested.map(normalizeArrayItem);
    if (nested && typeof nested === 'object') {
      const result = asArray(nested);
      if (result.length > 0) return result;
    }
  }

  return [];
};

export const getErrorInfo = (err, fallback = 'No se pudo completar la operación.') => {
  const details = err?.response?.data?.details || err?.response?.data?.error?.details || [];
  const validationMessage = Array.isArray(details) ? details[0]?.message : null;

  return {
    message: validationMessage || err?.response?.data?.message || err?.response?.data?.error?.message || err?.message || fallback,
    requestId: err?.response?.data?.requestId || err?.response?.headers?.['x-request-id'] || null,
  };
};

export const fullNameOf = (user) => user?.fullName || user?.name || user?.displayName || user?.email || 'Participante';

export const initialsOf = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'QM';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
};

export const phaseLabel = (phase) => {
  const labels = {
    group: 'Fase de Grupos',
    groups: 'Fase de Grupos',
    round_16: 'Octavos',
    round16: 'Octavos',
    quarter_final: 'Cuartos',
    quarter: 'Cuartos',
    semi_final: 'Semifinal',
    semifinal: 'Semifinal',
    third_place: 'Tercer Lugar',
    final: 'Final',
  };
  return labels[phase] || phase || 'Sin fase';
};

export const statusLabel = (status) => {
  const labels = {
    scheduled: 'Programado',
    live: 'En vivo',
    finished: 'Finalizado',
    postponed: 'Pospuesto',
    cancelled: 'Cancelado',
    void: 'Anulado',
  };
  return labels[status] || status || 'Programado';
};

export const formatDateTime = (value, options = {}) => {
  if (!value) return 'Fecha pendiente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha pendiente';
  return date.toLocaleString('es-BO', {
    weekday: options.weekday || 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateKey = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const teamCode = (team) => team?.fifaCode || team?.code || team?.abbreviation || 'TBD';
export const teamName = (team) => team?.name || team?.displayName || teamCode(team);

export const matchTitle = (match) => `${teamCode(match?.homeTeam)} vs ${teamCode(match?.awayTeam)}`;

export const isMatchClosedForPrediction = (match) => {
  if (!match) return true;
  const startsAt = new Date(match.startsAt);
  const hasStarted = match.startsAt && startsAt <= new Date();
  return hasStarted || match.status !== 'scheduled';
};

export const groupByDate = (matches) => matches.reduce((acc, match) => {
  const key = formatDateKey(match.startsAt);
  if (!acc[key]) acc[key] = [];
  acc[key].push(match);
  return acc;
}, {});

export const sortByDate = (items, field = 'startsAt') => [...items].sort((a, b) => new Date(a?.[field] || 0) - new Date(b?.[field] || 0));
