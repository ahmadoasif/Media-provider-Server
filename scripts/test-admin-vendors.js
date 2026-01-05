#!/usr/bin/env node
/*
  Manual test helper for /admin/vendors
  Usage (PowerShell):
    $env:ADMIN_API_BASE='http://localhost:3000'; $env:ADMIN_TOKEN='Bearer <token>'; node .\scripts\test-admin-vendors.js
*/

const BASE = process.env.ADMIN_API_BASE || 'http://localhost:3000';
const TOKEN = process.env.ADMIN_TOKEN || '';

async function call(params) {
  const url = `${BASE}/admin/vendors?${new URLSearchParams(params)}`;
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
  await call({ page: 1, limit: 5, status: 'pending' });
  await call({ page: 1, limit: 5, status: 'approved' });
  await call({ page: 1, limit: 5, status: 'suspended' });
  await call({ page: 1, limit: 5, status: 'disabled' });
  await call({ page: 1, limit: 5, search: 'USR-' });
  await call({ page: 1, limit: 5, sortBy: 'firstName', sortOrder: 'asc' });
})();
