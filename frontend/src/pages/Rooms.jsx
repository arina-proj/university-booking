import { useEffect, useState } from 'react';
import { api } from '../api.js';

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
            <div className={`badge ${r.status}`}>
              {r.status === 'available' ? 'Доступна' : 'На обслуживании'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}