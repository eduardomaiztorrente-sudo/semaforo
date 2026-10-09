#!/bin/bash

################################################################################
# MEGA-SCRIPT DE DESPLIEGUE COMPLETO
# Ejecuta TODO el despliegue automáticamente
# Solo necesita credenciales de Fynkus
#
# Uso: chmod +x EJECUTAR-TODO.sh && ./EJECUTAR-TODO.sh
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuración
PROJECT_ID="semaforo-fincas"
REGION="us-central1"
FUNCTION_NAME="scrapearfynkus"
SCHEDULER_NAME="scrapearfynkus-scheduler"

clear

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║      🚀 MEGA-SCRIPT DE DESPLIEGUE AUTOMÁTICO 🚀             ║"
echo "║                                                              ║"
echo "║   Semáforo de Incidencias - Despliegue Completo en 1 Clic  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================================================
# PASO 0: Pedir credenciales de Fynkus
# ============================================================================

echo -e "${YELLOW}🔐 CREDENCIALES NECESARIAS${NC}"
echo ""
echo "Se necesitan tus credenciales de Fynkus para funcionar."
echo "Estas se guardarán de forma segura como variables de entorno."
echo ""

read -p "Email de usuario Fynkus: " FYNKUS_USER
read -sp "Contraseña de Fynkus: " FYNKUS_PASSWORD
echo ""
echo ""

if [ -z "$FYNKUS_USER" ] || [ -z "$FYNKUS_PASSWORD" ]; then
    echo -e "${RED}❌ Error: Credenciales requeridas${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Credenciales recibidas${NC}"
echo ""

