const axios = require('axios');

async function testBackend() {
    console.log('Testing backend...');
    try {
        // 1. Register User
        const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'admin@test.com',
            password: 'password123',
            name: 'Admin Test',
            role: 'super_admin'
        }).catch(e => e.response);
        console.log('Register:', registerRes.status);

        // 2. Login User
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login:', loginRes.status, 'Token received');

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Test Dashboard
        const dashRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
        console.log('Dashboard Stats:', dashRes.status, dashRes.data);

        // 4. Test Users API
        const usersRes = await axios.get('http://localhost:5000/api/users', { headers });
        console.log('Users List:', usersRes.status, 'Count:', usersRes.data.data.length);

        // 5. Test KYC (Mock upload)
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', Buffer.from('mock image data'), { filename: 'test.png', contentType: 'image/png' });
        
        const ocrRes = await axios.post('http://localhost:5000/api/kyc/ocr', form, { 
            headers: { ...headers, ...form.getHeaders() } 
        });
        console.log('OCR Test:', ocrRes.status, ocrRes.data.data.appliedBy);

        console.log('Backend tests passed successfully.');
    } catch (e) {
        console.error('Test failed:', e.message, e.response?.data);
    }
}

testBackend();
