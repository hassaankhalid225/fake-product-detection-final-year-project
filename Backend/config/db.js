const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer;

const connectDB = async () => {
    // Check if we should use local DB or if Atlas URI is provided
    const mongoUri = process.env.MONGO_URI;
    const dbSource = mongoUri && mongoUri.includes('mongodb.net') ? 'Atlas' : 'Local';

    try {
        if (mongoUri) {
            const conn = await mongoose.connect(mongoUri);
            console.log(`✅ MongoDB ${dbSource} Connected: ${conn.connection.host}`);
            return;
        }
        throw new Error('No MONGO_URI provided in .env');
    } catch (error) {
        if (dbSource === 'Atlas') {
            console.error('❌ MongoDB Atlas Connection Error:', error.message);
        }
        
        // Zero-config persistent local DB fallback
        console.warn('🚀 Initializing portable local database...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            
            // Ensure db-data directory exists for persistence
            const dbPath = path.join(__dirname, '../db-data');
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            if (!mongoServer) {
                mongoServer = await MongoMemoryServer.create({
                    instance: {
                        dbPath: dbPath,
                        storageEngine: 'wiredTiger',
                        dbName: 'mahparah_local'
                    }
                });
            }
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log(`✅ Portable Local DB connected at: ${dbPath}`);
            console.log(`🔗 Connection URI: ${uri}`);
        } catch (err) {
            console.error('❌ Failed to start portable database:', err);
            process.exit(1);
        }
    }
};

module.exports = connectDB;

