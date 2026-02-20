// Diagnostic tool to help troubleshoot MongoDB Atlas connection
const dotenv = require('dotenv');
dotenv.config();

console.log('\n========================================');
console.log('MongoDB Connection Diagnostic Tool');
console.log('========================================\n');

const uri = process.env.MONGO_URI;
console.log('1. Connection String from .env:');
console.log('   ', uri);

if (uri) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (match) {
        console.log('\n2. Parsed Connection Details:');
        console.log('   Username:', match[1]);
        console.log('   Password (encoded):', match[2]);
        console.log('   Cluster:', match[3]);
        console.log('   Database:', match[4]);
        console.log('   Port: 27017 (default for Atlas)');
    }
}

console.log('\n3. Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   PORT:', process.env.PORT);
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***set***' : 'not set');

console.log('\n4. Troubleshooting Steps:');
console.log('   A. Verify MongoDB Atlas user exists:');
console.log('      - Go to mongodb.com/cloud');
console.log('      - Login to your cluster');
console.log('      - Database Access → Users');
console.log('      - Check if "closekart" user exists');
console.log('   ');
console.log('   B. Verify Network Access:');
console.log('      - Network Access → IP Whitelist');
console.log('      - Add your IP: ' + (require('os').networkInterfaces().eth0?.[0]?.address || '0.0.0.0/0'));
console.log('   ');
console.log('   C. Reset user password:');
console.log('      - Delete existing user and recreate');
console.log('      - Set password to: #closekart74');
console.log('      - Copy new connection string from Atlas');
console.log('\n========================================\n');
