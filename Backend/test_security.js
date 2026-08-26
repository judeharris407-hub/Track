import axios from 'axios';

async function testSecurity() {
  console.log('=== RUNNING SECURITY HARDENING VERIFICATION ===');
  const baseURL = 'http://localhost:5000';

  // 1. Test Helmet Headers
  console.log('\n[1] Testing Helmet Security Headers:');
  const healthRes = await axios.get(`${baseURL}/health`);
  console.log('Health check status:', healthRes.status);
  console.log('Helmet headers:');
  console.log(' - x-content-type-options:', healthRes.headers['x-content-type-options']);
  console.log(' - x-dns-prefetch-control:', healthRes.headers['x-dns-prefetch-control']);
  console.log(' - x-frame-options:', healthRes.headers['x-frame-options']);
  console.log(' - strict-transport-security:', healthRes.headers['strict-transport-security']);

  if (!healthRes.headers['x-content-type-options']) {
    throw new Error('Helmet headers missing!');
  }

  // 2. Test Rate Limiting on Public Tracking Lookup
  console.log('\n[2] Testing Rate Limiting on Tracking Lookup:');
  const trackRes = await axios.get(`${baseURL}/api/v1/public/parcels/TRK-1001`, {
    validateStatus: () => true,
  });
  console.log('Tracking lookup status:', trackRes.status);
  console.log(' - ratelimit-limit:', trackRes.headers['ratelimit-limit']);
  console.log(' - ratelimit-remaining:', trackRes.headers['ratelimit-remaining']);

  if (!trackRes.headers['ratelimit-limit']) {
    throw new Error('RateLimit headers missing on public tracking route!');
  }

  // 3. Test Rate Limiting on Admin Auth
  console.log('\n[3] Testing Rate Limiting on Admin Auth:');
  const loginRes = await axios.post(
    `${baseURL}/api/v1/admin/login`,
    { email: 'fake@test.com', password: 'wrong' },
    { validateStatus: () => true }
  );
  console.log('Admin login status:', loginRes.status);
  console.log(' - ratelimit-limit (auth):', loginRes.headers['ratelimit-limit']);
  console.log(' - ratelimit-remaining (auth):', loginRes.headers['ratelimit-remaining']);

  if (loginRes.headers['ratelimit-limit'] !== '10') {
    throw new Error(`Expected auth rate limit 10, got ${loginRes.headers['ratelimit-limit']}`);
  }

  // 4. Test 404 & Standard Error Response
  console.log('\n[4] Testing Standard Error Structure:');
  const notFoundRes = await axios.get(`${baseURL}/api/v1/non-existent-endpoint`, {
    validateStatus: () => true,
  });
  console.log('404 response status:', notFoundRes.status);
  console.log('404 response payload:', notFoundRes.data);

  if (typeof notFoundRes.data.error !== 'string' || notFoundRes.data.success !== false) {
    throw new Error('Standard error structure invalid!');
  }

  // 5. Test CORS Allowed Origin
  console.log('\n[5] Testing CORS Allowed Origin:');
  const corsAllowedRes = await axios.get(`${baseURL}/health`, {
    headers: { Origin: 'http://localhost:3000' },
  });
  console.log('CORS allow-origin header:', corsAllowedRes.headers['access-control-allow-origin']);

  if (corsAllowedRes.headers['access-control-allow-origin'] !== 'http://localhost:3000') {
    throw new Error('CORS allowed origin header missing or incorrect');
  }

  console.log('\n=== ALL SECURITY VERIFICATION CHECKS PASSED ===');
}

testSecurity().catch((err) => {
  console.error('Security test failed:', err.response?.data || err.message);
  process.exit(1);
});
