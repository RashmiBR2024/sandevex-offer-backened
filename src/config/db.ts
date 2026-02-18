// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import path from 'path';

// // Load environment variables from .env.local specifically
// const envPath = path.resolve(__dirname, '../../.env.local');
// dotenv.config({ path: envPath });

// // Fallback to default .env if .env.local doesn't exist
// if (!process.env.MONGODB_URI) {
//   dotenv.config();
// }

// // Get MongoDB URI from environment variables
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error('❌ Error: MONGODB_URI environment variable is not set');
//   console.error('Please make sure you have a .env.local file in the backend directory with MONGODB_URI');
//   process.exit(1);
// }

// console.log('📡 MongoDB URI: Configured');

// export const connectDB = async () => {
//   try {
//     if (mongoose.connection.readyState >= 1) {
//       console.log('Using existing database connection');
//       return;
//     }

//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI, {
//       serverSelectionTimeoutMS: 5000,
//     });
    
//     console.log('MongoDB connected successfully');
    
//     // Log the database name to verify connection
//     console.log('Connected to database:', mongoose.connection.db?.databaseName || 'unknown');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// // Handle MongoDB connection events
// mongoose.connection.on('error', (error) => {
//   console.error('MongoDB connection error:', error);});

// mongoose.connection.on('disconnected', () => {
//   console.log('MongoDB disconnected');
// });

// // Close the MongoDB connection when the Node process ends
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   process.exit(0);
// });

import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not found in environment variables");
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = (db.connections[0]?.readyState || 0) === 1;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
