# 🔍 Debug: Service Not Reachable di Easypanel

## 📊 Status Saat Ini

```
✅ App running: YES
✅ Port: 80
✅ Binding: 0.0.0.0
❌ Service not reachable
```

## 🐛 Root Cause Analysis

Aplikasi sudah running dengan benar, tapi Easypanel reverse proxy tidak bisa reach service. Ini biasanya karena:

1. **Health Check Configuration Salah** ⚠️
2. **Port Mapping Tidak Match**
3. **Container Network Issue**

## ✅ Solusi 1: Fix Health Check di Easypanel

### Di Easypanel Dashboard:

1. **Buka Service → Settings → Health Check**
2. **DISABLE Health Check sementara** atau config dengan benar:

```yaml
Type: HTTP
Path: /api/health
Port: 80  (PENTING: harus sama dengan container port!)
Protocol: HTTP
Method: GET
Initial Delay: 15 seconds  (kasih waktu lebih lama)
Interval: 30 seconds
Timeout: 10 seconds
Failure Threshold: 3
Success Threshold: 1
```

3. **Save dan Restart Service**

## ✅ Solusi 2: Cek Port Mapping di Easypanel

### Di Easypanel Dashboard → Settings → Networking:

```
Container Port: 80
Expose to Public: YES
Protocol: HTTP
```

**ATAU jika port auto-generated:**
```
Container Port: (auto from EXPOSE)
```

## ✅ Solusi 3: Test dari Terminal Easypanel

### Buka Terminal di Easypanel (container shell):

```bash
# Test health check dari DALAM container
curl http://localhost:80/api/health

# Expected output:
{"status":"healthy","timestamp":"2025-10-31...","binance":"connected"}

# Test dengan 0.0.0.0
curl http://0.0.0.0:80/api/health

# Cek port yang listening
netstat -tlnp | grep :80

# Test dengan wget jika curl tidak ada
wget -q -O- http://localhost:80/api/health
```

Jika berhasil di dalam container tapi tidak dari luar → masalah di Easypanel networking/health check.

## ✅ Solusi 4: Update Dockerfile dengan Fallback Port

Terkadang Easypanel set port non-standard. Mari pastikan app bisa handle:

**File sudah benar**, tapi cek logs untuk port yang digunakan:
```
📡 Server running on: http://0.0.0.0:80
```

## ✅ Solusi 5: Disable Health Check Sementara

### Quick Fix - Disable Health Check:

1. **Easypanel Dashboard → Service Settings → Health Check**
2. **Toggle OFF** atau **Delete Health Check**
3. **Save & Restart Service**

Ini akan membuat Easypanel route traffic tanpa wait health check pass.

## ✅ Solusi 6: Cek Logs untuk Error

### Di Easypanel Logs, cari:

```
✅ Good signs:
- "Server running on: http://0.0.0.0:80"
- "Docker/Easypanel ready"
- No error messages

❌ Bad signs:
- EADDRINUSE (port already in use)
- Connection refused
- Timeout errors
```

## ✅ Solusi 7: Rebuild with Different Approach

### Option A: Simplified Health Check

Update Dockerfile health check jadi lebih sederhana:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1
```

### Option B: Disable Health Check di Dockerfile

Hapus atau comment out HEALTHCHECK line di Dockerfile, biarkan Easypanel yang handle:

```dockerfile
# HEALTHCHECK removed - let Easypanel handle it
```

## 🎯 Recommended Steps (In Order)

### Step 1: Disable Health Check
```
Easypanel → Service → Settings → Health Check → Toggle OFF
Save → Restart Service
```

### Step 2: Test Access
```bash
# Test dari browser
https://baitulmaalku-hargaemaspxg.nvsxa3.easypanel.host/

# Test health check
https://baitulmaalku-hargaemaspxg.nvsxa3.easypanel.host/api/health
```

### Step 3: If Still Not Working

**Cek di Easypanel Terminal:**
```bash
# Masuk ke container terminal
ps aux | grep node  # Check if node is running
echo $PORT  # Check port env variable
curl http://localhost:$PORT/api/health  # Test internal
```

### Step 4: Check Container Logs

Di Easypanel Logs, pastikan tidak ada error seperti:
- `EADDRINUSE`
- `Cannot bind to port`
- `Connection refused`

### Step 5: Restart Everything

```
1. Stop Service
2. Clear cache (if option available)
3. Start Service
4. Wait 30 seconds
5. Test again
```

## 🔄 Alternative: Change to Port 3000

Jika masih gagal, coba ubah ke port standard (3000):

### Di Easypanel Dashboard:

**Environment Variables:**
```
PORT=3000
NODE_ENV=production
```

**Network Settings:**
```
Container Port: 3000
```

**Rebuild & Restart**

## 📞 Debug Checklist

- [ ] Health check disabled atau configured correctly
- [ ] Port mapping: 80 di container, exposed to public
- [ ] Logs show "Server running on: http://0.0.0.0:80"
- [ ] No error messages in logs
- [ ] Can curl health check from container terminal
- [ ] Environment variables: only NODE_ENV set
- [ ] Service restarted after changes

## 🆘 If Nothing Works

### Last Resort Options:

1. **Complete Rebuild:**
   ```
   - Delete service completely
   - Create new service
   - Deploy from GitHub
   - DO NOT set any health check initially
   ```

2. **Contact Easypanel Support:**
   ```
   Provide:
   - Service name
   - Domain: baitulmaalku-hargaemaspxg.nvsxa3.easypanel.host
   - Logs showing app running on port 80
   - Screenshot of "Service not reachable"
   ```

3. **Try Different Deployment Method:**
   ```
   - Instead of Dockerfile, try Node.js template
   - Let Easypanel auto-detect and build
   ```

## 💡 Most Common Fix

**90% of time, the issue is health check configuration!**

**Quick Fix:**
1. Disable health check completely
2. Restart service
3. Service should be reachable immediately

---

**Start with disabling health check first - that's usually the culprit! 🎯**
