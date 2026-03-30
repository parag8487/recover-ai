const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../temp_db.json');

class MemoryStorage {
    constructor() {
        this.users = [];
        this.logs = [];
        this.medicalLogs = [];
        this.messages = [];
        this.loadFromDisk();
    }

    saveToDisk() {
        try {
            const data = {
                users: this.users,
                logs: this.logs,
                medicalLogs: this.medicalLogs,
                messages: this.messages
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('Failed to save memory storage to disk:', err.message);
        }
    }

    loadFromDisk() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
                this.users = data.users || [];
                this.logs = data.logs || [];
                this.medicalLogs = data.medicalLogs || [];
                this.messages = data.messages || [];
                console.log('MemoryStorage loaded from disk');
            }
        } catch (err) {
            console.error('Failed to load memory storage from disk:', err.message);
        }
    }

    // User Operations
    async findUserByEmail(email) {
        if (!email) return null;
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }


    async findUserById(id) {
        return this.users.find(u => u.id === id || u._id?.toString() === id);
    }

    async createUser(userData) {
        const newUser = {
            ...userData,
            id: uuidv4(),
            _id: uuidv4(), // Dual ID support for consistency
            createdAt: new Date()
        };
        this.users.push(newUser);
        this.saveToDisk();
        return newUser;
    }

    // Daily Logs (Vitals)
    async saveLog(logData) {
        const newLog = { ...logData, id: uuidv4(), createdAt: new Date() };
        this.logs.push(newLog);
        this.saveToDisk();
        return newLog;
    }

    async getLogs(userId) {
        return this.logs.filter(l => l.userId === userId);
    }

    // RecoverAI Memory∞ (Clinical Logs)
    async saveMedicalLog(logData) {
        const newLog = {
            ...logData,
            id: uuidv4(),
            _id: uuidv4(),
            createdAt: new Date(),
            timestamp: logData.timestamp || new Date()
        };
        this.medicalLogs.push(newLog);
        this.saveToDisk();
        return newLog;
    }

    async getMedicalLogs(userId) {
        return this.medicalLogs
            .filter(l => l.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

module.exports = new MemoryStorage();
