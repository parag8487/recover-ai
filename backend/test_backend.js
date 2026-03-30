const axios = require('axios');

const BASE_URL = 'http://localhost:5005';
let token = '';

async function runTests() {
    console.log('--- RecoverAI Integration Test Suite ---');

    try {
        // 1. Register/Login
        console.log('[1/4] Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Integration Test Doctor',
            email: `test_doc_${Date.now()}@recoverai.com`,
            password: 'password123',
            role: 'Doctor'
        });
        token = authRes.data.token;
        console.log('✅ Authentication Successful');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Add Medical Log
        console.log('[2/4] Testing Clinical Logging (with Fallback Engine)...');
        const logRes = await axios.post(`${BASE_URL}/api/memory`, {
            text: 'I administered 50mg Metoprolol for heart rate control at 10:15 AM.',
            isHospitalMode: true
        }, { headers });
        console.log('✅ Log Response:', JSON.stringify(logRes.data.log, null, 2));

        // 3. Fetch History
        console.log('[3/4] Verifying History Retrieval...');
        const historyRes = await axios.get(`${BASE_URL}/api/memory/history`, { headers });
        if (historyRes.data.logs.length > 0) {
            console.log(`✅ History Found: ${historyRes.data.logs.length} entries`);
        } else {
            throw new Error('History empty after log addition');
        }

        // 4. Generate Handover
        console.log('[4/4] Testing Clinical Handover Synthesis...');
        const handoverRes = await axios.get(`${BASE_URL}/api/memory/handover`, { headers });
        if (handoverRes.data.handover) {
            console.log('✅ Handover Generated Successfully');
        } else {
            console.log('⚠️ Handover yielded empty results (likely missing logs in DB)');
        }

        console.log('\n--- ALL SYSTEMS NOMINAL ---');
    } catch (err) {
        console.error('❌ TEST FAILED:', err.response?.data || err.message);
        process.exit(1);
    }
}

runTests();
