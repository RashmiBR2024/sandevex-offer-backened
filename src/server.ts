import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/students";
import offerRoutes from "./routes/offerRoutes";
import slotRoutes from "./routes/slotRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

const app = express();

/* ===================== MIDDLEWARE ===================== */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sandevex-offer-email.vercel.app",
    "https://sandevex-offer-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());


/* ===================== DB CONNECTION ===================== */
/*
IMPORTANT:
In serverless (Vercel), every request may start a new function.
So we connect only when needed, inside a middleware.
*/

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    next(err);
  }
});


/* ===================== ROUTES ===================== */

app.use("/api/students", studentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);


/* ===================== HEALTH ===================== */

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});


/* ===================== ERROR HANDLER ===================== */

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message
  });
});


/* ===================== 404 ===================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`
  });
});


/* ===================== LOCALHOST ONLY ===================== */
/*
Vercel ignores this because NODE_ENV=production
So server starts only locally
*/

if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}


/* ===================== EXPORT FOR VERCEL ===================== */

export default app;
