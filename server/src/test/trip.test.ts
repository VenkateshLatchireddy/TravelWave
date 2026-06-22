import request from 'supertest';
import app from '../server';
import { User } from '../models/User';
import { Trip } from '../models/Trip';

describe('Trip Management', () => {
  let token: string;
  let userId: string;
  let tripId: string;

  const testUser = {
    email: 'trip@example.com',
    password: 'Test@1234',
    firstName: 'Trip',
    lastName: 'Tester',
  };

  const testTrip = {
    destination: 'Delhi',
    durationDays: 3,
    budgetTier: 'Medium',
    interests: ['Food', 'Culture'],
  };

  beforeEach(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = register.body.data.tokens.accessToken;
    userId = register.body.data.user.id;
  });

  describe('POST /api/trips/generate', () => {
    it('should generate a trip with AI', async () => {
      const response = await request(app)
        .post('/api/trips/generate')
        .set('Authorization', `Bearer ${token}`)
        .send(testTrip);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('destination', testTrip.destination);
      expect(response.body.data.itinerary).toBeDefined();
      expect(response.body.data.hotels).toBeDefined();
    }, 30000); // 30 second timeout for AI

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/trips/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ destination: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      const generate = await request(app)
        .post('/api/trips/generate')
        .set('Authorization', `Bearer ${token}`)
        .send(testTrip);
      tripId = generate.body.data._id;
    });

    it('should get user trips', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trips).toHaveLength(1);
      expect(response.body.data.trips[0]).toHaveProperty('destination', testTrip.destination);
    });

    it('should not get other users trips', async () => {
      const otherUser = {
        email: 'other@example.com',
        password: 'Test@1234',
        firstName: 'Other',
        lastName: 'User',
      };

      const register = await request(app)
        .post('/api/auth/register')
        .send(otherUser);
      const otherToken = register.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.body.data.trips).toHaveLength(0);
    });
  });

  describe('PUT /api/trips/:id/regenerate-day', () => {
    beforeEach(async () => {
      const generate = await request(app)
        .post('/api/trips/generate')
        .set('Authorization', `Bearer ${token}`)
        .send(testTrip);
      tripId = generate.body.data._id;
    });

    it('should regenerate a specific day', async () => {
      const response = await request(app)
        .put(`/api/trips/${tripId}/regenerate-day`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          dayNumber: 1,
          feedback: 'Make it more adventurous',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.itinerary[0]).toHaveProperty('dayNumber', 1);
    }, 20000);
  });
});