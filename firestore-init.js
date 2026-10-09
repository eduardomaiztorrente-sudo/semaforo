import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.error('');
  console.error('Pasos para obtener tu archivo de credenciales:');
  console.error('1. Ve a https://console.firebase.google.com');
  console.error('2. Selecciona tu proyecto semaforo-fincas');
  console.error('3. Configuración (engranaje) → Cuentas de servicio');
  console.error('4. Haz clic en la cuenta y ve a pestaña Claves');
  console.error('5. Haz clic en Crear clave → JSON');
  console.error('6. Guarda el archivo en la carpeta actual como serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function getIncidenciasHoy() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    console.log(`Buscando incidencias entre ${hoy.toISOString()} y ${mañana.toISOString()}...`);

    const snapshot = await db.collection('incidencias')
      .where('fechaVencimiento', '>=', admin.firestore.Timestamp.fromDate(hoy))
      .where('fechaVencimiento', '<', admin.firestore.Timestamp.fromDate(mañana))
      .get();

    const incidencias = [];
    snapshot.forEach(doc => {
      incidencias.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`\n✅ Se encontraron ${incidencias.length} incidencias para hoy\n`);
    console.log(JSON.stringify(incidencias, null, 2));

    return incidencias;
  } catch (error) {
    console.error('❌ Error al obtener incidencias:', error.message);
    throw error;
  } finally {
    await admin.app().delete();
  }
}

console.log('\n=== Gestor de Incidencias Firestore ===\n');
getIncidenciasHoy().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});