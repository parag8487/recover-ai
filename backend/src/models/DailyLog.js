const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vitals: {
        hr: { type: Number, required: true },
        bp: { type: String, required: true },
        spO2: { type: Number, required: true }
    },
    symptoms: [{ type: String }],
    mood: { type: String },
    medicationMet: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
