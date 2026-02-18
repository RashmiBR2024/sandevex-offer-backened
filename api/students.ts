import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import mongoose from 'mongoose';
import '../src/models'; // Import all models to register them
import { Student } from '../src/models/Student';

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const students = await Student.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Student.countDocuments();

      return res.status(200).json({
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('Error fetching students:', error);
      return res.status(500).json({
        message: 'Failed to fetch students',
        error: error?.message || 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const studentData = req.body;
      
      const student = new Student(studentData);
      await student.save();

      return res.status(201).json({
        message: 'Student created successfully',
        student
      });
    } catch (error: any) {
      console.error('Error creating student:', error);
      return res.status(500).json({
        message: 'Failed to create student',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
