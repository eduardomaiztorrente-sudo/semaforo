# 🚀 INICIO RÁPIDO - Hazlo en 3 pasos

## Lo que necesitas saber

✅ **Todo está completamente automatizado**  
✅ **Solo necesitas tus credenciales de Fynkus**  
✅ **30-40 minutos de trabajo real**

---

## **3 PASOS PARA HACERLO TODO**

### **PASO 1: Descarga estos archivos a tu máquina**

```
OBLIGATORIOS:
- EJECUTAR-TODO.sh          ← Este es el principal
- firestore-init.js
- dashboard.html
- Semaforo-GmailLabels.gs
- package.json
```

Todos están en: `/tmp/claude-0/-home-claude/5d89bd2f-6dce-5cdc-a4ac-cf6e75f0c275/scratchpad/`

---

### **PASO 2: En tu máquina local, en terminal:**

```bash
cd [carpeta-donde-descargaste-los-archivos]
chmod +x EJECUTAR-TODO.sh
./EJECUTAR-TODO.sh
```

Eso es TODO. El script te pedirá:
- Email de usuario Fynkus
- Contraseña de Fynkus

Y hará automáticamente:
- ✅ Configura Google Cloud
- ✅ Inicializa Firestore
- ✅ Configura Cloud Scheduler
- ✅ Configura credenciales

---

### **PASO 3: Después, dashboard + Gmail**

El script te dirá exactamente qué hacer:

**Dashboard** (elige UNA opción, ~10 minutos):
```bash
firebase deploy --project semaforo-fincas
# O
gsutil cp dashboard.html gs://semaforo-fincas-dashboard/index.html
```

**Google Apps Script** (~15 minutos):
- Abre script.google.com
- Copia el contenido de `Semaforo-GmailLabels.gs`
- Ejecuta `setupSemaforo()`

---

## ✅ **ESO ES TODO**

Después de esos 3 pasos:

🟢 Sistema completamente operativo  
🟢 Ejecutándose automáticamente cada 6 horas  
🟢 Dashboard en tiempo real  
🟢 Gmail con etiquetas automáticas  

---

## 📋 Checklist previo (30 segundos)

- [ ] Tengo gcloud instalado: `gcloud --version`
- [ ] Tengo Node.js: `node --version`
- [ ] Estoy autenticado en gcloud: `gcloud auth login`
- [ ] Tengo credenciales de Fynkus (email + contraseña)

Si todo ✅, puedes ejecutar EJECUTAR-TODO.sh

---

**¡Adelante! 🚀**

