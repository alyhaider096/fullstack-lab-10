import assert from 'node:assert/strict';

const base = process.env.LAB10_URL ?? 'http://127.0.0.1:3100';
const suffix = Date.now();
async function request(method, path, body, expected = 200) {
  const response = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}

const user = await request('POST', '/users', { name: 'Lab Test', email: `lab${suffix}@example.com` }, 201);
const empty = await request('GET', `/users/${user.id}/stats`);
assert.deepEqual([empty.totalNotes, empty.pinnedNotes, empty.totalViews], [0, 0, 0]);
const category = await request('POST', '/categories', { name: `Study${suffix}` }, 201);
await request('POST', '/categories', { name: category.name }, 409);
await request('POST', '/categories', { name: 'x'.repeat(31) }, 400);
const note = await request('POST', '/notes', { title: 'Nest search demo', content: 'Lab work', userId: user.id, categoryId: category.id, tags: ['lab10'] }, 201);
assert.equal(note.category.id, category.id);
await request('POST', '/notes', { title: 'Bad category', content: 'No match', userId: user.id, categoryId: 999999 }, 404);
const viewed1 = await request('GET', `/notes/${note.id}`);
const viewed2 = await request('GET', `/notes/${note.id}`);
const viewed3 = await request('GET', `/notes/${note.id}`);
assert.deepEqual([viewed1.views, viewed2.views, viewed3.views], [1, 2, 3]);
const updated = await request('PATCH', `/notes/${note.id}`, { isPinned: true }, 200);
assert.equal(updated.isPinned, true);
const stats = await request('GET', `/users/${user.id}/stats`);
assert.deepEqual([stats.totalNotes, stats.pinnedNotes, stats.totalViews], [1, 1, 3]);
for (let index = 0; index < 4; index++) {
  await request('POST', '/notes', { title: `Other note ${index}`, content: 'Pagination demo', userId: user.id }, 201);
}
const secondPage = await request('GET', '/notes?page=2&limit=3');
assert.equal(secondPage.page, 2);
assert.equal(secondPage.limit, 3);
assert.equal(secondPage.data.length, 3);
const ordered = await request('GET', '/notes?limit=20');
assert.equal(ordered.data[0].id, note.id);
const searched = await request('GET', '/notes?search=nEsT&limit=5');
assert.ok(searched.data.some(n => n.id === note.id));
const tagged = await request('GET', '/notes?tag=lab10');
assert.ok(tagged.data.some(n => n.id === note.id));
const filtered = await request('GET', `/notes?categoryId=${category.id}`);
assert.ok(filtered.data.some(n => n.id === note.id));
await request('GET', '/notes?limit=100', undefined, 400);
await request('GET', '/notes?page=0', undefined, 400);
await request('GET', '/users/999999/stats', undefined, 404);
await request('GET', '/categories/999999', undefined, 404);
const renamed = await request('PATCH', `/categories/${category.id}`, { name: `Updated${suffix}` });
assert.equal(renamed.name, `Updated${suffix}`);
await request('DELETE', `/categories/${category.id}`);
const retained = await request('GET', `/notes/${note.id}`);
assert.equal(retained.category, null);
console.log(JSON.stringify({ result: 'PASS', userId: user.id, noteId: note.id, views: retained.views, checks: 28 }, null, 2));
