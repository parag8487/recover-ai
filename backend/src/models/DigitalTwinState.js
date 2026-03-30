const mongoose = require('mongoose');

const DigitalTwinStateSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    graphData: { type: Object, default: {} },
    lastInferredRisk: { type: Number, default: 0 },
    lastSimulationResult: { type: Object, default: {} },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DigitalTwinState', DigitalTwinStateSchema);
