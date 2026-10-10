// Все запросы к Django в одном месте. Авторизация: JWT (access + refresh).
const BASE = import.meta.env.VITE_API_URL ?? ''; // пусто = через прокси Vite
const PREFIX = '/en'; // из-за i18n_patterns в mysite/urls.py

export const getToken = () => localStorage.getItem('access');
export const getRefresh = () => localStorage.getItem('refresh');
export function setTokens(access, refresh) {
  if (!access) {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return;
  }
  localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
}

const LABELS = {
  username: 'Имя пользователя',
  email: 'Email',
  password: 'Пароль',
  phone_number: 'Телефон',
  country: 'Страна',
  first_name: 'Имя',
  last_name: 'Фамилия',
  avatar: 'Фото',
};

// Превращает ошибку DRF в короткий читаемый текст.
function errorText(data, status) {
  if (status === 401) return 'Сессия истекла. Войдите снова.';
  if (!data || typeof data !== 'object') return `Ошибка ${status}`;
  if (data.detail) return String(data.detail);
  const parts = Object.entries(data).map(([key, v]) => {
    const text = Array.isArray(v) ? v.join(' ') : String(v);
    return LABELS[key] ? `${LABELS[key]}: ${text}` : text;
  });
  return parts.join(' ') || `Ошибка ${status}`;
}

// Обновление access-токена по refresh (нужен путь /en/token/refresh/ на бэкенде)
let refreshing = null;
function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return Promise.resolve(false);
  if (!refreshing) {
    refreshing = fetch(`${BASE}${PREFIX}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (r) => {
        if (!r.ok) return false;
        const d = await r.json();
        setTokens(d.access, d.refresh);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function request(path, { method = 'GET', body, auth = false } = {}, retried = false) {
  const headers = {};
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${PREFIX}${path}`, {
      method,
      headers,
      body: !body ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw Object.assign(new Error('Не удалось связаться с сервером'), { status: 0 });
  }

  if (res.status === 401 && auth && !retried && (await refreshAccess())) {
    return request(path, { method, body, auth }, true);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* пустой ответ (например, 204) */
  }
  if (!res.ok) throw Object.assign(new Error(errorText(data, res.status)), { status: res.status });
  return data;
}

export const api = {
  hotels: () => request('/hotel/'),
  hotel: (id) => request(`/hotel/${id}/`),
  rooms: (id) => request(`/hotel/${id}/rooms/`),

  login: (email, password) => request('/login/', { method: 'POST', body: { email, password } }),
  register: (body) => request('/register/', { method: 'POST', body }),
  logout: (refresh) => request('/logout/', { method: 'POST', body: { refresh } }),

  profile: () => request('/profile/', { auth: true }),
  updateProfile: (formData) => request('/profile/', { method: 'PATCH', body: formData, auth: true }),
  deleteProfile: () => request('/profile/', { method: 'DELETE', auth: true }),

  bookings: () => request('/booking/', { auth: true }),
  book: (body) => request('/booking/', { method: 'POST', body, auth: true }),
};
