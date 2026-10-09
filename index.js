const functions = require('@google-cloud/functions-framework');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Main function to scrape Fynkus
async function extraerIncidenciasDeFynkus() {
  let browser;
  try {
    console.log('Iniciando scraper de Fynkus...');

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('Navegando a Fynkus...');

    // Login to Fynkus
    await page.goto('https://www.fynkus.com/login', { waitUntil: 'networkidle2' });

    const user = process.env.FYNKUS_USER;
    const password = process.env.FYNKUS_PASSWORD;

    if (!user || !password) {
      throw new Error('FYNKUS_USER y FYNKUS_PASSWORD deben estar configurados');
    }

    // Fill login form
    await page.type('input[type="email"]', user);
    await page.type('input[type="password"]', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    console.log('Login exitoso, navegando a incidencias...');

    // Navigate to incidents page
    await page.goto('https://www.fynkus.com/incidencias', { waitUntil: 'networkidle2' });

    // Scroll to load all incidents
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);
    let incidenciasCount = 0;

    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);

      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }

    // Extract incidents from table
    const incidencias = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) {
          const incident = {
            fechaAlta: cells[0]?.textContent.trim() || '',
            comunidad: cells[1]?.textContent.trim() || '',
            propiedad: cells[2]?.textContent.trim() || '',
            oficio: cells[3]?.textContent.trim() || '',
            proveedor: cells[4]?.textContent.trim() || '',
            tipo: cells[5]?.textContent.trim() || '',
            asunto: cells[6]?.textContent.trim() || '',
            estado: cells[7]?.textContent.trim() || ''
          };
          data.push(incident);
        }
      });

      return data;
    });

    console.log(`Se extrajeron ${incidencias.length} incidencias`);
    return incidencias;

  } catch (error) {
    console.error('Error en scraper:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// HTTP Health check endpoint
functions.http('scrapearFynkus', async (req, res) => { `r`n  // Enable CORS `r`n  res.set('Access-Control-Allow-Origin', '*'); `r`n  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); `r`n  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); `r`n  `r`n  if (req.method === 'OPTIONS') { `r`n    return res.status(204).send(''); `r`n  } `r`n  `r`n  console.log('Request received:', req.method, req.path);

  try {
    // Healthcheck endpoint
    if (req.path === '/health' || req.method === 'GET' && !req.body) {
      console.log('Health check successful');
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Main scraping endpoint
    console.log('Starting Fynkus scraping...');
    const incidencias = await extraerIncidenciasDeFynkus();

    // Save to Firestore
    console.log('Saving to Firestore...');
    await db.collection('incidencias').doc('ultimas').set({
      datos: incidencias,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Scraping completed successfully');
    res.json({
      success: true,
      message: 'Incidencias scrapeadas correctamente',
      cantidad: incidencias.length,
      incidencias: incidencias
    });
  } catch (error) {
    console.error('Error during scraping:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

