// Test script for vendorGetOneInvoice API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/invoice';

// Replace with actual token and invoice ID
const vendorToken = 'your-vendor-jwt-token';
const invoiceId = '6939a57989e9079890c15bb3'; // Example invoice ID from seed

async function testVendorGetOneInvoice() {
    try {
        console.log('Testing vendorGetOneInvoice API...\n');

        const response = await axios.get(`${BASE_URL}/vendor/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${vendorToken}`
            }
        });

        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        console.log('Invoice Data:', JSON.stringify(response.data.data, null, 2));

    } catch (error) {
        console.log('❌ Error!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testVendorGetOneInvoice();
