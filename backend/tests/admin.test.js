const request = require('supertest');
const app = require('../src/app');

let hrToken;
let employeeToken;

beforeAll(async () => {
  let res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rohan@ashoka.com', password: 'password123' });
  hrToken = res.body.token;
  
  res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'priya@ashoka.com', password: 'password123' });
  employeeToken = res.body.token;
});

describe('Admin API', () => {
  it('should create a new company (Admin/HR role)', async () => {
    const res = await request(app)
      .post('/api/admin/companies')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ name: 'Test Company' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Company');
  });

  it('should deny employee access to Admin endpoints', async () => {
    const res = await request(app)
      .post('/api/admin/companies')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ name: 'Another Company' });
    
    expect(res.statusCode).toBe(403);
  });
});
