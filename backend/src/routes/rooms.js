import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY number').all();
  res.json(rooms);
});

export default router;