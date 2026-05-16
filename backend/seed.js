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
      role: 'admin',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
    });

    // Create Teachers
    const teacher1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@college.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science',
      subject: 'Data Structures',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
    });

    const teacher2 = await User.create({
      name: 'Prof. David Miller',
      email: 'david@college.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Mathematics',
      subject: 'Advanced Calculus',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
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
      section: 'A',
      dob: '2004-05-16',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
    });

    const student2 = await User.create({
      name: 'Priya Verma',
      email: 'priya@student.edu',
      password: 'password123',
      role: 'student',
      rollNumber: 'CS2026002',
      department: 'Computer Science',
      semester: 4,
      section: 'A',
      dob: '2004-05-16',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
    });

    // Create Subjects
    const subject1 = await Subject.create({
      subjectName: 'Data Structures',
      subjectCode: 'CS401',
      department: 'Computer Science',
      semester: 4,
    });

    const subject2 = await Subject.create({
      subjectName: 'Advanced Calculus',
      subjectCode: 'MTH401',
      department: 'Mathematics',
      semester: 4,
    });

    const Assignment = require('./models/Assignment');
    await Assignment.deleteMany();
    
    // Assign Subjects to Teachers
    await Assignment.create({
      facultyId: teacher1._id,
      subjectId: subject1._id,
      semester: 4,
      section: 'A'
    });

    await Assignment.create({
      facultyId: teacher2._id,
      subjectId: subject2._id,
      semester: 4,
      section: 'A'
    });

    console.log('Sample data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();