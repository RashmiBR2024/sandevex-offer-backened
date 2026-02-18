// import cors from 'cors';
// import mongoose from 'mongoose';
// import studentRoutes from '../src/routes/students';
// import offerRoutes from '../src/routes/offerRoutes';
// import slotRoutes from '../src/routes/slotRoutes';
// import appointmentRoutes from '../src/routes/appointmentRoutes';
// import express from 'express';

// const app = express();

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app', 'https://sandevex-offer-frontend.vercel.app'],
//   credentials: true
// }));
// app.use(express.json());

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   console.error('❌ MONGODB_URI environment variable is not set');
// } else {
//   // Connect to MongoDB
//   mongoose.connect(MONGODB_URI)
//     .then(() => console.log('✅ MongoDB connected successfully'))
//     .catch(err => console.error('❌ MongoDB connection error:', err));
// }

// // Routes
// app.use("/api/students", studentRoutes);
// app.use("/api/offers", offerRoutes);
// app.use("/api/slots", slotRoutes);
// app.use("/api/appointments", appointmentRoutes);

// // Health check
// app.get("/api/health", (_req, res) => {
//   res.status(200).json({ status: "OK", message: "Server is running" });
// });

// export default app;
import "../src/models";  // <-- ADD THIS FIRST

import cors from 'cors';
import mongoose from 'mongoose';
import studentRoutes from '../src/routes/students';
import offerRoutes from '../src/routes/offerRoutes';
import slotRoutes from '../src/routes/slotRoutes';
import appointmentRoutes from '../src/routes/appointmentRoutes';
import express from 'express';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app', 'https://sandevex-offer-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

export default app;
