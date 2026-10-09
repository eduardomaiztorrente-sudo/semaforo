# Guía Rápida - Semáforo de Incidencias

## 📋 Checklist de Despliegue

- [x] Código Cloud Function inyectado en editor
- [x] Botón "Volver a implementar" presionado
- [ ] Cloud Build completado exitosamente
- [ ] Variables de entorno configuradas (FYNKUS_USER, FYNKUS_PASSWORD)
- [ ] Firestore inicializado (firestore-init.js ejecutado)
- [ ] Cloud Scheduler configurado (scheduler-setup.sh ejecutado)
- [ ] Dashboard desplegado (Firebase Hosting o Cloud Storage)
- [ ] Google Apps Script creado y deployado
- [ ] Etiquetas de Gmail creadas

## 🚀 Comandos Rápidos

### Verificar Estado del Despliegue

```bash
# Ver detalles de la Cloud Function
gcloud run services describe scrapearfynkus --region us-central1 --project semaforo-fincas

# Ver últimos logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=scrapearfynkus" --limit 20 --project semaforo-fincas

# Obtener URL de la función
gcloud run services describe scrapearfynkus --region us-central1 --format 'value(status.url)' --project semaforo-fincas
```

### Configurar Variables de Entorno

```bash
# Configurar credenciales de Fynkus
gcloud run services update scrapearfynkus \
  --region us-central1 \
  --set-env-vars FYNKUS_USER=email@fynkus.com,FYNKUS_PASSWORD=password \
  --project semaforo-fincas

# Verificar variables configuradas
gcloud run services describe scrapearfynkus --region us-central1 --project semaforo-fincas | grep env
```

### Firestore

```bash
# Inicializar colecciones
node firestore-init.js

# Listar documentos
gcloud firestore documents list --collection incidencias --project semaforo-fincas

# Consultar específicamente
gcloud firestore documents get incidencias/ultimas --project semaforo-fincas
```

### Cloud Scheduler

```bash
# Crear scheduler automático
chmod +x scheduler-setup.sh && ./scheduler-setup.sh

# Ver trabajos programados
gcloud scheduler jobs list --location=us-central1 --project=semaforo-fincas

# Ver detalles de un trabajo
gcloud scheduler jobs describe scrapearfynkus-scheduler --location=us-central1 --project=semaforo-fincas

# Ejecutar manualmente
gcloud scheduler jobs run scrapearfynkus-scheduler --location=us-central1 --project=semaforo-fincas

# Cambiar horario (editar el archivo scheduler-setup.sh primero)
gcloud scheduler jobs delete scrapearfynkus-scheduler --location=us-central1 --project=semaforo-fincas
```

### Pruebas

```bash
# Probar la función directamente
FUNCTION_URL=$(gcloud run services describe scrapearfynkus --region us-central1 --format 'value(status.url)' --project semaforo-fincas)
curl -X POST $FUNCTION_URL

# Probar endpoint de salud
curl $FUNCTION_URL/health

# Con headers personalizados
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"scrape"}' \
  $FUNCTION_URL
```

## 📊 URLs Importantes

| Componente | URL |
|-----------|-----|
| Cloud Run Function | `https://scrapearfynkus-46419772803.us-central1.run.app` |
| Cloud Run Console | `https://console.cloud.google.com/run?project=semaforo-fincas` |
| Firestore Console | `https://console.cloud.google.com/firestore?project=semaforo-fincas` |
| Cloud Scheduler | `https://console.cloud.google.com/cloudscheduler?project=semaforo-fincas` |
| Cloud Build | `https://console.cloud.google.com/cloud-build?project=semaforo-fincas` |
| Cloud Logging | `https://console.cloud.google.com/logs?project=semaforo-fincas` |
| Dashboard | `https://storage.googleapis.com/semaforo-fincas-dashboard/` (después de desplegar) |
| Apps Script | `https://script.google.com` |

## 📁 Estructura de Archivos

```
scratchpad/
├── index.js                    # Cloud Function mejorada
├── package.json               # Dependencias Node.js
├── firestore-init.js          # Script de inicialización
├── Semaforo-GmailLabels.gs    # Google Apps Script
├── dashboard.html             # Dashboard web
├── scheduler-setup.sh         # Script de scheduler
├── .env.example               # Plantilla de configuración
├── DEPLOYMENT_GUIDE.md        # Guía completa
├── QUICK_REFERENCE.md         # Este archivo
└── set-env-vars.sh           # Script auxiliar de variables
```

