import { nanoid } from 'nanoid';

const listings = [
  { id: nanoid(), title: '중고 의자', price: 15000, location: '강남구', description: '상태 양호', createdAt: Date.now() },
  { id: nanoid(), title: '책상', price: 30000, location: '서초구', description: '튼튼합니다', createdAt: Date.now() }
];

export function getAll() { return listings; }
export function getById(id) { return listings.find(l => l.id === id) || null; }
export function create(data) { const item = { id: nanoid(), createdAt: Date.now(), ...data }; listings.unshift(item); return item; }
export function update(id, data) { const idx = listings.findIndex(l => l.id === id); if (idx === -1) return null; listings[idx] = { ...listings[idx], ...data }; return listings[idx]; }
export function remove(id) { const idx = listings.findIndex(l => l.id === id); if (idx === -1) return false; listings.splice(idx, 1); return true; }
