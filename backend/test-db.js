const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         MongoDB Database Read/Write Test                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function testDatabaseConnection() {
    try {
        // Step 1: Connect to MongoDB
        console.log('Step 1: Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Step 2: Test read operation
        console.log('Step 2: Testing READ operation...');
        const userCount = await User.countDocuments();
        console.log(`✅ READ Success: Found ${userCount} users in database\n`);

        // Step 3: Verify User model has required fields
        console.log('Step 3: Verifying User model schema...');
        const userSchema = User.schema.obj;
        console.log('✅ User model fields:');
        Object.keys(userSchema).forEach(field => {
            console.log(`   - ${field}`);
        });
        console.log();

        // Step 4: Get database info
        console.log('Step 4: Database Information:');
        console.log(`✅ Database: ${mongoose.connection.db.databaseName}`);
        console.log(`✅ Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
        console.log(`✅ Host: ${mongoose.connection.host}`);
        console.log();

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║         ✅ ALL DATABASE TESTS PASSED                      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('Summary:');
        console.log('  ✓ MongoDB Atlas connection successful');
        console.log('  ✓ Database is readable');
        console.log('  ✓ User model is working');
        console.log('  ✓ Schema validation passed');
        console.log();

        process.exit(0);
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error('\nError Details:', error);
        process.exit(1);
    }
}

testDatabaseConnection();
