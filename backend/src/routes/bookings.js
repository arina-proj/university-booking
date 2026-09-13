import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Создать бронь
router.post('/', authMiddleware, (req, res) => {
  const { room_id, date, start_time, end_time, participants, title } = req.body || {};
  // BUG #8: title убран из обязательных полей
  if (!room_id || !date || !start_time || !end_time || !participants ) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
// BUG #2, #3: убрана проверка start < end и нулевой длительности
//   if (timeToMin(start_time) >= timeToMin(end_time)) {
//     return res.status(400).json({ error: 'Время начала должно быть раньше окончания' });
//   }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
  if (!room) return res.status(404).json({ error: 'Аудитория не найдена' });
  if (room.status !== 'available') {
    return res.status(400).json({ error: 'Аудитория недоступна' });
  }
// BUG #6: НЕТ проверки вместимости — удалено
//   if (participants > room.capacity) {
//     return res.status(400).json({ error: `Вместимость аудитории — ${room.capacity} человек` });
//   }

  // Проверка пересечений
  const newStart = timeToMin(start_time);
  const newEnd = timeToMin(end_time);

// BUG #4: НЕТ проверки пересечений 
//   const conflicts = db.prepare(`
//     SELECT * FROM bookings WHERE room_id = ? AND date = ?
//   `).all(room_id, date);
//   const hasConflict = conflicts.some(b => {
//     const s = timeToMin(b.start_time);
//     const e = timeToMin(b.end_time);
//     return newStart < e && newEnd > s;
//   });
//   if (hasConflict) {
//     return res.status(409).json({ error: 'Это время уже занято' });
//   }

  const info = db.prepare(`
    INSERT INTO bookings (user_id, room_id, date, start_time, end_time, participants, title)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, room_id, date, start_time, end_time, participants, title);

  const booking = db.prepare(`
    SELECT b.*, r.number AS room_number, r.capacity AS room_capacity
    FROM bookings b JOIN rooms r ON r.id = b.room_id
    WHERE b.id = ?
  `).get(info.lastInsertRowid);

  res.status(201).json(booking);
});

// Мои брони
router.get('/my', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, r.number AS room_number, r.capacity AS room_capacity
    FROM bookings b JOIN rooms r ON r.id = b.room_id
    WHERE b.user_id = ?
    ORDER BY b.date DESC, b.start_time DESC
  `).all(req.user.id);
  res.json(rows);
});

// Удалить
router.delete('/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Не найдено' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Занятые слоты по аудитории на дату (для формы)
router.get('/busy', authMiddleware, (req, res) => {
  const { room_id, date } = req.query;
  if (!room_id || !date) return res.status(400).json({ error: 'room_id и date обязательны' });
  const rows = db.prepare(`
    SELECT start_time, end_time FROM bookings WHERE room_id = ? AND date = ?
  `).all(room_id, date);
  res.json(rows);
});

export default router;

// PUT /api/bookings/:id — редактирование брони
router.put('/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return res.status(404).json({ error: 'Бронь не найдена' });

  // Проверка владельца
  if (booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Нет доступа к этой брони' });
  }

  const { room_id, date, start_time, end_time, participants, title } = req.body || {};

  // Обязательные поля
  if (!room_id || !date || !start_time || !end_time || !participants || !title) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  // Проверка времени
  if (timeToMin(start_time) >= timeToMin(end_time)) {
    return res.status(400).json({ error: 'Время начала должно быть раньше окончания' });
  }

  // Проверка аудитории
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
  if (!room) return res.status(404).json({ error: 'Аудитория не найдена' });
  if (room.status !== 'available') {
    return res.status(400).json({ error: 'Аудитория недоступна' });
  }

  // Проверка вместимости
  if (participants > room.capacity) {
    return res.status(400).json({ error: `Вместимость аудитории — ${room.capacity} человек` });
  }

  // Проверка пересечений — исключаем саму редактируемую бронь
  const conflicts = db.prepare(`
    SELECT * FROM bookings
    WHERE room_id = ? AND date = ? AND id != ? AND deleted = 0
  `).all(room_id, date, id);

  const newStart = timeToMin(start_time);
  const newEnd = timeToMin(end_time);
  const hasConflict = conflicts.some(b => {
    const s = timeToMin(b.start_time);
    const e = timeToMin(b.end_time);
    return newStart < e && newEnd > s;   // строгое пересечение
  });
  if (hasConflict) {
    return res.status(409).json({ error: 'Это время уже занято другой бронью' });
  }

  // Обновляем
  db.prepare(`
    UPDATE bookings
    SET room_id = ?, date = ?, start_time = ?, end_time = ?, participants = ?, title = ?
    WHERE id = ?
  `).run(room_id, date, start_time, end_time, participants, title, id);

  const updated = db.prepare(`
    SELECT b.*, r.number AS room_number, r.capacity AS room_capacity
    FROM bookings b JOIN rooms r ON r.id = b.room_id
    WHERE b.id = ?
  `).get(id);

  res.json(updated);
});