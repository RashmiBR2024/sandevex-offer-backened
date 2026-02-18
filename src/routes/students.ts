import express from 'express';
import { Student } from '../models/Student';

const router = express.Router();

// Apply CORS headers
router.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Get all students
router.get('/', async (_req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    return res.json({ success: true, student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch student' });
  }
});

// Submit student application
router.post('/', async (req, res) => {
  try {
    const studentData = {
      fullName: req.body.fullName,
      email: req.body.email,
      mobile: req.body.mobile,
      cityState: req.body.cityState,
      address: req.body.address,
      collegeName: req.body.collegeName,
      degree: req.body.degree,
      branch: req.body.branch,
      yearOfStudy: req.body.yearOfStudy,
      preferredDomain: req.body.preferredDomain,
      technicalSkills: Array.isArray(req.body.technicalSkills) 
        ? req.body.technicalSkills 
        : [req.body.technicalSkills].filter(Boolean),
      priorExperience: req.body.priorExperience,
      portfolioUrl: req.body.portfolioUrl,
      whySandevex: req.body.whySandevex,
      declaration: req.body.declaration,
      assignmentSent: Boolean(req.body.assignmentSent),
    };

    const student = new Student(studentData);
    await student.save();

    // Send offer email (to be implemented)
    // await sendOfferEmail(student.email, student.fullName);

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// Send offer email to student
router.post('/:id/send-offer', async (req: express.Request, res: express.Response) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Update the student's status
    student.assignmentSent = true;
    student.sentAt = new Date();
    await student.save();
    
    // In a real application, you would integrate with EmailJS here
    console.log(`Offer sent to ${student.email}`);
    
    return res.json({ 
      success: true, 
      message: 'Offer email sent successfully',
      data: student
    });
  } catch (error) {
    console.error('Error sending offer email:', error);
    return res.status(500).json({ success: false, error: 'Failed to send offer email' });
  }
});

export default router;
