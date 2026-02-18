import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import mongoose from 'mongoose';
import '../src/models'; // Import all models to register them
import { Student } from '../src/models/Student';
import Candidate from '../src/models/Candidate';
import Offer from '../src/models/Offer';
import { Appointment } from '../src/models/Appointment';

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

  const { query } = req;
  const path = query.path as string;

  // Route based on path parameter
  if (path === 'students') {
    return await handleStudents(req, res);
  } else if (path === 'candidates') {
    return await handleCandidates(req, res);
  } else if (path === 'offers') {
    return await handleOffers(req, res);
  } else if (path === 'appointments') {
    return await handleAppointments(req, res);
  } else if (path === 'offer-status') {
    return await handleOfferStatus(req, res);
  } else if (path === 'create-offer') {
    return await handleCreateOffer(req, res);
  } else {
    return res.status(404).json({ message: 'Endpoint not found' });
  }
}

async function handleStudents(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const skip = (page - 1) * limit;

      console.log('📊 Students API - Page:', page, 'Limit:', limit, 'Search:', search);

      // Build search query if search term is provided
      let searchQuery = {};
      if (search) {
        searchQuery = {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { collegeName: { $regex: search, $options: 'i' } }
          ]
        };
        console.log('🔍 Search query:', JSON.stringify(searchQuery, null, 2));
      }

      const students = await Student.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Student.countDocuments(searchQuery);

      console.log('📈 Found students:', students.length, 'Total:', total);

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

async function handleCandidates(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const candidates = await Candidate.find()
        .populate('studentId', 'fullName email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Candidate.countDocuments();

      return res.status(200).json({
        candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      return res.status(500).json({
        message: 'Failed to fetch candidates',
        error: error?.message || 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const candidateData = req.body;
      const candidate = new Candidate(candidateData);
      await candidate.save();

      return res.status(201).json({
        message: 'Candidate created successfully',
        candidate
      });
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      return res.status(500).json({
        message: 'Failed to create candidate',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

async function handleOffers(req: VercelRequest, res: VercelResponse) {
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

async function handleAppointments(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const appointments = await Appointment.find()
        .populate('candidateId', 'fullName mobile email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ appointments });
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        message: 'Failed to fetch appointments',
        error: error?.message || 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { candidateId, slotDate, slotTime, notes } = req.body;

      const appointment = new Appointment({
        candidateId,
        slotDate,
        slotTime,
        notes,
        status: 'scheduled'
      });

      await appointment.save();

      return res.status(201).json({
        message: 'Appointment scheduled successfully',
        appointment
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        message: 'Failed to create appointment',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

async function handleOfferStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Candidate ID is required' });
      }

      // Validate if it's a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid candidate ID format' });
      }

      const offer = await Offer.findOne({
        candidateId: new mongoose.Types.ObjectId(id),
        status: { $in: ['pending', 'accepted', 'declined'] }
      }).sort({ sentAt: -1 });

      if (!offer) {
        return res.status(404).json({ message: 'No offer found for this candidate' });
      }

      return res.json({
        status: offer.status,
        sentAt: offer.sentAt,
        respondedAt: offer.respondedAt,
        expiresAt: offer.expiresAt
      });
    } catch (error: any) {
      console.error('Error getting offer status:', error);
      return res.status(500).json({
        message: 'Failed to get offer status',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

async function handleCreateOffer(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { candidateId, email, status } = req.body;

      if (!candidateId || !email) {
        return res.status(400).json({ message: 'Candidate ID and email are required' });
      }

      // Check if candidate exists
      const candidate = await Student.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      // Check if offer already exists
      const existingOffer = await Offer.findOne({ candidateId });
      if (existingOffer) {
        return res.status(400).json({ message: 'Offer already exists for this candidate' });
      }

      // Create offer record
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours to respond

      const offer = new Offer({
        candidateId,
        email,
        status: status || 'pending',
        expiresAt,
        sentAt: new Date()
      });

      await offer.save();

      return res.status(201).json({
        message: 'Offer record created successfully',
        offer: {
          id: offer._id,
          candidateId: offer.candidateId,
          email: offer.email,
          status: offer.status,
          sentAt: offer.sentAt,
          expiresAt: offer.expiresAt
        }
      });

    } catch (error: any) {
      console.error('Error creating offer record:', error);
      return res.status(500).json({
        message: 'Failed to create offer record',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
