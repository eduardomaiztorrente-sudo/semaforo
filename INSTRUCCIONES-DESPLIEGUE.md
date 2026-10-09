# 🚀 Instrucciones de Despliegue Completo - Semáforo de Incidencias

## Estado Actual
✅ **70% Completo** - Sistema completamente codificado y listo para ejecutar
- Cloud Function: Código mejorado e inyectado ✓
- Firestore: Script de inicialización preparado ✓
- Cloud Scheduler: Script de configuración preparado ✓
- Dashboard: HTML completamente funcional ✓
- Google Apps Script: Código preparado para despliegue ✓

---

## 📋 Requisitos Previos

Asegúrate de tener en tu máquina local (NO en la nube):

1. **gcloud CLI** instalado y autenticado
   ```bash
   gcloud auth login
   gcloud config set project semaforo-fincas
   ```

2. **Node.js** instalado (versión 18+)
   ```bash
   node --version
   npm --version
   ```

3. **Git** (opcional, pero recomendado)

4. **Acceso a Google Cloud Console** con permisos en el proyecto `semaforo-fincas`

5. **Credenciales de Fynkus** (email y contraseña)

---

## 🎯 Proceso de Despliegue (4 pasos sencillos)

### **PASO 1: Ejecutar el Script Automático** ⏱️ 5-10 minutos

1. **Descarga todos los archivos** de `scratchpad/` a tu máquina local

2. **Abre terminal/PowerShell** en la carpeta donde descargaste los archivos

3. **Ejecuta el script:**
   ```bash
   chmod +x DESPLIEGUE-FINAL.sh
   ./DESPLIEGUE-FINAL.sh
   ```

   **Qué hace automáticamente:**
   - ✅ Verifica que gcloud y Node.js estén instalados
   - ✅ Configura el proyecto Google Cloud
   - ✅ Obtiene la URL de tu Cloud Function
   - ✅ Instala dependencias necesarias
   - ✅ Inicializa Firestore con 5 colecciones
   - ✅ Configura Cloud Scheduler para ejecutarse cada 6 horas
   - ✅ Prepara el Dashboard HTML para desplegar

   **Salida esperada:**
   ```
   ✓ Proyecto configurado: semaforo-fincas
   ✓ URL de función obtenida: https://scrapearfynkus-xxxxx.us-central1.run.app
   ✓ Dependencias instaladas
   ✓ Firestore inicializado
   ✓ Cloud Scheduler configurado
   ✓ DESPLIEGUE AUTOMÁTICO COMPLETADO
   ```

---

### **PASO 2: Configurar Credenciales de Fynkus** ⏱️ 2 minutos

Después de que el script termine, verás esta instrucción. Cópiala y ejecuta con tus credenciales reales:

```bash
gcloud run services update scrapearfynkus \
  --region us-central1 \
  --set-env-vars FYNKUS_USER=tu_email@fynkus.com,FYNKUS_PASSWORD=tu_contraseña \
  --project semaforo-fincas
```

**Reemplaza:**
- `tu_email@fynkus.com` → tu email de usuario en Fynkus
- `tu_contraseña` → tu contraseña de Fynkus

**Confirmación:**
```
Updated [https://region-scrapearfynkus.a.run.app]
```

---

### **PASO 3: Desplegar el Dashboard** ⏱️ 5-10 minutos

Elige **una** de las dos opciones:

#### **Opción A: Firebase Hosting** (recomendado)
```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Inicializar Firebase
firebase init hosting --project semaforo-fincas

# Cuando te pregunte:
# - Public directory: . (punto)
# - Configure as single-page app: N (no)
# - Overwrite index.html: N (no)

# Desplegar
firebase deploy --project semaforo-fincas
```

**Resultado:** Tu dashboard estará en: `https://semaforo-fincas.web.app`

#### **Opción B: Cloud Storage** (más económico)
```bash
# Crear bucket
gsutil mb gs://semaforo-fincas-dashboard/

# Copiar dashboard
gsutil cp dashboard.html gs://semaforo-fincas-dashboard/index.html

# Hacer público
gsutil acl ch -u AllUsers:R gs://semaforo-fincas-dashboard/index.html
```

**Resultado:** Tu dashboard estará en: `https://storage.googleapis.com/semaforo-fincas-dashboard/index.html`

---

### **PASO 4: Desplegar Google Apps Script** ⏱️ 10-15 minutos

1. **Abre** https://script.google.com

2. **Crea nuevo proyecto:**
   - Click en "Nuevo proyecto"
   - Nómbralo: `Semaforo-Dashboard`

3. **Copia el código:**
   - Abre el archivo `Semaforo-GmailLabels.gs` en tu editor de texto
   - Copia TODO el contenido
   - Pégalo en el editor de Apps Script

4. **Guarda y ejecuta setup:**
   - Click en "Guardar"
   - En la lista de funciones, selecciona `setupSemaforo()`
   - Click en "Ejecutar" ▶️
   - Autoriza cuando se te pida

5. **Crea trigger automático:**
   - Click en "Activadores" (reloj) a la izquierda
   - Click en "Crear activador"
   - Configura:
     - Función: `processEmailThreads`
     - Evento: A tiempo (Time-driven)
     - Tipo: Cada hora
     - Horario: De 9 AM a 6 PM (ajusta según necesites)
   - Click en "Crear"

---

## ✅ Verificación de Funcionamiento

Después de completar todos los pasos, verifica que todo funciona:

### 1️⃣ **Probar la función** (30 segundos)
```bash
curl -X POST https://scrapearfynkus-xxxxx.us-central1.run.app/health
```
Respuesta esperada:
```json
{"status":"ok","timestamp":"2024-10-03T..."}
```

