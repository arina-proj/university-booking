import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function NewBooking() {
  const nav = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [busy, setBusy] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    room_id: '',
    date: today(),
    start_time: '09:00',
    end_time: '10:30',
    participants: 10,
    title: '',
  });

  useEffect(() => {
    api.rooms().then(setRooms).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!form.room_id || !form.date) return;
    api.busySlots(form.room_id, form.date).then(setBusy).catch(() => setBusy([]));
  }, [form.room_id, form.date]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.createBooking({
        ...form,
        room_id: Number(form.room_id),
        participants: Number(form.participants),
      });
      setSuccess('Бронь создана!');
      setTimeout(() => nav('/my'), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedRoom = rooms.find(r => String(r.id) === String(form.room_id));

  return (
    <div>
      <h1>Новая бронь</h1>
      <form className="card form" onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <label>Аудитория
          <select name="room_id" value={form.room_id} onChange={change} required>
            <option value="">— выберите —</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id} disabled={r.status !== 'available'}>
                №{r.number} — до {r.capacity} чел. {r.status !== 'available' ? '(недоступна)' : ''}
              </option>
            ))}
          </select>
        </label>

        <label>Дата
          <input type="date" name="date" value={form.date} onChange={change} 
          //BUG #1. Бронь на прошедшую дату
          // min={today()} 
          required />
        </label>

        <div className="row">
          <label>Начало
            <input type="time" name="start_time" value={form.start_time} onChange={change} required />
          </label>
          <label>Окончание
            <input type="time" name="end_time" value={form.end_time} onChange={change} required />
          </label>
        </div>

        <label>Количество участников
          <input
            type="number" name="participants" min={1}
            // BUG #6: убран max, чтобы UI не блокировал
            //max={selectedRoom ? selectedRoom.capacity : undefined}
            value={form.participants} onChange={change} required
          />
          {selectedRoom && <small className="muted">Максимум: {selectedRoom.capacity}</small>}
        </label>

        <label>Название мероприятия
          <input name="title" value={form.title} onChange={change} 
          // BUG #8: title убран из обязательных полей
          //required 
          placeholder="Например, Лекция по БД" />
        </label>

        <button className="btn">Забронировать</button>

        {busy.length > 0 && (
          <div className="busy-info">
            <strong>Занятые слоты на этот день:</strong>
            <ul>{busy.map((b, i) => <li key={i}>{b.start_time} — {b.end_time}</li>)}</ul>
          </div>
        )}
      </form>
    </div>
  );
}