// Test API endpoints from inside container
import fetch from 'node-fetch';

const testAPI = async () => {
    try {
        console.log('🧪 Testing internal API endpoints...');
        
        // Test 1: Health check
        console.log('\n1. Testing API health...');
        try {
            const response = await fetch('http://localhost:5000/');
            const text = await response.text();
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${text}`);
        } catch (error) {
            console.log('❌ API health check failed:', error.message);
        }

        // Test 2: Login endpoint
        console.log('\n2. Testing login endpoint...');
        try {
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@rentalhub.com',
                    password: 'admin123'
                })
            });

            const loginData = await loginResponse.json();
            console.log(`Status: ${loginResponse.status}`);
            console.log(`Response:`, loginData);

            if (loginResponse.status === 200) {
                console.log('✅ Login successful!');
                console.log(`Token: ${loginData.token?.substring(0, 20)}...`);
            } else {
                console.log('❌ Login failed');
            }

        } catch (error) {
            console.log('❌ Login test failed:', error.message);
        }

        // Test 3: Wrong credentials
        console.log('\n3. Testing with wrong password...');
        try {
            const wrongResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@rentalhub.com',
                    password: 'wrongpassword'
                })
            });

            const wrongData = await wrongResponse.json();
            console.log(`Status: ${wrongResponse.status}`);
            console.log(`Response:`, wrongData);

        } catch (error) {
            console.log('❌ Wrong password test failed:', error.message);
        }

        console.log('\n🏁 API tests complete');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

testAPI();