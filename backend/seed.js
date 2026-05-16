const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Subject = require('./models/Subject');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Subject.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'College Administrator',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin'
    });

    // Create Teachers
    const teacher1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@college.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science',
      subject: 'Data Structures'
    });

    const teacher2 = await User.create({
      name: 'Prof. David Miller',
      email: 'david@college.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Mathematics',
      subject: 'Advanced Calculus'
    });

    // Create Students
    const student1 = await User.create({
      name: 'Ankit Sharma',
      email: 'ankit@student.edu',
      password: 'password123',
      role: 'student',
      rollNumber: 'CS2026001',
      department: 'Computer Science',
      semester: 4,
      section: 'A'
    });

    const student2 = await User.create({
      name: 'Priya Verma',
      email: 'priya@student.edu',
      password: 'password123',
      role: 'student',
      rollNumber: 'CS2026002',
      department: 'Computer Science',
      semester: 4,
      section: 'A'
    });

    // Create Subjects
    await Subject.create({
      subjectName: 'Data Structures',
      subjectCode: 'CS401',
      department: 'Computer Science',
      semester: 4,
      teacherId: teacher1._id
    });

    await Subject.create({
      subjectName: 'Advanced Calculus',
      subjectCode: 'MTH401',
      department: 'Mathematics',
      semester: 4,
      teacherId: teacher2._id
    });

    console.log('Sample data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();