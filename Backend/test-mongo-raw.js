const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        console.log("Connecting with MongoClient...");
        await client.connect();
        console.log("✅ MongoClient connected successfully!");
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Pinged Successfully!");
    } catch (e) {
        console.error("❌ MongoClient connection failed:", e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
