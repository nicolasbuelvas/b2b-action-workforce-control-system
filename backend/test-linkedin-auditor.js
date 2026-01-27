const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const AUDITOR_EMAIL = 'li_aud@test.com';
const AUDITOR_PASSWORD = 'password123';

async function testLinkedInAuditor() {
  try {
    console.log('1. Login as LinkedIn inquirer auditor...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: AUDITOR_EMAIL,
      password: AUDITOR_PASSWORD,
    });
    
    const token = loginRes.data.access_token;
    const auditorUserId = loginRes.data.userId;
    console.log(`✓ Logged in: ${AUDITOR_EMAIL} (${auditorUserId})`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('\n2. Get pending LinkedIn inquiry audits...');
    const pendingRes = await axios.get(`${BASE_URL}/audit/linkedin-inquiry/pending`, { headers });
    
    console.log(`✓ Pending tasks: ${pendingRes.data.length}`);
    if (pendingRes.data.length > 0) {
      const task = pendingRes.data[0];
      console.log(`\n  Task ID: ${task.id}`);
      console.log(`  Worker: ${task.workerName} (${task.workerEmail})`);
      console.log(`  Category: ${task.categoryName}`);
      console.log(`  Actions: ${task.actions.length}`);
      
      task.actions.forEach((action, i) => {
        console.log(`    Step ${i+1}: ${action.actionType} - ${action.status}${action.isDuplicate ? ' (DUPLICATE)' : ''}`);
      });
    }
    
    console.log('\n✓ Test passed! LinkedIn auditor page should now show pending tasks.');
  } catch (err) {
    console.error('✗ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testLinkedInAuditor();
