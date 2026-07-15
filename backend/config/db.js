import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // If MONGO_URI is not set or is still the default placeholder, fallback to RAM DB
    if (!mongoUri || mongoUri.includes('xxxx') || mongoUri.includes('username')) {
      console.log('--- DB Config Alert ---');
      console.log('No MongoDB Atlas URL provided in .env.');
      console.log('Starting a dynamic In-Memory MongoDB Server inside RAM...');

      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();

      console.log(`Temporary DB running at: ${mongoUri}`);
      console.log('-----------------------');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit server process on failure
  }
};

export default connectDB;
