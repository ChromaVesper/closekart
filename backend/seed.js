const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
        await importData();
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await User.deleteMany();
        await Shop.deleteMany();
        await Product.deleteMany();
        await Service.deleteMany();

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            { name: 'Amit Kumar', email: 'amit@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Rahul Gupta', email: 'rahul@shop.com', password: hashedPassword, role: 'shopkeeper' }, // Owner of Gupta General Store
            { name: 'Suresh Sharma', email: 'suresh@shop.com', password: hashedPassword, role: 'shopkeeper' }, // Owner of Sharma Dairy
            { name: 'Ravi Singh', email: 'ravi@shop.com', password: hashedPassword, role: 'shopkeeper' }, // Owner of Ravi Mobile
            { name: 'Admin User', email: 'admin@closekart.com', password: hashedPassword, role: 'admin' },
        ]);

        // Create Shops
        const shops = await Shop.insertMany([
            {
                owner: users[1]._id,
                shopName: 'Gupta General Store',
                category: 'Grocery',
                address: 'Anisabad Golambar, Patna',
                location: { type: 'Point', coordinates: [85.1082, 25.5866] }, // Approx Anisabad coords
                rating: 4.8,
                distanceKm: 0.5,
                deliveryAvailable: true,
                deliveryCharge: 20,
                phone: '9876543210'
            },
            {
                owner: users[2]._id,
                shopName: 'Sharma Dairy',
                category: 'Dairy',
                address: 'Near Police Colony, Anisabad, Patna',
                location: { type: 'Point', coordinates: [85.1100, 25.5870] },
                rating: 4.6,
                distanceKm: 0.8,
                deliveryAvailable: true,
                deliveryCharge: 15,
                phone: '9876500000'
            },
            {
                owner: users[3]._id,
                shopName: 'Ravi Mobile Repair',
                category: 'Electronics',
                address: 'Manik Chand Talab Road, Anisabad, Patna',
                location: { type: 'Point', coordinates: [85.1050, 25.5850] },
                rating: 4.2,
                distanceKm: 1.2,
                deliveryAvailable: false,
                deliveryCharge: 0,
                phone: '9998887776'
            },
            {
                owner: users[1]._id, // Reusing owner for demo
                shopName: 'Daily Needs Super Store',
                category: 'Grocery',
                address: 'Phulwari Sharif Road, Anisabad',
                location: { type: 'Point', coordinates: [85.0900, 25.5800] },
                rating: 4.5,
                distanceKm: 2.1,
                deliveryAvailable: true,
                deliveryCharge: 30,
                phone: '8887776665'
            }
        ]);

        // Create Products
        await Product.insertMany([
            { shop: shops[0]._id, name: 'Amul Milk (Taaza) 1L', category: 'Dairy', price: 54, stockQuantity: 50 },
            { shop: shops[0]._id, name: 'Basmati Rice 1kg', category: 'Grocery', price: 120, stockQuantity: 20 },
            { shop: shops[0]._id, name: 'Sugar 1kg', category: 'Grocery', price: 45, stockQuantity: 100 },
            { shop: shops[0]._id, name: 'Eggs (1 Tray - 30 pcs)', category: 'Grocery', price: 210, stockQuantity: 10 },

            { shop: shops[1]._id, name: 'Amul Gold Milk 500ml', category: 'Dairy', price: 33, stockQuantity: 40 },
            { shop: shops[1]._id, name: 'Paneer 1kg', category: 'Dairy', price: 400, stockQuantity: 5 },
            { shop: shops[1]._id, name: 'Curd 1kg', category: 'Dairy', price: 110, stockQuantity: 8 },

            { shop: shops[2]._id, name: 'C-Type Mobile Charger', category: 'Electronics', price: 350, stockQuantity: 15 },
            { shop: shops[2]._id, name: 'Earphones', category: 'Electronics', price: 200, stockQuantity: 30 },

            { shop: shops[3]._id, name: 'Notebook (Classmate)', category: 'Stationery', price: 60, stockQuantity: 100 },
            { shop: shops[3]._id, name: 'Pen Box (Link)', category: 'Stationery', price: 50, stockQuantity: 20 },
        ]);

        // Create Services
        await Service.insertMany([
            { shop: shops[2]._id, name: 'Mobile Screen Replacement', price: 1500, homeServiceAvailable: false },
            { shop: shops[2]._id, name: 'Charging Port Repair', price: 300, homeServiceAvailable: false },
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

connectDB();
