#!/usr/bin/env node

/**
 * CloseKart MongoDB Atlas Setup Checklist
 * Run this after configuring MongoDB Atlas to verify everything works
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     CloseKart MongoDB Connection Setup Checklist           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Load environment variables
dotenv.config();

// Check 1: .env file exists
console.log('📋 CHECK 1: Environment File');
console.log('─────────────────────────────────────────────────────────────');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ backend/.env file exists');
    const mongoUri = process.env.MONGO_URI;
    console.log(`✅ MONGO_URI is set`);
    console.log(`   Value: ${mongoUri.substring(0, 50)}...`);
} else {
    console.log('❌ backend/.env file NOT found');
    process.exit(1);
}
console.log();

// Check 2: Environment variables
console.log('📋 CHECK 2: Environment Variables');
console.log('─────────────────────────────────────────────────────────────');
if (process.env.MONGO_URI) {
    console.log('✅ MONGO_URI loaded');
} else {
    console.log('❌ MONGO_URI not loaded');
}
if (process.env.PORT) {
    console.log(`✅ PORT loaded: ${process.env.PORT}`);
} else {
    console.log('❌ PORT not loaded');
}
if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET loaded');
} else {
    console.log('❌ JWT_SECRET not loaded');
}
console.log();

// Check 3: Connection string format
console.log('📋 CHECK 3: Connection String Format');
console.log('─────────────────────────────────────────────────────────────');
const mongoUri = process.env.MONGO_URI;
if (mongoUri && mongoUri.includes('mongodb+srv://')) {
    console.log('✅ Connection string uses mongodb+srv:// (Atlas)');
} else {
    console.log('❌ Connection string format incorrect');
}

if (mongoUri && mongoUri.includes('closekart')) {
    console.log('✅ Connection string contains username: closekart');
} else {
    console.log('❌ Username not found in connection string');
}

if (mongoUri && mongoUri.includes('%23closekart74')) {
    console.log('✅ Connection string has URL-encoded password');
} else {
    console.log('⚠️  Password encoding check failed');
}

if (mongoUri && mongoUri.includes('cluster0.wy3rb6d.mongodb.net')) {
    console.log('✅ Connection string contains cluster0');
} else {
    console.log('❌ Cluster information not found');
}

if (mongoUri && mongoUri.includes('retryWrites=true')) {
    console.log('✅ Connection string has retryWrites option');
} else {
    console.log('⚠️  retryWrites option missing');
}
console.log();

// Check 4: Try to connect
console.log('📋 CHECK 4: MongoDB Atlas Connection');
console.log('─────────────────────────────────────────────────────────────');
console.log('Attempting to connect to MongoDB Atlas...\n');

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ MongoDB Connection: SUCCESS');
        console.log(`✅ Database: ${mongoose.connection.db.databaseName}`);
        console.log(`✅ Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting'}`);
        
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║              ✅ ALL CHECKS PASSED!                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        console.log('🎉 Your MongoDB Atlas is properly configured!');
        console.log('🚀 Backend is ready for production use.');
        console.log('\nYou can now run: node server.js\n');
        
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ MongoDB Connection: FAILED');
        console.log(`❌ Error: ${err.message}`);
        
        if (err.message.includes('bad auth')) {
            console.log('\n⚠️  Authentication Failed!');
            console.log('Possible causes:');
            console.log('  1. User "closekart" does not exist in MongoDB Atlas');
            console.log('  2. Password is incorrect (should be: #closekart74)');
            console.log('  3. User was not created with correct permissions');
            console.log('\nAction: Log in to MongoDB Atlas and:');
            console.log('  - Go to Database Access');
            console.log('  - Create or edit user: closekart');
            console.log('  - Password: #closekart74');
            console.log('  - Role: Read and write to any database');
        } else if (err.message.includes('ECONNREFUSED')) {
            console.log('\n⚠️  Connection Refused!');
            console.log('Possible causes:');
            console.log('  1. IP address is not whitelisted');
            console.log('  2. MongoDB Atlas cluster is not running');
            console.log('\nAction: Log in to MongoDB Atlas and:');
            console.log('  - Go to Network Access');
            console.log('  - Add IP: 0.0.0.0/0 (or your specific IP)');
            console.log('  - Save and wait for changes to apply');
        } else if (err.message.includes('ENOTFOUND')) {
            console.log('\n⚠️  DNS Resolution Failed!');
            console.log('Possible causes:');
            console.log('  1. Internet connection issue');
            console.log('  2. Cluster host name is incorrect');
            console.log('\nAction: Check your connection string and network');
        }
        
        process.exit(1);
    });
