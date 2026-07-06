import axios from 'axios';

export const API_REFRESH_INTERVAL_MS = 20 * 60 * 1000;
export const AUTH_UNAUTHORIZED_EVENT = 'quiniela:auth:unauthorized';

const AUTH_TOKEN_KEYS = ['accessToken', 'token', 'quiniela_access_token'];
const INVALID_TOKEN_VALUES = new Set(['undefined', 'null', 'false', 'true', '[object object]']);
const VALID_MATCH_STATUSES = new Set(['scheduled', 'live', 'finished', 'postponed', 'cancelled']);
const VALID_MATCH_PHASES = new Set(['group', 'round_32', 'round_16', 'quarter_final', 'semi_final', 'third_place', 'final']);
const VALID_SOURCES = new Set(['manual', 'thesportsdb']);
const SPORTSDB_EVENT_MODES = new Set(['day', 'next', 'past', 'season']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeBaseURL = (value) => {
  const raw = (value || 'http://localhost:3000/api/v1').trim().replace(/\/+$/, '');
  if (!raw) return 'http://localhost:3000/api/v1';
  if (raw.endsWith('/api/v1')) return raw;
  if (raw.endsWith('/api')) return `${raw}/v1`;
  return `${raw}/api/v1`;
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeToken = (value) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || INVALID_TOKEN_VALUES.has(trimmed.toLowerCase())) return null;

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return normalizeToken(extractAuthToken(parsed));
    } catch {
      return null;
    }
  }

  if (trimmed.toLowerCase().startsWith('bearer ')) {
    const bearerToken = trimmed.slice(7).trim();
    return bearerToken && !INVALID_TOKEN_VALUES.has(bearerToken.toLowerCase()) ? bearerToken : null;
  }

  return trimmed;
};

export const getStoredAuthToken = () => {
  for (const key of AUTH_TOKEN_KEYS) {
    const token = normalizeToken(localStorage.getItem(key));
    if (token) return token;
    localStorage.removeItem(key);
  }

  return null;
};

export const saveAuthToken = (value) => {
  const token = normalizeToken(value);
  if (!token) {
    clearAuthToken();
    return null;
  }

  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
};

export const clearAuthToken = () => {
  for (const key of AUTH_TOKEN_KEYS) localStorage.removeItem(key);
  delete api.defaults.headers.common.Authorization;
};

export const extractAuthToken = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  return normalizeToken(
    payload.accessToken
      || payload.access_token
      || payload.token
      || payload.jwt
      || payload.idToken
      || payload.id_token
      || payload.data?.accessToken
      || payload.data?.access_token
      || payload.data?.token
      || payload.data?.jwt,
  );
};

const extractUser = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  return payload.user || payload.data?.user || payload.profile || payload.data?.profile || null;
};

export const extractAuthUser = extractUser;

const api = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_BASE_URL),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const pathOf = (url) => {
  try {
    const parsed = new URL(String(url || ''), api.defaults.baseURL);
    const base = new URL(api.defaults.baseURL);
    return parsed.pathname.replace(base.pathname, '').replace(/\/+$/, '') || '/';
  } catch {
    return String(url || '').split('?')[0].replace(/\/+$/, '') || '/';
  }
};

const isPublicAuthPath = (url) => ['/auth/login', '/auth/register'].includes(pathOf(url));
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value.trim());
const cleanString = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

const removeAuthorizationHeader = (headers) => {
  if (!headers) return;
  if (typeof headers.delete === 'function') headers.delete('Authorization');
  delete headers.Authorization;
  delete headers.authorization;
};

const setAuthorizationHeader = (headers, token) => {
  if (!headers) return;
  if (typeof headers.set === 'function') {
    headers.set('Authorization', `Bearer ${token}`);
    return;
  }
  headers.Authorization = `Bearer ${token}`;
};

const normalizeScore = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 30) return undefined;
  return parsed;
};

const normalizeDate = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return DATE_ONLY_RE.test(trimmed) ? trimmed : undefined;
};

