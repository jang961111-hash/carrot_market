const url = 'http://localhost:4000/health';
try {
  const res = await fetch(url);
  console.log('Status:', res.status);
  console.log('Body:', await res.json());
  process.exit(res.ok ? 0 : 1);
} catch (e) {
  console.error('Health check failed:', e.message);
  process.exit(2);
}
