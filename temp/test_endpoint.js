#!/usr/bin/env node

// Test script to verify /users/me/categories endpoint
const https = require('http');

async function testEndpoint() {
  // First, login to get JWT token
  const loginData = JSON.stringify({
    email: 'web_res@test.com',
    password: 'admin123'
  });

  const loginReq = https.request({
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const loginResp = JSON.parse(data);
        const token = loginResp.accessToken;
        console.log('✓ Login successful');
        console.log('✓ Token:', token.substring(0, 20) + '...');
        
        // Now test /users/me/categories endpoint
        const categoriesReq = https.request({
          hostname: 'localhost',
          port: 3000,
          path: '/users/me/categories',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }, (res) => {
          let catData = '';
          res.on('data', chunk => catData += chunk);
          res.on('end', () => {
            try {
              const categories = JSON.parse(catData);
              console.log('✓ /users/me/categories endpoint works!');
              console.log('✓ Categories:', JSON.stringify(categories, null, 2));
              if (categories.length > 0) {
                console.log('✅ SUCCESS: Researcher can access their categories without 403 error');
              } else {
                console.log('⚠️  WARNING: No categories assigned (but endpoint works)');
              }
              process.exit(0);
            } catch (e) {
              console.log('✗ Error parsing categories response:', e.message);
              process.exit(1);
            }
          });
        });

        categoriesReq.on('error', (e) => {
          console.error('✗ Error calling /users/me/categories:', e);
          process.exit(1);
        });
        
        categoriesReq.end();
      } catch (e) {
        console.log('✗ Error parsing login response:', e.message);
        process.exit(1);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error('✗ Error calling login:', e);
    process.exit(1);
  });

  loginReq.write(loginData);
  loginReq.end();
}

testEndpoint();
