# 🚨 Semáforo de Incidencias v2.0

**Kanban Dashboard para Gestión de Incidencias de Fincas**

---

## 🌐 Acceso al Dashboard

### **URL CORRECTA (USAR ESTA):**
```
https://semaforo-bice.vercel.app
```

✅ **Estado:** Totalmente funcional y sincronizado con Firestore  
✅ **Última actualización:** Commit bee795c (Dashboard Kanban con 8 columnas)  
✅ **Datos:** En tiempo real desde Firestore  

---

## 📊 Características del Dashboard

### **4 Columnas de Incidencias (Firestore)**
- **📋 Incidencias** - Problemas reportados
- **📧 Borradores** - Respuestas en preparación
- **❓ Dudas** - Preguntas sin resolver
- **✅ Completadas** - Tareas finalizadas

### **Funcionalidades**
- ✓ Sincronización automática con Firestore
- ✓ Búsqueda y filtrado en tiempo real
- ✓ Arrastrar y soltar entre columnas
- ✓ Vista responsive (móvil, tablet, desktop)
- ✓ Botón "Sincronizar" para actualizar datos manualmente

---

## 🚀 Despliegue

### **Tecnología**
- Frontend: HTML5 + CSS3 + JavaScript
- Backend: Firebase Firestore
- Hosting: Vercel (semaforo-bice.vercel.app)
- Control de versiones: GitHub

### **Despliegue Automático**
El dashboard se actualiza automáticamente en Vercel cuando haces push a la rama `main`:

```bash
# Hacer cambios locales
git add .
git commit -m "Descripción del cambio"
git push origin main

# Vercel redeploy automático en ~30 segundos
```

---

## 🔧 Desarrollo Local

### **Requisitos**
- Node.js v18+
- Git
- Credenciales de Firebase/Firestore

### **Instalación**
```bash
cd Semaforo
npm install
```

### **Ejecutar localmente**
```bash
# Opción 1: Servidor simple
npx serve public

# Opción 2: Con Node.js
node index.js

# Luego abre: http://localhost:3000
```

### **Hacer cambios**
1. Edita `public/index.html`
2. Recarga el navegador
3. Cuando esté listo, haz push a GitHub

---

## 📝 Notas Importantes

### **Sobre semaforo.vercel.app**
- ⚠️ Este dominio está asignado a otro proyecto en Vercel y no se puede transferir a través de la UI
- ✅ **Solución:** Usar **semaforo-bice.vercel.app** (totalmente funcional)
- 📌 Todos los links y bookmarks deben apuntar a `https://semaforo-bice.vercel.app`

### **Sincronización**
- La rama `main` de GitHub es la fuente de verdad
- Vercel redeploy automático en cada push
- El archivo local `public/index.html` contiene el dashboard completo

---

## 📦 Archivos Importantes

```
Semaforo/
├── public/
│   └── index.html          ← Dashboard principal (8 columnas)
├── package.json            ← Dependencias
├── .vercel/
│   └── project.json        ← Configuración Vercel
├── .env.local              ← Variables de entorno (Git ignorado)
└── README.md               ← Este archivo
```

---

## 🔐 Configuración de Firestore

El dashboard se conecta automáticamente a Firestore usando las credenciales configuradas en `public/index.html`:

```javascript
// Firestore collections
- incidencias    → Problemas reportados
- borradores     → Borradores de respuestas
- dudas          → Preguntas pendientes
- completadas    → Tareas finalizadas
```

---

## 💡 Solución de Problemas

### **Dashboard no carga datos**
1. Verifica la conexión a Firestore
2. Abre DevTools (F12) → Console
3. Busca errores de autenticación o CORS

### **Cambios no se reflejan en Vercel**
1. Verifica que el push llegó a GitHub: `git log --oneline -5`
2. Espera 30-60 segundos para el redeploy de Vercel
3. Abre la URL en modo incógnito para limpiar cache

### **¿Qué pasó con semaforo.vercel.app?**
Ese dominio está bloqueado en otro proyecto de Vercel y no puede ser transferido. 
**Solución definitiva:** Usa `semaforo-bice.vercel.app` que está completamente funcional.

---

## 📞 Contacto / Soporte

Para reportar problemas o solicitar cambios en el dashboard:
- 📧 administracion@eduardomaiz.com
- 📝 Crear un issue en GitHub

---

**Última actualización:** 2026-10-10  
**Versión:** v2.0 (Kanban Dashboard)  
**Estado:** ✅ Producción
