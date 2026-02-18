import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import mongoose from 'mongoose';

// CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app', 'https://sandevex-offer-frontend.vercel.app'],
  credentials: true
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
}

// Simple Offer schema without Student reference
const SimpleOfferSchema = new mongoose.Schema({
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending' 
  },
  respondedAt: { 
    type: Date 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date,
    required: true
  }
});

const SimpleOffer = mongoose.model('Offer', SimpleOfferSchema);

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
      if (!MONGODB_URI) {
        return res.status(500).json({
          message: 'MONGODB_URI not set',
          error: 'Database configuration error'
        });
      }

      await mongoose.connect(MONGODB_URI);
      
      const offers = await SimpleOffer.find()
        .sort({ sentAt: -1 })
        .lean();

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
