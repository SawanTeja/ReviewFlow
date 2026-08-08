const request = require('supertest');
const app = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'priya@ashoka.com', password: 'password123' });
  token = res.body.token;
});

describe('Employee API', () => {
  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'priya@ashoka.com');
  });

  it('should get feedback given assignments', async () => {
    const res = await request(app)
      .get('/api/me/feedback/given')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should get feedback received', async () => {
    const res = await request(app)
      .get('/api/me/feedback/received')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
