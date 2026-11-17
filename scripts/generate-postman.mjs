import { mkdir, writeFile } from 'node:fs/promises';

const base = '{{baseUrl}}';
const json = (value) => JSON.stringify(value)
  .replaceAll('"{{userId}}"', '{{userId}}')
  .replaceAll('"{{categoryId}}"', '{{categoryId}}');
const save = (key) => [
  'pm.test("Expected success", () => pm.response.to.have.status(201));',
  `pm.collectionVariables.set("${key}", pm.response.json().id);`,
];
function item(name, method, path, body, tests = []) {
  return {
    name,
    event: tests.length ? [{ listen: 'test', script: { type: 'text/javascript', exec: tests } }] : [],
    request: {
      method,
      header: body === undefined ? [] : [{ key: 'Content-Type', value: 'application/json' }],
      url: base + path,
      ...(body === undefined ? {} : { body: { mode: 'raw', raw: json(body), options: { raw: { language: 'json' } } } }),
    },
  };
}
const collection = {
  info: {
    name: 'CS-301L Lab 10 Notes API',
    description: 'Run in order against the local NestJS API. Save screenshots of the request URL, status, and response body.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3101' },
    { key: 'userId', value: '1' },
    { key: 'categoryId', value: '1' },
    { key: 'noteId', value: '1' },
    { key: 'categoryName', value: '' },
  ],
  item: [
    item('01 Create user', 'POST', '/users', { name: 'Lab Student', email: 'lab{{$timestamp}}@example.com' }, save('userId')),
    item('02 Empty user statistics', 'GET', '/users/{{userId}}/stats'),
    item('03 Create category', 'POST', '/categories', { name: 'Study{{$timestamp}}' }, [
      ...save('categoryId'),
      'pm.collectionVariables.set("categoryName", pm.response.json().name);',
    ]),
    item('04 Duplicate category returns 409', 'POST', '/categories', { name: '{{categoryName}}' }, [
      'pm.test("Duplicate returns 409", () => pm.response.to.have.status(409));',
    ]),
    item('05 Category too long returns 400', 'POST', '/categories', { name: 'ThisCategoryNameHasMoreThanThirtyCharacters' }, [
      'pm.test("Validation returns 400", () => pm.response.to.have.status(400));',
    ]),
    item('06 List categories', 'GET', '/categories'),
    item('07 Create linked note', 'POST', '/notes', { title: 'NestJS Lab Note', content: 'PostgreSQL and TypeORM', userId: '{{userId}}', categoryId: '{{categoryId}}', tags: ['lab10'] }, save('noteId')),
    item('08 Invalid category returns 404', 'POST', '/notes', { title: 'Bad category', content: 'test', userId: '{{userId}}', categoryId: 999999 }, [
      'pm.test("Missing category returns 404", () => pm.response.to.have.status(404));',
    ]),
    item('09 Get note views 1', 'GET', '/notes/{{noteId}}'),
    item('10 Get note views 2', 'GET', '/notes/{{noteId}}'),
    item('11 Get note views 3', 'GET', '/notes/{{noteId}}'),
    item('12 Pin note', 'PATCH', '/notes/{{noteId}}', { isPinned: true }),
    item('13 User statistics', 'GET', '/users/{{userId}}/stats'),
    item('14 Pagination page 2', 'GET', '/notes?page=2&limit=3'),
    item('15 Case-insensitive title search', 'GET', '/notes?search=nest'),
    item('16 Filter by tag', 'GET', '/notes?tag=lab10'),
    item('17 Filter by category', 'GET', '/notes?categoryId={{categoryId}}'),
    item('18 Invalid limit returns 400', 'GET', '/notes?limit=100', undefined, [
      'pm.test("Limit returns 400", () => pm.response.to.have.status(400));',
    ]),
    item('19 Invalid page returns 400', 'GET', '/notes?page=0', undefined, [
      'pm.test("Page returns 400", () => pm.response.to.have.status(400));',
    ]),
    item('20 Delete category', 'DELETE', '/categories/{{categoryId}}'),
    item('21 Note retained with null category', 'GET', '/notes/{{noteId}}'),
  ],
};
await mkdir('postman', { recursive: true });
await writeFile('postman/Lab10.postman_collection.json', JSON.stringify(collection, null, 2) + '\n');