const normalizeDateTime = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeMatchStatus = (value) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  const aliases = {
    upcoming: 'scheduled',
    pending: 'scheduled',
    in_progress: 'live',
    completed: 'finished',
    complete: 'finished',
    done: 'finished',
    canceled: 'cancelled',
  };
  const status = aliases[normalized] || normalized;
  return VALID_MATCH_STATUSES.has(status) ? status : undefined;
};

const normalizeMatchPhase = (value) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  const aliases = {
    groups: 'group',
    group_stage: 'group',
    round16: 'round_16',
    round_of_16: 'round_16',
    last_16: 'round_16',
    octavos: 'round_16',
    round32: 'round_32',
    round_of_32: 'round_32',
    last_32: 'round_32',
    quarter: 'quarter_final',
    quarterfinal: 'quarter_final',
    quarter_finals: 'quarter_final',
    semifinal: 'semi_final',
    semi: 'semi_final',
    third: 'third_place',
    third_place_match: 'third_place',
  };
  const phase = aliases[normalized] || normalized;
  return VALID_MATCH_PHASES.has(phase) ? phase : undefined;
};

const normalizeSource = (value) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return VALID_SOURCES.has(normalized) ? normalized : undefined;
};

const normalizeSportsDbMode = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  return SPORTSDB_EVENT_MODES.has(normalized) ? normalized : fallback;
};

const compactObject = (value) => {
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, isPlainObject(entry) ? compactObject(entry) : entry])
      .filter(([, entry]) => entry !== undefined && entry !== null && entry !== ''),
  );
};

const sanitizeMatchesQuery = (params = {}) => compactObject({
  phase: normalizeMatchPhase(params.phase),
  status: normalizeMatchStatus(params.status),
  date: normalizeDate(params.date),
  teamId: isUuid(params.teamId) ? params.teamId.trim() : undefined,
  stadiumId: isUuid(params.stadiumId) ? params.stadiumId.trim() : undefined,
  source: normalizeSource(params.source),
  leagueExternalId: cleanString(params.leagueExternalId),
  season: cleanString(params.season),
});

const pickHomeScore = (data = {}) => normalizeScore(data.homeScore ?? data.predictedHomeScore);
const pickAwayScore = (data = {}) => normalizeScore(data.awayScore ?? data.predictedAwayScore);

const sanitizePredictionPayload = (data = {}, { includeMatchId = false, useNewContract = false } = {}) => {
  const homeScore = pickHomeScore(data);
  const awayScore = pickAwayScore(data);

  return compactObject({
    ...(includeMatchId ? { matchId: isUuid(data.matchId) ? data.matchId.trim() : undefined } : {}),
    ...(useNewContract
      ? { homeScore, awayScore }
      : { predictedHomeScore: homeScore, predictedAwayScore: awayScore }),
  });
};

const sanitizeMatchPayload = (data = {}, { mode = 'patch' } = {}) => {
  const payload = compactObject({
    externalId: cleanString(data.externalId),
    homeTeamId: isUuid(data.homeTeamId) ? data.homeTeamId.trim() : undefined,
    awayTeamId: isUuid(data.awayTeamId) ? data.awayTeamId.trim() : undefined,
    stadiumId: isUuid(data.stadiumId) ? data.stadiumId.trim() : undefined,
    source: normalizeSource(data.source),
    leagueExternalId: cleanString(data.leagueExternalId),
    season: cleanString(data.season),
    phase: normalizeMatchPhase(data.phase),
    status: normalizeMatchStatus(data.status),
    startsAt: normalizeDateTime(data.startsAt),
  });

  if (mode === 'create' && !payload.status) payload.status = 'scheduled';
  return payload;
};

