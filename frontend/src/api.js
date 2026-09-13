const TOKEN_KEY = 'booking_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  rooms: () => request('/rooms'),
  myBookings: () => request('/bookings/my'),
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  busySlots: (roomId, date) => request(`/bookings/busy?room_id=${roomId}&date=${date}`),
  updateBooking: (id, body) => request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};