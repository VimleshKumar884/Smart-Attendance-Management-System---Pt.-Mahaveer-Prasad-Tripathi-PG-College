const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  // Navigate to login
  await page.goto('http://localhost:5173/login/faculty', { waitUntil: 'networkidle2' });
  
  // Fill login form
  await page.type('input[type="email"]', 'rahul@test.com');
  await page.type('input[type="password"]', 'faculty123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log("Logged in!");

  // Go to Mark Attendance page
  await page.goto('http://localhost:5173/faculty/mark-attendance', { waitUntil: 'networkidle2' });
  console.log("On Mark Attendance page");

  // Select subject
  await page.waitForSelector('select');
  await page.select('select', await page.evaluate(() => document.querySelectorAll('select option')[1].value));

  // Load students
  await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const loadBtn = btns.find(b => b.innerText.includes('Load Students'));
      loadBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));

  console.log("Clicking Generate Session");
  await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const genBtn = btns.find(b => b.innerText.includes('Start 10 Min Session'));
      if(genBtn) genBtn.click();
  });

  // Wait a bit to see if error occurs
  await new Promise(r => setTimeout(r, 3000));
  console.log("Done");
  await browser.close();
})();
