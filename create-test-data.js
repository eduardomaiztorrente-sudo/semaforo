import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

console.log('\n=== Crear Datos de Prueba en Firestore (v4) ===\n');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  process.exit(1);
}

let serviceAccount;
try {
  let fileContent = fs.readFileSync(serviceAccountPath, 'utf8');

  // Eliminar BOM si existe
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    console.log('🔍 Se detectó BOM, limpiando...');
    fileContent = fileContent.slice(1);
  }

  serviceAccount = JSON.parse(fileContent);
  console.log('✅ Credenciales cargadas correctamente\n');
} catch (error) {
  console.error('❌ Error al parsear serviceAccountKey.json:', error.message);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('✅ Firebase inicializado\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Datos de prueba para INCIDENCIAS
const datosIncidencias = [
  {
    comunidad: 'Soto 4',
    asunto: 'Reparación tubería zona común',
    proveedor: 'Fontanería López',
    estado: 'activo',
    tipo: 'incidencias'
  },
  {
    comunidad: 'Breogán',
    asunto: 'Revisión anual ascensor',
    proveedor: 'Ascensores Galicia',
    estado: 'pendiente',
    tipo: 'incidencias'
  },
  {
    comunidad: 'Urbanización Breogán',
    asunto: 'Inspección eléctrica comunidad',
    proveedor: 'Electricidad Total',
    estado: 'activo',
    tipo: 'incidencias'
  }
];

// Datos de prueba para BORRADORES
const datosBorradores = [
  {
    comunidad: 'Soto 2',
    asunto: 'Revisión normativa estatutos',
    proveedor: 'Asesoría Jurídica López',
    estado: 'pendiente',
    tipo: 'borradores'
  },
  {
    comunidad: 'Cervantes 12',
    asunto: 'Presupuestos 2027 en revisión',
    proveedor: 'Gestoría Martínez',
    estado: 'pendiente',
    tipo: 'borradores'
  }
];

// Datos de prueba para DUDAS
const datosDudas = [
  {
    comunidad: 'Paz y Bien',
    asunto: '¿Obligatoriedad revisión caldera?',
    proveedor: 'Normativa técnica',
    estado: 'pendiente',
    tipo: 'dudas'
  },
  {
    comunidad: 'San Xosé',
    asunto: 'Interpretación art. 21 LPH',
    proveedor: 'Consultoría legal',
    estado: 'pendiente',
    tipo: 'dudas'
  }
];

async function crearDatos() {
  try {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    let totalCreados = 0;

    // Crear incidencias
    console.log('📋 Creando INCIDENCIAS...\n');
    for (const dato of datosIncidencias) {
      const docData = {
        comunidad: dato.comunidad,
        asunto: dato.asunto,
        proveedor: dato.proveedor,
        estado: dato.estado,
        tipo: dato.tipo,
        fechaVencimiento: admin.firestore.Timestamp.fromDate(hoy),
        fechaCreacion: admin.firestore.Timestamp.now(),
        completada: false,
        notas: 'Datos de prueba creados automáticamente'
      };

      const docRef = await db.collection('incidencias').add(docData);
      totalCreados++;

      console.log(`✅ [${totalCreados}] ${dato.comunidad} - ${dato.asunto}`);
      console.log(`   ID: ${docRef.id}`);
    }

    // Crear borradores
    console.log('\n📝 Creando BORRADORES...\n');
    for (const dato of datosBorradores) {
      const docData = {
        comunidad: dato.comunidad,
        asunto: dato.asunto,
        proveedor: dato.proveedor,
        estado: dato.estado,
        tipo: dato.tipo,
        fechaVencimiento: admin.firestore.Timestamp.fromDate(hoy),
        fechaCreacion: admin.firestore.Timestamp.now(),
        completada: false,
        notas: 'Datos de prueba creados automáticamente'
      };

      const docRef = await db.collection('borradores').add(docData);
      totalCreados++;

      console.log(`✅ [${totalCreados}] ${dato.comunidad} - ${dato.asunto}`);
      console.log(`   ID: ${docRef.id}`);
    }

    // Crear dudas
    console.log('\n❓ Creando DUDAS...\n');
    for (const dato of datosDudas) {
      const docData = {
        comunidad: dato.comunidad,
        asunto: dato.asunto,
        proveedor: dato.proveedor,
        estado: dato.estado,
        tipo: dato.tipo,
        fechaVencimiento: admin.firestore.Timestamp.fromDate(hoy),
        fechaCreacion: admin.firestore.Timestamp.now(),
        completada: false,
        notas: 'Datos de prueba creados automáticamente'
      };

      const docRef = await db.collection('dudas').add(docData);
      totalCreados++;

      console.log(`✅ [${totalCreados}] ${dato.comunidad} - ${dato.asunto}`);
      console.log(`   ID: ${docRef.id}`);
    }

    console.log(`\n✅ Se crearon ${totalCreados} gestiones correctamente\n`);
    console.log('📊 Resumen:');
    console.log(`   • ${datosIncidencias.length} incidencias`);
    console.log(`   • ${datosBorradores.length} borradores`);
    console.log(`   • ${datosDudas.length} dudas`);
    console.log('\n🚀 El dashboard muestra:\n');
    console.log('   1. Todas estas gestiones porque vencen hoy');
    console.log('   2. Checkboxes para marcarlas como completadas');
    console.log('   3. El dashboard se actualiza cada 30 segundos');
    console.log('   4. Las no marcadas continúan al día siguiente\n');

  } catch (error) {
    console.error('❌ Error al crear datos:', error.message);
    throw error;
  } finally {
    await admin.app().delete();
  }
}

crearDatos().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
