import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getAll());
});

router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const { title, price, location, description } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const item = create({ title, price: Number(price) || 0, location: location || '', description: description || '' });
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const updated = update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
