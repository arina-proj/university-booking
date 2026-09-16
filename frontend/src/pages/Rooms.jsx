import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Единое рабочее время для всех аудиторий
// ВАЖНО: используется только для отображения.
// BUG #7: на бэкенде проверки рабочего времени нет — бронь можно оформить вне этого диапазона.
const WORK_HOURS = { start: '08:00', end: '20:00' };

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.rooms().then(setRooms).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Аудитории</h1>

      
      {error && <div className="error">{error}</div>}

      <div className="grid">
        {rooms.map(r => (
          <div key={r.id} className="card room-card">
            <div className="room-number">Ауд. {r.number}</div>
            <div className="room-info">Вместимость: {r.capacity} чел.</div>

            <div className="room-hours">
              🕐 {WORK_HOURS.start} — {WORK_HOURS.end}
            </div>

            <div className={`badge ${r.status}`}>
              {r.status === 'available' ? 'Доступна' : 'На обслуживании'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}