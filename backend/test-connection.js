const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

console.log('=== MongoDB Connection Test ===\n');
console.log('MONGO_URI from .env:');
console.log(process.env.MONGO_URI);
console.log('\n');

// Extract components from URI
const uri = process.env.MONGO_URI;
if (uri) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (match) {
        console.log('Parsed Connection Components:');
        console.log('  Username:', match[1]);
        console.log('  Password (encoded):', match[2]);
        console.log('  Cluster:', match[3]);
        console.log('  Database:', match[4]);
        console.log('\n');
    }
}

console.log('Attempting connection...\n');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        console.log('Connection Status:', mongoose.connection.readyState);
        console.log('Database:', mongoose.connection.db.databaseName);
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        if (err.errorResponse) {
            console.error('Error Code:', err.errorResponse.code);
            console.error('Error Name:', err.errorResponse.codeName);
        }
        process.exit(1);
    });