## 🔧 Tareas Comunes

### Actualizar el código de la Cloud Function

```bash
# 1. Editar index.js localmente
# 2. Ir a Cloud Run Console
# 3. Hacer clic en "EDITAR Y VOLVER A IMPLEMENTAR"
# 4. Reemplazar el código
# 5. Hacer clic en "IMPLEMENTAR"
```

### Cambiar la frecuencia de scraping

```bash
# El scheduler ejecuta cada 6 horas por defecto
# Para cambiar, editar scheduler-setup.sh:
# SCHEDULE_EXPRESSION="0 */6 * * *"  # <-- cambiar este valor

# Opciones comunes:
# 0 * * * *      = Cada hora
# 0 */2 * * *    = Cada 2 horas
# 0 */6 * * *    = Cada 6 horas (actual)
# 0 0 * * *      = Diariamente a medianoche
# 0 9 * * 1-5    = Lunes-viernes a las 9 AM
```

### Ver logs en tiempo real

```bash
# Ver logs de Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 50 --follow --project semaforo-fincas

# Ver logs de Cloud Scheduler
gcloud logging read "resource.type=cloud_scheduler_job" --limit 50 --follow --project semaforo-fincas

# Filtrar por fecha
gcloud logging read "resource.type=cloud_run_revision" \
  --start-time 2024-10-03T00:00:00Z \
  --end-time 2024-10-04T00:00:00Z \
  --project semaforo-fincas
```

### Actualizar credenciales de Fynkus

```bash
# Las credenciales están almacenadas como variables de entorno
# Para actualizar:
gcloud run services update scrapearfynkus \
  --region us-central1 \
  --set-env-vars FYNKUS_USER=nuevo_email@fynkus.com,FYNKUS_PASSWORD=nueva_password \
  --project semaforo-fincas
```

## 🐛 Solución de Problemas

### La función retorna 504

```bash
# Ver logs detallados
gcloud logging read "resource.type=cloud_run_revision" --limit 50 --project semaforo-fincas

# Comprobar que el endpoint de salud funciona
curl FUNCTION_URL/health

# Soluciones comunes:
# - Las variables de entorno no están configuradas
# - El navegador Puppeteer necesita más memoria
# - Timeout al conectar a Fynkus
```

### Firestore no recibe datos

```bash
# Verificar permisos
gcloud firestore indexes list --project semaforo-fincas

# Ver documentos
gcloud firestore documents list --collection incidencias --project semaforo-fincas

# Limpiar e reinicializar
node firestore-init.js
```

### Cloud Scheduler no dispara

```bash
# Ver estado del job
gcloud scheduler jobs describe scrapearfynkus-scheduler --location=us-central1 --project=semaforo-fincas

# Ejecutar manualmente para probar
gcloud scheduler jobs run scrapearfynkus-scheduler --location=us-central1 --project=semaforo-fincas

# Ver logs del scheduler
gcloud logging read "resource.type=cloud_scheduler_job" --limit 50 --project=semaforo-fincas
```

## 📈 Monitoreo

### Métricas Clave

- **Latencia de la función**: < 30 segundos en condiciones normales
- **Frecuencia de errores**: < 5%
- **Disponibilidad**: > 99%
- **Incidencias procesadas por ejecución**: 10-100

### Panel de Control

El dashboard debe mostrar:
- Estado general (🟢 Verde, 🟡 Amarillo, 🔴 Rojo)
- Contador de incidencias abiertas
- Contador de incidencias urgentes
- Lista de últimas incidencias con estado

## 📝 Notas

- El sistema se ejecuta cada 6 horas automáticamente
- Las credenciales de Fynkus se almacenan de forma segura como variables de entorno
- Firestore proporciona almacenamiento gratuito hasta 1 GB
- El dashboard se actualiza en tiempo real vía Firestore listeners

## 📞 Contacto y Soporte

Para ayuda adicional:
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Apps Script Documentation](https://developers.google.com/apps-script)

---

**Última actualización**: 3 de octubre de 2024
**Versión**: 1.0.0
