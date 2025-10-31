# 🚀 Easypanel Deployment Guide - Binance Proxy

## ⚠️ Penting untuk Easypanel

Easypanel memiliki beberapa konfigurasi khusus yang berbeda dengan deployment Docker biasa.

## 📋 Konfigurasi Easypanel

### 1. **Port Configuration**

Easypanel secara otomatis set PORT environment variable. Pastikan:

- ✅ **Jangan hardcode port** di Dockerfile (sudah diperbaiki)
- ✅ Aplikasi menggunakan `process.env.PORT` (sudah benar di index.js)
- ✅ Expose port 3000 di Dockerfile (default Easypanel)

### 2. **Health Check Path**

Pastikan endpoint health check berfungsi:
- Path: `/api/health`
- Harus return status 200 untuk healthy

### 3. **Environment Variables di Easypanel**

Set environment variables berikut di Easypanel dashboard:

```
NODE_ENV=production
```

**JANGAN set PORT** - Easypanel akan set otomatis!

## 🔧 Setup di Easypanel

### Step 1: Create Service

1. Login ke Easypanel dashboard
2. Klik "Create Service" atau "New App"
3. Pilih "Deploy from GitHub" atau "Deploy from Docker"

### Step 2: Repository Configuration

**Jika dari GitHub:**
- Repository: `RAYDENFLY/binance-proxy`
- Branch: `main`
- Build Method: `Dockerfile`

**Jika dari Docker Registry:**
- Build dari Dockerfile yang sudah ada

### Step 3: Port Configuration

Di Easypanel dashboard:

**Port Mapping:**
- Container Port: **Biarkan kosong atau gunakan port yang di-set Easypanel**
- Easypanel akan auto-detect dari EXPOSE di Dockerfile
- Public Port: 80 atau 443 (otomatis oleh Easypanel)

### Step 4: Health Check Settings

**Health Check Configuration:**
```
Protocol: HTTP
Path: /api/health
Port: (gunakan PORT yang sama dengan aplikasi)
Interval: 30s
Timeout: 10s
Start Period: 10s
Retries: 3
```

### Step 5: Domain Configuration

1. Set domain atau subdomain
2. Easypanel akan handle reverse proxy otomatis
3. SSL/HTTPS akan di-setup otomatis oleh Easypanel

## 🐛 Troubleshooting Error 502

### Penyebab Umum:

1. **Port Mismatch**
   - ✅ **Solusi**: Pastikan aplikasi listen di port yang di-set Easypanel (via env PORT)
   - Cek logs: `Service running on: http://localhost:XXXX`

2. **Health Check Gagal**
   - ✅ **Solusi**: Test endpoint `/api/health` manual
   - Endpoint harus return 200 OK

3. **Aplikasi Crash/Not Starting**
   - ✅ **Solusi**: Cek logs di Easypanel dashboard
   - Pastikan dependencies ter-install

4. **Binding to 0.0.0.0**
   - ✅ **Solusi**: Aplikasi harus listen di `0.0.0.0`, bukan `localhost`

### Fix untuk Binding Issue (Jika Diperlukan)

Jika masih error, pastikan Express listen ke `0.0.0.0`:

Edit index.js, ganti:
```javascript
app.listen(PORT, () => {
```

Menjadi:
```javascript
app.listen(PORT, '0.0.0.0', () => {
```

## 📊 Cek Status di Easypanel

### Melalui Dashboard:

1. **Logs**: Lihat real-time logs
   - Cari message: "Server running on: http://localhost:XXXX"
   - Pastikan tidak ada error

2. **Metrics**: Monitor CPU/Memory usage
   - Pastikan tidak over limit

3. **Health Status**: 
   - Harus menunjukkan "Healthy" (hijau)
   - Jika "Unhealthy" (merah), cek health check path

### Melalui Terminal di Easypanel:

```bash
# Cek port yang digunakan
echo $PORT

# Test health check dari dalam container
curl http://localhost:$PORT/api/health

# Cek apakah aplikasi running
ps aux | grep node
```

## 🔄 Rebuild & Redeploy

Jika sudah update Dockerfile:

1. **Commit & Push ke GitHub**
   ```bash
   git add .
   git commit -m "Fix Easypanel port configuration"
   git push
   ```

2. **Trigger Rebuild di Easypanel**
   - Klik "Rebuild" atau "Redeploy"
   - Atau set auto-deploy on git push

3. **Monitor Deployment**
   - Watch logs during deployment
   - Wait for "Healthy" status

## ✅ Checklist Deployment

- [ ] Dockerfile tidak hardcode PORT
- [ ] index.js menggunakan `process.env.PORT`
- [ ] EXPOSE 3000 di Dockerfile
- [ ] Health check path `/api/health` aktif
- [ ] Environment variables di-set di Easypanel (tanpa PORT)
- [ ] Domain/subdomain sudah dikonfigurasi
- [ ] Logs menunjukkan "Server running on..."
- [ ] Health check status "Healthy"
- [ ] Bisa akses via browser/curl

## 🌐 Testing Setelah Deploy

### Test dari luar:

```bash
# Health check
curl https://your-domain.com/api/health

# API test
curl https://your-domain.com/api/ticker/price?symbol=BTCUSDT

# Swagger docs
# Buka di browser: https://your-domain.com/api-docs
```

### Expected Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T...",
  "binance": "connected"
}
```

## 📝 Catatan Tambahan

1. **Auto-scaling**: Easypanel bisa auto-scale jika traffic tinggi
2. **SSL/HTTPS**: Otomatis di-handle Easypanel
3. **Logs Persistence**: Logs tersimpan di Easypanel dashboard
4. **Backup**: Setup backup schedule di Easypanel settings
5. **Monitoring**: Enable monitoring untuk alerts

## 🆘 Jika Masih Error 502

1. **Restart Service** di Easypanel dashboard
2. **Rebuild** dari scratch (clear cache)
3. **Cek Logs** untuk error messages
4. **Test Health Check** manual dari terminal
5. **Verify Port** di logs matches dengan health check
6. **Contact Support** dengan logs jika masih gagal

---

**Dockerfile sudah di-update untuk kompatibilitas Easypanel! ✅**
