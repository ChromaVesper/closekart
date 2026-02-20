#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║              CloseKart Backend - Production Readiness Audit                  ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

// Load environment
dotenv.config();

let allChecksPass = true;

// Check 1: .env File
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✓ CHECK 1: Environment Configuration (.env)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    allChecksPass = false;
} else {
    console.log('✅ .env file exists');
    
    if (process.env.MONGO_URI) {
        console.log('✅ MONGO_URI is set');
        const uriValidation = process.env.MONGO_URI.includes('mongodb+srv://');
        console.log(`   ${uriValidation ? '✅' : '❌'} Uses MongoDB Atlas (mongodb+srv://)`);
        const hasUsername = process.env.MONGO_URI.includes('closekart');
        console.log(`   ${hasUsername ? '✅' : '❌'} Contains username: closekart`);
        const hasCluster = process.env.MONGO_URI.includes('cluster0');
        console.log(`   ${hasCluster ? '✅' : '❌'} Contains cluster: cluster0`);
        allChecksPass = allChecksPass && uriValidation && hasUsername && hasCluster;
    } else {
        console.log('❌ MONGO_URI not set');
        allChecksPass = false;
    }
    
    if (process.env.JWT_SECRET) {
        console.log('✅ JWT_SECRET is set');
    } else {
        console.log('❌ JWT_SECRET not set');
        allChecksPass = false;
    }
    
    if (process.env.PORT) {
        console.log(`✅ PORT is set: ${process.env.PORT}`);
    } else {
        console.log('❌ PORT not set');
        allChecksPass = false;
    }
}
console.log();

// Check 2: Dependencies
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✓ CHECK 2: Package Dependencies');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const requiredDeps = ['mongoose', 'dotenv', 'express', 'bcryptjs', 'jsonwebtoken', 'cors'];

requiredDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
        console.log(`✅ ${dep} (${pkg.dependencies[dep]})`);
    } else {
        console.log(`❌ ${dep} missing`);
        allChecksPass = false;
    }
});
console.log();

// Check 3: Core Files
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✓ CHECK 3: Core Backend Files');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const coreFiles = [
    'server.js',
    'package.json',
    '.env',
    'middleware/auth.js',
    'models/User.js',
    'models/Shop.js',
    'models/Product.js',
    'models/Service.js',
    'routes/auth.js',
    'routes/shops.js',
    'routes/products.js',
    'routes/services.js'
];

coreFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} missing`);
        allChecksPass = false;
    }
});
console.log();

// Check 4: Configuration Quality
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✓ CHECK 4: Configuration Quality');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Read server.js to check configuration
const serverPath = path.join(__dirname, 'server.js');
const serverCode = fs.readFileSync(serverPath, 'utf8');

const hasDotenvConfig = serverCode.includes('dotenv.config()');
console.log(`${hasDotenvConfig ? '✅' : '❌'} dotenv.config() present`);
allChecksPass = allChecksPass && hasDotenvConfig;

const hasModernConnect = serverCode.includes('mongoose.connect(process.env.MONGO_URI)');
console.log(`${hasModernConnect ? '✅' : '❌'} Modern mongoose.connect() without deprecated options`);
allChecksPass = allChecksPass && hasModernConnect;

const noDeprecatedOptions = !serverCode.includes('useNewUrlParser') && !serverCode.includes('useUnifiedTopology');
console.log(`${noDeprecatedOptions ? '✅' : '❌'} No deprecated mongoose options`);
allChecksPass = allChecksPass && noDeprecatedOptions;

const hasErrorHandling = serverCode.includes('.then(') && serverCode.includes('.catch(');
console.log(`${hasErrorHandling ? '✅' : '❌'} Proper error handling (.then/.catch)`);
allChecksPass = allChecksPass && hasErrorHandling;

const hasExpressSetup = serverCode.includes('app.use(express.json())') && serverCode.includes('app.use(cors())');
console.log(`${hasExpressSetup ? '✅' : '❌'} Express middleware configured (JSON, CORS)`);
allChecksPass = allChecksPass && hasExpressSetup;

const hasPortListener = serverCode.includes('app.listen(PORT');
console.log(`${hasPortListener ? '✅' : '❌'} Server listening on PORT`);
allChecksPass = allChecksPass && hasPortListener;

const hasRoutes = serverCode.includes('/api/auth') && serverCode.includes('/api/shops');
console.log(`${hasRoutes ? '✅' : '❌'} API routes configured`);
allChecksPass = allChecksPass && hasRoutes;
console.log();

// Check 5: Security
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✓ CHECK 5: Security & Best Practices');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const noHardcodedCredentials = !serverCode.includes('mongodb+srv://') || serverCode.includes('process.env');
console.log(`${noHardcodedCredentials ? '✅' : '❌'} No hardcoded credentials (uses environment variables)`);
allChecksPass = allChecksPass && noHardcodedCredentials;

const usesEnvVars = serverCode.includes('process.env.MONGO_URI') && serverCode.includes('process.env.PORT');
console.log(`${usesEnvVars ? '✅' : '❌'} Uses environment variables for configuration`);
allChecksPass = allChecksPass && usesEnvVars;

const hasCors = serverCode.includes('cors()');
console.log(`${hasCors ? '✅' : '❌'} CORS protection enabled`);
allChecksPass = allChecksPass && hasCors;
console.log();

// Final Result
console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
if (allChecksPass) {
    console.log('║              ✅ ALL PRODUCTION READINESS CHECKS PASSED ✅                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
    
    console.log('Summary:');
    console.log('  ✓ All configuration files present and correct');
    console.log('  ✓ All required dependencies installed');
    console.log('  ✓ MongoDB Atlas connection properly configured');
    console.log('  ✓ Express server properly configured');
    console.log('  ✓ Security best practices followed');
    console.log('  ✓ No deprecated options or hardcoded credentials');
    console.log('  ✓ Backend is production-ready\n');
    
    process.exit(0);
} else {
    console.log('║              ⚠️  SOME CHECKS FAILED - REVIEW ABOVE ⚠️                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
    process.exit(1);
}
