/**
 * Placeholder for Email/SMS alerts
 * In a real-world scenario, you would integrate with SendGrid, Twilio, or AWS SES here.
 */

exports.sendLowAttendanceAlert = async (studentEmail, studentPhone, percentage) => {
  console.log(`[STUB: EMAIL ALERT] To: ${studentEmail} | Message: Your attendance is critically low at ${percentage}%. Please contact your faculty.`);
  
  // Example SMS integration (Twilio placeholder)
  if (studentPhone) {
    console.log(`[STUB: SMS ALERT] To: ${studentPhone} | Message: Attendance Alert: ${percentage}%`);
  }
};

exports.sendQrScanSuccess = async (studentEmail, subjectName) => {
  console.log(`[STUB: NOTIFICATION] To: ${studentEmail} | Attendance marked for ${subjectName}`);
};
