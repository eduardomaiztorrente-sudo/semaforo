import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

console.log('\n=== Crear Datos de Prueba en Firestore ===\n');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: No se encontró serviceAccountKey.json');
  process.exit(1);
}

let serviceAccount;
try {
  let fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }
  serviceAccount = JSON.parse(fileContent);
  console.log('Credenciales cargadas correctamente\n');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('Firebase inicializado\n');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const datosIncidencias = [
  { comunidad: 'Soto 4', asunto: 'Reparación tubería zona común', proveedor: 'Fontanería López', estado: 'activo', diasVencimiento: 0 },
  { comunidad: 'Breogán', asunto: 'Revisión anual ascensor', proveedor: 'Ascensores Galicia', estado: 'pendiente', diasVencimiento: 0 },
  { comunidad: 'Urbanización Breogán', asunto: 'Inspección eléctrica comunidad', proveedor: 'Electricidad Total', estado: 'activo', diasVencimiento: 0 },
  { comunidad: 'Soto 2', asunto: 'Reparación azotea', proveedor: 'Construcciones Marcos', estado: 'pendiente', diasVencimiento: 0 },
  { comunidad: 'Cervantes 12', asunto: 'Limpieza canalones', proveedor: 'Limpiezas Profesionales', estado: 'resuelto', diasVencimiento: 0 },
  { comunidad: 'Paz y Bien', asunto: 'Mantenimiento caldera', proveedor: 'Calefacción García', estado: 'activo', diasVencimiento: 0 },
  { comunidad: 'San Xosé', asunto: 'Reparación puerta principal', proveedor: 'Cerrajería López', estado: 'pendiente', diasVencimiento: 0 },
  { comunidad: 'Virgen del Pilar', asunto: 'Control plagas común', proveedor: 'Desratización Plus', estado: 'resuelto', diasVencimiento: 0 }
];

async function crearDatos() {
  try {
    console.log(`Creando ${datosIncidencias.length} incidencias...\n`);
    let contador = 0;
    for (const dato of datosIncidencias) {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + dato.diasVencimiento);
      hoy.setHours(23, 59, 59, 999);
      const docData = {
        comunidad: dato.comunidad,
        asunto: dato.asunto,
        proveedor: dato.proveedor,
        estado: dato.estado,
        fechaVencimiento: admin.firestore.Timestamp.fromDate(hoy),
        fechaCreacion: admin.firestore.Timestamp.now(),
        notas: 'Datos de prueba'
      };
      const docRef = await db.collection('incidencias').add(docData);
      contador++;
      console.log(`[${contador}/${datosIncidencias.length}] ${dato.comunidad}`);
    }
    console.log(`\nSe crearon ${contador} incidencias!\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await admin.app().delete();
  }
}

crearDatos().catch(e => { console.error(e); process.exit(1); });