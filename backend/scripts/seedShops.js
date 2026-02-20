/*
 Seed 5 sample shops in Patna
 Usage: node scripts/seedShops.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Shop = require('../models/Shop');

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI not set in environment.');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Base coordinates for Patna
    const baseLat = 25.5941;
    const baseLng = 85.1376;

    // Helper to offset coords slightly
    const jitter = (val, delta) => val + (Math.random() * 2 - 1) * delta;

    const samples = [
      {
        name: 'Patna Fresh Mart',
        shopName: 'Patna Fresh Mart',
        category: 'Grocery',
        latitude: jitter(baseLat, 0.01),
        longitude: jitter(baseLng, 0.01),
        address: 'Fraser Road, Patna, Bihar 800001',
        city: 'Patna',
      },
      {
        name: 'Ganga Electronics',
        shopName: 'Ganga Electronics',
        category: 'Electronics',
        latitude: jitter(baseLat, 0.01),
        longitude: jitter(baseLng, 0.01),
        address: 'Boring Road, Patna, Bihar 800001',
        city: 'Patna',
      },
      {
        name: 'Magadh Medicals',
        shopName: 'Magadh Medicals',
        category: 'Pharmacy',
        latitude: jitter(baseLat, 0.01),
        longitude: jitter(baseLng, 0.01),
        address: 'Kankarbagh, Patna, Bihar 800020',
        city: 'Patna',
      },
      {
        name: 'Ashoka Book Store',
        shopName: 'Ashoka Book Store',
        category: 'Books & Stationery',
        latitude: jitter(baseLat, 0.01),
        longitude: jitter(baseLng, 0.01),
        address: 'Ashok Rajpath, Patna, Bihar 800004',
        city: 'Patna',
      },
      {
        name: 'Bihar Fashion Hub',
        shopName: 'Bihar Fashion Hub',
        category: 'Clothing',
        latitude: jitter(baseLat, 0.01),
        longitude: jitter(baseLng, 0.01),
        address: 'Dak Bungalow Road, Patna, Bihar 800001',
        city: 'Patna',
      },
    ];

    // Map to Shop model documents. Provide required fields (owner, phone, location)
    const ownerId = new mongoose.Types.ObjectId(); // placeholder owner
    const withModelFields = samples.map((s, i) => ({
      owner: ownerId,
      shopName: s.shopName,
      category: s.category,
      address: s.address,
      phone: `98765000${10 + i}`,
      location: { type: 'Point', coordinates: [s.longitude, s.latitude] }, // [lng, lat]
      // Keep additional fields for reference/debugging
      name: s.name,
      city: s.city,
      latitude: s.latitude,
      longitude: s.longitude,
    }));

    // Clean up any existing samples with same names to avoid duplicates
    const names = samples.map(s => s.shopName);
    await Shop.deleteMany({ shopName: { $in: names } });

    const inserted = await Shop.collection.insertMany(withModelFields); // bypass validation to retain extra fields
    console.log(`Inserted ${inserted.insertedCount || (inserted?.ops?.length ?? 0)} shops.`);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
