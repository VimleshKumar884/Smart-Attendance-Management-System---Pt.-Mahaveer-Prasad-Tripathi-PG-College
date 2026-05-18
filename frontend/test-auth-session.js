const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sarah@college.edu',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Logged in:", token.substring(0, 20) + "...");
    
    // We need a subjectId. Let's fetch subjects first.
    const subRes = await axios.get('http://localhost:5000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assignment = subRes.data.data[0];
    console.log("Assignment:", assignment);

    const sessionRes = await axios.post('http://localhost:5000/api/sessions/create', {
      subjectId: assignment.subjectId._id,
      section: assignment.section,
      durationMinutes: 10
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Session created:", sessionRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