const sanitizeBodyForPath = (path, data, method, options = {}) => {
  if (!isPlainObject(data)) return data;

  if (path === '/auth/login') {
    return compactObject({ email: cleanString(data.email), password: data.password });
  }

  if (path === '/auth/register') {
    return compactObject({ name: cleanString(data.name) || cleanString(data.fullName), email: cleanString(data.email), password: data.password });
  }

  if (path === '/users/me') {
    return compactObject({ name: cleanString(data.name) || cleanString(data.fullName), email: cleanString(data.email) });
  }

  if (path === '/groups') {
    return compactObject({ name: cleanString(data.name) });
  }

  if (path === '/groups/join') {
    return compactObject({ invitationCode: cleanString(data.invitationCode)?.toUpperCase() });
  }

  if (path === '/predictions') {
    return sanitizePredictionPayload(data, { includeMatchId: true, useNewContract: options.useNewPredictionContract });
  }

  if (/^\/predictions\/[^/]+$/.test(path)) {
    return sanitizePredictionPayload(data, { useNewContract: options.useNewPredictionContract });
  }

  if (path === '/admin/matches') {
    return sanitizeMatchPayload(data, { mode: 'create' });
  }

  if (/^\/admin\/matches\/[^/]+$/.test(path)) {
    return sanitizeMatchPayload(data, { mode: method === 'post' ? 'create' : 'patch' });
  }

  if (path === '/admin/sync/import-league') {
    return compactObject({
      leagueId: cleanString(data.leagueId),
      season: cleanString(data.season),
      mode: normalizeSportsDbMode(data.mode, 'next'),
      sport: cleanString(data.sport),
      date: normalizeDate(data.date),
    });
  }

  if (path === '/admin/sync/import-world-cup') {
    return compactObject({
      leagueId: cleanString(data.leagueId),
      season: cleanString(data.season),
      mode: normalizeSportsDbMode(data.mode, 'day'),
      date: normalizeDate(data.date),
    });
  }

  return compactObject(data);
};

const sanitizeParamsForPath = (path, params) => {
  if (!isPlainObject(params)) return params;

  if (path === '/matches') return sanitizeMatchesQuery(params);

  if (path === '/sportsdb/leagues') {
    return compactObject({ sport: cleanString(params.sport), country: cleanString(params.country) });
  }

  if (path === '/sportsdb/events') {
    return compactObject({
      mode: normalizeSportsDbMode(params.mode, 'day'),
      leagueId: cleanString(params.leagueId),
      season: cleanString(params.season),
      date: normalizeDate(params.date),
      sport: cleanString(params.sport),
      leagueName: cleanString(params.leagueName),
    });
  }

  if (path === '/sportsdb/world-cup/events') {
    return compactObject({
      mode: normalizeSportsDbMode(params.mode, 'day'),
      leagueId: cleanString(params.leagueId),
      season: cleanString(params.season),
      date: normalizeDate(params.date),
    });
  }

  return compactObject(params);
};

const sanitizeRequestConfig = (config, options = {}) => {
  const path = pathOf(config.url);
  config.params = sanitizeParamsForPath(path, config.params);

  if (isPlainObject(config.data)) {
    config.data = sanitizeBodyForPath(path, config.data, String(config.method || '').toLowerCase(), options);
  } else if (typeof config.data === 'string' && config.data.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(config.data);
      config.data = JSON.stringify(sanitizeBodyForPath(path, parsed, String(config.method || '').toLowerCase(), options));
    } catch {
      // Se deja el body original si no se puede parsear sin riesgo.
    }
  }

  return config;
};

const normalizeErrorPayload = (error) => {
  const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id'] || 'N/A';
  const payload = error.response?.data;
  const backendError = payload?.error;

  if (payload) {
    error.response.data = {
      ...payload,
      requestId,
      message: payload.message || backendError?.message || error.message,
      code: payload.code || backendError?.code,
      details: payload.details || backendError?.details || [],
    };
  } else {
    error.response = { data: { message: error.message, requestId, details: [] } };
  }
};

