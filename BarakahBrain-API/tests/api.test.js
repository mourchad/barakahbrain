const request = require('supertest');
const fs = require('fs');
const path = require('path');

// ensure we use a fresh sqlite file for each test run
const testDbPath = path.resolve(__dirname, 'test.sqlite');
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'testsecret';

const app = require('../server');

describe('API basic flows', () => {
    let token;

    beforeAll(async () => {
        // wait for DB initialization (server.js sets up on import)
        await new Promise(r => setTimeout(r, 500));
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'StrongPass123!',
                fullName: 'Test User'
            });
        if(res.statusCode !== 201) console.error('registration failed body', res.body);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toMatch(/compte créé/i);
    });

    it('should login with credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'StrongPass123!' });
        if(res.statusCode !== 200) console.error('login failed body', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    it('should get profile with token', async () => {
        const res = await request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${token}`);
        if(res.statusCode !== 200) console.error('profile failed body', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe('testuser');
    });
});
