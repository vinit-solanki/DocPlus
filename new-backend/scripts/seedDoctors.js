const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Sample doctors data
const doctorsData = [
  {
    name: "Dr. Richard James",
    speciality: "General Physician",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Richard has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  },
  {
    name: "Dr. Emily Larson",
    speciality: "Gynecologist",
    degree: "MBBS",
    experience: "3 Years",
    about: "Dr. Emily Larson is a dedicated gynecologist committed to providing comprehensive women's healthcare services.",
    fees: 60,
    image: "https://images.unsplash.com/photo-1594824475317-d8b5b0b0b0b0?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  },
  {
    name: "Dr. Sarah Patel",
    speciality: "Dermatologist",
    degree: "MBBS",
    experience: "2 Years",
    about: "Dr. Sarah Patel is an experienced dermatologist committed to providing comprehensive skin and hair care services.",
    fees: 30,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  },
  {
    name: "Dr. Christopher Lee",
    speciality: "Pediatricians",
    degree: "MBBS",
    experience: "10 Years",
    about: "Dr. Christopher Lee is a dedicated pediatrician committed to providing comprehensive medical care for children.",
    fees: 40,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  },
  {
    name: "Dr. Jennifer Garcia",
    speciality: "Neurologist",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Jennifer Garcia is a skilled neurologist committed to providing comprehensive neurological care.",
    fees: 50,
    image: "https://images.unsplash.com/photo-1594824475317-d8b5b0b0b0b0?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  },
  {
    name: "Dr. Andrew Williams",
    speciality: "Gastroenterologist",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. Andrew Williams is a dedicated gastroenterologist committed to providing comprehensive digestive health care.",
    fees: 40,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    availableSlots: generateTimeSlots()
  }
];

function generateTimeSlots() {
  const slots = [];
  const today = new Date();
  
  // Generate slots for next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Morning slots
    const morningTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    // Evening slots
    const eveningTimes = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    
    [...morningTimes, ...eveningTimes].forEach(time => {
      slots.push({
        date: date,
        time: time,
        isAvailable: true
      });
    });
  }
  
  return slots;
}

async function seedDoctors() {
  try {
    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');
    
    // Insert new doctors
    await Doctor.insertMany(doctorsData);
    console.log('Doctors seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();