const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
        // Seed Admin User
        const adminExists = await User.findOne({ email: 'admin@verichain.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Super Admin',
                email: 'admin@verichain.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Auto-Seeded default Admin -> Email: admin@verichain.com | Password: admin123');
        }

        // Seed Dummy Products if none exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const dummyProducts = [
                {
                    productName: 'Mahparah Premium Saffron',
                    serialNumber: 'MPH-SF-001',
                    batchNumber: 'BATCH-2024-001',
                    manufacturingDate: new Date('2024-01-15'),
                    expiryDate: new Date('2026-01-15'),
                    quantity: 500,
                    description: 'Original Kashmiri Saffron, grade A quality.',
                    hash: '4fe29c8e...',
                    blockchainTxId: '0x123abc456def789'
                },
                {
                    productName: 'Mahparah Pure Honey',
                    serialNumber: 'MPH-HN-082',
                    batchNumber: 'BATCH-2024-005',
                    manufacturingDate: new Date('2024-02-10'),
                    expiryDate: new Date('2025-08-10'),
                    quantity: 200,
                    description: 'Organic forest honey, raw and unfiltered.',
                    hash: '9a8b7c6d...',
                    blockchainTxId: '0x789def123abc456'
                }
            ];
            await Product.insertMany(dummyProducts);
            console.log('📦 Auto-Seeded 2 Local Demo Products.');
        }
    } catch (seedError) {
        console.error('Seeding failed:', seedError.message);
    }
};

module.exports = { seedAdmin };

