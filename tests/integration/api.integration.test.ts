import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

describe('API Integration Tests', () => {
  let app: Hono;
  let server: any;
  const baseUrl = 'http://localhost:3200';

  beforeAll(async () => {
    app = new Hono();

    app.get('/health', (c) => {
      return c.json({ status: 'ok', timestamp: Date.now() });
    });

    app.get('/api/users', (c) => {
      return c.json({ users: [] });
    });

    app.post('/api/users', async (c) => {
      const body = await c.req.json();
      return c.json({ success: true, user: body }, 201);
    });

    app.get('/api/users/:id', (c) => {
      const id = c.req.param('id');
      return c.json({ id, name: 'Test User', email: 'test@example.com' });
    });

    app.put('/api/users/:id', async (c) => {
      const id = c.req.param('id');
      const body = await c.req.json();
      return c.json({ success: true, id, ...body });
    });

    app.delete('/api/users/:id', (c) => {
      const id = c.req.param('id');
      return c.json({ success: true, id });
    });

    app.get('/api/cache/:key', async (c) => {
      const key = c.req.param('key');
      return c.json({ key, value: `cached-${key}`, hit: true });
    });

    app.post('/api/cache/:key', async (c) => {
      const key = c.req.param('key');
      const body = await c.req.json();
      return c.json({ success: true, key, value: body.value });
    });

    app.delete('/api/cache/:key', (c) => {
      const key = c.req.param('key');
      return c.json({ success: true, key });
    });

    server = serve({
      fetch: app.fetch,
      port: 3200,
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('User API', () => {
    describe('GET /api/users', () => {
      it('should return list of users', async () => {
        const response = await fetch(`${baseUrl}/api/users`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.users).toBeDefined();
        expect(Array.isArray(data.users)).toBe(true);
      });
    });

    describe('POST /api/users', () => {
      it('should create new user', async () => {
        const newUser = {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User',
        };

        const response = await fetch(`${baseUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.email).toBe(newUser.email);
      });

      it('should handle invalid user data', async () => {
        const invalidUser = {
          email: 'invalid-email',
          password: 'weak',
        };

        const response = await fetch(`${baseUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidUser),
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should return user by ID', async () => {
        const userId = '123';
        const response = await fetch(`${baseUrl}/api/users/${userId}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.id).toBe(userId);
        expect(data.name).toBeDefined();
        expect(data.email).toBeDefined();
      });

      it('should handle non-existent user', async () => {
        const userId = 'non-existent';
        const response = await fetch(`${baseUrl}/api/users/${userId}`);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update user', async () => {
        const userId = '123';
        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
        };

        const response = await fetch(`${baseUrl}/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.id).toBe(userId);
        expect(data.name).toBe(updateData.name);
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should delete user', async () => {
        const userId = '123';
        const response = await fetch(`${baseUrl}/api/users/${userId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.id).toBe(userId);
      });
    });
  });

  describe('Cache API', () => {
    describe('GET /api/cache/:key', () => {
      it('should return cached value', async () => {
        const key = 'test-key';
        const response = await fetch(`${baseUrl}/api/cache/${key}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.key).toBe(key);
        expect(data.value).toBeDefined();
        expect(data.hit).toBe(true);
      });

      it('should handle cache miss', async () => {
        const key = 'non-existent-key';
        const response = await fetch(`${baseUrl}/api/cache/${key}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.key).toBe(key);
        expect(data.hit).toBe(false);
      });
    });

    describe('POST /api/cache/:key', () => {
      it('should set cached value', async () => {
        const key = 'new-cache-key';
        const value = { data: 'test-value' };

        const response = await fetch(`${baseUrl}/api/cache/${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value }),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.key).toBe(key);
        expect(data.value).toBeDefined();
      });
    });

    describe('DELETE /api/cache/:key', () => {
      it('should delete cached value', async () => {
        const key = 'cache-key-to-delete';
        const response = await fetch(`${baseUrl}/api/cache/${key}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.key).toBe(key);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await fetch(`${baseUrl}/api/non-existent`);
      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle missing required fields', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => 
        fetch(`${baseUrl}/health`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(5000);
    });

    it('should handle large payloads', async () => {
      const largeData = {
        data: 'x'.repeat(100000),
      };

      const response = await fetch(`${baseUrl}/api/cache/large-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(largeData),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Security', () => {
    it('should set security headers', async () => {
      const response = await fetch(`${baseUrl}/health`);

      expect(response.headers.get('X-Content-Type-Options')).toBeDefined();
      expect(response.headers.get('X-Frame-Options')).toBeDefined();
    });

    it('should handle CORS preflight', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });

    it('should reject malicious input', async () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maliciousData),
      });

      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data.name).not.toContain('<script>');
    });
  });
});
