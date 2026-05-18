const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();

  let errorFound = false;

  page.on('console', msg => {
     if(msg.type() === 'error') {
         console.error('BROWSER CONSOLE ERROR:', msg.text());
     }
  });
  page.on('pageerror', err => {
      console.error('UNCAUGHT PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost:5173/login/faculty', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'rahul@test.com');
  await page.type('input[type="password"]', 'faculty123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  await page.goto('http://localhost:5173/faculty/mark-attendance', { waitUntil: 'networkidle0' });
  
  await page.waitForSelector('select');
  await page.select('select', await page.evaluate(() => document.querySelectorAll('select option')[1].value));
  
  await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const loadBtn = btns.find(b => b.innerText.includes('Load Students'));
      if (loadBtn) loadBtn.click();
  });
  
  await page.waitForFunction(() => {
     return [...document.querySelectorAll('button')].find(b => b.innerText.includes('Start 10 Min Session'));
  });

  console.log("Clicking Generate Session");
  await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const genBtn = btns.find(b => b.innerText.includes('Start 10 Min Session'));
      if(genBtn) genBtn.click();
  });

  await new Promise(r => setTimeout(r, 3000));
  console.log("Check complete.");
  await browser.close();
  process.exit(0);
})();