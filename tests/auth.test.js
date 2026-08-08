const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  it('should login with valid credentials (Priya - Employee)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya@ashoka.com', password: 'password123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'EMPLOYEE');
  });

  it('should login with valid credentials (Rohan - HR)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rohan@ashoka.com', password: 'password123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'HR');
  });

  it('should fail with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya@ashoka.com', password: 'wrongpassword' });
    
    expect(res.statusCode).toBe(401);
  });

  it('should fail when missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya@ashoka.com' });
    
    expect(res.statusCode).toBe(400);
  });
});
