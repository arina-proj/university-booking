import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function MyBookings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null); // объект брони или null
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.myBookings().then(setItems).catch(e => setError(e.message));

  useEffect(() => {
    load();
    api.rooms().then(setRooms).catch(() => {});
  }, []);

  const remove = async (id) => {
    if (!confirm('Отменить бронь?')) return;
    try {
      await api.deleteBooking(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      room_id: b.room_id,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      participants: b.participants,
      title: b.title,
    });
    setFormError('');
  };

  const closeEdit = () => {
    setEditing(null);
    setForm(null);
    setFormError('');
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.updateBooking(editing.id, {
        ...form,
        room_id: Number(form.room_id),
        participants: Number(form.participants),
      });
      closeEdit();
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Мои бронирования</h1>
      {error && <div className="error">{error}</div>}
      {items.length === 0 && <p className="muted">Пока нет бронирований.</p>}

      <div className="bookings">
        {items.map(b => (
          <div key={b.id} className="card booking-card">
            <div className="booking-title">{b.title}</div>
            <div className="booking-info">
              <div>🏛 Ауд. {b.room_number}</div>
              <div>📅 {b.date}</div>
              <div>🕐 {b.start_time} — {b.end_time}</div>
              <div>👥 {b.participants} чел.</div>
            </div>
            <div className="booking-actions">
              <button className="btn-secondary" onClick={() => openEdit(b)}>Редактировать</button>
              <button className="btn-danger" onClick={() => remove(b.id)}>Отменить</button>
            </div>
          </div>
        ))}
      </div>

      {editing && form && (
        <div className="modal-overlay" onClick={closeEdit}>
          <form
            className="card modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
          >
            <h2>Редактировать бронь</h2>
            {formError && <div className="error">{formError}</div>}

            <label>Аудитория
              <select name="room_id" value={form.room_id} onChange={change} required>
                {rooms.map(r => (
                  <option key={r.id} value={r.id} disabled={r.status !== 'available'}>
                    №{r.number} — до {r.capacity} чел.
                    {r.status !== 'available' ? ' (недоступна)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>Дата
              <input type="date" name="date" value={form.date} onChange={change} required />
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
                type="number"
                name="participants"
                min={1}
                value={form.participants}
                onChange={change}
                required
              />
            </label>

            <label>Название мероприятия
              <input name="title" value={form.title} onChange={change} required />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeEdit}>Отмена</button>
              <button className="btn" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}