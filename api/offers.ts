import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import mongoose from 'mongoose';
import '../src/models'; // Import all models to register them
import Offer from '../src/models/Offer';

// CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app', 'https://sandevex-offer-frontend.vercel.app'],
  credentials: true
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  if (req.method === 'GET') {
    try {
      const offers = await Offer.find()
        .populate('candidateId', 'fullName mobile')
        .sort({ sentAt: -1 });

      return res.status(200).json({ offers });
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      return res.status(500).json({
        message: 'Failed to fetch offers',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