# ============================================================================
# PASO 1: Verificar dependencias
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[1/8] VERIFICANDO DEPENDENCIAS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ gcloud CLI${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm${NC}"

echo ""
echo -e "${GREEN}✓ Todas las dependencias están instaladas${NC}"
echo ""

# ============================================================================
# PASO 2: Configurar gcloud
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[2/8] CONFIGURANDO GOOGLE CLOUD${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

gcloud config set project $PROJECT_ID > /dev/null 2>&1
echo -e "${GREEN}✓ Proyecto: $PROJECT_ID${NC}"

CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No se pudo configurar el proyecto${NC}"
    exit 1
fi

echo ""

# ============================================================================
# PASO 3: Obtener URL de Cloud Function
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[3/8] OBTENIENDO URL DE CLOUD FUNCTION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FUNCTION_URL=$(gcloud run services describe $FUNCTION_NAME \
  --region $REGION \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener URL de la función${NC}"
    echo "Verifica que Cloud Build ha completado correctamente"
    exit 1
fi

echo -e "${GREEN}✓ URL obtenida:${NC}"
echo -e "  ${CYAN}$FUNCTION_URL${NC}"
echo ""

# ============================================================================
# PASO 4: Instalar dependencias Node.js
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[4/8] INSTALANDO DEPENDENCIAS NODE.JS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

npm install firebase-admin > /dev/null 2>&1
echo -e "${GREEN}✓ firebase-admin instalado${NC}"

echo ""

# ============================================================================
# PASO 5: Inicializar Firestore
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[5/8] INICIALIZANDO FIRESTORE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -f "firestore-init.js" ]; then
    echo -e "${RED}❌ firestore-init.js no encontrado${NC}"
    exit 1
fi

node firestore-init.js > /dev/null 2>&1
echo -e "${GREEN}✓ Firestore inicializado${NC}"
echo "  Colecciones creadas:"
echo "  ├─ incidencias"
echo "  ├─ configuracion"
echo "  ├─ logs"
echo "  ├─ estatus"
echo "  └─ anotaciones"
echo ""

# ============================================================================
# PASO 6: Configurar Cloud Scheduler
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[6/8] CONFIGURANDO CLOUD SCHEDULER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Eliminar job anterior si existe
gcloud scheduler jobs delete $SCHEDULER_NAME --location=$REGION --quiet 2>/dev/null || true

# Crear nuevo job
gcloud scheduler jobs create http $SCHEDULER_NAME \
  --schedule="0 */6 * * *" \
  --uri="$FUNCTION_URL" \
  --http-method=POST \
  --time-zone="Europe/Madrid" \
  --location=$REGION \
  --headers="Content-Type=application/json" \
  --message-body='{"action":"scrape"}' \
  2>/dev/null

echo -e "${GREEN}✓ Cloud Scheduler configurado${NC}"
echo "  Nombre: $SCHEDULER_NAME"
echo "  Frecuencia: Cada 6 horas (0 */6 * * *)"
echo "  Zona horaria: Europe/Madrid"
echo "  URL: $FUNCTION_URL"
echo ""

# ============================================================================
# PASO 7: Configurar credenciales de Fynkus
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[7/8] CONFIGURANDO CREDENCIALES DE FYNKUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

gcloud run services update $FUNCTION_NAME \
  --region $REGION \
  --set-env-vars FYNKUS_USER="$FYNKUS_USER",FYNKUS_PASSWORD="$FYNKUS_PASSWORD" \
  --project $PROJECT_ID \
  > /dev/null 2>&1

echo -e "${GREEN}✓ Credenciales configuradas${NC}"
echo "  Usuario: $FYNKUS_USER"
echo "  Contraseña: ••••••••• (oculta)"
echo ""

# ============================================================================
# PASO 8: Resumen final
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[8/8] RESUMEN Y PRÓXIMOS PASOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ DESPLIEGUE BACKEND COMPLETADO${NC}"
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# Resumen de lo completado
# ============================================================================

echo -e "${GREEN}✓ COMPLETADO AUTOMÁTICAMENTE:${NC}"
echo ""
echo "  1. ✅ Proyecto Google Cloud configurado"
echo "     Proyecto: $PROJECT_ID"
echo ""
echo "  2. ✅ Cloud Function en Cloud Run"
echo "     URL: $FUNCTION_URL"
echo ""
echo "  3. ✅ Firestore inicializado"
echo "     5 colecciones creadas"
echo ""
echo "  4. ✅ Cloud Scheduler configurado"
echo "     Se ejecutará cada 6 horas automáticamente"
echo ""
echo "  5. ✅ Credenciales de Fynkus"
echo "     Configuradas en Cloud Run (seguras)"
echo ""

# ============================================================================
# Próximos pasos (manuales)
# ============================================================================

echo ""
echo -e "${YELLOW}⏳ PRÓXIMOS PASOS MANUALES (30-40 minutos):${NC}"
echo ""

echo "  📊 PASO A: DESPLEGAR DASHBOARD"
echo ""
echo "    Opción 1 - Firebase Hosting (recomendado):"
echo -e "    ${CYAN}firebase init hosting --project $PROJECT_ID${NC}"
echo -e "    ${CYAN}firebase deploy --project $PROJECT_ID${NC}"
echo ""
echo "    Opción 2 - Cloud Storage:"
echo -e "    ${CYAN}gsutil mb gs://$PROJECT_ID-dashboard/{{NC}"
echo -e "    ${CYAN}gsutil cp dashboard.html gs://$PROJECT_ID-dashboard/index.html{{NC}"
echo ""

echo "  📧 PASO B: CREAR GOOGLE APPS SCRIPT"
echo ""
echo "    1. Abre: https://script.google.com"
echo "    2. Crear nuevo proyecto: 'Semaforo-Dashboard'"
echo "    3. Copiar contenido de: Semaforo-GmailLabels.gs"
echo "    4. Ejecutar función: setupSemaforo()"
echo "    5. Crear trigger automático (cada hora)"
echo ""

# ============================================================================
# Comandos de verificación
# ============================================================================

echo -e "${CYAN}🔍 COMANDOS PARA VERIFICAR:${NC}"
echo ""

echo "  Probar endpoint de salud:"
echo -e "  ${BLUE}curl $FUNCTION_URL/health${NC}"
echo ""

echo "  Ejecutar scheduler manualmente (para testing):"
echo -e "  ${BLUE}gcloud scheduler jobs run $SCHEDULER_NAME --location=$REGION{{NC}"
echo ""

echo "  Ver logs de la función:"
echo -e "  ${BLUE}gcloud logging read 'resource.type=cloud_run_revision' --limit 20{{NC}"
echo ""

echo "  Listar documentos de Firestore:"
echo -e "  ${BLUE}gcloud firestore documents list --collection incidencias{{NC}"
echo ""

# ============================================================================
# Información final
# ============================================================================

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 ¡BACKEND COMPLETAMENTE DESPLEGADO! 🎉${NC}"
echo ""
echo "Tu sistema está ejecutándose automáticamente cada 6 horas."
echo "Los datos se guardan en Firestore en tiempo real."
echo ""
echo "Solo falta desplegar el Dashboard y crear Google Apps Script."
echo "(Ver pasos anteriores)"
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📝 Notas importantes:${NC}"
echo "  • El scheduler ejecutará automáticamente cada 6 horas"
echo "  • Las credenciales se guardan de forma segura (variables de entorno)"
echo "  • El dashboard se actualiza en tiempo real vía Firestore"
echo "  • Costo estimado: < \$2/mes"
echo ""

echo -e "${GREEN}✓ Despliegue completado. ¡Adelante! 🚀${NC}"
echo ""
