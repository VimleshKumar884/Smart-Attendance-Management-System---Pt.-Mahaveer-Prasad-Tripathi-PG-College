const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './backend/.env'});
const Session = require('./backend/models/Session');
const AuditLog = require('./backend/models/AuditLog');

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_attendance');
  console.log("Connected to DB");
  const session = await Session.create({
    teacherId: new mongoose.Types.ObjectId(),
    subjectId: new mongoose.Types.ObjectId(),
    section: 'A',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  console.log("Session created:", session);
  await AuditLog.create({
      action: 'SESSION_CREATED',
      performedBy: new mongoose.Types.ObjectId(),
      details: { sessionId: session._id, subjectId: session.subjectId, section: session.section, expiresAt: session.expiresAt }
  });
  console.log("Audit log created");
  process.exit(0);
}
test().catch(console.error);
