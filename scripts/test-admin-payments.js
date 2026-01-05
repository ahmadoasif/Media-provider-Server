#!/usr/bin/env node
/*
  Quick script to manually test the /admin/payments endpoint.
  Usage: set ADMIN_API_BASE and ADMIN_TOKEN then run: node scripts/test-admin-payments.js

  Example:
    $env:ADMIN_API_BASE = 'http://localhost:3000' ; $env:ADMIN_TOKEN='Bearer <token>' ; node .\scripts\test-admin-payments.js
*/


const BASE = process.env.ADMIN_API_BASE || 'http://localhost:3000';
const TOKEN = process.env.ADMIN_TOKEN || '';

async function call(params) {
  const url = `${BASE}/admin/payments?${new URLSearchParams(params)}`;
  console.log('GET', url);
  const res = await fetch(url, { headers: { Authorization: TOKEN } });
  const json = await res.json().catch(() => ({}));
  console.log('status', res.status);
  console.log(JSON.stringify(json, null, 2));
}

(async () => {
  // example queries
  await call({ page: 1, limit: 5 });
  await call({ page: 1, limit: 5, status: 'paid' });
  await call({ page: 1, limit: 5, status: 'pending' });
  await call({ page: 1, limit: 5, sortBy: 'date', sortOrder: 'desc' });
  await call({ page: 1, limit: 5, sortBy: 'total', sortOrder: 'asc' });
  await call({ page: 1, limit: 5, sortBy: 'paymentid', sortOrder: 'asc', search: 'PAY-' });
})();
