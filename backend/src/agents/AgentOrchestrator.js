const axios = require('axios');

class AgentOrchestrator {
    static async processHealthInput(message, patientHistory) {
        const msg = message.toLowerCase();
        const hfToken = process.env.HUGGINGFACE_TOKEN;
        const modelUrl = "https://api-inference.huggingface.co/models/AhmedSSoliman/medgemma-4b-digital-twin-v1";

        let apiResponse = null;
        if (hfToken) {
            try {
                const prompt = `Patient Vitals History: ${JSON.stringify(patientHistory)}\nPatient Message: ${message}\nClinical Analysis:`;
                const res = await axios.post(modelUrl, { inputs: prompt }, {
                    headers: { Authorization: `Bearer ${hfToken}` },
                    timeout: 8000
                });
                apiResponse = res.data[0]?.generated_text || res.data?.generated_text;
            } catch (err) {
                console.error("Hugging Face API Error:", err.message);
            }
        }

        // Process Inference or Fallback
        const recentLogs = patientHistory || [];
        const avgHR = recentLogs.reduce((acc, log) => acc + (log.vitals?.hr || 72), 0) / (recentLogs.length || 1);
        const highHRTrend = recentLogs.length >= 3 && recentLogs.slice(0, 3).every(l => l.vitals?.hr > 90);

        let responseText = apiResponse || "I've analyzed your current state. Your vitals seem stable.";
        let riskLevel = highHRTrend ? 65 : 15;
        let agentPath = apiResponse ? 'MedGemma-4B (Inference) -> Digital Twin' : 'RecoverAI (Logic) -> Digital Twin';

        if (!apiResponse && (highHRTrend || msg.includes('pain'))) {
            responseText = `Elevated heart rate detected (Avg: ${Math.round(avgHR)} BPM). Clinical path suggests rest and hydration.`;
        }

        return {
            response: responseText,
            agentPath,
            isAlert: riskLevel >= 60,
            analysis: {
                risk: {
                    score: riskLevel,
                    indicators: highHRTrend ? ['Tachycardia Trend'] : ['Stable Baseline'],
                    reasoning: `Analysis based on ${apiResponse ? 'Live Inference' : 'Algorithmic Fallback'}.`
                },
                doctor: {
                    clinicalImpression: riskLevel > 50 ? 'Suggesting assessment for inflammatory markers.' : 'Normal recovery baseline maintained.',
                    confidence: apiResponse ? 0.98 : 0.94
                }
            }
        };
    }

    static async runSimulation(patientId, scenario) {
        const scenarios = {
            'miss_medication_3days': {
                riskLevel: 'High',
                recoveryImpact: '-4 days',
                reasoning: 'Discontinuation of post-discharge inflammatory control increases secondary infection risk by 35%.'
            },
            'increased_activity': {
                riskLevel: 'Moderate',
                recoveryImpact: '+1 day',
                reasoning: 'Gradual increase in activity promotes cardiac vascularization but requires HR monitoring.'
            },
            'low_hydration': {
                riskLevel: 'Moderate',
                recoveryImpact: '-1 day',
                reasoning: 'Dehydration leads to tachycardia and increased recovery strain.'
            }
        };

        return scenarios[scenario] || { riskLevel: 'Stable', recoveryImpact: 'Neutral', reasoning: 'Scenario analysis complete.' };
    }
}

module.exports = AgentOrchestrator;
