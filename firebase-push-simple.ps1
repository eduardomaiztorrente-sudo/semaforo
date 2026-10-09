# Firebase Fix - Push Simple
Write-Host "Iniciando push del Firebase fix..." -ForegroundColor Green

$temp = "$env:TEMP\semaforo-push"
if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
New-Item -ItemType Directory -Path $temp | Out-Null

Write-Host "Clonando repositorio..."
cd $temp
git clone https://github.com/eduardomaiz/semaforo.git
cd semaforo

if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

Write-Host "Descargando archivo HTML actualizado..."
$htmlUrl = "https://claude.ai/code/session_01JM4kGH6cQbTk8dAHuebCeH"

$htmlContent = @'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semaforo de Incidencias - Dashboard Interactivo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; color: #333; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .header h1 { font-size: 28px; color: #333; }
        .header-info { font-size: 14px; color: #666; }
        .sync-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; gap: 8px; }
        .sync-button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4); }
        .sync-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(650px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .card h2 { font-size: 20px; margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px; }
        .card h2 .badge { background: #667eea; color: white; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
        .item { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #667eea; display: flex; justify-content: space-between; align-items: center; gap: 15px; }
        .item-content { flex: 1; }
        .item-title { font-weight: 600; color: #333; margin-bottom: 4px; }
        .item-meta { font-size: 12px; color: #999; }
        .btn { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
        .btn-complete { background: #d4edda; color: #155724; }
        .btn-complete:hover { background: #c3e6cb; }
        .empty-state { text-align: center; color: #999; padding: 40px 20px; font-size: 14px; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 2000; animation: slideIn 0.3s ease; }
        .notification.success { background: #d4edda; color: #155724; }
        .notification.error { background: #f8d7da; color: #721c24; }
        .notification.info { background: #d1ecf1; color: #0c5460; }
        @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .header { flex-direction: column; text-align: center; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>Dashboard Incidencias</h1>
                <div class="header-info">Tiempo Real</div>
            </div>
            <button class="sync-button" id="syncBtn" onclick="sincronizarAhora()">Sincronizar</button>
        </div>
        <div class="grid">
            <div class="card"><h2>Tareas <span class="badge" id="incidenciasCount">0</span></h2><div id="incidenciasContainer"><div class="empty-state">Sin incidencias</div></div></div>
            <div class="card"><h2>Gmail <span class="badge" id="borradorCount">0</span></h2><div id="borradorContainer"><div class="empty-state">Sin borradores</div></div></div>
            <div class="card"><h2>Dudas <span class="badge" id="dudasCount">0</span></h2><div id="dudasContainer"><div class="empty-state">Sin dudas</div></div></div>
            <div class="card"><h2>Completadas <span class="badge" id="completadasCount">0</span></h2><div id="completadasContainer"><div class="empty-state">Sin completadas</div></div></div>
        </div>
    </div>
    <script async defer src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/compat/app.js"></script>
    <script async defer src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/compat/firestore.js"></script>
    <script>
        let db = null, incidenciasActuales = [], firebaseInitialized = false, initAttempts = 0;
        const maxAttempts = 50;
        const firebaseConfig = { apiKey: "AIzaSyB-cQU2F9-uVwKKdFFcBjQKxVF-WQ0KqG4", authDomain: "semaforo-fincas.firebaseapp.com", projectId: "semaforo-fincas", storageBucket: "semaforo-fincas.appspot.com", messagingSenderId: "1084905038869", appId: "1:1084905038869:web:3e4d0d4c8e5d7b9c2a1b3c" };
        function iniciarFirebase() { initAttempts++; if (typeof firebase === 'undefined') { if (initAttempts < maxAttempts) { setTimeout(iniciarFirebase, 100); } else { console.error('Firebase no cargado'); mostrarNotificacion('Error: Firebase no disponible', 'error'); } return; } if (firebaseInitialized) return; try { if (!firebase.apps || firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); db = firebase.firestore(); firebaseInitialized = true; cargarDatos(); } catch(e) { mostrarNotificacion('Error: ' + e.message, 'error'); } }
        async function cargarDatos() { if (!firebaseInitialized || !db) { setTimeout(cargarDatos, 500); return; } try { const snap = await db.collection("incidencias").doc("ultimas").get(); incidenciasActuales = snap.exists ? snap.data().datos || [] : []; actualizarUI(); } catch(e) { mostrarNotificacion('Error: ' + e.message, 'error'); } }
        function actualizarUI() { const c = document.getElementById('incidenciasContainer'), cnt = document.getElementById('incidenciasCount'); if (!incidenciasActuales || !incidenciasActuales.length) { c.innerHTML = '<div class="empty-state">Sin incidencias</div>'; cnt.textContent = '0'; return; } cnt.textContent = incidenciasActuales.length; c.innerHTML = incidenciasActuales.map((i, idx) => `<div class="item"><div class="item-content"><div class="item-title">${i.asunto || 'N/A'}</div><div class="item-meta">${i.comunidad || 'N/A'}</div></div><button class="btn btn-complete" onclick="marcarCompletada(${idx})">OK</button></div>`).join(''); }
        async function sincronizarAhora() { document.getElementById('syncBtn').disabled = true; try { const r = await fetch('https://scrapearfynkus-pq5dm7lgrq-uc.a.run.app', {method:'POST', headers:{'Content-Type':'application/json'}}); if(r.ok) { await cargarDatos(); mostrarNotificacion('Sincronizado', 'success'); } } catch(e) { mostrarNotificacion('Error: ' + e.message, 'error'); } finally { document.getElementById('syncBtn').disabled = false; } }
        async function marcarCompletada(idx) { if(!firebaseInitialized||!db) return; const t = incidenciasActuales[idx]; try { await db.collection("completadas").add({tarea:t.asunto||'N/A', comunidad:t.comunidad||'N/A', fecha: new Date().toISOString().split('T')[0], timestamp:new Date().toISOString()}); incidenciasActuales.splice(idx,1); actualizarUI(); mostrarNotificacion('Completada', 'success'); } catch(e) { mostrarNotificacion('Error: ' + e.message, 'error'); } }
        function mostrarNotificacion(m, t='info') { const n = document.createElement('div'); n.className = 'notification ' + t; n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
        console.log('Iniciando...'); iniciarFirebase(); if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciarFirebase); } setTimeout(iniciarFirebase, 1000); setInterval(() => { if(firebaseInitialized) cargarDatos(); }, 60000);
    </script>
</body>
</html>
'@

$htmlContent | Out-File -FilePath "public/index.html" -Encoding UTF8 -Force

Write-Host "Haciendo commit..."
git add public/index.html
git commit -m "Fix Firebase SDK CDN - jsDelivr"
git push

cd ..
Remove-Item -Recurse -Force semaforo

Write-Host "Listo. Vercel se redeployara en 1-2 minutos."
