const axios = require('axios');

const BASE_URL = 'http://localhost:5005';

async function runDiagnostics() {
    console.log('--- RecoverAI Diagnostic Suite ---');
    let token = '';

    try {
        // 1. Auth
        console.log('[1/3] Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'doctor@recoverai.com',
            password: 'password123'
        });
        token = authRes.data.token;
        console.log('✅ Auth Success');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Memory Route (was 500)
        console.log('[2/3] Testing POST /api/memory...');
        const memRes = await axios.post(`${BASE_URL}/api/memory`, {
            text: 'Administered 10mg Amlodipine for BP control at 8AM.',
            isHospitalMode: true
        }, { headers });
        console.log('✅ Memory Post Success:', memRes.data.log.name);

        // 3. Test Report Route (was 404)
        console.log('[3/3] Testing GET /api/features/report...');
        const repRes = await axios.get(`${BASE_URL}/api/features/report`, { headers });
        console.log('✅ Report Get Success:', repRes.data.report.summary);

        console.log('\n--- ALL DIAGNOSTICS PASSED ---');
    } catch (err) {
        console.error('❌ DIAGNOSTIC FAILED:', err.response?.status, err.response?.data || err.message);
        process.exit(1);
    }
}

runDiagnostics();
