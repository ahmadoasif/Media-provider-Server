#!/usr/bin/env node
/*
  Quick script to manually test the /admin/queries endpoint.
  Usage: set ADMIN_API_BASE and ADMIN_TOKEN then run: node scripts/test-admin-queries.js

  Example (PowerShell):
    $env:ADMIN_API_BASE = 'http://localhost:3000' ; $env:ADMIN_TOKEN='Bearer <token>' ; node .\scripts\test-admin-queries.js
*/

const BASE = process.env.ADMIN_API_BASE || 'http://localhost:3000';
const TOKEN = process.env.ADMIN_TOKEN || '';

async function call(params) {
  const url = `${BASE}/admin/queries?${new URLSearchParams(params)}`;
  console.log('\nGET', url);
  try {
    const res = await fetch(url, { headers: { Authorization: TOKEN } });
    const json = await res.json().catch(() => ({}));
    console.log('status', res.status);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Request error', err);
  }
}

(async () => {
  await call({ page: 1, limit: 5 });
  await call({ page: 1, limit: 5, status: 'open' });
  await call({ page: 1, limit: 5, status: 'answered' });
  await call({ page: 1, limit: 5, status: 'closed' });
  await call({ page: 1, limit: 5, search: 'QUE-', sortBy: 'createdAt', sortOrder: 'desc' });
  await call({ page: 1, limit: 5, search: 'question text', sortBy: 'answeredAt', sortOrder: 'asc' });
})();
