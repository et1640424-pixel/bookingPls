export const CURRENCY = '$'; // поменяйте на нужную валюту

const BASE = import.meta.env.VITE_API_URL ?? '';

// Фото приходят как полный URL или как путь /media/...
export const mediaUrl = (u) => (!u ? '' : u.startsWith('http') ? u : `${BASE}${u}`);
export const list = (d) => (Array.isArray(d) ? d : d?.results ?? []);

const toDate = (d) => (typeof d === 'string' && d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d));
export const formatDate = (d) =>
  d ? toDate(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
export const formatShort = (d) =>
  d ? toDate(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
export const nightsBetween = (a, b) =>
  a && b ? Math.round((toDate(b) - toDate(a)) / 86400000) : 0;

export const money = (n) => `${Number(n).toLocaleString('ru-RU')} ${CURRENCY}`;

// plural(2, ['ночь', 'ночи', 'ночей']) -> 'ночи'
export function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export function initials(u) {
  const full = `${u?.first_name || ''} ${u?.last_name || ''}`.trim();
  const name = full || u?.username || u?.user_name || '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const todayISO = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
