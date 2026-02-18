// Import all models to ensure they're registered with Mongoose
import './Student';
import './Offer';
import './Candidate';
import './Appointment';

export { Student } from './Student';
export { default as Offer } from './Offer';
export { default as Candidate } from './Candidate';
export { Appointment } from './Appointment';
