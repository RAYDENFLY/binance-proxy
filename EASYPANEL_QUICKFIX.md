# 🚨 Quick Fix untuk Error 502 di Easypanel

## Masalah Teridentifikasi

Error 502 Bad Gateway terjadi karena:
1. ❌ Port hardcode di Dockerfile (3002)
2. ❌ Aplikasi binding ke `localhost` bukan `0.0.0.0`
3. ❌ Health check tidak dinamis

## ✅ Sudah Diperbaiki

### 1. **Dockerfile** - Updated ✅
```dockerfile
# Port sekarang fleksibel (tidak hardcode)
EXPOSE 3000  # Default Easypanel

# Health check sekarang dinamis
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get('http://localhost:' + port + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"
```

### 2. **index.js** - Updated ✅
```javascript
// Sekarang bind ke 0.0.0.0 (accessible dari luar)
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

## 🔄 Cara Deploy Ulang di Easypanel

### Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Fix: Update for Easypanel compatibility - bind to 0.0.0.0 and dynamic port"
git push origin main
```

### Langkah 2: Rebuild di Easypanel

**Via Dashboard:**
1. Buka service Anda di Easypanel
2. Klik tab "Deployments"
3. Klik tombol **"Rebuild"** atau **"Redeploy"**
4. Tunggu hingga status menjadi "Running"

**Via CLI (jika ada akses):**
```bash
easypanel rebuild <service-name>
```

### Langkah 3: Konfigurasi di Easypanel

#### A. Environment Variables (Penting!)
Di Easypanel Dashboard → Settings → Environment Variables:

**HANYA SET INI:**
```
NODE_ENV=production
```

**JANGAN SET:**
- ❌ PORT (Easypanel set otomatis!)

#### B. Health Check Settings
Di Easypanel Dashboard → Settings → Health Check:

```
Type: HTTP
Path: /api/health
Port: (biarkan default, Easypanel auto-detect)
Initial Delay: 10 seconds
Interval: 30 seconds
Timeout: 10 seconds
Failure Threshold: 3
```

#### C. Port Mapping
Di Easypanel Dashboard → Settings → Network:

```
Container Port: (biarkan auto-detect atau isi dengan 3000)
Public Port: 80 atau 443 (HTTPS)
Protocol: HTTP
```

### Langkah 4: Verifikasi Deployment

**Cek Logs di Easypanel:**
Harus muncul:
```
🚀 Binance Futures Proxy API Server Started
📡 Server running on: http://0.0.0.0:XXXX
🐳 Docker/Easypanel ready - Listening on all interfaces
```

**Test Health Check:**
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T...",
  "binance": "connected"
}
```

## 🐛 Jika Masih Error 502

### Debug Checklist:

1. **Cek Logs di Easypanel**
   - Apakah ada error message?
   - Apakah server berhasil start?
   - Port berapa yang digunakan?

2. **Test dari Terminal Easypanel**
   ```bash
   # Masuk ke container
   # Di Easypanel: Terminal tab
   
   # Cek PORT environment
   echo $PORT
   
   # Test health check internal
   curl http://localhost:$PORT/api/health
   
   # Cek process
   ps aux | grep node
   
   # Test binding
   netstat -tlnp | grep $PORT
   ```

3. **Restart Service**
   - Klik "Restart" di Easypanel dashboard
   - Tunggu 10-15 detik untuk startup

4. **Clear Cache & Rebuild**
   - Klik "Settings" → "Advanced"
   - Enable "Clear build cache"
   - Klik "Rebuild"

## 📱 Monitoring

### Real-time Logs:
```
Easypanel Dashboard → Your Service → Logs (tab)
```

### Metrics:
```
Easypanel Dashboard → Your Service → Metrics (tab)
```

Pantau:
- CPU Usage (< 80%)
- Memory Usage (< 80%)
- Request Count
- Error Rate

## ⚡ Pro Tips

1. **Auto Deploy**: Enable auto-deploy on git push
   - Settings → Git → Auto Deploy: ON

2. **Rollback**: Jika deployment gagal
   - Deployments → Previous Version → Rollback

3. **Scaling**: Jika traffic tinggi
   - Settings → Scaling → Increase replicas

4. **Custom Domain**: 
   - Settings → Domains → Add Custom Domain
   - Update DNS records sesuai instruksi

5. **SSL/HTTPS**: Otomatis aktif untuk custom domain

## 🎯 Hasil Akhir

Setelah fix ini, Anda akan bisa akses:

- ✅ `https://your-domain.com` → Welcome page
- ✅ `https://your-domain.com/api-docs` → Swagger UI
- ✅ `https://your-domain.com/api/health` → Health check
- ✅ `https://your-domain.com/api/ticker/price?symbol=BTCUSDT` → API endpoint

## 📞 Support

Jika masih ada masalah setelah semua langkah:

1. Screenshot error di browser
2. Copy logs dari Easypanel
3. Cek status health check di dashboard
4. Hubungi Easypanel support dengan informasi:
   - Service name
   - Error message
   - Logs
   - Screenshots

---

**Update files sudah selesai! Sekarang push ke GitHub dan rebuild di Easypanel. Good luck! 🚀**
