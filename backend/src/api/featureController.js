// Mock Feature Controller for Voice and Emotion
exports.processVoice = async (req, res) => {
    try {
        res.status(200).json({ text: "I feel some pain in my chest.", confidence: 0.95 });
    } catch (error) {
        res.status(500).json({ message: 'Voice processing failed' });
    }
};

exports.detectEmotion = async (req, res) => {
    try {
        res.status(200).json({ emotion: "Anxious", intensity: 0.7 });
    } catch (error) {
        res.status(500).json({ message: 'Emotion detection failed' });
    }
};
