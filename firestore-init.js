/**
 * Firestore Initialization Script
 * Initialize Firestore collections and set up indexes for the Semáforo system
 *
 * Run this script once to set up the Firestore database structure
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (use service account)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'semaforo-fincas'
  });
}

const db = admin.firestore();

/**
 * Initialize Firestore collections and sample data
 */
async function initializeFirestore() {
  try {
    console.log('Initializing Firestore collections...');

    // 1. Create the incidencias collection with initial document
    await db.collection('incidencias').doc('ultimas').set({
      datos: [],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      actualizacion: new Date().toISOString()
    });
    console.log('✓ Created incidencias/ultimas collection');

    // 2. Create the configuracion collection
    await db.collection('configuracion').doc('sistema').set({
      version: '1.0.0',
      fynkus_enabled: true,
      gmail_enabled: true,
      scraping_interval: '0 */6 * * *', // Every 6 hours
      max_incidents: 100,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Created configuracion/sistema');

    // 3. Create the logs collection for tracking scraping runs
    await db.collection('logs').doc('scraping_log').set({
      runs: [],
      last_success: admin.firestore.FieldValue.serverTimestamp(),
      total_incidents_scraped: 0
    });
    console.log('✓ Created logs/scraping_log');

    // 4. Create the estatus collection for dashboard status
    await db.collection('estatus').doc('dashboard').set({
      estado: 'verde', // verde, amarillo, rojo
      incidencias_abiertas: 0,
      incidencias_urgentes: 0,
      incidencias_resueltas: 0,
      ultima_actualizacion: admin.firestore.FieldValue.serverTimestamp(),
      emails_procesados: 0
    });
    console.log('✓ Created estatus/dashboard');

    // 5. Create the anotaciones collection for notes and comments
    await db.collection('anotaciones').doc('sistema').set({
      notas: [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✓ Created anotaciones/sistema');

    console.log('\n✓ Firestore initialization complete!');
    console.log('\nCollections created:');
    console.log('  - incidencias (incident data)');
    console.log('  - configuracion (system configuration)');
    console.log('  - logs (scraping and activity logs)');
    console.log('  - estatus (dashboard status)');
    console.log('  - anotaciones (notes and annotations)');

    return true;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return false;
  }
}

/**
 * Create composite indexes for optimized queries
 * Note: These can also be created through the GCP Console
 */
function getIndexDefinitions() {
  return [
    {
      collection: 'incidencias',
      fields: [
        { fieldPath: 'estado', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    },
    {
      collection: 'logs',
      fields: [
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]
    }
  ];
}

/**
 * Sample incident data structure for reference
 */
function getSampleIncident() {
  return {
    fechaAlta: '2024-10-01',
    comunidad: 'Residencial Maiz',
    propiedad: 'Bloque A',
    oficio: 'Fontanería',
    proveedor: 'Fontanero 123',
    tipo: 'Avería',
    asunto: 'Filtración en cocina',
    estado: 'Abierto',
    prioridad: 'Normal',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    tags: ['agua', 'cocina', 'urgencia'],
    asignado_a: 'admin@example.com'
  };
}

/**
 * Add sample incident data (for testing)
 */
async function addSampleIncidents() {
  try {
    const sample1 = getSampleIncident();
    sample1.fechaAlta = '2024-10-01';
    sample1.asunto = 'Filtración en cocina';

    const sample2 = getSampleIncident();
    sample2.fechaAlta = '2024-10-02';
    sample2.asunto = 'Calefacción no funciona';
    sample2.tipo = 'Avería';
    sample2.prioridad = 'Urgente';

    // Add samples as subcollection
    await db.collection('incidencias').doc('ultimas')
      .collection('detalle').doc('sample1').set(sample1);

    await db.collection('incidencias').doc('ultimas')
      .collection('detalle').doc('sample2').set(sample2);

    console.log('✓ Sample incidents added');
  } catch (error) {
    console.error('Error adding sample incidents:', error);
  }
}

/**
 * List all collections (for verification)
 */
async function listCollections() {
  try {
    const collections = await db.listCollections();
    console.log('\nExisting Firestore collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.id}`);
    });
  } catch (error) {
    console.error('Error listing collections:', error);
  }
}

// Run initialization
async function main() {
  const success = await initializeFirestore();
  if (success) {
    await listCollections();
    // Uncomment to add sample data
    // await addSampleIncidents();
  }
  process.exit(success ? 0 : 1);
}

// Export functions for use as module
module.exports = {
  initializeFirestore,
  getSampleIncident,
  addSampleIncidents,
  listCollections,
  getIndexDefinitions
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
