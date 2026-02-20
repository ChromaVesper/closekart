#!/usr/bin/env node

/**
 * MongoDB Atlas Troubleshooting Guide
 * Run this to diagnose the connection issue
 */

const dotenv = require('dotenv');
dotenv.config();

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     MongoDB Atlas Troubleshooting Diagnostic               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('🔍 DIAGNOSIS: Authentication Failed Error\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('POSSIBLE CAUSES (In Order of Likelihood)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. ❌ Database User NOT Created Yet');
console.log('   If you just set up MongoDB Atlas:');
console.log('   - User might not be saved yet');
console.log('   - Database Access might still be processing');
console.log('   Action: Wait 2-3 minutes and try again\n');

console.log('2. ❌ Wrong Username or Password');
console.log('   Current connection string username: closekart');
console.log('   Current connection string password: %23closekart74 (encoded)\n');
console.log('   Action: In MongoDB Atlas Database Access:');
console.log('   - Delete the user if wrong');
console.log('   - Create new user with EXACT credentials:');
console.log('     Username: closekart');
console.log('     Password: #closekart74 (with hash symbol)\n');

console.log('3. ❌ User Created in Wrong Database');
console.log('   Action: In MongoDB Atlas Database Access:');
console.log('   - Check if user is "admin" user (not specific to a database)');
console.log('   - Should have permissions for "Any Database"\n');

console.log('4. ❌ Network Access Not Configured');
console.log('   Your cluster cannot be reached');
console.log('   Action: In MongoDB Atlas Network Access:');
console.log('   - Verify 0.0.0.0/0 is added (or your specific IP)');
console.log('   - Status should show as "ACTIVE"\n');

console.log('5. ❌ Cluster is Paused or Stopped');
console.log('   Action: In MongoDB Atlas Clusters:');
console.log('   - Check cluster status is "IDLE" or "RUNNING"');
console.log('   - If paused, click "Resume" to restart\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('VERIFICATION STEPS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Step 1: Log in to MongoDB Atlas');
console.log('URL: https://mongodb.com/cloud\n');

console.log('Step 2: Navigate to Database Access');
console.log('- Click "Database Access" in left sidebar');
console.log('- Look for user: "closekart"');
console.log('- Verify it shows "PASSWORD" auth method\n');

console.log('Step 3: Check/Create User');
console.log('If "closekart" user exists:');
console.log('- Username should be: closekart');
console.log('- Click the three dots (...) and select "Edit Password"');
console.log('- Set password to: #closekart74');
console.log('- Click "Update Password"\n');

console.log('If "closekart" user does NOT exist:');
console.log('- Click "+ Add New Database User"');
console.log('- Username: closekart');
console.log('- Password: #closekart74');
console.log('- Database User Privileges: "Read and write to any database"');
console.log('- Click "Add User"\n');

console.log('Step 4: Verify Network Access');
console.log('- Click "Network Access" in left sidebar');
console.log('- Verify entry exists for: 0.0.0.0/0 (or your IP)');
console.log('- Status should show as "ACTIVE" (green checkmark)\n');

console.log('Step 5: Check Cluster Status');
console.log('- Click "Clusters" or "Deployments"');
console.log('- Find cluster: "cluster0"');
console.log('- Status should NOT be "PAUSED"');
console.log('- If paused, click "Resume"\n');

console.log('Step 6: Wait and Retry');
console.log('- After changes, wait 1-2 minutes');
console.log('- Run: node check-mongodb.js again');
console.log('- Or run: node server.js\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('YOUR CURRENT CONFIGURATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const uri = process.env.MONGO_URI;
console.log('Connection String:');
console.log(uri + '\n');

const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
if (match) {
    console.log('Parsed Details:');
    console.log('  Username: ' + match[1]);
    console.log('  Password (encoded): ' + match[2]);
    console.log('  Cluster: ' + match[3]);
    console.log('  Database: ' + match[4] + '\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('QUICK CHECKLIST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Before retrying, verify ALL of these:');
console.log('[ ] User "closekart" exists in MongoDB Atlas');
console.log('[ ] Password is exactly: #closekart74 (with hash symbol)');
console.log('[ ] User has "Read and write to any database" role');
console.log('[ ] Network Access includes 0.0.0.0/0 (or your IP)');
console.log('[ ] Network Access entry shows "ACTIVE" status');
console.log('[ ] Cluster status is NOT "PAUSED"');
console.log('[ ] Waited at least 1-2 minutes after making changes\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('AFTER FIXING, RUN:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('node check-mongodb.js   (to verify the fix)');
console.log('node server.js          (to start the server)\n');

console.log('Expected success output:');
console.log('✅ MongoDB Connection: SUCCESS');
console.log('✅ Database: closekart');
console.log('✅ ALL CHECKS PASSED!\n');

console.log('═════════════════════════════════════════════════════════════\n');

process.exit(0);
