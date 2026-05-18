async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@test.com', password: 'faculty123' })
    });
    const loginData = await loginRes.json();
    console.log("Login data:", loginData);
    const token = loginData.token;
    
    // We need a subjectId. Let's fetch subjects first.
    const subRes = await fetch('http://localhost:5000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const subData = await subRes.json();
    const assignment = subData.data[0];
    console.log("Assignment:", assignment);

    const sessionRes = await fetch('http://localhost:5000/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        subjectId: assignment.subjectId._id,
        section: assignment.section,
        durationMinutes: 10
      })
    });
    const sessionData = await sessionRes.json();
    console.log("Session created:", sessionData);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
