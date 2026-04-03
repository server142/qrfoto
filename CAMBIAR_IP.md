# 🌐 Cambio de IP de Red — Veltrix Events

Usa esta guía cada vez que cambies de red Wi-Fi o tu IP local cambie.

---

## Paso 1: Saber cuál es tu nueva IP

Abre una terminal de Windows (PowerShell o CMD) y ejecuta:

```powershell
ipconfig
```

Busca la sección **"Adaptador de LAN inalámbrica Wi-Fi"** y anota la:

```
Dirección IPv4. . . . : 192.168.X.XX   ← Esta es tu nueva IP
```

---

## Paso 2: Actualizar el Backend `.env`

Abre el archivo:
```
veltrix-events\backend\.env
```

Cambia las tres líneas que contienen la IP anterior por la nueva:

```env
PUBLIC_IP=192.168.X.XX
FRONTEND_URL=http://192.168.X.XX:3001
MINIO_ENDPOINT=192.168.X.XX
```

> Las tres deben tener exactamente la misma IP.

---

## Paso 3: No tocar nada más

El Frontend detecta la IP automáticamente desde el navegador.  
El script de arranque ya está configurado con `-H 0.0.0.0` para escuchar en toda la red.

---

## Paso 4: Reiniciar los servidores

Es **obligatorio** reiniciar para que tomen la nueva IP del `.env`.

**Backend** (en su terminal):
```powershell
# Ctrl+C para detener, luego:
npm run start:dev
```

**Frontend** (en su terminal):
```powershell
# Ctrl+C para detener, luego:
npm run dev
```

Al iniciar verás en la terminal del frontend:
```
- Local:    http://localhost:3001
- Network:  http://192.168.X.XX:3001   ✅  Confirma que tomó la IP
```

---

## Paso 5: Probar la conexión

Desde cualquier PC o celular en la misma red Wi-Fi, abre:

```
http://192.168.X.XX:3001
```

Panel admin:
```
http://192.168.X.XX:3001/admin
```

---

## Checklist rápido

- [ ] Corrí `ipconfig` y anoté la nueva IP
- [ ] Edité `backend/.env`: `PUBLIC_IP`, `FRONTEND_URL`, `MINIO_ENDPOINT`
- [ ] Reinicié el backend
- [ ] Reinicié el frontend
- [ ] La terminal del frontend muestra la nuevaIP en "Network"
- [ ] Probé desde otro dispositivo en la misma red

---

## Mapa de puertos

| Servicio       | Puerto | URL                               |
|----------------|--------|-----------------------------------|
| Frontend (Web) | 3001   | `http://192.168.X.XX:3001`        |
| Backend (API)  | 3000   | `http://192.168.X.XX:3000/api`    |
| MinIO (Fotos)  | 9000   | `http://192.168.X.XX:9000`        |
| MinIO (Panel)  | 9001   | `http://192.168.X.XX:9001`        |
| Redis          | 6379   | Solo uso interno                  |
| n8n            | 5678   | `http://192.168.X.XX:5678`        |