api.interceptors.request.use(
  (config) => {
    sanitizeRequestConfig(config, { useNewPredictionContract: config.__useNewPredictionContract });

    if (config.skipAuth || isPublicAuthPath(config.url)) {
      removeAuthorizationHeader(config.headers);
      return config;
    }

    const token = getStoredAuthToken();
    if (token) {
      setAuthorizationHeader(config.headers, token);
    } else {
      removeAuthorizationHeader(config.headers);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const unwrapDataEnvelope = (payload) => {
  if (!isPlainObject(payload) || payload.data === undefined) return payload;

  const keys = Object.keys(payload);
  const looksLikeEnvelope = keys.some((key) => ['success', 'message', 'meta', 'pagination', 'requestId'].includes(key))
    || keys.length <= 3
    || Array.isArray(payload.data)
    || isPlainObject(payload.data);

  return looksLikeEnvelope ? payload.data : payload;
};

export function unwrapItems(responseOrPayload) {
  const payload = responseOrPayload?.data !== undefined ? responseOrPayload.data : responseOrPayload;
  if (Array.isArray(payload)) return payload;
  if (!isPlainObject(payload)) return [];
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

export function unwrapData(responseOrPayload) {
  return responseOrPayload?.data !== undefined ? responseOrPayload.data : responseOrPayload;
}

const normalizePrediction = (prediction) => {
  if (!isPlainObject(prediction)) return prediction;

  const homeScore = prediction.predictedHomeScore ?? prediction.homeScore;
  const awayScore = prediction.predictedAwayScore ?? prediction.awayScore;

  return {
    ...prediction,
    homeScore,
    awayScore,
    predictedHomeScore: homeScore,
    predictedAwayScore: awayScore,
  };
};

const normalizeMatch = (match) => {
  if (!isPlainObject(match)) return match;

  return {
    ...match,
    homeTeam: match.homeTeam || match.home || match.localTeam || null,
    awayTeam: match.awayTeam || match.away || match.visitorTeam || null,
    stadium: match.stadium ?? match.venue ?? null,
  };
};

const normalizeDashboard = (dashboard) => {
  if (!isPlainObject(dashboard)) return dashboard;
  const groupPositions = Array.isArray(dashboard.groupPositions) ? dashboard.groupPositions : [];

  return {
    ...dashboard,
    groups: Array.isArray(dashboard.groups) ? dashboard.groups : groupPositions,
    rankings: Array.isArray(dashboard.rankings) ? dashboard.rankings : groupPositions,
    leaderboards: Array.isArray(dashboard.leaderboards) ? dashboard.leaderboards : groupPositions,
    upcomingMatches: Array.isArray(dashboard.upcomingMatches) ? dashboard.upcomingMatches.map(normalizeMatch) : [],
  };
};

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!isPlainObject(payload)) return [];

  const directKeys = [
    'items',
    'results',
    'rows',
    'data',
    'matches',
    'predictions',
    'groups',
    'members',
    'leaderboard',
    'rankings',
    'runs',
    'teams',
    'stadiums',
  ];

  for (const key of directKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (isPlainObject(value)) {
      const nested = extractArrayPayload(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};

const normalizeArrayItemsForPath = (path, items) => {
  if (!Array.isArray(items)) return [];
  if (path === '/matches') return items.map(normalizeMatch);
  if (path === '/predictions/me' || /^\/predictions\/me\/groups\/[^/]+$/.test(path) || /^\/groups\/[^/]+\/predictions$/.test(path)) {
    return items.map(normalizePrediction);
  }
  if (path === '/sportsdb/events' || path === '/sportsdb/world-cup/events') return items.map(normalizeMatch);
  return items;
};

const normalizeResponseDataForPath = (path, payload) => {
  const data = unwrapDataEnvelope(payload);

  const listPaths = [
    '/matches',
    '/teams',
    '/stadiums',
    '/predictions/me',
    '/groups',
    '/admin/sync/runs',
    '/sportsdb/sports',
    '/sportsdb/leagues',
    '/sportsdb/events',
    '/sportsdb/world-cup/events',
  ];

  if (listPaths.includes(path)
    || /^\/groups\/[^/]+\/(leaderboard|members|predictions)$/.test(path)
    || /^\/predictions\/me\/groups\/[^/]+$/.test(path)) {
    return normalizeArrayItemsForPath(path, extractArrayPayload(data));
  }

  if (path === '/dashboard/me') return normalizeDashboard(data);

  if (path === '/groups/join' && isPlainObject(data?.group)) {
    return { ...data.group, group: data.group, membership: data.membership, membershipId: data.membershipId };
  }

  if (/^\/matches\/[^/]+$/.test(path)) return normalizeMatch(isPlainObject(data?.match) ? data.match : data);
  if (/^\/predictions\/[^/]+$/.test(path) || path === '/predictions') return normalizePrediction(data);
  if (/^\/groups\/[^/]+$/.test(path) && isPlainObject(data?.group)) return data.group;
  if ((path === '/auth/me' || path === '/users/me') && isPlainObject(data?.user)) return data.user;

  return data;
};

api.interceptors.response.use(
  (response) => {
    response.data = normalizeResponseDataForPath(pathOf(response.config?.url), response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestPath = pathOf(error.config?.url);

    if (status === 401 && !isPublicAuthPath(requestPath)) {
      clearAuthToken();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    normalizeErrorPayload(error);
    return Promise.reject(error);
  },
);

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPatch = api.patch.bind(api);

const cloneResponse = (response, data, requestedUrl) => ({
  ...response,
  data,
  config: {
    ...response.config,
    url: requestedUrl,
  },
});

const emptyResponse = (requestedUrl, config, data = []) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { ...(config || {}), url: requestedUrl },
});

const buildMyLeaderboard = async (requestedUrl, config) => {
  const groupsResponse = await originalGet('/groups', config);
  const groups = extractArrayPayload(groupsResponse.data);
  const activeGroups = groups.filter((group) => group?.status !== 'inactive' && isUuid(group?.id));

  const positions = await Promise.allSettled(
    activeGroups.map((group) => originalGet(`/groups/${group.id}/my-position`, config)),
  );

  const rows = activeGroups.map((group, index) => {
    const positionData = positions[index].status === 'fulfilled' ? positions[index].value.data : null;
    return {
      groupId: group.id,
      groupName: group.name,
      position: positionData?.position ?? '-',
      points: positionData?.points ?? 0,
      totalPoints: positionData?.points ?? 0,
      predictionsCount: positionData?.predictionsCount ?? 0,
    };
  });

  return cloneResponse(groupsResponse, rows, requestedUrl);
};

const looksLikePredictionValidationError = (error) => {
  if (error.response?.status !== 400) return false;
  const data = error.response?.data || {};
  const detailText = JSON.stringify(data.details || data.error?.details || data.message || data.error?.message || '').toLowerCase();
  return data.code === 'VALIDATION_ERROR'
    || data.error?.code === 'VALIDATION_ERROR'
    || detailText.includes('predictedhomescore')
    || detailText.includes('predictedawayscore')
    || detailText.includes('homescore')
    || detailText.includes('awayscore')
    || detailText.includes('required');
};

const retryWithNewPredictionContract = async (method, url, data, config) => {
  const retryConfig = { ...(config || {}), __useNewPredictionContract: true };
  return method(url, data, retryConfig);
};

api.get = async (url, config) => {
  const path = pathOf(url);
  const groupPredictionsMatch = path.match(/^\/groups\/([^/]+)\/predictions$/);

  if (path === '/leaderboard/me') {
    return buildMyLeaderboard(url, config);
  }

  if (groupPredictionsMatch) {
    const groupId = decodeURIComponent(groupPredictionsMatch[1]);
    if (!isUuid(groupId)) return emptyResponse(url, config);
    return originalGet(`/predictions/me/groups/${groupId}`, config);
  }

  return originalGet(url, config);
};

api.post = async (url, data, config) => {
  const path = pathOf(url);
  try {
    return await originalPost(url, data, config);
  } catch (error) {
    if (path === '/predictions' && looksLikePredictionValidationError(error) && !config?.__useNewPredictionContract) {
      return retryWithNewPredictionContract(originalPost, url, data, config);
    }
    throw error;
  }
};

api.patch = async (url, data, config) => {
  const path = pathOf(url);
  try {
    return await originalPatch(url, data, config);
  } catch (error) {
    if (/^\/predictions\/[^/]+$/.test(path) && looksLikePredictionValidationError(error) && !config?.__useNewPredictionContract) {
      return retryWithNewPredictionContract(originalPatch, url, data, config);
    }
    throw error;
  }
};

export default api;
