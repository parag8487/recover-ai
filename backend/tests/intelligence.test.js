const request = require('supertest');
const express = require('express');

// Mock Auth Middleware
const mockAuth = (req, res, next) => {
    req.user = { id: 'patient123' };
    next();
};

jest.mock('../src/middleware/authMiddleware', () => mockAuth);

// Mock DigitalTwinState model
jest.mock('../src/models/DigitalTwinState', () => {
    return {
        findOneAndUpdate: jest.fn().mockResolvedValue({
            patientId: 'patient123',
            graphData: { state: 'stable' },
            lastInferredRisk: 10
        }),
        findOne: jest.fn().mockResolvedValue({
            patientId: 'patient123',
            graphData: { state: 'stable' }
        })
    };
});

const intelligenceRoutes = require('../src/api/intelligenceRoutes');
const app = express();
app.use(express.json());
app.use('/api/intelligence', intelligenceRoutes);

describe('Intelligence Module API', () => {
    describe('GET /api/intelligence/risk/:patientId', () => {
        it('should return a valid risk score', async () => {
            const res = await request(app).get('/api/intelligence/risk/patient123');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('riskScore');
            expect(res.body).toHaveProperty('reasoning');
        });
    });

    describe('POST /api/intelligence/simulate', () => {
        it('should run a simulation and return projections', async () => {
            const res = await request(app)
                .post('/api/intelligence/simulate')
                .send({
                    patientId: 'patient123',
                    scenario: 'miss_medication_3days'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('projection');
            expect(res.body.projection).toHaveProperty('riskLevel');
        });
    });

    describe('POST /api/intelligence/chat', () => {
        it('should return a multi-agent AI response', async () => {
            const res = await request(app)
                .post('/api/intelligence/chat')
                .send({
                    message: 'I feel a bit dizzy today'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('response');
            expect(res.body).toHaveProperty('agentPath'); // Path: Risk -> Doctor -> Companion
        });
    });
});
