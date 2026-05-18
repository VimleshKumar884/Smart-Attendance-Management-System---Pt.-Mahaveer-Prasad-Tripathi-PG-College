const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');
const FacultyLoginLog = require('./models/FacultyLoginLog');
const AttendanceOtp = require('./models/AttendanceOtp');
const OtpUsageLog = require('./models/OtpUsageLog');
const BackdatedLog = require('./models/BackdatedLog');
const Notification = require('./models/Notification');

dotenv.config();

const indianFirstNames = [
  "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Siddharth", "Rohan", "Krishna", "Ishaan", "Shaurya",
  "Aarohi", "Ananya", "Diya", "Isha", "Kavya", "Meera", "Neha", "Pooja", "Riya", "Sneha",
  "Karan", "Rahul", "Vikram", "Amit", "Raj", "Manish", "Suresh", "Ramesh", "Deepak", "Anil",
  "Priya", "Sunita", "Anita", "Geeta", "Seema", "Rekha", "Kiran", "Nisha", "Lata", "Asha",
  "Ravi", "Manoj", "Ajay", "Vijay", "Sanjay", "Rajesh", "Prakash", "Gaurav", "Tarun", "Nitin"
];
const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Das", "Bose", "Jha", "Mishra",
  "Pandey", "Tiwari", "Yadav", "Chauhan", "Rajput", "Rao", "Reddy", "Nair", "Menon", "Pillai"
];

function getRandomName() {
  const first = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
  const last = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  return `${first} ${last}`;
}

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Subject.deleteMany();
    await Assignment.deleteMany();
    await Attendance.deleteMany();
    await FacultyLoginLog.deleteMany();
    await AttendanceOtp.deleteMany();
    await OtpUsageLog.deleteMany();
    await BackdatedLog.deleteMany();
    await Notification.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'College Administrator',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin',
      securityQuestion: 'What was your first pet\'s name?',
      securityAnswer: 'fluffy'
    });
    console.log('Admin created.');

    // Create 1 Test Faculty
    const faculty = await User.create({
      name: 'Prof. Rahul Sharma',
      email: 'rahul@test.com',
      password: 'faculty123',
      role: 'teacher',
      employeeId: 'FAC001',
      department: 'Computer Science',
      securityQuestion: 'What is your mother\'s maiden name?',
      securityAnswer: 'verma'
    });
    console.log('Faculty created.');

    // Create 3 Subjects
    const subject1 = await Subject.create({
      subjectName: 'Data Structures',
      subjectCode: 'CS301',
      department: 'Computer Science',
      semester: 3,
      section: 'CS-A'
    });
    const subject2 = await Subject.create({
      subjectName: 'Web Development',
      subjectCode: 'CS302',
      department: 'Computer Science',
      semester: 3,
      section: 'CS-A'
    });
    const subject3 = await Subject.create({
      subjectName: 'DBMS',
      subjectCode: 'CS303',
      department: 'Computer Science',
      semester: 3,
      section: 'CS-A'
    });
    console.log('Subjects created.');

    // Assign Subjects to Faculty
    await Assignment.create([
      { facultyId: faculty._id, subjectId: subject1._id, semester: 3, section: 'CS-A' },
      { facultyId: faculty._id, subjectId: subject2._id, semester: 3, section: 'CS-A' },
      { facultyId: faculty._id, subjectId: subject3._id, semester: 3, section: 'CS-A' }
    ]);
    console.log('Subjects assigned to Faculty.');

    // Create 50 Test Students
    const studentsData = [];
    for (let i = 1; i <= 50; i++) {
      const rollNumStr = i.toString().padStart(3, '0');
      studentsData.push({
        name: getRandomName(),
        email: `student${i}@test.com`,
        password: 'password123',
        role: 'student',
        rollNumber: `CS${rollNumStr}`,
        dob: '15/08/2004',
        department: 'Computer Science',
        semester: 3,
        section: 'CS-A',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue'
      });
    }
    await User.insertMany(studentsData);
    console.log('50 Students created.');

    console.log('✅ Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