### 2️⃣ **Ejecutar scheduler manualmente** (para testing)
```bash
gcloud scheduler jobs run scrapearfynkus-scheduler --location=us-central1
```

### 3️⃣ **Ver logs de ejecución**
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 20
```

### 4️⃣ **Verificar Firestore**
```bash
gcloud firestore documents list --collection incidencias
```

### 5️⃣ **Abrir Dashboard**
- Abre la URL que obtuviste en PASO 3
- Deberías ver un semáforo con estado (🟢 verde, 🟡 amarillo o 🔴 rojo)
- Y una tabla con incidencias

### 6️⃣ **Verificar Gmail**
- Abre Gmail
- Deberías ver etiquetas nuevas: `Incidencias/Urgentes`, `Incidencias/Normales`, etc.

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────────────────┐
│         Semáforo de Incidencias - OPERATIVO         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Cloud Scheduler (cada 6 horas)                     │
│         ↓                                           │
│  Cloud Function (Node.js con Puppeteer)            │
│    ├─ Conecta a Fynkus                            │
│    ├─ Scrape de incidencias                       │
│    └─ Guarda en Firestore                         │
│         ↓                                           │
│  Firestore (Base de datos en tiempo real)          │
│         ↓                                           │
│  Dashboard HTML (actualización en vivo)            │
│    └─ Muestra semáforo + estadísticas             │
│         ↓                                           │
│  Google Apps Script (procesa emails)               │
│    ├─ Lee threads de Gmail                        │
│    ├─ Etiqueta automáticamente                    │
│    └─ Sincroniza con Firestore                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### "Error: comando no encontrado"
- Asegúrate de estar en la carpeta correcta
- En Windows, usa PowerShell como Administrador
- Verifica que gcloud está en el PATH: `gcloud --version`

### "Permission denied"
```bash
# En Mac/Linux, asegúrate de dar permisos:
chmod +x DESPLIEGUE-FINAL.sh
```

### "No se pudo obtener URL de la función"
- Cloud Build puede aún estar compilando
- Espera 5 minutos y vuelve a ejecutar el script
- Verifica en Cloud Console → Cloud Run

### "Firestore initialization failed"
- Verifica que tienes Firebase Admin SDK: `npm install firebase-admin`
- Asegúrate de que tu cuenta tiene permisos en el proyecto

### "Dashboard no se actualiza"
- Abre la consola del navegador (F12)
- Busca errores de autenticación con Firestore
- Verifica que la URL de la función es correcta en el dashboard

### "Cloud Scheduler no dispara"
```bash
# Verifica que el job está habilitado:
gcloud scheduler jobs describe scrapearfynkus-scheduler --location=us-central1

# Ejecuta manualmente para probar:
gcloud scheduler jobs run scrapearfynkus-scheduler --location=us-central1

# Ve los logs:
gcloud logging read "resource.type=cloud_scheduler_job" --limit 20
```

---

## 📞 URLs Importantes

| Componente | URL |
|-----------|-----|
| Cloud Run Console | https://console.cloud.google.com/run?project=semaforo-fincas |
| Firestore | https://console.cloud.google.com/firestore?project=semaforo-fincas |
| Cloud Scheduler | https://console.cloud.google.com/cloudscheduler?project=semaforo-fincas |
| Cloud Logging | https://console.cloud.google.com/logs?project=semaforo-fincas |
| Google Apps Script | https://script.google.com |
| Gmail | https://mail.google.com |

---

## 💾 Resumen de Archivos

```
scratchpad/
├── DESPLIEGUE-FINAL.sh           ← Script PRINCIPAL (ejecuta esto)
├── index.js                      ← Cloud Function (ya desplegada)
├── package.json                  ← Dependencias
├── firestore-init.js             ← Inicializa Firestore (ejecutado por script)
├── dashboard.html                ← Dashboard web (para desplegar)
├── Semaforo-GmailLabels.gs       ← Google Apps Script (para Apps Script)
├── scheduler-setup.sh            ← Configuración de scheduler (automatizada)
├── .env.example                  ← Plantilla de variables
├── DEPLOYMENT_GUIDE.md           ← Guía completa
├── QUICK_REFERENCE.md            ← Referencia rápida
└── INSTRUCCIONES-DESPLIEGUE.md   ← Este archivo
```

---

## 🎯 Resumen de Pasos

| Paso | Acción | Tiempo | Automatizado |
|------|--------|--------|---------------|
| 1 | Ejecutar DESPLIEGUE-FINAL.sh | 5-10 min | ✅ Sí |
| 2 | Configurar credenciales Fynkus | 2 min | ❌ Manual |
| 3 | Desplegar Dashboard | 5-10 min | ❌ Manual (elige opción) |
| 4 | Desplegar Google Apps Script | 10-15 min | ❌ Manual |
| **Total** | **Despliegue Completo** | **22-37 min** | **~80% automático** |

---

## ✨ Después del Despliegue

Tu sistema estará:
- ✅ Ejecutándose automáticamente cada 6 horas
- ✅ Scrapeando incidencias de Fynkus
- ✅ Almacenando en Firestore
- ✅ Mostrando en Dashboard en tiempo real
- ✅ Etiquetando emails automáticamente en Gmail
- ✅ Monitoreado y loguado completamente

---

**¿Preguntas?** Consulta:
- DEPLOYMENT_GUIDE.md - Guía técnica completa
- QUICK_REFERENCE.md - Comandos rápidos
- Google Cloud Docs - https://cloud.google.com/docs

---

**Última actualización:** 3 de octubre de 2026
**Versión:** 2.0 - Despliegue Final Automatizado
**Estado:** Listo para ejecutar ✅

