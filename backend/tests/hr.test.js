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

describe('HR API', () => {
  it('should get all employees (HR role)', async () => {
    const res = await request(app)
      .get('/api/hr/employees')
      .set('Authorization', `Bearer ${hrToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should deny employee access to HR endpoints', async () => {
    const res = await request(app)
      .get('/api/hr/employees')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.statusCode).toBe(403);
  });

  it('should get review periods', async () => {
    const res = await request(app)
      .get('/api/hr/review-periods')
      .set('Authorization', `Bearer ${hrToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
