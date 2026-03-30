const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock Auth Middleware
const mockAuth = (req, res, next) => {
    req.user = { id: 'patient123' };
    next();
};

jest.mock('../src/middleware/authMiddleware', () => mockAuth);

const logsRoutes = require('../src/api/logsRoutes');
const app = express();
app.use(express.json());
app.use('/api/logs', logsRoutes);

// Mock Logging model
jest.mock('../src/models/DailyLog', () => {
    return jest.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = jest.fn().mockImplementation(function () {
            this._id = 'log123';
            return Promise.resolve(this);
        });
        return this;
    });
});
const DailyLog = require('../src/models/DailyLog');
DailyLog.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockImplementation(function () {
        return this;
    }),
    then: jest.fn().mockImplementation(function (callback) {
        return Promise.resolve([]).then(callback);
    })
});

describe('Patient Data Logging API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/logs', () => {
        it('should create a new health log successfully', async () => {
            const logData = {
                vitals: { hr: 75, bp: '120/80', spO2: 98 },
                symptoms: ['Mild fatigue'],
                mood: 'Neutral',
                medicationMet: true
            };

            const res = await request(app)
                .post('/api/logs')
                .send(logData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.log.patientId).toBe('patient123');
            expect(res.body.log.vitals.hr).toBe(75);
        });

        it('should fail if vitals are missing', async () => {
            const res = await request(app)
                .post('/api/logs')
                .send({ mood: 'Happy' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Vitals are required');
        });
    });

    describe('GET /api/logs/:patientId', () => {
        it('should retrieve logs for a specific patient', async () => {
            const mockLogs = [
                { _id: 'log1', vitals: { hr: 70 } },
                { _id: 'log2', vitals: { hr: 72 } }
            ];

            DailyLog.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockLogs)
            });

            const res = await request(app).get('/api/logs/patient123');

            expect(res.statusCode).toEqual(200);
            expect(res.body.logs.length).toBe(2);
        });
    });
});
