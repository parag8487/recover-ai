const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../src/api/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mocking User model
jest.mock('../src/models/User', () => {
    return jest.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        this.save = jest.fn().mockImplementation(function () {
            this._id = '123';
            return Promise.resolve(this);
        });
        return this;
    });
});
const User = require('../src/models/User');
User.findOne = jest.fn();

describe('Auth Module API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new patient successfully', async () => {
            User.findOne.mockResolvedValue(null);

            // Mock the save implementation to return a document with an _id
            User.prototype.save = jest.fn().mockImplementation(function () {
                this._id = '123';
                return Promise.resolve(this);
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'PATIENT'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.name).toBe('John Doe');
        });

        it('should fail if user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'john@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'PATIENT'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            User.findOne.mockResolvedValue({
                _id: '123',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedpassword',
                role: 'PATIENT',
                comparePassword: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});
