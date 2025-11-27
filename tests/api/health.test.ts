import request from 'supertest';
import express from 'express';

// Create a minimal test app
const app = express();
app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

describe('Health Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
