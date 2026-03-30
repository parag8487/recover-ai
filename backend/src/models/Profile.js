const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: String, // Supporting both ObjectId and UUID for Demo Mode
        required: true
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: 'bg-primary'
    },
    isSelf: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
